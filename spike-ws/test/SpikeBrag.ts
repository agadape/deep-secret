import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

// Plain reference for the encrypted evaluator in SpikeBrag._score
function score(cards: number[]): number {
  const ranks = cards.map((c) => Math.floor(c / 4)).sort((x, y) => x - y);
  const suits = cards.map((c) => c % 4);
  const [lo, mid, hi] = ranks;
  const flush = suits[0] === suits[1] && suits[1] === suits[2];
  const pairLow = lo === mid;
  const pairHigh = mid === hi;
  const trips = pairLow && pairHigh;
  const pair = pairLow || pairHigh;
  const wheel = lo === 0 && mid === 1 && hi === 12;
  const straight = (mid === lo + 1 && hi === mid + 1) || wheel;
  let cat = pair ? 1 : 0;
  if (flush) cat = 2;
  if (straight) cat = 3;
  if (trips) cat = 4;
  if (straight && flush) cat = 5;
  const top = pair ? mid : wheel ? mid : hi;
  const second = wheel ? lo : mid;
  const third = pair ? (pairLow ? hi : lo) : wheel ? 0 : lo;
  return (cat << 12) | (top << 8) | (second << 4) | third;
}

describe("SpikeBrag (encrypted three-card poker)", function () {
  this.timeout(30 * 60_000);
  let brag: any, addr: string, alice: any;
  const t0 = Date.now();
  const log = (m: string) => console.log(`    [${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function retry<T>(f: () => Promise<T>): Promise<T> {
    for (let i = 0; ; i++) {
      try {
        return await f();
      } catch (e) {
        if (fhevm.isMock || i >= 8) throw e;
        await sleep(3000);
      }
    }
  }

  before(async function () {
    [alice] = await ethers.getSigners();
    if (process.env.SPIKEBRAG_ADDRESS) {
      brag = await ethers.getContractAt("SpikeBrag", process.env.SPIKEBRAG_ADDRESS);
    } else {
      brag = await (await ethers.getContractFactory("SpikeBrag")).deploy();
      await brag.waitForDeployment();
    }
    addr = await brag.getAddress();
    log(`network=${network.name} mock=${fhevm.isMock} SpikeBrag=${addr}`);
  });

  it("S15 deal 6 distinct cards, rank both hands blind, compare, dealer decision — matches plain reference", async function () {
    const rounds = Number(process.env.BRAG_ROUNDS ?? (fhevm.isMock ? 40 : 1));
    const cats: Record<number, number> = {};
    for (let n = 0; n < rounds; n++) {
      let s = Date.now();
      let tx = await brag.deal();
      let rc = await tx.wait();
      const dealGas = rc.gasUsed;
      const dealBlock = rc.blockNumber;
      if (!fhevm.isMock) log(`deal(): tx ${tx.hash} gas=${dealGas} ${((Date.now() - s) / 1000).toFixed(1)}s`);

      // the player can read their own hand before deciding
      const mine: string[] = await retry(() => brag.getPlayerCards(alice.address, { blockTag: dealBlock }));
      s = Date.now();
      const first = await retry(() => fhevm.userDecryptEuint(FhevmType.euint8, mine[0], addr, alice));
      if (!fhevm.isMock) log(`player decrypts own card: ${first} (${((Date.now() - s) / 1000).toFixed(1)}s)`);

      s = Date.now();
      tx = await brag.showdown();
      rc = await tx.wait();
      if (!fhevm.isMock) log(`showdown(): tx ${tx.hash} gas=${rc.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s`);
      const block = rc.blockNumber;

      const pc: string[] = await retry(() => brag.getPlayerCards(alice.address, { blockTag: block }));
      const dc: string[] = await retry(() => brag.getDealerCards(alice.address, { blockTag: block }));
      const res = await retry(() => brag.getResult(alice.address, { blockTag: block }));
      const handles = [...pc, ...dc, res[0], res[1], res[2]];
      s = Date.now();
      const out: any = await retry(() => fhevm.publicDecrypt(handles));
      if (!fhevm.isMock) log(`publicDecrypt 9 values in one call: ${((Date.now() - s) / 1000).toFixed(1)}s`);
      const v = handles.map((h) => out.clearValues[h]);
      const player = v.slice(0, 3).map(Number);
      const dealer = v.slice(3, 6).map(Number);
      const [dealerPlays, playerWins, tie] = v.slice(6) as boolean[];

      expect(new Set([...player, ...dealer]).size, "distinct cards").to.eq(6);
      expect(BigInt(player[0])).to.eq(first);
      const ps = score(player);
      const ds = score(dealer);
      cats[ps >> 12] = (cats[ps >> 12] ?? 0) + 1;
      cats[ds >> 12] = (cats[ds >> 12] ?? 0) + 1;
      expect(playerWins, `playerWins p=${player} d=${dealer}`).to.eq(ps > ds);
      expect(tie, `tie p=${player} d=${dealer}`).to.eq(ps === ds);
      if (ds >= 10 << 8) expect(dealerPlays, "qualifying dealer must play").to.eq(true);
      if (!fhevm.isMock || n === 0) {
        log(`player=${player} dealer=${dealer} ps=${ps} ds=${ds} playerWins=${playerWins} tie=${tie} dealerPlays=${dealerPlays} dealGas=${dealGas} showdownGas=${rc.gasUsed}`);
      }
    }
    log(`rounds=${rounds} category histogram (0 high,1 pair,2 flush,3 straight,4 trips,5 straight flush)=${JSON.stringify(cats)}`);
  });
});

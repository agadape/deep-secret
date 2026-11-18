import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

// Spike S17/S18: GAME_SPEC §10.2 cast circuit.
// Mock:    npx hardhat test test/SpikeCast.ts            (DIST_CASTS=1000 for the distribution run)
// Sepolia: npx hardhat test test/SpikeCast.ts --network sepolia   (only the on-chain tests run)

const decode = (v: bigint) => {
  const n = Number(v);
  return {
    tier: n & 7,
    species: (n >> 3) & 3,
    aura: (n >> 5) & 1,
    weight: (n >> 8) & 255,
    valid: (n >> 16) & 1,
  };
};
const expectedPrice = (f: ReturnType<typeof decode>) => {
  if (f.tier === 4) return 0n;
  const base = [2, 8, 30, 150][f.tier];
  const p = base + f.weight;
  return BigInt(f.aura ? p * 2 : p);
};
const TIER_NAMES = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];

describe("SpikeCast (5 fish + encrypted Secret quota)", function () {
  this.timeout(60 * 60_000);
  let alice: any, bob: any;
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
  const deploy = async (quota: number, starter: bigint) => {
    const c = await (await ethers.getContractFactory("SpikeCast")).deploy(quota, starter);
    await c.waitForDeployment();
    return c as any;
  };
  const send = async (label: string, txp: Promise<any>) => {
    const s = Date.now();
    const tx = await txp;
    const rc = await tx.wait();
    if (!fhevm.isMock) log(`${label}: tx ${tx.hash} gas=${rc.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s`);
    return rc;
  };
  // owner-side read of the 5 fish of one cast (user decrypt; mock uses the debugger for speed in bulk runs)
  const readCast = async (game: any, first: bigint, who: any, block: number | undefined, fast = false) => {
    const addr = await game.getAddress();
    const out = [];
    for (let i = 0n; i < 5n; i++) {
      const f = await retry(() => game.getFish(first + i, { blockTag: block }));
      const packed = fast
        ? await fhevm.debugger.decryptEuint(FhevmType.euint32, f[1])
        : await retry(() => fhevm.userDecryptEuint(FhevmType.euint32, f[1], addr, who));
      const price = fast
        ? await fhevm.debugger.decryptEuint(FhevmType.euint64, f[2])
        : await retry(() => fhevm.userDecryptEuint(FhevmType.euint64, f[2], addr, who));
      out.push({ packed, price, ...decode(packed) });
    }
    return out;
  };

  before(async function () {
    [alice, bob] = await ethers.getSigners();
    log(`network=${network.name} mock=${fhevm.isMock}`);
    if (!fhevm.isMock) await fhevm.initializeCLIApi();
  });

  it("S17 paid cast: 5 encrypted fish, owner-only decrypt, price matches attributes, bait burned", async function () {
    const game = await deploy(5, 100n);
    const addr = await game.getAddress();
    const coinAddr: string = await retry(() => game.coin());
    log(`SpikeCast=${addr} coin=${coinAddr}`);
    await send("claimStarter()", game.connect(alice).claimStarter());
    const rc = await send("cast()", game.connect(alice).cast());
    const first = game.interface.parseLog(rc.logs.find((l: any) => l.address.toLowerCase() === addr.toLowerCase()))!
      .args.firstFishId as bigint;

    const s = Date.now();
    const fish = await readCast(game, first, alice, rc.blockNumber);
    log(`decrypt 5 fish (packed + price, 10 values, one by one): ${((Date.now() - s) / 1000).toFixed(1)}s`);
    for (const f of fish) {
      log(`  ${TIER_NAMES[f.tier]} species=${f.species} weight=${f.weight} aura=${f.aura} price=${f.price}`);
      expect(f.valid).to.eq(1);
      expect(f.price).to.eq(expectedPrice(f));
    }
    const coin = await ethers.getContractAt("SpikePearl", coinAddr);
    const balH = await retry(() => coin.confidentialBalanceOf(alice.address, { blockTag: rc.blockNumber }));
    const bal = await retry(() => fhevm.userDecryptEuint(FhevmType.euint64, balH, coin.target as string, alice));
    expect(bal).to.eq(95n);

    // nobody else can read the catch
    const f0 = await retry(() => game.getFish(first, { blockTag: rc.blockNumber }));
    await expect(fhevm.userDecryptEuint(FhevmType.euint32, f0[1], addr, bob)).to.be.rejected;
    (this as any).test.parent.ctx.game = game;
  });

  it("S18 unpaid cast (no coins): no revert, 5 Sandal Jepit, quota untouched", async function () {
    const game = (this as any).test.parent.ctx.game;
    const before = fhevm.isMock
      ? await fhevm.debugger.decryptEuint(FhevmType.euint8, await game.remainingHandle())
      : undefined;
    const rc = await send("cast() by bob without coins", game.connect(bob).cast());
    const first = (await retry(() => game.fishCount({ blockTag: rc.blockNumber }))) - 5n;
    const fish = await readCast(game, first, bob, rc.blockNumber);
    for (const f of fish) {
      expect(f.packed).to.eq(0n);
      expect(f.price).to.eq(0n);
    }
    log(`bob got ${fish.length} x Sandal Jepit`);
    if (fhevm.isMock) {
      const after = await fhevm.debugger.decryptEuint(FhevmType.euint8, await game.remainingHandle());
      expect(after).to.eq(before);
    }
  });

  it("S17 quota: never more Secrets than the hidden quota, extra Secret rolls become Legenda", async function () {
    if (!fhevm.isMock) this.skip();
    const quota = 5;
    const game = await deploy(quota, 100_000n);
    await (await game.connect(alice).claimStarter()).wait();
    let secrets = 0;
    let casts = 0;
    while (casts < 150) {
      const rc = await (await game.connect(alice).cast()).wait();
      casts++;
      const fish = await readCast(game, (await game.fishCount()) - 5n, alice, rc.blockNumber, true);
      secrets += fish.filter((f) => f.tier === 4).length;
    }
    const remaining = await fhevm.debugger.decryptEuint(FhevmType.euint8, await game.remainingHandle());
    log(`quota=${quota} casts=${casts} secrets=${secrets} remaining=${remaining}`);
    expect(secrets).to.eq(quota);
    expect(remaining).to.eq(0n);
  });

  it("S17 distribution: tier frequencies match the public odds table", async function () {
    if (!fhevm.isMock) this.skip();
    const castsTarget = Number(process.env.DIST_CASTS ?? 200);
    const game = await deploy(255, 1_000_000n);
    await (await game.connect(alice).claimStarter()).wait();
    const counts = [0, 0, 0, 0, 0];
    let auras = 0;
    for (let c = 0; c < castsTarget; c++) {
      const rc = await (await game.connect(alice).cast()).wait();
      for (const f of await readCast(game, (await game.fishCount()) - 5n, alice, rc.blockNumber, true)) {
        counts[f.tier]++;
        auras += f.aura;
      }
    }
    const total = castsTarget * 5;
    const p = [1 - 1 / 3 - 1 / 8 - 1 / 25 - 1 / 40, 1 / 3, 1 / 8, 1 / 25, 1 / 40];
    let chi = 0;
    for (let t = 0; t < 5; t++) {
      const e = total * p[t];
      chi += (counts[t] - e) ** 2 / e;
      log(`  ${TIER_NAMES[t].padEnd(8)} ${String(counts[t]).padStart(5)}  observed ${(counts[t] / total).toFixed(4)}  expected ${p[t].toFixed(4)}`);
    }
    log(`  aura ${auras}/${total} = ${(auras / total).toFixed(4)} (expected 0.0625); chi2 (4 dof) = ${chi.toFixed(2)}`);
    // 4 degrees of freedom: 18.47 is the 0.1% critical value
    expect(chi).to.be.lessThan(18.47);
  });
});

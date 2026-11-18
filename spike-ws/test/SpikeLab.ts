import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

// Runs on the local mock (npx hardhat test test/SpikeLab.ts) and on Sepolia
// (npx hardhat test test/SpikeLab.ts --network sepolia). On Sepolia set SPIKELAB_ADDRESS to reuse a deployment.
describe("SpikeLab", function () {
  this.timeout(15 * 60_000);

  let lab: any;
  let addr: string;
  let alice: any;
  const t0 = Date.now();
  const log = (m: string) => console.log(`    [${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
  const timed = async <T>(label: string, f: () => Promise<T>): Promise<T> => {
    const s = Date.now();
    const r = await f();
    log(`${label}: ${((Date.now() - s) / 1000).toFixed(1)}s`);
    return r;
  };
  const send = async (label: string, txp: Promise<any>) => {
    const s = Date.now();
    const tx = await txp;
    const rc = await tx.wait();
    log(`${label}: tx ${tx.hash} gas=${rc.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s`);
    return rc;
  };

  before(async function () {
    [alice] = await ethers.getSigners();
    log(`network=${network.name} mock=${fhevm.isMock} signer=${alice.address}`);
    if (process.env.SPIKELAB_ADDRESS) {
      addr = process.env.SPIKELAB_ADDRESS;
      lab = await ethers.getContractAt("SpikeLab", addr);
    } else {
      const f = await ethers.getContractFactory("SpikeLab");
      lab = await timed("deploy", async () => {
        const c = await f.deploy();
        await c.waitForDeployment();
        return c;
      });
      addr = await lab.getAddress();
    }
    log(`SpikeLab=${addr}`);
  });

  it("S2 roll: encrypted dice in 1..6, decryptable only by the roller", async function () {
    await send("roll()", lab.roll());
    const handles: string[] = await lab.getDice(alice.address);
    const dice: bigint[] = [];
    for (let i = 0; i < handles.length; i++) {
      dice.push(
        await timed(`userDecrypt die ${i}`, () => fhevm.userDecryptEuint(FhevmType.euint8, handles[i], addr, alice)),
      );
    }
    log(`dice=${dice.join(",")}`);
    for (const d of dice) expect(d >= 1n && d <= 6n).to.eq(true);
    (this as any).test.parent.ctx.dice = dice;
  });

  it("S3-S5 hidden guess -> blind count -> public bit verified on-chain", async function () {
    const dice: bigint[] = (this as any).test.parent.ctx.dice;
    const guess = Number(dice[0]);
    const enc = await timed("encrypt input", () =>
      fhevm.createEncryptedInput(addr, alice.address).add8(guess).encrypt(),
    );
    await send("submitGuess()", lab.submitGuess(enc.handles[0], enc.inputProof));
    await send("settle()", lab.settle());

    const expected = dice.filter((d) => d === BigInt(guess)).length;
    const count = await timed("userDecrypt count", async () =>
      fhevm.userDecryptEuint(FhevmType.euint8, await lab.getCount(alice.address), addr, alice),
    );
    expect(count).to.eq(BigInt(expected));

    const hitHandle: string = await lab.getHit(alice.address);
    const res: any = await timed("publicDecrypt hit", () => fhevm.publicDecrypt([hitHandle]));
    log(`publicDecrypt keys=${Object.keys(res).join(",")}`);
    const clear = res.clearValues[hitHandle] as boolean;
    expect(clear).to.eq(expected >= 2);

    await expect(lab.finalize.staticCall(alice.address, !clear, res.decryptionProof)).to.be.reverted;
    await send("finalize()", lab.finalize(alice.address, clear, res.decryptionProof));
    expect(await lab.hitClear(alice.address)).to.eq(clear);
    await expect(lab.finalize.staticCall(alice.address, clear, res.decryptionProof)).to.be.revertedWith(
      "already finalized",
    );
  });

  it("S6 dealDistinct: 5 distinct cards from 52, encrypted end to end", async function () {
    await send("dealDistinct()", lab.dealDistinct());
    const handles: string[] = await lab.getCards(alice.address);
    const cards: number[] = [];
    for (const h of handles) cards.push(Number(await fhevm.userDecryptEuint(FhevmType.euint8, h, addr, alice)));
    log(`cards=${cards.join(",")}`);
    expect(new Set(cards).size).to.eq(5);
    for (const c of cards) expect(c >= 0 && c < 52).to.eq(true);
  });

  it("S7 stress: find how many eq+select+add rounds fit in one tx", async function () {
    const sizes = (process.env.STRESS_SIZES ?? "10,40,80").split(",").map(Number);
    for (const n of sizes) {
      try {
        await send(`stress(${n})`, lab.stress(n));
      } catch (e: any) {
        log(`stress(${n}) FAILED: ${(e.shortMessage ?? e.message ?? String(e)).slice(0, 300)}`);
      }
    }
  });
});

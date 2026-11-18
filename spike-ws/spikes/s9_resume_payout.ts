// S9 on Sepolia — resume after both stakes landed: verify balances with block-pinned reads, pay the pot to Bob, verify again.
// Reads are pinned to the receipt's block because the public RPC is load-balanced and can answer from a lagging node.
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ethers, fhevm } from "hardhat";

const CUSDT = "0x4E7B06D78965594eB5EF5414c357ca21E1554491";
const POT = process.env.SPIKEPOT_ADDRESS!;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retry<T>(label: string, f: () => Promise<T>): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await f();
    } catch (e: any) {
      if (i >= 8) throw e;
      console.log(`  ${label}: ${(e.shortMessage ?? e.message ?? "").slice(0, 80)} — retry`);
      await sleep(3000);
    }
  }
}

async function main() {
  await fhevm.initializeCLIApi();
  const [alice, bob] = await ethers.getSigners();
  const cusdt = await ethers.getContractAt("LocalCUSDT", CUSDT);
  const pot = await ethers.getContractAt("SpikePot", POT);
  let block = await ethers.provider.getBlockNumber();

  const dec = async (label: string, handle: string, contract: string, who: any) => {
    if (handle === ethers.ZeroHash) return 0n;
    const s = Date.now();
    const v = await retry(label, () => fhevm.userDecryptEuint(FhevmType.euint64, handle, contract, who));
    console.log(`${label} = ${v} (${((Date.now() - s) / 1000).toFixed(1)}s)`);
    return v;
  };
  const balance = async (label: string, who: any) =>
    dec(label, await retry(label, () => cusdt.confidentialBalanceOf(who.address, { blockTag: block })), CUSDT, who);

  const aliceBefore = await balance("alice cUSDT", alice);
  const bobBefore = await balance("bob cUSDT", bob);
  const staked = await dec(
    "alice staked in pot",
    await retry("stakedOf", () => pot.stakedOf(alice.address, { blockTag: block })),
    POT,
    alice,
  );
  if (staked !== 15_000_000n) throw new Error(`expected 15.000000 staked, got ${staked}`);

  const s = Date.now();
  const tx = await pot.connect(alice).payout(bob.address);
  const rc = await tx.wait();
  block = rc!.blockNumber;
  console.log(`pot.payout(bob): tx ${tx.hash} gas=${rc!.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s block=${block}`);

  const bobAfter = await balance("bob cUSDT after", bob);
  const aliceAfter = await balance("alice cUSDT after", alice);
  console.log(`bob delta=${bobAfter - bobBefore} alice delta=${aliceAfter - aliceBefore}`);
  if (bobAfter - bobBefore !== 15_000_000n) throw new Error("payout amount mismatch");
  console.log("OK");
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

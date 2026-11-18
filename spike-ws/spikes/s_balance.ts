// Wallet balances, current fee data, and what an earlier spike tx actually paid.
import { ethers } from "hardhat";
async function main() {
  const p = ethers.provider;
  for (const s of await ethers.getSigners()) console.log(`${s.address} ${ethers.formatEther(await p.getBalance(s.address))} ETH`);
  const fee = await p.getFeeData();
  console.log(`gasPrice=${fee.gasPrice} maxFee=${fee.maxFeePerGas} maxPriority=${fee.maxPriorityFeePerGas} (wei)`);
  const b = await p.getBlock("latest");
  console.log(`baseFee=${b?.baseFeePerGas} wei gasLimit=${b?.gasLimit}`);
  for (const h of [
    "0xb404a02a77b2d737b8912e063c6110e574eab8d43688c1cf3b864b4c17992008",
    "0xc5ff19c7b65ac65eced06d6a40433214dd0ad95ad0cc2f3c44326ec413c17684",
    "0xf03b38958604b877b2246bd040bb9e1c99fbcf36de17071ae7c68ae72b2d9b6b",
  ]) {
    const r = await p.getTransactionReceipt(h);
    console.log(`${h.slice(0, 10)} gas=${r!.gasUsed} price=${ethers.formatUnits(r!.gasPrice, "gwei")} gwei cost=${ethers.formatEther(r!.gasUsed * r!.gasPrice)} ETH`);
  }
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); });

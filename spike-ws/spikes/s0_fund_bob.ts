// S0 — after Alice is funded from a faucet, forward part of it to Bob so two-player spikes can run.
import { ethers } from "hardhat";

async function main() {
  const [alice, bob] = await ethers.getSigners();
  const p = ethers.provider;
  const a = await p.getBalance(alice.address);
  const b = await p.getBalance(bob.address);
  console.log(`alice ${alice.address} ${ethers.formatEther(a)} ETH | bob ${bob.address} ${ethers.formatEther(b)} ETH`);
  if (a === 0n) throw new Error("Alice has no Sepolia ETH yet — fund her address from a faucet first.");
  if (b * 4n < a) {
    const tx = await alice.sendTransaction({ to: bob.address, value: a / 3n });
    await tx.wait();
    console.log(`sent ${ethers.formatEther(a / 3n)} ETH to bob: tx ${tx.hash}`);
  }
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

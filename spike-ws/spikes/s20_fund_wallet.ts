// S20 helper — send 0.002 Sepolia test ETH from the throwaway Bob wallet to the user's MetaMask test address.
import { ethers } from "hardhat";

const TO = "0xba7d552247eef7283eb9b48d28ab578a66345802";

async function main() {
  const [, bob] = await ethers.getSigners();
  const tx = await bob.sendTransaction({ to: TO, value: ethers.parseEther("0.002") });
  const rc = await tx.wait();
  console.log(`sent 0.002 ETH from ${bob.address} to ${TO}: tx ${tx.hash} status=${rc!.status}`);
  console.log(`recipient balance now ${ethers.formatEther(await ethers.provider.getBalance(TO, rc!.blockNumber))} ETH`);
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

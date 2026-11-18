// Cross-check the UI: decrypt Bob's coin balance and the prices of his sold fish straight from Sepolia.
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployments, ethers, fhevm } from "hardhat";

async function main() {
  await fhevm.initializeCLIApi();
  const [, bob] = await ethers.getSigners();
  const game = await ethers.getContractAt("DeepSecretGame", (await deployments.get("DeepSecretGame")).address);
  const coin = await ethers.getContractAt("PearlCoin", (await deployments.get("PearlCoin")).address);
  const bal = await fhevm.userDecryptEuint(FhevmType.euint64, await coin.confidentialBalanceOf(bob.address), await coin.getAddress(), bob);
  const ids = await game.fishIdsOf(bob.address);
  let soldSum = 0n;
  let sold = 0;
  for (const id of ids) {
    const f = await game.getFish(id);
    if (f.state !== 1n) continue;
    soldSum += await fhevm.userDecryptEuint(FhevmType.euint64, f.price, await game.getAddress(), bob);
    sold++;
  }
  const p = await game.player(bob.address);
  console.log(`bob balance ${bal}; casts ${p.castCount}; sold ${sold} fish worth ${soldSum}`);
  console.log(`expected balance = 100 starter - 5 x ${p.castCount} casts + ${soldSum} = ${100n - 5n * p.castCount + soldSum}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

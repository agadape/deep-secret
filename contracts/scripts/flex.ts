// Show off one Secret on Sepolia: flex → public decryption with KMS proof → finalizeFlex → NFT.
// Usage: FISH_ID=0 npx hardhat run scripts/flex.ts --network sepolia
import { deployments, ethers, fhevm } from "hardhat";

async function main() {
  await fhevm.initializeCLIApi();
  const id = BigInt(process.env.FISH_ID ?? "0");
  const game = await ethers.getContractAt("DeepSecretGame", (await deployments.get("DeepSecretGame")).address);
  const nft = await ethers.getContractAt("SecretFishNFT", (await deployments.get("SecretFishNFT")).address);
  let tx = await game.flex(id);
  let rc = await tx.wait();
  console.log(`flex(${id}): tx ${tx.hash} gas=${rc!.gasUsed}`);
  const packed = (await game.getFish(id, { blockTag: rc!.blockNumber })).packed;
  const t = Date.now();
  const d = await fhevm.publicDecrypt([packed]);
  console.log(`public decryption + proof in ${((Date.now() - t) / 1000).toFixed(1)} s`);
  tx = await game.finalizeFlex(id, d.abiEncodedClearValues, d.decryptionProof);
  rc = await tx.wait();
  const ev = rc!.logs.map((l) => game.interface.parseLog(l)).find((e) => e?.name === "Flexed" || e?.name === "FlexRejected");
  console.log(`finalizeFlex: tx ${tx.hash} gas=${rc!.gasUsed} → ${ev?.name} ${ev ? JSON.stringify(ev.args.toObject(), (_, v) => (typeof v === "bigint" ? v.toString() : v)) : ""}`);
  if (ev?.name === "Flexed") {
    const uri = await nft.tokenURI(ev.args.tokenId, { blockTag: rc!.blockNumber });
    console.log(`tokenURI JSON: ${Buffer.from(uri.split(",")[1], "base64").toString().slice(0, 220)}…`);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

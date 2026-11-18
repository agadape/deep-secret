// S4/S5 on Sepolia — resume after settle(): check ACL state, user-decrypt the private count, public-decrypt the bit, finalize on-chain.
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ethers, fhevm } from "hardhat";

const LAB = process.env.SPIKELAB_ADDRESS!;
const ACL = "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D";

async function main() {
  await fhevm.initializeCLIApi();
  const [alice] = await ethers.getSigners();
  const lab = await ethers.getContractAt("SpikeLab", LAB);
  const acl = new ethers.Contract(
    ACL,
    ["function persistAllowed(bytes32,address) view returns (bool)", "function isAllowedForDecryption(bytes32) view returns (bool)"],
    ethers.provider,
  );
  const countH: string = await lab.getCount(alice.address);
  const hitH: string = await lab.getHit(alice.address);
  console.log(`count handle ${countH}\nhit handle   ${hitH}`);
  console.log(`ACL count: contract=${await acl.persistAllowed(countH, LAB)} alice=${await acl.persistAllowed(countH, alice.address)}`);
  console.log(`ACL hit: contract=${await acl.persistAllowed(hitH, LAB)} publiclyDecryptable=${await acl.isAllowedForDecryption(hitH)}`);

  let s = Date.now();
  const count = await fhevm.userDecryptEuint(FhevmType.euint8, countH, LAB, alice);
  console.log(`userDecrypt count=${count} in ${((Date.now() - s) / 1000).toFixed(1)}s`);

  s = Date.now();
  const res: any = await fhevm.publicDecrypt([hitH]);
  const clear = res.clearValues[hitH] as boolean;
  console.log(`publicDecrypt hit=${clear} in ${((Date.now() - s) / 1000).toFixed(1)}s proofBytes=${(res.decryptionProof.length - 2) / 2}`);

  try {
    await lab.finalize.staticCall(alice.address, !clear, res.decryptionProof);
    console.log("UNEXPECTED: flipped cleartext accepted");
  } catch (e: any) {
    console.log(`flipped cleartext rejected: ${(e.shortMessage ?? e.message).slice(0, 120)}`);
  }
  s = Date.now();
  const tx = await lab.finalize(alice.address, clear, res.decryptionProof);
  const rc = await tx.wait();
  console.log(`finalize(): tx ${tx.hash} gas=${rc!.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s`);
  console.log(`on-chain hitClear=${await lab.hitClear(alice.address)} finalized=${await lab.finalized(alice.address)}`);
  try {
    await lab.finalize.staticCall(alice.address, clear, res.decryptionProof);
    console.log("UNEXPECTED: replay accepted");
  } catch (e: any) {
    console.log(`replay rejected: ${(e.shortMessage ?? e.message).slice(0, 120)}`);
  }
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

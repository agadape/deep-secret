// S11 — real Zama testnet relayer round-trip without spending gas: build an encrypted input + ZK proof for Sepolia.
import { ethers, fhevm, network } from "hardhat";

async function main() {
  const [alice] = await ethers.getSigners();
  await fhevm.initializeCLIApi();
  console.log(`network=${network.name} mock=${fhevm.isMock} user=${alice.address}`);
  // any contract address works for building the proof; it is only checked when the tx is sent
  const target = "0x4E7B06D78965594eB5EF5414c357ca21E1554491";
  for (const run of [1, 2, 3]) {
    const s = Date.now();
    const enc = await fhevm.createEncryptedInput(target, alice.address).add8(3).add64(5_000_000n).encrypt();
    console.log(
      `run ${run}: ${((Date.now() - s) / 1000).toFixed(1)}s handles=${enc.handles.length} ` +
        `h0=${ethers.hexlify(enc.handles[0])} proofBytes=${enc.inputProof.length}`,
    );
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

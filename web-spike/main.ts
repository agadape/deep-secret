// S12 — does @zama-fhe/sdk initialise in a real browser and build an encrypted input against Zama's Sepolia relayer?
import { createPublicClient, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

const out = document.getElementById("out")!;
const lines: string[] = [];
const log = (m: string) => {
  lines.push(m);
  out.textContent = lines.join("\n");
  (window as any).__spike = lines;
};

async function run() {
  lines.length = 0;
  log(`crossOriginIsolated=${self.crossOriginIsolated} SAB=${typeof SharedArrayBuffer} cores=${navigator.hardwareConcurrency}`);
  try {
    const account = privateKeyToAccount(generatePrivateKey()); // in-memory throwaway, never funded
    const rpc = "https://ethereum-sepolia-rpc.publicnode.com";
    const publicClient = createPublicClient({ chain: sepolia, transport: http(rpc) });
    const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpc) });
    let t = performance.now();
    const config = createConfig({
      chains: [sepoliaFhe],
      publicClient,
      walletClient,
      relayers: { [sepoliaFhe.id]: web() },
    } as any);
    const sdk = new ZamaSDK(config);
    log(`sdk constructed ${(performance.now() - t).toFixed(0)}ms relayerUrl=${(sepoliaFhe as any).relayerUrl}`);
    for (const i of [1, 2, 3]) {
      t = performance.now();
      const enc = await sdk.relayer.encryptValues({
        values: [
          { type: "euint8", value: 3n },
          { type: "euint64", value: 5_000_000n },
        ],
        contractAddress: "0x4E7B06D78965594eB5EF5414c357ca21E1554491",
        userAddress: account.address,
      });
      log(`encrypt ${i}: ${((performance.now() - t) / 1000).toFixed(1)}s values=${enc.encryptedValues.length} h0=${enc.encryptedValues[0]} proofLen=${enc.inputProof.length}`);
    }
    log("DONE");
  } catch (e: any) {
    log(`ERROR ${e?.name}: ${e?.message}\n${e?.stack?.slice(0, 600)}`);
  }
}
document.getElementById("run")!.addEventListener("click", run);
run();

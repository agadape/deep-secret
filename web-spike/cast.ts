// S19 — in a real browser: one permit, then decrypt the 5 packed euint32 fish of a Sepolia cast in ONE call
// (and packed + price = 10 values in one call). Values must match the Node run of S17.
// Uses the throwaway Sepolia test wallet from spike-ws/.env (local dev only).
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

const GAME = "0x501b3FD5089dafc7562430E473F350768FD129D1" as const;
const abi = parseAbi(["function getFish(uint256) view returns (address, bytes32, bytes32, bytes32)"]);
const TIERS = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];
const decode = (v: bigint) => {
  const n = Number(v);
  return { tier: TIERS[n & 7], species: (n >> 3) & 3, aura: (n >> 5) & 1, weight: (n >> 8) & 255, valid: (n >> 16) & 1 };
};
const out = document.getElementById("out")!;
const lines: string[] = [];
const log = (m: string) => {
  lines.push(m);
  out.textContent = lines.join("\n");
};
const secs = (t: number) => ((performance.now() - t) / 1000).toFixed(1) + "s";

async function run() {
  try {
    log(`crossOriginIsolated=${self.crossOriginIsolated}`);
    const account = privateKeyToAccount(import.meta.env.PRIVATE_KEY_ALICE as `0x${string}`);
    const rpc = "https://ethereum-sepolia-rpc.publicnode.com";
    const publicClient = createPublicClient({ chain: sepolia, transport: http(rpc) });
    const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpc) });
    const sdk = new ZamaSDK(
      createConfig({ chains: [sepoliaFhe], publicClient, walletClient, relayers: { [sepoliaFhe.id]: web() } } as any),
    );
    const fish = [];
    for (let i = 0n; i < 5n; i++) {
      fish.push(await publicClient.readContract({ address: GAME, abi, functionName: "getFish", args: [i] }));
    }
    const packed = fish.map((f) => f[1]);
    const prices = fish.map((f) => f[2]);
    log(`owner=${fish[0][0]} (expect ${account.address})`);

    let t = performance.now();
    await sdk.permits.grantPermit([GAME]);
    log(`grantPermit: ${secs(t)}`);

    t = performance.now();
    const p5 = await sdk.decryption.decryptValues(packed.map((h) => ({ encryptedValue: h, contractAddress: GAME })));
    log(`decrypt 5 packed in one call: ${secs(t)}`);

    t = performance.now();
    const all = await sdk.decryption.decryptValues(
      [...packed, ...prices].map((h) => ({ encryptedValue: h, contractAddress: GAME })),
    );
    log(`decrypt 10 values (packed + price) in one call: ${secs(t)}`);

    packed.forEach((h, i) => {
      const f = decode(BigInt(p5[h] as any));
      log(`  fish ${i}: ${f.tier} species=${f.species} weight=${f.weight} aura=${f.aura} valid=${f.valid} price=${all[prices[i]]}`);
    });
    log("DONE");
  } catch (e: any) {
    log(`ERROR ${e?.name}: ${e?.message}\n${e?.stack?.slice(0, 700)}`);
  }
}
run();

// S13 — in a real browser: sign an EIP-712 decryption permit, user-decrypt private dice, public-decrypt the revealed bit.
// Uses the throwaway Sepolia test wallet from spike-ws/.env (local dev only).
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

const LAB = "0xcA9FA3a5cF916e6b540d4074736344A1d05C61e4" as const;
const abi = parseAbi([
  "function getDice(address) view returns (bytes32[5])",
  "function getHit(address) view returns (bytes32)",
]);
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
    const dice = await publicClient.readContract({ address: LAB, abi, functionName: "getDice", args: [account.address] });
    const hit = await publicClient.readContract({ address: LAB, abi, functionName: "getHit", args: [account.address] });
    log(`user=${account.address} dice handles=${dice.length}`);

    let t = performance.now();
    await sdk.permits.grantPermit([LAB]);
    log(`grantPermit (EIP-712 signature): ${secs(t)}`);

    t = performance.now();
    const one = await sdk.decryption.decryptValues([{ encryptedValue: dice[0], contractAddress: LAB }]);
    log(`decrypt 1 die: ${secs(t)} -> ${one[dice[0]]}`);

    t = performance.now();
    const all = await sdk.decryption.decryptValues(dice.map((h) => ({ encryptedValue: h, contractAddress: LAB })));
    log(`decrypt 5 dice in one call: ${secs(t)} -> ${dice.map((h) => all[h]).join(",")}`);

    t = performance.now();
    const again = await sdk.decryption.decryptValues(dice.map((h) => ({ encryptedValue: h, contractAddress: LAB })));
    log(`decrypt 5 dice again (cache?): ${secs(t)} -> ${dice.map((h) => again[h]).join(",")}`);

    t = performance.now();
    const pub: any = await sdk.decryption.decryptPublicValues([hit]);
    log(`public decrypt hit: ${secs(t)} keys=${Object.keys(pub).join(",")} value=${JSON.stringify(pub.clearValues ?? pub, (_, v) => (typeof v === "bigint" ? v.toString() : v)).slice(0, 200)}`);
    log("DONE");
  } catch (e: any) {
    log(`ERROR ${e?.name}: ${e?.message}\n${e?.stack?.slice(0, 700)}`);
  }
}
run();

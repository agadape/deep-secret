// Presence login with a session key (FE_REQUESTS #1): the key signs, the server checks activeKeyOf(player) on-chain.
// Uses the throwaway Alice testnet key from contracts/.env and the game at GAME_ADDRESS (or the server default).
// Usage: start the server, then `node test-session-login.mjs`
import WebSocket from "ws";
import { createPublicClient, createWalletClient, http, parseAbi, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

process.loadEnvFile(new URL("../contracts/.env", import.meta.url));
const URL_WS = process.env.RT_URL ?? "ws://localhost:8787/ws";
const GAME = process.env.GAME_ADDRESS ?? "0x7316ba642A6BB9966d6e713726Ac01EA148E96Eb";
const RPC = process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.ethpandaops.io";
const alice = privateKeyToAccount(process.env.PRIVATE_KEY_ALICE);
const key = privateKeyToAccount(generatePrivateKey());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function login({ signer, address, keyAddr }) {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL_WS);
    ws.on("message", async (raw) => {
      const m = JSON.parse(raw);
      if (m.t === "challenge") {
        const signature = await signer.signMessage({ message: m.message });
        ws.send(JSON.stringify({ t: "auth", address, key: keyAddr, signature, name: "tes" }));
      } else if (m.t === "welcome" || m.t === "error") {
        ws.close();
        resolve(m.t === "welcome" ? "welcome" : m.error);
      }
    });
    ws.on("close", () => resolve("closed"));
  });
}

const pub = createPublicClient({ chain: sepolia, transport: http(RPC) });
const wallet = createWalletClient({ account: alice, chain: sepolia, transport: http(RPC) });
const abi = parseAbi([
  "function authorizeSession(address key, uint64 expiresAt) payable", // deployment 0x7316 (pre-review signature)
  "function activeKeyOf(address player) view returns (address)",
]);

console.log("key not authorized yet:", await login({ signer: key, address: alice.address, keyAddr: key.address }));
const hash = await wallet.writeContract({
  address: GAME,
  abi,
  functionName: "authorizeSession",
  args: [key.address, BigInt(Math.floor(Date.now() / 1000) + 600)],
  value: parseEther("0"),
  gasPrice: 100_000n,
});
await pub.waitForTransactionReceipt({ hash });
for (let i = 0; i < 10 && (await pub.readContract({ address: GAME, abi, functionName: "activeKeyOf", args: [alice.address] })).toLowerCase() !== key.address.toLowerCase(); i++) await sleep(2000);
console.log(`authorized ${key.address} in ${hash}`);
console.log("key logs in as alice:", await login({ signer: key, address: alice.address, keyAddr: key.address }));
console.log("key claims to be someone else:", await login({ signer: key, address: "0x722df08ED4E04eB01171032084069bEe77Aeb32F", keyAddr: key.address }));
console.log("alice signs herself (old flow):", await login({ signer: alice, address: alice.address }));

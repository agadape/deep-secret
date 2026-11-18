// Spike S21 test: two signed-in headless clients (the throwaway Alice/Bob testnet keys), end-to-end movement latency,
// bad-signature rejection, room overflow at 31 players, and a real Sepolia Cast event relayed by the server.
import WebSocket from "ws";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

process.loadEnvFile(new URL("../spike-ws/.env", import.meta.url));
const URL_WS = process.env.RT_URL ?? "ws://localhost:8787/ws";
const GAME = "0x501b3FD5089dafc7562430E473F350768FD129D1";
const RPC = process.env.SEPOLIA_RPC_URL;
const SKIP_CHAIN = process.env.SKIP_CHAIN === "1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (a, p) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor((a.length * p) / 100))];

function connect(account, name, { forgeAs } = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL_WS);
    const c = { ws, account, name, inbox: [], snaps: [], chain: [], welcome: undefined, error: undefined };
    ws.on("message", async (raw) => {
      const m = JSON.parse(raw);
      if (m.t === "challenge") {
        const signature = await account.signMessage({ message: m.message });
        ws.send(JSON.stringify({ t: "auth", address: forgeAs ?? account.address, signature, name }));
      } else if (m.t === "welcome") {
        c.welcome = m;
        resolve(c);
      } else if (m.t === "snap") c.snaps.push({ at: Date.now(), m });
      else if (m.t === "chain") c.chain.push({ at: Date.now(), m });
      else if (m.t === "error") {
        c.error = m.error;
        resolve(c);
      }
    });
    ws.on("close", () => resolve(c));
    ws.on("error", reject);
  });
}

const alice = privateKeyToAccount(process.env.PRIVATE_KEY_ALICE);
const bob = privateKeyToAccount(process.env.PRIVATE_KEY_BOB);

// 1. login + mutual visibility
const A = await connect(alice, "Alice");
const B = await connect(bob, "Bob");
console.log(`A welcome: id=${A.welcome.id} room=${A.welcome.room}; B welcome: id=${B.welcome.id} room=${B.welcome.room}`);
if (A.welcome.room !== B.welcome.room) throw new Error("A and B should share a room");

// 2. A walks for 10 s at 10 Hz; B measures send→receive delay from A's client timestamp
const samples = [];
let lastCts = 0;
const t0 = Date.now();
let x = 100;
while (Date.now() - t0 < 10_000) {
  x = (x + 3) % 900;
  A.ws.send(JSON.stringify({ t: "state", x, y: 200, dir: "right", anim: "walk", cts: Date.now() }));
  await sleep(100);
}
for (const s of B.snaps) {
  const a = s.m.players.find((p) => p.id === A.welcome.id);
  if (a && a.cts && a.cts !== lastCts) {
    samples.push(s.at - a.cts);
    lastCts = a.cts;
  }
}
const seen = B.snaps.at(-1)?.m.players.find((p) => p.id === A.welcome.id);
console.log(`B saw A at x=${seen?.x} anim=${seen?.anim}; snapshots=${B.snaps.length}`);
console.log(`movement latency A→B over ${samples.length} updates: p50=${pct(samples, 50)} ms p95=${pct(samples, 95)} ms max=${Math.max(...samples)} ms`);
const leaked = JSON.stringify(B.snaps.at(-1)?.m.players ?? []).match(/fish|tier|weight|aura|price|address/i);
console.log(`snapshot fields: ${Object.keys(seen ?? {}).join(",")} — private/identity field leaked: ${leaked ? leaked[0] : "none"}`);

// 3. forged login: Bob's key claiming Alice's address must be rejected
const F = await connect(bob, "Forger", { forgeAs: alice.address });
console.log(`forged login result: ${F.error ?? "ACCEPTED (bad)"}`);

// 4. room overflow: 29 more guests fill pulau-1 to 31 players → one lands in a new room
const guests = [];
for (let i = 0; i < 29; i++) guests.push(await connect(privateKeyToAccount(generatePrivateKey()), `Tamu${i}`));
const roomsSeen = new Set([A, B, ...guests].map((c) => c.welcome.room));
console.log(`31 players → rooms: ${[...roomsSeen].join(", ")}`);
const health = await (await fetch(URL_WS.replace("ws://", "http://").replace("/ws", "/health"))).json();
console.log(`server /health: ${JSON.stringify(health)}`);
for (const g of guests) g.ws.close();

// 5. real Sepolia Cast by Alice → server relays the public event to both clients
if (!SKIP_CHAIN) {
  const pc = createPublicClient({ chain: sepolia, transport: http(RPC) });
  const wc = createWalletClient({ account: alice, chain: sepolia, transport: http(RPC) });
  const hash = await wc.writeContract({
    address: GAME,
    abi: parseAbi(["function cast() returns (uint256)"]),
    functionName: "cast",
    gas: 12_000_000n,
    maxFeePerGas: 200_000n,
    maxPriorityFeePerGas: 100_000n,
  });
  const rc = await pc.waitForTransactionReceipt({ hash });
  const minedAt = Date.now();
  console.log(`Alice cast tx ${hash} status=${rc.status} block=${rc.blockNumber}`);
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline && !(A.chain.some((e) => e.m.tx === hash) && B.chain.some((e) => e.m.tx === hash))) await sleep(500);
  const ea = A.chain.find((e) => e.m.tx === hash);
  const eb = B.chain.find((e) => e.m.tx === hash);
  console.log(`chain event relayed: A=${ea ? `+${ea.at - minedAt} ms after receipt` : "NOT RECEIVED"} B=${eb ? `+${eb.at - minedAt} ms after receipt` : "NOT RECEIVED"}`);
  console.log(`relayed payload: ${JSON.stringify(eb?.m ?? {})}`);
}

A.ws.close();
B.ws.close();
process.exit(0);

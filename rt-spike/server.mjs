// Spike S21 — cosmetic realtime room server for Deep Secret.
// Syncs only what GAME_SPEC §4.4 / ART_BIBLE §8.4 allow: player id, name, position, facing, animation state, emotes,
// plus public contract events. It never receives or stores fish data, keys, or decryption rights.
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createPublicClient, http, parseAbi, verifyMessage } from "viem";
import { sepolia } from "viem/chains";

const PORT = Number(process.env.PORT ?? 8787);
const ROOM_CAP = Number(process.env.ROOM_CAP ?? 30);
const TICK_MS = 100; // 10 Hz snapshots
const WORLD = { w: 960, h: 540 };
const GAME = process.env.GAME_ADDRESS ?? "0x2C253892D001ed11A773a88f749358ff9Ea9442C"; // DeepSecretGame on Sepolia
const RPC = process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
// Animation states carry no catch information: everyone's catch looks the same to others (ART_BIBLE Addendum A2).
const ANIMS = new Set(["idle", "walk", "cast", "fishing", "reel", "hold_unknown", "snatch", "flex"]);
const DIRS = new Set(["up", "down", "left", "right"]);
const EMOTES = new Set(["wave", "cool", "cry", "shh", "laugh"]);
const MAX_MSGS_PER_SEC = 30;

const loginMessage = (nonce) => `Deep Secret — masuk ke pulau\n\nTanda tangan ini gratis dan tidak mengirim transaksi.\nNonce: ${nonce}`;

const rooms = new Map();
let nextRoom = 1;
let nextPlayer = 1;
const byAddress = new Map();

function pickRoom() {
  for (const r of rooms.values()) if (r.players.size < ROOM_CAP) return r;
  const r = { id: `pulau-${nextRoom++}`, players: new Map(), dirty: true };
  rooms.set(r.id, r);
  return r;
}

const send = (ws, msg) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(msg));
const broadcast = (room, msg) => {
  const s = JSON.stringify(msg);
  for (const ws of room.players.keys()) if (ws.readyState === ws.OPEN) ws.send(s);
};
const publicView = (p) => ({ id: p.id, name: p.name, x: p.x, y: p.y, dir: p.dir, anim: p.anim, cts: p.cts });

// Static test page, served with the same isolation headers the game will use.
const page = readFileSync(new URL("./public/index.html", import.meta.url));
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ rooms: [...rooms.values()].map((r) => ({ id: r.id, players: r.players.size })) }));
    return;
  }
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-embedder-policy": "require-corp",
  });
  res.end(page);
});

const wss = new WebSocketServer({ server: httpServer, path: "/ws", maxPayload: 1024 });

wss.on("connection", (ws) => {
  const nonce = randomBytes(16).toString("hex");
  const conn = { nonce, player: undefined, room: undefined, window: Date.now(), count: 0 };
  send(ws, { t: "challenge", message: loginMessage(nonce) });

  ws.on("message", async (raw) => {
    const now = Date.now();
    if (now - conn.window > 1000) {
      conn.window = now;
      conn.count = 0;
    }
    if (++conn.count > MAX_MSGS_PER_SEC) return;
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }

    if (m.t === "auth" && !conn.player) {
      let ok = false;
      try {
        ok = await verifyMessage({ address: m.address, message: loginMessage(nonce), signature: m.signature });
      } catch {
        ok = false;
      }
      if (!ok) {
        send(ws, { t: "error", error: "bad_signature" });
        ws.close();
        return;
      }
      const address = m.address.toLowerCase();
      const old = byAddress.get(address);
      if (old) old.close(4000, "logged in elsewhere"); // one avatar per address
      const room = pickRoom();
      const name = String(m.name ?? "").replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 16) || address.slice(0, 8);
      const p = { id: nextPlayer++, address, name, x: WORLD.w / 2, y: WORLD.h / 2, dir: "down", anim: "idle", cts: 0 };
      conn.player = p;
      conn.room = room;
      room.players.set(ws, p);
      room.dirty = true;
      byAddress.set(address, ws);
      send(ws, { t: "welcome", id: p.id, room: room.id, world: WORLD, players: [...room.players.values()].map(publicView) });
      return;
    }
    if (!conn.player) return;
    const p = conn.player;

    if (m.t === "state") {
      if (Number.isFinite(m.x)) p.x = Math.max(0, Math.min(WORLD.w, m.x));
      if (Number.isFinite(m.y)) p.y = Math.max(0, Math.min(WORLD.h, m.y));
      if (DIRS.has(m.dir)) p.dir = m.dir;
      if (ANIMS.has(m.anim)) p.anim = m.anim;
      if (Number.isFinite(m.cts)) p.cts = m.cts;
      conn.room.dirty = true;
    } else if (m.t === "emote" && EMOTES.has(m.e)) {
      broadcast(conn.room, { t: "emote", id: p.id, e: m.e });
    } else if (m.t === "ping") {
      send(ws, { t: "pong", cts: m.cts });
    }
  });

  ws.on("close", () => {
    if (!conn.player) return;
    conn.room.players.delete(ws);
    if (byAddress.get(conn.player.address) === ws) byAddress.delete(conn.player.address);
    broadcast(conn.room, { t: "left", id: conn.player.id });
    if (conn.room.players.size === 0) rooms.delete(conn.room.id);
  });
});

setInterval(() => {
  const ts = Date.now();
  for (const room of rooms.values()) {
    if (!room.dirty) continue;
    room.dirty = false;
    broadcast(room, { t: "snap", room: room.id, ts, players: [...room.players.values()].map(publicView) });
  }
}, TICK_MS);

// Public contract events → every room. The real game listens for Flexed (and Snatched); the spike contract emits Cast.
const chain = createPublicClient({ chain: sepolia, transport: http(RPC) });
chain.watchContractEvent({
  address: GAME,
  abi: parseAbi([
    "event Cast(address indexed player, uint8 zoneId, uint256 firstFishId)",
    "event Flexed(address indexed player, uint256 indexed fishId, uint256 tokenId, uint8 species, uint8 aura, uint8 weight, uint32 serial)",
  ]),
  pollingInterval: 4000,
  onLogs: (logs) => {
    for (const l of logs) {
      const msg = {
        t: "chain",
        event: l.eventName,
        player: l.args.player,
        ...(l.eventName === "Flexed"
          ? { species: l.args.species, serial: l.args.serial, tokenId: String(l.args.tokenId) }
          : { firstFishId: String(l.args.firstFishId) }),
        tx: l.transactionHash,
        serverTs: Date.now(),
      };
      console.log(`[chain] ${l.eventName} by ${l.args.player} in tx ${l.transactionHash}`);
      for (const room of rooms.values()) broadcast(room, msg);
    }
  },
  onError: (e) => console.error(`[chain] ${e.shortMessage ?? e.message}`),
});

httpServer.listen(PORT, () => console.log(`rt-spike listening on http://localhost:${PORT} (ws path /ws), room cap ${ROOM_CAP}`));

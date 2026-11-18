// S22 — Phaser 3 world + @zama-fhe/sdk in one bundle on a cross-origin-isolated page.
// Pass: page ready to play < 5 s on a laptop; encrypting / decrypting does not freeze the animated world.
import Phaser from "phaser";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

const GAME = "0x501b3FD5089dafc7562430E473F350768FD129D1" as const;
const abi = parseAbi(["function getFish(uint256) view returns (address, bytes32, bytes32, bytes32)"]);
const out = document.getElementById("out")!;
const log = (m: string) => {
  out.textContent += m + "\n";
  fetch("/__log", { method: "POST", body: JSON.stringify({ page: "s22", t: new Date().toISOString(), m }) }).catch(() => {});
};
const ms = (t: number) => `${Math.round(performance.now() - t)} ms`;

// ---------- frame-gap and long-task meter ----------
let measuring = false;
let maxGap = 0;
let frames = 0;
let lastFrame = performance.now();
const longTasks: number[] = [];
(function tick(t: number) {
  const gap = t - lastFrame;
  lastFrame = t;
  if (measuring) {
    frames++;
    maxGap = Math.max(maxGap, gap);
  }
  requestAnimationFrame(tick);
})(performance.now());
try {
  new PerformanceObserver((l) => {
    if (measuring) for (const e of l.getEntries()) longTasks.push(e.duration);
  }).observe({ type: "longtask", buffered: false });
} catch {
  log("longtask observer not supported");
}
async function measure(label: string, f: () => Promise<string>) {
  maxGap = 0;
  frames = 0;
  longTasks.length = 0;
  measuring = true;
  const t = performance.now();
  let detail = "";
  try {
    detail = await f();
  } catch (e: any) {
    detail = `ERROR ${e?.message ?? e}`;
  }
  measuring = false;
  const dt = (performance.now() - t) / 1000;
  log(
    `${label}: ${dt.toFixed(1)} s | world fps ${(frames / dt).toFixed(0)} | max frame gap ${Math.round(maxGap)} ms | long tasks ${longTasks.length} (max ${Math.round(Math.max(0, ...longTasks))} ms) | ${detail}`,
  );
}

// ---------- Phaser world (procedural textures, no asset files) ----------
const tNav = performance.timeOrigin ? 0 : 0;
let worldReadyAt = 0;
class Island extends Phaser.Scene {
  create() {
    const g = this.add.graphics();
    g.fillStyle(0x277c78).fillRect(0, 0, 16, 16).fillStyle(0x65c9b5).fillRect(2, 3, 5, 1).fillRect(9, 10, 4, 1);
    g.generateTexture("water", 16, 16).clear();
    g.fillStyle(0x26343b).fillRect(0, 0, 12, 14).fillStyle(0xf18d5b).fillRect(1, 1, 10, 7).fillStyle(0xf4efd9).fillRect(3, 9, 6, 4);
    g.generateTexture("avatar", 12, 14).clear();
    g.fillStyle(0x0c0a16).fillEllipse(8, 5, 16, 9).fillTriangle(14, 5, 19, 1, 19, 9);
    g.generateTexture("silhouette", 20, 10).destroy();

    const water = this.add.tileSprite(0, 0, 480, 190, "water").setOrigin(0);
    this.add.rectangle(0, 190, 480, 80, 0xf2d38d).setOrigin(0);
    this.events.on("update", () => (water.tilePositionX += 0.25));

    // 30 wandering avatars, 30 bobbing bobbers and silhouettes: roughly a full island
    for (let i = 0; i < 30; i++) {
      const a = this.add.image(Phaser.Math.Between(10, 470), Phaser.Math.Between(196, 262), "avatar");
      this.tweens.add({ targets: a, x: Phaser.Math.Between(10, 470), duration: Phaser.Math.Between(2000, 5000), yoyo: true, repeat: -1 });
      const b = this.add.circle(Phaser.Math.Between(10, 470), Phaser.Math.Between(150, 185), 2, 0xf18d5b);
      this.tweens.add({ targets: b, y: b.y + 2, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const s = this.add.image(a.x, a.y - 12, "silhouette");
      this.tweens.add({ targets: s, y: s.y - 2, duration: 900, yoyo: true, repeat: -1 });
    }
    const label = this.add.text(4, 4, "", { fontFamily: "system-ui", fontSize: "10px", color: "#f4efd9" });
    this.events.on("update", () => label.setText(`fps ${this.game.loop.actualFps.toFixed(0)}`));
    worldReadyAt = performance.now();
    log(`world visible at ${Math.round(worldReadyAt)} ms after navigation (crossOriginIsolated=${self.crossOriginIsolated})`);
  }
}
void tNav;
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 480,
  height: 270,
  pixelArt: true,
  backgroundColor: "#163b42",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: Island,
});

// ---------- SDK ----------
const rpc = "https://ethereum-sepolia-rpc.publicnode.com";
const devKey = import.meta.env.DEV ? (import.meta.env.PRIVATE_KEY_ALICE as `0x${string}` | undefined) : undefined;
const account = privateKeyToAccount(devKey ?? generatePrivateKey());
const publicClient = createPublicClient({ chain: sepolia, transport: http(rpc) });
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpc) });
let t = performance.now();
const sdk = new ZamaSDK(
  createConfig({ chains: [sepoliaFhe], publicClient, walletClient, relayers: { [sepoliaFhe.id]: web() } } as any),
);
log(`sdk constructed in ${ms(t)}; wallet ${devKey ? "Alice (dev)" : "random (prod build, decrypt disabled)"}`);

const encrypt = () =>
  measure("encrypt 2 values", async () => {
    const r = await sdk.relayer.encryptValues({
      values: [
        { type: "euint8", value: 3n },
        { type: "euint64", value: 5_000_000n },
      ],
      contractAddress: GAME,
      userAddress: account.address,
    });
    return `${r.encryptedValues.length} handles, proof ${r.inputProof.length} chars`;
  });

const decrypt = () =>
  measure("permit + decrypt 5 fish", async () => {
    if (!devKey) return "skipped (needs Alice key, dev only)";
    const handles: `0x${string}`[] = [];
    for (let i = 0n; i < 5n; i++) handles.push((await publicClient.readContract({ address: GAME, abi, functionName: "getFish", args: [i] }))[1]);
    await sdk.permits.grantPermit([GAME]);
    const v = await sdk.decryption.decryptValues(handles.map((h) => ({ encryptedValue: h, contractAddress: GAME })));
    return handles.map((h) => ["Biasa", "Langka", "Epik", "Legenda", "Secret"][Number(v[h]) & 7]).join(", ");
  });

document.getElementById("enc")!.onclick = encrypt;
document.getElementById("dec")!.onclick = decrypt;

// Auto-run once the world is up: baseline, warm-up encrypt (downloads FHE keys + WASM), warm encrypt, decrypt.
(async () => {
  while (!worldReadyAt) await new Promise((r) => setTimeout(r, 50));
  await measure("baseline (no crypto)", async () => {
    await new Promise((r) => setTimeout(r, 3000));
    return "idle world";
  });
  await encrypt();
  await encrypt();
  await decrypt();
  log("S22 DONE");
})();

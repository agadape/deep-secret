// Bakes the island ground (src/game/terrainArt.ts) into public/terrain.png, so phones do not repaint ~1.1M pixels
// on the main thread at every page load. The painter is deterministic (hash noise only, no Math.random), so the PNG
// is exactly what the runtime fallback would paint. Run after changing terrainArt.ts or map.ts:
//   node scripts/bake-terrain.mjs
import { rolldown } from "rolldown";
import { deflateSync } from "node:zlib";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "bake-terrain-"));
const file = join(dir, "terrainArt.mjs");
const bundle = await rolldown({ input: join(root, "src/game/terrainArt.ts"), logLevel: "silent" });
await bundle.write({ file, format: "esm" });
await bundle.close();
const { paintTerrainPixels } = await import(pathToFileURL(file).href);
rmSync(dir, { recursive: true, force: true });

const t0 = performance.now();
const { width, height, data } = paintTerrainPixels();
const ms = Math.round(performance.now() - t0);

// Minimal PNG encoder: RGBA 8-bit, per-row filter chosen by the smallest absolute sum (none, sub, up).
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, body) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const tb = Buffer.concat([Buffer.from(type, "ascii"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tb));
  return Buffer.concat([len, tb, crc]);
};
const stride = width * 4;
const raw = Buffer.alloc((stride + 1) * height);
for (let y = 0; y < height; y++) {
  const row = data.subarray(y * stride, (y + 1) * stride);
  const prev = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
  const cands = [0, 1, 2].map((f) => {
    const out = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prev ? prev[i] : 0;
      out[i] = (row[i] - (f === 1 ? left : f === 2 ? up : 0)) & 0xff;
    }
    let sum = 0;
    for (const v of out) sum += v < 128 ? v : 256 - v;
    return { f, out, sum };
  });
  const best = cands.reduce((a, b) => (b.sum < a.sum ? b : a));
  raw[y * (stride + 1)] = best.f;
  best.out.copy(raw, y * (stride + 1) + 1);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr.set([8, 6, 0, 0, 0], 8);
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
const outPath = join(root, "public/terrain.png");
writeFileSync(outPath, png);
console.log(`terrain.png ${width}x${height}, ${(png.length / 1024).toFixed(0)} KB, painted in ${ms} ms`);

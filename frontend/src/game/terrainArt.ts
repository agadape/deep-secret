import { GRID, TILE, WORLD_H, WORLD_W, type Terrain } from "./map";

/**
 * Paints the island ground once, pixel by pixel, at the logical resolution (1 texel = 1 world pixel).
 * Style F (DESIGN.md): hi-color pixel art with 4-6 step ramps per material, organized texture clusters,
 * stepped organic edges and translucent-looking shadows. Every colour comes from the ramps below, so the
 * result stays on one pixel grid and scales crisply with nearest-neighbour.
 * Collision stays tile based (map.ts); the painted shore only rounds the tile corners by a few pixels.
 */

/** The painted canvas covers the camera margin around the world too, so there is no hard edge. */
export const PAINT_OX = 160;
export const PAINT_OY = 120;
const W = WORLD_W + 2 * PAINT_OX;
const H = WORLD_H + 2 * PAINT_OY;

// Deep-sky sea: foam, turquoise shallows, deep sky blue, steel blue, near-black navy (ART_BIBLE §4 + DESIGN.md).
export const WATER = [
  "#f2fcff", "#b6f1f2", "#6fe3e2", "#35cfe2", "#14b8ec", "#0aa2de", "#0b88c6",
  "#0b6eaa", "#0b558c", "#0a3f6f", "#082e55", "#07203f", "#06162d",
];
const SAND = ["#fff4d8", "#f8e3b2", "#efd092", "#e2ba79", "#cfa165", "#b38350", "#8f653e"];
const GRASS = ["#c8ee8a", "#a3d96e", "#80c457", "#62a847", "#488a3b", "#356b32"];
const WOOD = ["#f3c88f", "#dba36a", "#bb814c", "#96623b", "#70472c", "#4b2f20"];
const CORAL = ["#ff9a7a", "#ffbe63", "#f2708a", "#ffd9a0"];
const FLOWER = ["#ff8fb3", "#ffe270", "#ffffff"];
export const DEEPEST = WATER[WATER.length - 1];

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};

function hash(x: number, y: number, s = 0) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s + 1, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function vnoise(x: number, y: number, size: number, s = 0) {
  const gx = x / size;
  const gy = y / size;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, s);
  const b = hash(x0 + 1, y0, s);
  const c = hash(x0, y0 + 1, s);
  const d = hash(x0 + 1, y0 + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Terrain under a canvas pixel; everything outside the world is open deep sea. */
const tileAt = (x: number, y: number): Terrain => {
  const tx = Math.floor((x - PAINT_OX) / TILE);
  const ty = Math.floor((y - PAINT_OY) / TILE);
  if (tx < 0 || ty < 0 || ty >= GRID.length || tx >= GRID[0].length) return "deep";
  return GRID[ty][tx];
};

function mask(pred: (t: Terrain) => boolean) {
  const m = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m[y * W + x] = pred(tileAt(x, y)) ? 1 : 0;
  return m;
}

/** Two passes of a separable box blur, close to a gaussian. */
function blur(src: Float32Array, r: number) {
  const n = 2 * r + 1;
  const a = new Float32Array(W * H);
  const b = new Float32Array(W * H);
  const cl = (v: number, hi: number) => (v < 0 ? 0 : v > hi ? hi : v);
  const pass = (from: Float32Array, to: Float32Array) => {
    for (let y = 0; y < H; y++) {
      const row = y * W;
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += from[row + cl(x, W - 1)];
      for (let x = 0; x < W; x++) {
        to[row + x] = acc / n;
        acc += from[row + cl(x + r + 1, W - 1)] - from[row + cl(x - r, W - 1)];
      }
    }
  };
  const passV = (from: Float32Array, to: Float32Array) => {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += from[cl(y, H - 1) * W + x];
      for (let y = 0; y < H; y++) {
        to[y * W + x] = acc / n;
        acc += from[cl(y + r + 1, H - 1) * W + x] - from[cl(y - r, H - 1) * W + x];
      }
    }
  };
  pass(src, a);
  passV(a, b);
  pass(b, a);
  passV(a, b);
  return b;
}

/** Chamfer distance (px) from every pixel to the nearest pixel where `inside` is true. */
function distance(inside: Uint8Array) {
  const INF = 1e9;
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = inside[i] ? 0 : INF;
  const D = Math.SQRT2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - W] + 1);
        if (x > 0) v = Math.min(v, d[i - W - 1] + D);
        if (x < W - 1) v = Math.min(v, d[i - W + 1] + D);
      }
      d[i] = v;
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      let v = d[i];
      if (x < W - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < H - 1) {
        v = Math.min(v, d[i + W] + 1);
        if (x < W - 1) v = Math.min(v, d[i + W + 1] + D);
        if (x > 0) v = Math.min(v, d[i + W - 1] + D);
      }
      d[i] = v;
    }
  return d;
}

/** Edge strength of a jittered cell pattern: small values sit on the thin lines between cells (caustics). */
function cellEdge(x: number, y: number, size: number) {
  const cx = Math.floor(x / size);
  const cy = Math.floor(y / size);
  let f1 = 1e9;
  let f2 = 1e9;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const px = (cx + i + 0.15 + hash(cx + i, cy + j, 11) * 0.7) * size;
      const py = (cy + j + 0.15 + hash(cx + i, cy + j, 12) * 0.7) * size;
      const dd = Math.hypot(px - x, py - y);
      if (dd < f1) {
        f2 = f1;
        f1 = dd;
      } else if (dd < f2) f2 = dd;
    }
  return f2 - f1;
}

const WATER_STEPS = [1.5, 3, 7, 12, 20, 32, 46, 62, 80, 102, 128, 158];
const waterIndex = (d: number) => {
  let i = 0;
  while (i < WATER_STEPS.length && d >= WATER_STEPS[i]) i++;
  return i;
};

/** Dock rectangle in canvas pixels (world pixels + paint offset). */
const DOCK = { x0: 29 * TILE + PAINT_OX, x1: 31 * TILE + PAINT_OX, y0: 31 * TILE + PAINT_OY, y1: 38 * TILE + PAINT_OY };

export function paintTerrain(): HTMLCanvasElement {
  const landTiles = (t: Terrain) => t === "sand" || t === "grass" || t === "building";
  const landSoft = blur(mask(landTiles), 5);
  const grassSoft = blur(mask((t) => t === "grass" || t === "building"), 8);
  const trenchSoft = blur(mask((t) => t === "trench"), 14);
  const reefSoft = blur(mask((t) => t === "reef"), 10);

  // Organic shore: threshold the softened tile mask with a little noise.
  const land = new Uint8Array(W * H);
  const grass = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      land[i] = landSoft[i] + (vnoise(x, y, 7, 1) - 0.5) * 0.28 > 0.5 ? 1 : 0;
      grass[i] = land[i] && grassSoft[i] + (vnoise(x, y, 9, 2) - 0.5) * 0.42 + (vnoise(x, y, 3, 24) - 0.5) * 0.12 > 0.5 ? 1 : 0;
    }
  const water = new Uint8Array(W * H);
  const sandOnly = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    water[i] = land[i] ? 0 : 1;
    sandOnly[i] = land[i] && !grass[i] ? 1 : 0;
  }
  const toLand = distance(land); // for water pixels: how far from the beach
  const toWater = distance(water); // for land pixels: how far from the sea
  const toSand = distance(sandOnly); // for grass pixels: how far from the sand
  // The dock sits on a shallow sand bar, so the water around it stays deep-sky blue instead of navy.
  const dockMask = new Uint8Array(W * H);
  for (let y = DOCK.y0; y < DOCK.y1; y++) for (let x = DOCK.x0; x < DOCK.x1; x++) dockMask[y * W + x] = 1;
  const toDock = distance(dockMask);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const out = img.data;
  const cache = new Map<string, [number, number, number]>();
  const put = (i: number, hex: string) => {
    let c = cache.get(hex);
    if (!c) cache.set(hex, (c = rgb(hex)));
    out[i * 4] = c[0];
    out[i * 4 + 1] = c[1];
    out[i * 4 + 2] = c[2];
    out[i * 4 + 3] = 255;
  };
  const inDock = (x: number, y: number) => x >= DOCK.x0 && x < DOCK.x1 && y >= DOCK.y0 && y < DOCK.y1;

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!land[i]) {
        // ---- sea ----
        const d = Math.min(toLand[i], toDock[i] * 1.2 + 26);
        const wobble = d < 9 ? (vnoise(x, y, 5, 3) - 0.5) * 2.2 : (vnoise(x, y, 18, 4) - 0.5) * 16;
        let k = waterIndex(d + wobble);
        if (d > 9) k += Math.round(trenchSoft[i] * 2.6) - Math.round(reefSoft[i] * 1.4);
        // second, broken wave line just off the beach
        if (Math.abs(d - 6 - (vnoise(x, y, 9, 5) - 0.5) * 3) < 0.55 && vnoise(x, y, 7, 6) > 0.42) k = 1;
        // shadow of the dock on the water (light from the upper left)
        if (!inDock(x, y) && inDock(x - 3, y - 4)) k += 2;
        k = Math.max(0, Math.min(WATER.length - 1, k));
        // caustic cells: strong in the shallows, broken further out, gone in the deep
        if (k >= 2 && k <= 9) {
          const e = cellEdge(x + vnoise(x, y, 23, 7) * 6, y, k <= 4 ? 11 : 15);
          if (e < (k <= 6 ? 1.05 : 0.8) && (k <= 6 || hash(x, y, 8) > 0.45)) k -= 1;
        }
        let hex = WATER[k];
        // reef: coral clusters seen through the water
        if (reefSoft[i] > 0.45 && k >= 3 && k <= 7 && vnoise(x, y, 4, 9) > 0.74) {
          const c = CORAL[Math.floor(hash(Math.floor(x / 5), Math.floor(y / 5), 10) * CORAL.length)];
          hex = mix(c, WATER[k], 0.45 + (vnoise(x, y, 3, 13) > 0.6 ? 0 : 0.2));
        }
        put(i, hex);
        continue;
      }
      if (!grass[i]) {
        // ---- sand ----
        const dw = toWater[i];
        let k = vnoise(x, y, 40, 14) > 0.55 ? 1 : 2;
        const r = Math.sin(x * 0.21 + y * 0.62 + vnoise(x, y, 28, 15) * 9);
        if (r > 0.94 && vnoise(x, y, 11, 16) > 0.35) k = 0;
        else if (r < -0.9 && vnoise(x, y, 11, 17) > 0.4) k = 3;
        if (hash(x, y, 18) > 0.9975) k = 4;
        if (dw < 5) k = Math.max(k, 3);
        if (dw < 2.5) k = 4;
        // the beach lip facing the camera: water just below a sand pixel shows its front face
        if (y + 2 < H && (water[i + W] || water[i + 2 * W])) k = water[i + W] ? 6 : 5;
        // grass throws a 1 px shadow on the sand just below it
        if (y > 0 && grass[i - W]) k = Math.max(k, 3);
        put(i, SAND[k]);
        continue;
      }
      // ---- grass ----
      const ds = toSand[i];
      let k = vnoise(x, y, 34, 19) > 0.62 ? 3 : 2;
      if (vnoise(x, y, 4, 20) > 0.8) k = 1;
      // small tufts on a loose 6 px lattice: lit tip, two side blades, a shadow under the tip
      const cx = Math.floor(x / 6);
      const cy = Math.floor(y / 6);
      if (hash(cx, cy, 21) > 0.5) {
        const dx = x - (cx * 6 + 1 + Math.floor(hash(cx, cy, 25) * 4));
        const dy = y - (cy * 6 + 1 + Math.floor(hash(cx, cy, 26) * 3));
        if (dx === 0 && dy === 0) k = 0;
        else if (Math.abs(dx) === 1 && dy === 0) k = 1;
        else if (dx === 0 && dy === 1) k = 4;
      }
      if (ds < 1.5) k = 5;
      else if (ds < 3) k = 4;
      let hex = GRASS[k];
      if (ds > 4 && hash(x, y, 22) > 0.9992) hex = FLOWER[Math.floor(hash(x, y, 23) * FLOWER.length)];
      put(i, hex);
    }

  paintDock((x, y, hex) => put(y * W + x, hex));
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Wooden dock running south, 2 tiles wide: planks with grain and nails, rails, posts with a front face. */
function paintDock(put: (x: number, y: number, hex: string) => void) {
  const { x0, x1, y0, y1 } = DOCK;
  for (let y = y0; y < y1; y++) {
    const p = Math.floor((y - y0) / 4);
    const row = (y - y0) % 4;
    const tone = hash(p, 0, 30) > 0.5 ? 0 : 1;
    for (let x = x0; x < x1; x++) {
      let k: number;
      if (row === 3) k = 4;
      else if (row === 0) k = 1 + tone;
      else {
        k = 2 + tone;
        if (vnoise(x * 0.35, y * 3, 2.2, 31 + p) > 0.66) k = 3 + tone;
      }
      if (x < x0 + 2 || x >= x1 - 2) k = x === x0 || x === x1 - 1 ? 5 : 3; // rails
      if (row === 1 && (x === x0 + 3 || x === x1 - 4)) k = 5; // nail heads
      if (row === 1 && (x === x0 + 4 || x === x1 - 3)) k = 0;
      put(x, y, WOOD[Math.min(5, k)]);
    }
  }
  // posts every two tiles on both sides, and the two end posts
  const posts: number[] = [];
  for (let y = y0 + 6; y < y1 - 4; y += 32) posts.push(y);
  posts.push(y1 - 5);
  for (const py of posts)
    for (const px of [x0 - 2, x1 - 2]) {
      for (let dy = 0; dy < 5; dy++)
        for (let dx = 0; dx < 4; dx++) {
          const top = dy < 2;
          const k = top ? (dx === 0 ? 0 : dx === 3 ? 2 : 1) : dx === 0 ? 3 : dx === 3 ? 5 : 4;
          put(px + dx, py + dy, WOOD[k]);
        }
    }
  // front face of the dock end (the camera looks slightly from the south)
  for (let y = y1; y < y1 + 3; y++)
    for (let x = x0; x < x1; x++) put(x, y, WOOD[y === y1 ? 3 : y === y1 + 1 ? 4 : 5]);
}

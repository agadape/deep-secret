import Phaser from "phaser";
import { WATER } from "./terrainArt";

/**
 * Buildings and island props for the style-F art pass, painted pixel by pixel in code (DESIGN.md).
 * High 3/4 overhead view: each building shows its roof and its front wall, and is anchored at the bottom edge of its
 * footprint in map.ts. Light comes from the upper left; every material uses its own 4-6 step ramp.
 */

type Px = { set(x: number, y: number, c: string): void; rect(x: number, y: number, w: number, h: number, c: string): void; w: number; h: number };

const INK = "#2b1d1c";
const WOOD = ["#f3c88f", "#dba36a", "#bb814c", "#96623b", "#70472c", "#4b2f20"];
const STONE = ["#ffffff", "#eef2f5", "#d3dbe2", "#adb8c4", "#808d9d", "#56606f"];
const BLUE_ROOF = ["#a8ccff", "#6fa6f2", "#4f8fe8", "#3a6fc4", "#2a5196", "#1d3769"];
const CORAL = ["#ffd0b5", "#ffae86", "#f18d5b", "#c9643c", "#8f4226"];
const CREAM = ["#fffaf0", "#fff1cf", "#f2dcae", "#d9bd86"];
const LEAF = ["#c8ee8a", "#8fd162", "#5fb048", "#3f8c3a", "#2b6a31", "#1d4b27"];
const TRUNK = ["#e9c38d", "#c99a63", "#a5764a", "#7d5636", "#563a26"];
const ROCK = ["#f1e4c4", "#c3c9cf", "#9aa5b1", "#76828f", "#535d6a", "#363e4a"];
const TIER_FISH = ["#9fd8cf", "#4f8fe8", "#a77bff", "#f8b84a"];

function canvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (p: Px) => void) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  const p: Px = {
    w,
    h,
    set(x, y, c) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      ctx.fillStyle = c;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    },
    rect(x, y, rw, rh, c) {
      ctx.fillStyle = c;
      ctx.fillRect(Math.floor(x), Math.floor(y), rw, rh);
    },
  };
  draw(p);
  tex.refresh();
}

const hash = (x: number, y: number, s = 0) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s + 7, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Wooden front wall with vertical planks, shadow under the eave and a darker foot. */
function wall(p: Px, x0: number, y0: number, w: number, h: number) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const plank = Math.floor((x - x0) / 4);
      let k = 2 + (plank % 2);
      if ((x - x0) % 4 === 3) k = 4;
      if (y < y0 + 2) k = 5; // under the eave
      else if (y === y0 + 2) k = 4;
      if (y >= y0 + h - 1) k = 5;
      if (hash(x, y, 3) > 0.93 && k < 4) k += 1;
      p.set(x, y, WOOD[k]);
    }
  for (let y = y0; y < y0 + h; y++) {
    p.set(x0, y, INK);
    p.set(x0 + w - 1, y, INK);
  }
}

function door(p: Px, cx: number, bottom: number, w = 10, h = 15) {
  const x0 = cx - w / 2;
  const y0 = bottom - h;
  p.rect(x0 - 1, y0 - 1, w + 2, h + 1, INK);
  for (let y = y0; y < bottom; y++)
    for (let x = x0; x < x0 + w; x++) {
      const edge = x === x0 || x === x0 + w - 1 || y === y0;
      p.set(x, y, edge ? WOOD[1] : (x - x0) % 3 === 2 ? WOOD[5] : WOOD[4]);
    }
  p.set(x0 + w - 3, y0 + h / 2, "#ffd36b");
}

function windowPane(p: Px, x0: number, y0: number, w = 8, h = 6) {
  p.rect(x0 - 1, y0 - 1, w + 2, h + 2, INK);
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      let c = WATER[y - y0 < h / 2 ? 3 : 5];
      if (x - x0 === y - y0 || x - x0 === y - y0 + 1) c = WATER[1]; // glint
      if (x === x0 + w / 2) c = WOOD[3];
      p.set(x, y, c);
    }
  p.rect(x0 - 1, y0 + h, w + 2, 1, WOOD[1]); // sill catches the light
}

/**
 * Shingled roof seen from above at an angle: a trapezoid that narrows toward the ridge, a ridge cap, rows that darken
 * toward the eave, seams offset per row, and a dark eave underside with a 1 px lit lip.
 */
function roof(p: Px, x0: number, y0: number, w: number, h: number, ramp: string[]) {
  const inset = (y: number) => Math.floor(((y0 + h - y) / h) * 5);
  for (let y = y0; y < y0 + h; y++) {
    const row = Math.floor((y - y0) / 4);
    const r = (y - y0) % 4;
    const depth = Math.min(ramp.length - 3, Math.floor(((y - y0) / h) * (ramp.length - 2)));
    const off = Math.floor(hash(row, 0, 41) * 6);
    const a = x0 + inset(y);
    const b = x0 + w - inset(y);
    for (let x = a; x < b; x++) {
      let k = depth + (r === 0 ? 0 : r === 3 ? 2 : 1);
      if (r !== 3 && (x - a + off) % 7 === 0) k += 1; // shingle seams
      if (x < a + 2) k -= 1;
      if (x >= b - 2) k += 1;
      p.set(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, k))]);
    }
    p.set(a - 1, y, INK);
    p.set(b, y, INK);
  }
  // ridge cap
  const ra = x0 + inset(y0);
  const rb = x0 + w - inset(y0);
  for (let x = ra; x < rb; x++) {
    p.set(x, y0 - 2, INK);
    p.set(x, y0 - 1, ramp[0]);
    p.set(x, y0, ramp[1]);
  }
  p.set(ra - 1, y0 - 1, INK);
  p.set(rb, y0 - 1, INK);
  // eave: lit lip, then the dark underside
  for (let x = x0 - 1; x <= x0 + w; x++) {
    p.set(x, y0 + h, ramp[1]);
    p.set(x, y0 + h + 1, ramp[ramp.length - 1]);
    p.set(x, y0 + h + 2, INK);
  }
}

/** Tiny side-view fish (7x4) with a forked tail, an eye and a belly highlight; used in tanks and crates. */
function tinyFish(p: Px, x: number, y: number, col: string, flip = false) {
  const px = (dx: number, dy: number, c: string) => p.set(flip ? x + 6 - dx : x + dx, y + dy, c);
  for (let dx = 1; dx <= 4; dx++) {
    px(dx, 1, col);
    px(dx, 2, col);
  }
  px(2, 0, col);
  px(3, 0, col);
  px(2, 3, "#ffffff");
  px(3, 3, col);
  px(5, 0, col);
  px(5, 3, col);
  px(6, 0, col);
  px(6, 3, col);
  px(5, 1, col);
  px(5, 2, col);
  px(1, 1, INK);
  px(0, 1, col);
  px(0, 2, col);
}

export type BuildingArt = { key: string; w: number; h: number };

/** Paints the building textures; returns the art size per building key (anchor: bottom center of the footprint). */
export function makeBuildings(scene: Phaser.Scene): Record<string, BuildingArt> {
  const out: Record<string, BuildingArt> = {};

  // Rod Shop: blue shingle roof, plank wall, door, window, a giant rod with a bobber as the sign.
  {
    const w = 72;
    const h = 80;
    const t = 14; // headroom for the rod sign above the roof
    canvas(scene, "b-shop", w, h, (p) => {
      roof(p, 3, t + 3, w - 6, 33, BLUE_ROOF);
      wall(p, 6, t + 39, w - 12, 27);
      door(p, w / 2, h - 1);
      windowPane(p, 12, t + 47);
      windowPane(p, w - 20, t + 47);
      // the sign: a big rod (3 px) leaning on the right wall, its tip and bobber well above the roofline (ART_BIBLE §5.3)
      const len = 71;
      for (let i = 0; i < len; i++) {
        const x = w - 5 - Math.floor(i / 4);
        const y = h - 2 - i;
        p.set(x - 1, y, INK);
        p.set(x, y, i % 6 === 0 ? WOOD[4] : WOOD[1]);
        p.set(x + 1, y, WOOD[3]);
        p.set(x + 2, y, INK);
      }
      // the bobber hangs right at the rod tip
      const tipX = w - 5 - Math.floor((len - 1) / 4);
      const bx = tipX - 3;
      p.rect(bx - 1, 0, 6, 7, INK);
      p.rect(bx, 1, 4, 2, "#ffffff");
      p.rect(bx, 3, 4, 3, "#ff5a4f");
      p.set(bx + 3, 5, "#c2362f");
    });
    out.shop = { key: "b-shop", w, h };
  }

  // Fish Market: striped coral and cream awning with a scalloped edge, an open counter with ice and fish.
  {
    const w = 70;
    const h = 62;
    canvas(scene, "b-market", w, h, (p) => {
      // back wall in shade
      p.rect(5, 26, w - 10, 34, WOOD[5]);
      // awning
      for (let y = 2; y < 30; y++)
        for (let x = 1; x < w - 1; x++) {
          const stripe = Math.floor((x - 1) / 6) % 2;
          const ramp = stripe ? CREAM : CORAL;
          let k = y < 4 ? 0 : y < 14 ? 1 : y < 24 ? 2 : 3;
          if (x < 3) k = Math.max(0, k - 1);
          if (x > w - 4) k = Math.min(ramp.length - 1, k + 1);
          p.set(x, y, ramp[Math.min(ramp.length - 1, k)]);
        }
      for (let x = 1; x < w - 1; x++) {
        p.set(x, 1, INK);
        const s = (x - 1) % 6;
        const stripe = Math.floor((x - 1) / 6) % 2;
        const drop = s === 0 || s === 5 ? 0 : s === 1 || s === 4 ? 1 : 2; // scallops
        for (let d = 0; d <= drop; d++) p.set(x, 30 + d, (stripe ? CREAM : CORAL)[stripe ? 3 : 4]);
        p.set(x, 31 + drop, INK);
      }
      for (let y = 1; y < 31; y++) {
        p.set(0, y, INK);
        p.set(w - 1, y, INK);
      }
      // posts
      p.rect(5, 32, 3, 28, WOOD[3]);
      p.rect(w - 8, 32, 3, 28, WOOD[3]);
      // counter
      p.rect(4, 47, w - 8, 13, WOOD[2]);
      p.rect(4, 47, w - 8, 2, WOOD[1]);
      p.rect(4, 59, w - 8, 2, WOOD[5]);
      for (let x = 8; x < w - 8; x += 6) p.rect(x, 50, 1, 9, WOOD[4]);
      // ice crates with fish in tier colours
      for (let c = 0; c < 3; c++) {
        const cx = 10 + c * 18;
        p.rect(cx, 40, 14, 7, "#cfeef7");
        p.rect(cx, 40, 14, 1, "#ffffff");
        p.rect(cx, 46, 14, 1, "#8cc6d8");
        tinyFish(p, cx + 1, 41, TIER_FISH[c % TIER_FISH.length]);
        tinyFish(p, cx + 7, 42, TIER_FISH[(c + 1) % TIER_FISH.length], true);
      }
    });
    out.market = { key: "b-market", w, h };
  }

  // Verification Board: a sturdy notice board on two posts, pinned papers, one with a padlock.
  {
    const w = 52;
    const h = 46;
    canvas(scene, "b-board", w, h, (p) => {
      p.rect(7, 20, 4, 26, WOOD[3]);
      p.rect(7, 20, 1, 26, WOOD[1]);
      p.rect(w - 11, 20, 4, 26, WOOD[3]);
      p.rect(w - 11, 20, 1, 26, WOOD[1]);
      p.rect(1, 2, w - 2, 28, INK);
      for (let y = 3; y < 29; y++)
        for (let x = 2; x < w - 2; x++) {
          let k = y < 5 ? 1 : 2 + (Math.floor((y - 3) / 5) % 2);
          if (hash(x, y, 9) > 0.92) k += 1;
          p.set(x, y, WOOD[k]);
        }
      p.rect(2, 3, w - 4, 1, WOOD[0]);
      const papers = [
        [6, 7, 12, 14],
        [21, 6, 11, 10],
        [35, 8, 11, 15],
      ];
      papers.forEach(([x, y, pw, ph], i) => {
        p.rect(x + 1, y + 1, pw, ph, WOOD[5]); // shadow
        p.rect(x, y, pw, ph, CREAM[1]);
        p.rect(x, y, pw, 1, CREAM[0]);
        for (let l = y + 3; l < y + ph - 2; l += 2) p.rect(x + 2, l, pw - 4, 1, STONE[3]);
        p.set(x + Math.floor(pw / 2), y, "#ff5a4f"); // pin
        if (i === 1) {
          p.rect(x + 3, y + 3, 5, 4, "#f8b84a");
          p.rect(x + 4, y + 1, 3, 2, STONE[4]);
          p.set(x + 5, y + 5, INK);
        }
      });
    });
    out.board = { key: "b-board", w, h };
  }

  // Public Aquarium: the landmark. White stone, a glass dome on the roof and a big glass tank as the front wall.
  {
    const w = 136;
    const h = 92;
    canvas(scene, "b-aquarium", w, h, (p) => {
      // roof slab
      for (let y = 14; y < 40; y++)
        for (let x = 2; x < w - 2; x++) {
          let k = y < 16 ? 0 : y < 30 ? 1 : 2;
          if (x < 5) k = Math.max(0, k - 1);
          if (x > w - 6) k += 1;
          if (y === 15) k = 0; // lit front edge of the slab
          p.set(x, y, STONE[Math.min(5, k)]);
        }
      p.rect(2, 38, w - 4, 2, "#00bfff"); // deep-sky accent band
      p.rect(2, 40, w - 4, 1, "#0b6eaa");
      // glass dome
      const cx = w / 2;
      for (let y = 0; y < 26; y++)
        for (let x = 0; x < w; x++) {
          const dx = (x + 0.5 - cx) / 30;
          const dy = (y + 0.5 - 26) / 24;
          const d = dx * dx + dy * dy;
          if (d > 1) continue;
          let c = WATER[d > 0.82 ? 6 : d > 0.55 ? 4 : 3];
          if (Math.abs(dx + 0.35 + dy * 0.2) < 0.06 && dy < -0.2) c = "#ffffff"; // highlight arc
          if (Math.round(x - cx) % 10 === 0) c = STONE[3]; // ribs
          p.set(x, y, c);
          if (d > 0.93) p.set(x, y, INK);
        }
      // front wall with the big tank on both sides of the entrance
      for (let y = 41; y < h - 2; y++)
        for (let x = 2; x < w - 2; x++) {
          let k = y < 50 ? 1 : y < h - 12 ? 2 : 3;
          if (x < 6) k -= 1;
          if (x > w - 7) k += 1;
          if (y >= h - 5) k = 5; // dark plinth
          p.set(x, y, STONE[Math.max(0, k)]);
        }
      const tank = (x0: number, x1: number) => {
        const y0 = 46;
        const y1 = h - 8;
        p.rect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2, INK);
        for (let y = y0; y < y1; y++)
          for (let x = x0; x < x1; x++) {
            const t = (y - y0) / (y1 - y0);
            let c = WATER[3 + Math.floor(t * 5)];
            if ((x * 3 + y * 5 + Math.floor(hash(Math.floor(x / 7), Math.floor(y / 7), 4) * 9)) % 23 === 0) c = WATER[2];
            if (x - x0 < 2 && y - y0 < 8) c = WATER[1];
            p.set(x, y, c);
          }
        for (let f = 0; f < 5; f++) {
          const fx = x0 + 4 + Math.floor(hash(f, x0, 5) * (x1 - x0 - 10));
          const fy = y0 + 5 + Math.floor(hash(f, x0, 6) * (y1 - y0 - 12));
          tinyFish(p, fx, fy, TIER_FISH[f % TIER_FISH.length], f % 2 === 1);
        }
        for (let b = 0; b < 4; b++) p.set(x0 + 3 + b * 9, y0 + 3 + ((b * 7) % 14), "#ffffff");
        p.rect(x0, y1 - 3, x1 - x0, 3, "#e2ba79"); // sand floor
      };
      tank(8, 56);
      tank(80, w - 8);
      // entrance arch
      p.rect(60, 54, 16, h - 56, INK);
      p.rect(61, 55, 14, h - 57, "#0a3f6f");
      p.rect(61, 55, 14, 2, "#0b6eaa");
      p.rect(58, 52, 20, 2, STONE[0]);
      // base and steps
      p.rect(0, h - 2, w, 2, STONE[5]);
      p.rect(58, h - 3, 20, 1, STONE[1]);
      for (let y = 14; y < h; y++) {
        p.set(1, y, INK);
        p.set(w - 2, y, INK);
      }
    });
    out.aquarium = { key: "b-aquarium", w, h };
  }
  return out;
}

/** Coconut palm: ringed trunk with a lean, seven drooping fronds with a 6-step green ramp, coconuts. */
export function makePalm(scene: Phaser.Scene, key: string, lean: number) {
  const w = 64;
  const h = 76;
  canvas(scene, key, w, h, (p) => {
    const baseX = w / 2 - lean * 6;
    const topX = w / 2 + lean * 8;
    const topY = 22;
    // trunk
    for (let y = h - 1; y >= topY; y--) {
      const t = (h - 1 - y) / (h - 1 - topY);
      const cx = baseX + (topX - baseX) * (t * t);
      const half = 3 - Math.round(t);
      const ring = (h - y) % 4 === 0;
      for (let dx = -half; dx <= half; dx++) {
        let k = dx < -half + 1 ? 0 : dx > half - 1 ? 3 : 1 + (dx > 0 ? 1 : 0);
        if (ring) k = Math.min(4, k + 1);
        p.set(cx + dx, y, TRUNK[k]);
      }
      p.set(cx - half - 1, y, INK);
      p.set(cx + half + 1, y, INK);
    }
    // fronds
    const angles = [-160, -125, -90, -55, -20, 150, 30];
    for (const [i, a] of angles.entries()) {
      const rad = (a * Math.PI) / 180;
      const len = 22 + (i % 3) * 3;
      for (let s = 0; s <= len; s++) {
        const t = s / len;
        const x = topX + Math.cos(rad) * s;
        const y = topY + Math.sin(rad) * s * 0.55 + t * t * 14; // droop
        const thick = t < 0.35 ? 2 : t < 0.8 ? 1 : 0;
        for (let o = -thick - 1; o <= thick + 1; o++) {
          const k = o < -thick ? 0 : o < 0 ? 1 : o === 0 ? 2 : o <= thick ? 3 : 5;
          if (o > thick && t < 0.12) continue;
          p.set(x, y + o, LEAF[t > 0.85 ? Math.min(5, k + 1) : k]);
        }
        if (t > 0.15) {
          // leaflets hang below the rib in a sawtooth, darkest at their tips
          const len = s % 2 === 0 ? 3 : 2;
          for (let j = 1; j <= len; j++) p.set(x - (j > 1 ? Math.sign(Math.cos(rad)) : 0), y + thick + 1 + j, LEAF[j === len ? 5 : 4]);
        }
      }
    }
    // coconuts
    for (const [dx, dy] of [
      [-2, 2],
      [1, 3],
      [-1, 5],
    ]) {
      p.rect(topX + dx, topY + dy, 3, 3, "#6b4a2e");
      p.set(topX + dx, topY + dy, "#a5764a");
      p.set(topX + dx + 2, topY + dy + 2, "#3f2a1b");
    }
  });
  return { key, w, h };
}

/** Beach rock lit from the upper left, with a warm sand-coloured top light. */
export function makeRock(scene: Phaser.Scene, key: string, w: number, h: number) {
  canvas(scene, key, w, h, (p) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const dx = (x + 0.5 - w / 2) / (w / 2);
        const dy = (y + 0.5 - h * 0.6) / (h * 0.6);
        const d = dx * dx + dy * dy * (dy < 0 ? 1 : 2.2);
        if (d > 1) continue;
        const light = -dx * 0.55 - dy * 0.8 + (hash(x, y, 2) - 0.5) * 0.3;
        let k = light > 0.75 ? 0 : light > 0.35 ? 1 : light > 0 ? 2 : light > -0.4 ? 3 : 4;
        if (d > 0.8) k = 5;
        p.set(x, y, ROCK[k]);
      }
  });
  return { key, w, h };
}

/** Round tropical bush with a few coral-pink flowers. */
export function makeBush(scene: Phaser.Scene, key: string) {
  const w = 22;
  const h = 16;
  canvas(scene, key, w, h, (p) => {
    const blobs = [
      [7, 9, 6],
      [14, 9, 6],
      [11, 6, 6],
    ];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let best = 9;
        let light = 0;
        for (const [bx, by, r] of blobs) {
          const d = Math.hypot(x + 0.5 - bx, (y + 0.5 - by) * 1.2) / r;
          if (d < best) {
            best = d;
            light = (bx - x) / r + (by - y) / r;
          }
        }
        if (best > 1) continue;
        let k = light > 0.7 ? 1 : light > 0.1 ? 2 : light > -0.5 ? 3 : 4;
        if (best > 0.86) k = 5;
        if (hash(x, y, 4) > 0.9 && k < 4) k -= 1;
        p.set(x, y, LEAF[Math.max(0, k)]);
      }
    for (const [x, y] of [
      [6, 6],
      [13, 4],
      [16, 9],
      [9, 11],
    ]) {
      p.set(x, y, "#ff8fb3");
      p.set(x + 1, y, "#ffd0dd");
      p.set(x, y + 1, "#d9577e");
    }
  });
  return { key, w, h };
}

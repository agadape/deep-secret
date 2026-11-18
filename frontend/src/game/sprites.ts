import Phaser from "phaser";

/**
 * Hand-placed pixel sprites for the style-F art pass (DESIGN.md). Each sprite is a character map; every letter is one
 * pixel from a 4-6 step ramp, outlines use a dark shade instead of pure black (ART_BIBLE §3.3).
 * The avatar is 34 px tall (DESIGN.md: 32-36 px). The shirt ramp is swapped per player for variety.
 */

const OUT = "#2b1d1c"; // warm ink outline
const BASE: Record<string, string> = {
  o: OUT,
  // bucket hat
  H: "#fff4d2", h: "#efd9a0", g: "#cdb071", G: "#977a46",
  // hair
  q: "#86593a", r: "#5e3c27", R: "#3d271b",
  // skin
  S: "#ffdcb8", s: "#f2bb8f", k: "#cf8d63",
  e: "#1f1a2e",
  w: "#ffffff",
  // shorts
  K: "#eedaa6", c: "#cdb077", C: "#9d8453",
  // sandals
  n: "#3b2c2c",
};

/** Shirt ramps: highlight, mid, shadow, dark. Index 0 is the local player (leaf green). */
export const SHIRT_RAMPS = [
  ["#9be695", "#3daa4a", "#2b8a3b", "#1d6530"],
  ["#ffb894", "#f18d5b", "#c9643c", "#8f4226"],
  ["#a8ccff", "#4f8fe8", "#2f62b8", "#213f7a"],
  ["#d6bfff", "#a77bff", "#7a52d6", "#4f3593"],
  ["#fff1ad", "#f8d77b", "#d1a84a", "#8f6f2a"],
  ["#ffabbb", "#e85d75", "#b83b55", "#7a2438"],
];

const HAT = [
  ".....oooooo.....",
  "....oHHHhhhgo...",
  "...oHHhhhhhhgo..",
  "...ohhhhhhhhgo..",
  "..oohhhhhhhhggo.",
  ".ohhhhhhhhhhhhgo",
  "oGGggggggggggGGo",
];
const LEGS = [
  "...oKKccccccCo..",
  "...oKcccccccCo..",
  "...oKccCoCccCo..",
  "...ocCCo.oCCco..",
  "....oSso..osSo..",
  "....oSko..okso..",
  "...onnno..onnno.",
  "...oooo....oooo.",
];

const FRONT = [
  ...HAT,
  ".oRRrrrrrrrrRRo.",
  ".oRsSSSSSSSSsRo.",
  ".oRSSSSSSSSSSRo.",
  ".osSeSSSSSSeSso.",
  ".osSeSSSSSSeSso.",
  ".oksSSSkkSSSsko.",
  "..oksSSSSSSsko..",
  "...okkssssskko..",
  "......okko......",
  "...ooAAaaaaAoo..",
  "..oAAaaawaaaabo.",
  ".oAAaaaaaaaaabbo",
  ".oAaaaaaaawaabbo",
  ".osaaaaaaaaaabso",
  ".osbaawaaaaaabso",
  ".oSsbaaaaaaabsko",
  "..okbaaaaaaabko.",
  "...obbaaaaabbo..",
  "...oBBBBBBBBBo..",
  ...LEGS,
];

const BACK = [
  ...HAT,
  ".oRRrrrrrrrrRRo.",
  ".oRrrqqqqqqrrRo.",
  ".oRrqqqrrqqqrRo.",
  ".oRrrrrrrrrrrRo.",
  ".oRRrrrrrrrrRRo.",
  ".okRRrrrrrrRRko.",
  "..oRRRRRRRRRRo..",
  "...okkssssskko..",
  "......okko......",
  "...ooAAaaaaAoo..",
  "..oAAaaaaaaaabo.",
  ".oAAaaawaaaaabbo",
  ".oAaaaaaaaaaabbo",
  ".osaaaaawaaaabso",
  ".osbaaaaaaaaabso",
  ".oSsbaaaaaaabsko",
  "..okbaaaaaaabko.",
  "...obbaaaaabbo..",
  "...oBBBBBBBBBo..",
  ...LEGS,
];

const SIDE = [
  ...HAT,
  "..oRRRrrrrssso..",
  "..oRRrrrsSSSSo..",
  "..oRRrrSSSSSSo..",
  "..oRRrkSSSSeSo..",
  "..oRRrkSSSSeSSo.",
  "..oRRkSSSSSSSo..",
  "...oRkssSSSkko..",
  "....okkssssko...",
  "......okko......",
  ".....oAAaaao....",
  "....oAAaaaabo...",
  "....oAaawaabo...",
  "....oAaaaaabo...",
  "....oAbbaaabo...",
  "....oasskaabo...",
  "....oaSskaabo...",
  "....obaaaaabo...",
  "....obbaaabbo...",
  "....oBBBBBBBo...",
  "....oKKccccCo...",
  "....oKccccCCo...",
  "....oKcCoCCCo...",
  "....ocCo.oCCo...",
  "....oSso.oSso...",
  "....oSko.oSko...",
  "....onnnoonnno..",
  "....oooo.ooooo..",
];

/** One plain near-black catch silhouette, the same single size for every catch (Addendum A3). */
const SILHOUETTE = [
  ".....######.........",
  "...##########....##.",
  ".##############.###.",
  "##################..",
  "#################...",
  "##################..",
  ".##############.###.",
  "...##########....##.",
  ".....######.........",
];

const BOBBER = ["..o..", ".oWo.", "oWWWo", "oRRRo", "orrro", ".ooo."];
const LANTERN = ["..oo..", ".oGGo.", "oyYYyo", "oYWWYo", "oyYYyo", "oyyyyo", ".oGGo.", "..oo.."];

function paint(scene: Phaser.Scene, key: string, rows: string[], pal: Record<string, string>) {
  if (scene.textures.exists(key)) return;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = pal[row[x]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  tex.refresh();
}

/** Stepped (not smooth) ellipse, so even translucent shadows sit on the pixel grid. */
function ellipse(scene: Phaser.Scene, key: string, w: number, h: number, color: string) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  ctx.fillStyle = color;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2);
      const dy = (y + 0.5 - h / 2) / (h / 2);
      if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1);
    }
  tex.refresh();
}

/** Warm light pool in four hard-edged rings; drawn with ADD blending by the scene. */
function glow(scene: Phaser.Scene, key: string, r: number, color: [number, number, number]) {
  if (scene.textures.exists(key)) return;
  const size = r * 2;
  const tex = scene.textures.createCanvas(key, size, size)!;
  const ctx = tex.getContext();
  const rings = [0.34, 0.2, 0.11, 0.05];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - r, (y + 0.5 - r) * 1.25) / r;
      const ring = Math.floor(d * 4);
      if (ring >= rings.length) continue;
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${rings[ring]})`;
      ctx.fillRect(x, y, 1, 1);
    }
  tex.refresh();
}

export const AVATAR_VIEWS = ["front", "back", "side"] as const;
export type AvatarView = (typeof AVATAR_VIEWS)[number];
export const avatarKey = (shirt: number, view: AvatarView) => `av${shirt}-${view}`;

export function makeSprites(scene: Phaser.Scene) {
  SHIRT_RAMPS.forEach((ramp, i) => {
    const pal = { ...BASE, A: ramp[0], a: ramp[1], b: ramp[2], B: ramp[3] };
    paint(scene, avatarKey(i, "front"), FRONT, pal);
    paint(scene, avatarKey(i, "back"), BACK, pal);
    paint(scene, avatarKey(i, "side"), SIDE, pal);
  });
  paint(scene, "silhouette", SILHOUETTE, { "#": "#0c0a16" });
  paint(scene, "bobber", BOBBER, { o: OUT, W: "#ffffff", R: "#ff5a4f", r: "#c2362f" });
  paint(scene, "lantern", LANTERN, { o: OUT, G: "#9a7b3c", y: "#ffb43d", Y: "#ffd36b", W: "#fff6d0" });
  ellipse(scene, "shadow", 16, 5, "#06162d");
  glow(scene, "glow-warm", 28, [255, 196, 96]);
}

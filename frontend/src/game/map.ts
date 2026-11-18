// Procedural island layout (placeholder art pass). One small island, three fishing zones, four landmarks.

export const TILE = 16;
export const COLS = 60;
export const ROWS = 40;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export type Terrain = "deep" | "water" | "reef" | "trench" | "sand" | "grass" | "dock" | "building";
export const WALKABLE = new Set<Terrain>(["sand", "grass", "dock"]);
const WATERY = new Set<Terrain>(["deep", "water", "reef", "trench"]);

export type Building = { key: string; label: string; x: number; y: number; w: number; h: number; door: { x: number; y: number } };

export const BUILDINGS: Building[] = [
  { key: "aquarium", label: "Public Aquarium", x: 26, y: 11, w: 8, h: 4, door: { x: 30, y: 15.6 } },
  { key: "market", label: "Fish Market", x: 16, y: 18, w: 4, h: 3, door: { x: 18, y: 21.6 } },
  { key: "shop", label: "Rod Shop", x: 21, y: 25, w: 4, h: 3, door: { x: 23, y: 28.6 } },
  { key: "board", label: "Verification Board", x: 37, y: 25, w: 3, h: 2, door: { x: 38.5, y: 27.6 } },
];

export const SPAWN = { x: 30 * TILE, y: 30 * TILE };

function build(): Terrain[][] {
  const g: Terrain[][] = [];
  const cx = 30;
  const cy = 21;
  for (let y = 0; y < ROWS; y++) {
    const row: Terrain[] = [];
    for (let x = 0; x < COLS; x++) {
      const d = ((x - cx) / 17) ** 2 + ((y - cy) / 11) ** 2;
      const dInner = ((x - cx) / 14.5) ** 2 + ((y - cy) / 8.8) ** 2;
      row.push(dInner < 1 ? "grass" : d < 1 ? "sand" : d < 1.55 ? "water" : "deep");
    }
    g.push(row);
  }
  // shore bands: the north shore drops into the trench, the east shore into the reef
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      if (g[y][x] !== "water") continue;
      if (y <= 12) g[y][x] = "trench";
      else if (x >= 44) g[y][x] = "reef";
    }
  // the dock runs south from the beach into open water
  for (let y = 31; y <= 37; y++) for (let x = 29; x <= 30; x++) g[y][x] = "dock";
  for (const b of BUILDINGS) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) g[y][x] = "building";
  return g;
}

export const GRID = build();

export const terrainAt = (px: number, py: number): Terrain => {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return "deep";
  return GRID[y][x];
};

export const walkable = (px: number, py: number) => WALKABLE.has(terrainAt(px, py));

/** Zone of the water next to a standing point: 2 Palung (trench), 1 Karang (reef), 0 Dermaga, null = no water. */
export function fishingZoneAt(px: number, py: number): number | null {
  if (!walkable(px, py)) return null;
  let best: number | null = null;
  for (const [dx, dy] of [
    [0, TILE],
    [0, -TILE],
    [TILE, 0],
    [-TILE, 0],
  ]) {
    const t = terrainAt(px + dx, py + dy);
    if (!WATERY.has(t)) continue;
    const z = t === "trench" ? 2 : t === "reef" ? 1 : 0;
    best = best === null ? z : Math.max(best, z);
  }
  return best;
}

export function nearestBuilding(px: number, py: number): string | null {
  for (const b of BUILDINGS) {
    if (Math.hypot(px - b.door.x * TILE, py - b.door.y * TILE) < 22) return b.key;
  }
  return null;
}

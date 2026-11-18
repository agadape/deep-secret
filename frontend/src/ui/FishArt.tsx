import { TIERS, TIER, type Fish } from "../fish";

/**
 * Pixel sprites from the style-F art pass (self-hosted in public/sprites, ART_BIBLE A6). Each fish ships at a few
 * native widths; we pick the one that fills `size` best at a whole-number scale, so pixels never smear.
 * Only the two style-lock fish exist so far (HANDOFF §9: prove one fish in game before producing all 19).
 */
const SPRITES: Record<string, { w: number; h: number }[]> = {
  "teri-ngantuk": [{ w: 40, h: 19 }],
  "raja-abyss": [
    { w: 128, h: 54 },
    { w: 96, h: 40 },
    { w: 64, h: 27 },
    { w: 48, h: 20 },
  ],
};

function spriteFor(fish: Fish): string | null {
  if (fish.tier === TIER.BIASA && fish.species === 0) return "teri-ngantuk";
  if (fish.tier === TIER.SECRET && fish.species === 0) return "raja-abyss";
  return null;
}

function pickSize(name: string, size: number) {
  const opts = SPRITES[name];
  let best = opts[opts.length - 1];
  let bestW = best.w;
  for (const o of opts) {
    const shown = o.w * Math.floor(size / o.w);
    if (shown > bestW || (shown === bestW && o.w > best.w)) {
      best = o;
      bestW = shown;
    }
  }
  const scale = Math.max(1, Math.floor(size / best.w));
  return { ...best, scale };
}

export function FishArt({ fish, size = 96, silhouette = false }: { fish?: Fish; size?: number; silhouette?: boolean }) {
  const name = fish && fish.valid && !silhouette ? spriteFor(fish) : null;
  if (fish && name) {
    const s = pickSize(name, size);
    const secret = fish.tier === TIER.SECRET;
    return (
      <img
        src={`/sprites/${name}-${s.w}.png`}
        width={s.w * s.scale}
        height={s.h * s.scale}
        alt=""
        draggable={false}
        className={`fish-art pixel${fish.aura ? " aura" : ""}${secret ? " secret" : ""}`}
      />
    );
  }
  const px = (x: number, y: number, w: number, h: number, c: string) => <rect x={x} y={y} width={w} height={h} fill={c} />;
  if (fish && !fish.valid && !silhouette) {
    return (
      <svg viewBox="0 0 24 16" width={size} height={(size * 16) / 24} shapeRendering="crispEdges" className="fish-art">
        {px(4, 3, 16, 10, "#26343b")}
        {px(5, 4, 14, 8, "#e85d75")}
        {px(9, 4, 2, 5, "#f4efd9")}
        {px(13, 4, 2, 5, "#f4efd9")}
        {px(10, 8, 4, 1, "#f4efd9")}
      </svg>
    );
  }
  const secret = fish?.tier === TIER.SECRET;
  const base = silhouette ? "#0c0a16" : TIERS[fish?.tier ?? 0].color;
  const ink = silhouette ? "#0c0a16" : "#26343b";
  const belly = silhouette ? "#0c0a16" : "#f4efd9";
  const v = fish?.species ?? 0;
  return (
    <svg
      viewBox="0 0 24 16"
      width={size}
      height={(size * 16) / 24}
      shapeRendering="crispEdges"
      className={`fish-art${fish?.aura && !silhouette ? " aura" : ""}${secret && !silhouette ? " secret" : ""}`}
    >
      {px(3, 4, 14, 8, ink)}
      {px(4, 5, 12, 6, base)}
      {px(5, 9, 10, 2, belly)}
      {/* tail: shape varies by species */}
      {px(17, v === 1 ? 3 : 5, 2, v === 1 ? 10 : 6, ink)}
      {px(19, v === 2 ? 2 : 4, 3, v === 2 ? 12 : 8, base)}
      {/* dorsal fin */}
      {px(8, v === 3 ? 1 : 2, v === 3 ? 6 : 4, v === 3 ? 3 : 2, base)}
      {/* eye: sleepy for species 0 */}
      {!silhouette && px(6, 6, 2, v === 0 ? 1 : 2, "#26343b")}
      {secret && !silhouette && px(10, 6, 1, 1, "#f8d77b")}
      {secret && !silhouette && px(13, 7, 1, 1, "#a77bff")}
    </svg>
  );
}

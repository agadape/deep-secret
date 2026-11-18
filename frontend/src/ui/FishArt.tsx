import { TIERS, TIER, type Fish } from "../fish";

/** Placeholder pixel fish drawn as SVG rects until the real sprites from the art pass land (ART_BIBLE §7). */
export function FishArt({ fish, size = 96, silhouette = false }: { fish?: Fish; size?: number; silhouette?: boolean }) {
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

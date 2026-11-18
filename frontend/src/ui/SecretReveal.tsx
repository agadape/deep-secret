import { useEffect, useState } from "react";
import type { Fish } from "../fish";
import { FishArt } from "./FishArt";

/**
 * The PRIVATE Secret reveal (ART_BIBLE §9.3 as corrected by Addendum A1-A2). It plays only on the owner's screen:
 * nothing here is sent to the presence server, and the avatar everyone else sees keeps the same "hold ???" pose
 * as for any catch. Going public is a separate, explicit choice ("Show off" -> flex on-chain -> Flexed banner).
 */
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

type Beat = "hush" | "omen" | "burst" | "card";
const NEXT: Record<Exclude<Beat, "card">, Beat> = { hush: "omen", omen: "burst", burst: "card" };
const LENGTH: Record<Exclude<Beat, "card">, number> = { hush: 600, omen: 1200, burst: 900 };

// Pixel shards of the silhouette: direction, distance and colour from the Secret identity (Void, Cosmic, Energy, Gold).
const SHARDS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.2;
  const d = 90 + ((i * 37) % 70);
  return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d * 0.7), c: ["#0c0a16", "#a77bff", "#48f0db", "#f8d77b"][i % 4] };
});

export function SecretReveal({ fish, last, onKeep, onShowOff }: { fish: Fish; last: boolean; onKeep: () => void; onShowOff: () => void }) {
  const [beat, setBeat] = useState<Beat>(REDUCED ? "card" : "hush");
  useEffect(() => {
    if (beat === "card") return;
    const t = setTimeout(() => setBeat(NEXT[beat]), LENGTH[beat]);
    return () => clearTimeout(t);
  }, [beat]);

  return (
    <div
      className={`sr is-${beat}`}
      role="dialog"
      aria-modal="true"
      aria-label="Private Secret reveal"
      onClick={beat === "card" ? undefined : () => setBeat("card")}
    >
      <div className="sr-stage" aria-hidden>
        {(beat === "omen" || beat === "burst") && <div className="sr-ring" />}
        {beat === "omen" && <img className="sr-sil pixel" src="/sprites/siluet.png" width={176} height={88} alt="" />}
        {beat === "burst" &&
          SHARDS.map((s, i) => (
            <span key={i} className="sr-shard" style={{ "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, background: s.c } as React.CSSProperties} />
          ))}
        {(beat === "burst" || beat === "card") && (
          <div className="sr-fish">
            <div className="sr-aura" />
            <FishArt fish={fish} size={256} />
          </div>
        )}
      </div>
      {beat === "omen" && <p className="sr-omen">Something impossible bit your hook.</p>}
      {beat !== "card" && <p className="sr-skip">Tap to skip</p>}
      {beat === "card" && (
        <div className="sr-card">
          <h2>{fish.name}</h2>
          <p className="en">{fish.en}</p>
          <p className="sr-tier">Secret</p>
          <p className="sr-meta">
            {fish.weight} kg{fish.aura ? " · aura" : ""}
          </p>
          <p className="sr-private">Only you can see this. Nobody else was told, not even the island server.</p>
          <div className="sr-actions">
            <button className="sr-keep" onClick={onKeep} autoFocus>
              {last ? "Keep it secret" : "Keep it secret · next fish"}
            </button>
            <button className="sr-show" onClick={onShowOff}>
              Show off
            </button>
          </div>
          <small className="sr-note">
            Show off makes it a 1-of-1 NFT in the Public Aquarium and tells every player.
            {last ? "" : " The rest of this catch waits in your bucket."}
          </small>
        </div>
      )}
    </div>
  );
}

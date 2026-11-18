import { useEffect, useRef, useState } from "react";
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
const SHARDS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
  const d = 110 + ((i * 37) % 90);
  return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d * 0.7), c: ["#0c0a16", "#a77bff", "#48f0db", "#f8d77b"][i % 4] };
});

export function SecretReveal({ fish, last, onKeep, onShowOff }: { fish: Fish; last: boolean; onKeep: () => void; onShowOff: () => void }) {
  const [beat, setBeat] = useState<Beat>(REDUCED ? "card" : "hush");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (beat === "card") return;
    const t = setTimeout(() => setBeat(NEXT[beat]), LENGTH[beat]);
    return () => clearTimeout(t);
  }, [beat]);
  useEffect(() => root.current?.focus(), []);
  // Keyboard: Enter / Space / Escape skip the animation; Escape on the card keeps the fish secret (the safe default).
  // Tab stays inside the dialog.
  const onKey = (e: React.KeyboardEvent) => {
    if (beat !== "card" && (e.key === "Enter" || e.key === " " || e.key === "Escape")) {
      e.preventDefault();
      setBeat("card");
    } else if (beat === "card" && e.key === "Escape") {
      e.preventDefault();
      onKeep();
    } else if (e.key === "Tab") {
      const items = [...(root.current?.querySelectorAll<HTMLElement>("button") ?? [])];
      if (items.length === 0) return e.preventDefault();
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
      e.preventDefault();
      items[next].focus();
    }
  };

  return (
    <div
      ref={root}
      tabIndex={-1}
      className={`sr is-${beat}`}
      role="dialog"
      aria-modal="true"
      aria-label="Private Secret reveal"
      onKeyDown={onKey}
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
      {beat !== "card" && <p className="sr-skip">Tap or press Enter to skip</p>}
      {beat === "card" && (
        <div className="sr-card">
          <h2>{fish.name}</h2>
          <p className="en">{fish.en}</p>
          <p className="sr-meta">
            <span className="sr-tier">Secret</span> · {fish.weight} kg{fish.aura ? " · aura" : ""}
          </p>
          <p className="sr-private">Only you can see this. Nobody else was told, not even the island server.</p>
          <div className="sr-actions">
            <button className="sr-keep" onClick={onKeep}>
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

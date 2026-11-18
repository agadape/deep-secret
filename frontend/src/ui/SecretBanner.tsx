import { useEffect, useState } from "react";
import { loadName } from "../chain/game";
import { EXPLORER } from "../config";
import { on } from "../game/bus";
import { FishArt } from "./FishArt";

/**
 * The PUBLIC moment (Addendum A1): shown to every player only after a Flexed event is confirmed on-chain and relayed
 * by the presence server. Everything shown here is public by then: species, serial, NFT id and the owner.
 */
type Shown = { key: string; owner: string; species: number; serial: number; tokenId: string; tx?: string };
const SPECIES = ["Raja Abyss", "Ratu Palung"];
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function SecretBanner() {
  const [queue, setQueue] = useState<Shown[]>([]);

  useEffect(
    () =>
      on("secret-flex", (e) => {
        void loadName(e.player as `0x${string}`)
          .catch(() => "")
          .then((name) =>
            setQueue((q) => [...q, { key: e.tx ?? `${e.tokenId}`, owner: name || short(e.player), species: e.species, serial: e.serial, tokenId: e.tokenId, tx: e.tx }]),
          );
      }),
    [],
  );

  const cur = queue[0];
  useEffect(() => {
    if (!cur) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 8000);
    return () => clearTimeout(t);
  }, [cur]);
  if (!cur) return null;

  const fish = { id: 0n, valid: true, tier: 4, species: cur.species, aura: false, weight: 0, price: 0n, state: 2, name: "", en: "" };
  return (
    <div className="sb" role="status" aria-live="polite" key={cur.key}>
      <div className="sb-art">
        <FishArt fish={fish} size={64} />
      </div>
      <div className="sb-text">
        <b className="sb-title">Secret shown</b>
        <span>
          <em>{cur.owner}</em> put {SPECIES[cur.species] ?? "a Secret"} in the Public Aquarium
        </span>
        <small>
          Secret #{cur.serial} · NFT #{cur.tokenId}
          {cur.tx && (
            <>
              {" · "}
              <a href={`${EXPLORER}/tx/${cur.tx}`} target="_blank" rel="noreferrer">
                proof on-chain
              </a>
            </>
          )}
        </small>
      </div>
      <button className="sb-close" aria-label="Close" onClick={() => setQueue((q) => q.slice(1))}>
        ×
      </button>
    </div>
  );
}

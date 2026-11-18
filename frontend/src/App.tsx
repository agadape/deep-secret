import { useEffect, useState } from "react";
import * as act from "./actions";
import { devAccount, discoverWallets, type DiscoveredWallet } from "./chain/wallet";
import { DISCLAIMER, EXPLORER, FAUCET_HINT, ZONES } from "./config";
import { TIERS, isSecret } from "./fish";
import { on, pad } from "./game/bus";
import { PhaserGame } from "./game/PhaserGame";
import { setState, toast, useStore, type Panel } from "./store";
import { FishArt } from "./ui/FishArt";
import { SecretBanner } from "./ui/SecretBanner";
import { SecretReveal } from "./ui/SecretReveal";
import { AquariumPanel, BoardPanel, BucketPanel, ShopPanel } from "./ui/Panels";

const BUILDING_PANEL: Record<string, { panel: Panel; label: string }> = {
  market: { panel: "bucket", label: "Fish Market" },
  shop: { panel: "shop", label: "Rod Shop" },
  aquarium: { panel: "aquarium", label: "Public Aquarium" },
  board: { panel: "board", label: "Verification Board" },
};

function ConnectScreen() {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>();
  const busy = useStore((s) => s.busy);
  const note = useStore((s) => s.toast);
  useEffect(() => {
    void discoverWallets().then(setWallets);
  }, []);
  const dev = devAccount();
  return (
    <div className="connect">
      <div className="connect-card">
        <h1>Deep Secret</h1>
        <p className="tagline">The sea keeps secrets. So do you.</p>
        <p className="lede">Fish with everyone on one island. Your catches are encrypted on-chain: other players only ever see “???”.</p>
        {busy ? (
          <p className="status" role="status">
            {busy}
          </p>
        ) : (
          <div className="entry">
            <button className="play" onClick={() => act.playNow()}>
              Play now
              <small>No wallet needed · free test gas</small>
            </button>
            {wallets === undefined ? (
              <p className="hint">Looking for browser wallets…</p>
            ) : wallets.length === 0 ? (
              <p className="hint">No browser wallet found. Play now works without one.</p>
            ) : (
              wallets.map((w) => (
                <button key={w.rdns} className="alt" onClick={() => act.connect(w)}>
                  <span className="alt-name">
                    {w.icon && <img src={w.icon} alt="" width={18} height={18} />} Connect {w.name}
                  </span>
                  <small>Fish go to your own wallet · 1 confirmation per day</small>
                </button>
              ))
            )}
            {dev && (
              <button className="ghost dev" onClick={() => act.connect({ name: "Dev key", account: dev })}>
                Dev: use test key {dev.address.slice(0, 8)}…
              </button>
            )}
          </div>
        )}
        {note && (
          <p className={`connect-note connect-note-${note.kind}`} role="alert">
            {note.text}
          </p>
        )}
        <p className="hint">
          Sepolia testnet.{" "}
          <a href={FAUCET_HINT} target="_blank" rel="noreferrer">
            Test ETH faucet
          </a>
        </p>
        <p className="disclaimer">{DISCLAIMER}</p>
      </div>
    </div>
  );
}

function Reveal() {
  const cast = useStore((s) => s.cast);
  if (cast.phase !== "reveal") return null;
  const f = cast.results[cast.shown];
  const secret = isSecret(f);
  if (secret)
    return (
      <SecretReveal
        key={String(f.id)}
        fish={f}
        last={cast.shown + 1 >= cast.results.length}
        onKeep={act.nextReveal}
        onShowOff={() => {
          act.endReveal();
          void act.flex(f.id);
        }}
      />
    );
  return (
    <div className={`reveal${secret ? " reveal-secret" : ""}`} onClick={act.nextReveal}>
      <div className="reveal-card" onClick={(e) => e.stopPropagation()}>
        {secret && <div className="secret-banner">SECRET!</div>}
        <FishArt fish={f} size={secret ? 256 : 144} />
        <h2>{f.name}</h2>
        <p className="en">{f.en}</p>
        <p className="tier" style={{ color: f.valid ? TIERS[f.tier].color : "#e85d75" }}>
          {f.valid ? TIERS[f.tier].en : "Junk — the bait was not paid"}
        </p>
        {f.valid && (
          <p>
            {f.weight} kg{f.aura ? " · ✨ aura" : ""}
          </p>
        )}
        {secret && (
          <p className="hint">
            Only you can see this. Keep it secret, or show it off from your bucket to put it in the Public Aquarium.
          </p>
        )}
        <button className="primary" onClick={act.nextReveal}>
          {cast.shown + 1 < cast.results.length ? `Next (${cast.shown + 1}/5)` : "Done"}
        </button>
        {cast.tx && (
          <a className="tx" href={`${EXPLORER}/tx/${cast.tx}`} target="_blank" rel="noreferrer">
            See the cast on the explorer: only ciphertext
          </a>
        )}
      </div>
    </div>
  );
}

function Pad() {
  const hold = (k: keyof typeof pad, v: boolean) => () => (pad[k] = v);
  return (
    <div className="pad" aria-hidden>
      {(["up", "left", "right", "down"] as const).map((k) => (
        <button key={k} className={`pad-${k}`} onPointerDown={hold(k, true)} onPointerUp={hold(k, false)} onPointerLeave={hold(k, false)}>
          {k === "up" ? "▲" : k === "down" ? "▼" : k === "left" ? "◀" : "▶"}
        </button>
      ))}
    </div>
  );
}

function Hud() {
  const s = useStore((st) => st);
  const zone = s.nearZone === null ? null : ZONES[s.nearZone];
  const rodOk = !!s.player && !!zone && s.player.rodLevel >= zone.minRod;
  let castHint = "";
  if (!s.player?.starterClaimed) castHint = "Claim your starter pack at the Rod Shop";
  else if (!zone) castHint = "Walk to the water’s edge to fish";
  else if (!rodOk) castHint = `${zone.name} needs rod level ${zone.minRod}`;
  const canCast = !castHint && !s.busy && s.cast.phase === "idle";
  const building = s.nearBuilding ? BUILDING_PANEL[s.nearBuilding] : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space" && canCast) {
        e.preventDefault();
        void act.cast();
      }
      if (e.code === "KeyE" && building) setState({ panel: building.panel });
      if (e.code === "Escape") setState({ panel: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canCast, building]);

  return (
    <>
      <div className="hud-top" {...(s.cast.phase === "reveal" ? { inert: "" } : {})}>
        <div className="chip">
          <b>{s.name}</b>
          <span>
            🦪 {s.pearls === undefined ? "…" : s.pearls.toString()} · Rod {s.player?.rodLevel ?? 0}
          </span>
          {s.mode === "guest" && (
            <button className="chip-btn" onClick={() => act.exportGuestKey()}>
              Guest wallet · Export key
            </button>
          )}
        </div>
        <div className="chip secret-chip">Secrets left: ???</div>
        <div className="chip">{s.room ? `${s.online} on ${s.room}` : "offline (solo)"}</div>
      </div>

      <div className="hud-bottom" {...(s.cast.phase === "reveal" ? { inert: "" } : {})}>
        {s.busy && (
          <div className="status" role="status">
            {s.busy}
          </div>
        )}
        {s.gasNote && !s.busy && (
          <div className="status note">
            {s.gasNote}
            {s.mode === "guest" && (
              <button className="chip-btn" onClick={() => act.copyGuestAddress()}>
                Copy address
              </button>
            )}
          </div>
        )}
        {s.sessionExpired && !s.busy && (
          <button className="renew" onClick={() => act.renewSession()}>
            Renew session · 1 confirmation
          </button>
        )}
        {s.cast.phase !== "idle" && s.cast.phase !== "reveal" && <div className="status pulse">{s.cast.status}</div>}
        {building && !s.panel && (
          <button className="secondary" onClick={() => setState({ panel: building.panel })}>
            Open {building.label} (E)
          </button>
        )}
        <button className="cast" disabled={!canCast} onClick={() => act.cast()}>
          {zone ? `CAST · ${zone.name}` : "CAST"}
          <small>{castHint || "5 hooks · 5 Pearls · Space"}</small>
        </button>
        <nav>
          <button onClick={() => setState({ panel: "bucket" })}>Bucket ({s.bucket.length})</button>
          <button onClick={() => setState({ panel: "shop" })}>Shop</button>
          <button onClick={() => setState({ panel: "aquarium" })}>Aquarium</button>
          <button onClick={() => setState({ panel: "board" })}>Verify</button>
        </nav>
      </div>
      {s.panel === "bucket" && <BucketPanel />}
      {s.panel === "shop" && <ShopPanel />}
      {s.panel === "aquarium" && <AquariumPanel />}
      {s.panel === "board" && <BoardPanel />}
      <Reveal />
      {s.toast && <div className={`toast toast-${s.toast.kind}`}>{s.toast.text}</div>}
      <Pad />
      <footer className="disclaimer-bar">{DISCLAIMER}</footer>
    </>
  );
}

export function App() {
  const address = useStore((s) => s.address);
  useEffect(() => on("near", ({ zone, building }) => setState({ nearZone: zone, nearBuilding: building })), []);
  useEffect(() => on("secret-flex", () => void act.loadAquarium()), []);
  return (
    <div className="app">
      <PhaserGame />
      {address ? <Hud /> : <ConnectScreen />}
      <SecretBanner />
    </div>
  );
}

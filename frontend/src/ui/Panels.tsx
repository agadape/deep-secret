import { useEffect, useState } from "react";
import * as act from "../actions";
import { loadOdds, loadSeason } from "../chain/game";
import { ZONES } from "../config";
import { TIERS, isSecret } from "../fish";
import { setState, useStore } from "../store";
import { FishArt } from "./FishArt";

const close = () => setState({ panel: null });

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sheet" role="dialog" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <button className="ghost" onClick={close} aria-label="Close">
          ✕
        </button>
      </header>
      <div className="sheet-body">{children}</div>
    </div>
  );
}

export function BucketPanel() {
  const bucket = useStore((s) => s.bucket);
  const busy = useStore((s) => s.busy);
  const sorted = [...bucket].sort((a, b) => b.tier - a.tier || Number(b.id - a.id));
  const sellable = bucket.filter((f) => f.state === 0 && !isSecret(f));
  const total = sellable.reduce((s, f) => s + f.price, 0n);
  return (
    <Sheet title={`Your bucket (${bucket.length})`}>
      <p className="hint">Only you can see what is in here. Other players see your catches as “???”.</p>
      <button className="primary" disabled={!!busy || sellable.length === 0} onClick={act.sellAll}>
        Sell all ({sellable.length}) · +{total.toString()} Pearls
      </button>
      <ul className="fish-list">
        {sorted.map((f) => (
          <li key={String(f.id)} className={isSecret(f) ? "secret-row" : ""}>
            <FishArt fish={f} size={48} />
            <div>
              <b>{f.name}</b>
              <small>
                {f.en} · {f.valid ? TIERS[f.tier].en : "Junk"}
                {f.valid ? ` · ${f.weight} kg` : ""}
                {f.aura ? " · ✨ aura" : ""}
              </small>
            </div>
            {isSecret(f) ? (
              <button className="secret-btn" disabled={!!busy || f.state !== 0} onClick={() => act.flex(f.id)}>
                {f.state === 4 ? "Waiting for proof…" : "Show off"}
              </button>
            ) : (
              <span className="price">{f.price.toString()} 🦪</span>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function ShopPanel() {
  const player = useStore((s) => s.player);
  const busy = useStore((s) => s.busy);
  const name = useStore((s) => s.name);
  const [prices, setPrices] = useState<readonly bigint[]>([]);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    loadSeason().then((s) => setPrices(s.rodPrices)).catch(() => undefined);
  }, []);
  if (!player) return <Sheet title="Rod Shop">Connect a wallet first.</Sheet>;
  const next = player.rodLevel < 4 ? prices[player.rodLevel] : undefined;
  return (
    <Sheet title="Rod Shop">
      {!player.starterClaimed && (
        <button className="primary" disabled={!!busy} onClick={act.claimStarter}>
          Claim starter pack · 100 Pearls
        </button>
      )}
      <div className="card">
        <h3>Your rod: level {player.rodLevel}</h3>
        <p className="hint">
          Each level raises your odds of Legenda and Secret. Level 2 opens Karang, level 4 opens Palung. Payment is
          encrypted; only the “paid / not paid” result is made public, with a proof.
        </p>
        {next !== undefined ? (
          <button className="primary" disabled={!!busy || player.upgradePending} onClick={act.upgradeRod}>
            Upgrade to level {player.rodLevel + 1} · {next.toString()} Pearls
          </button>
        ) : (
          <p>Max level reached.</p>
        )}
      </div>
      <div className="card">
        <h3>Your name on the island</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) void act.setName(draft.trim());
          }}
        >
          <input value={draft} maxLength={16} placeholder={name} onChange={(e) => setDraft(e.target.value)} />
          <button disabled={!!busy || !draft.trim()}>Save</button>
        </form>
      </div>
    </Sheet>
  );
}

export function AquariumPanel() {
  const fish = useStore((s) => s.aquarium);
  useEffect(() => {
    void act.loadAquarium();
  }, []);
  return (
    <Sheet title="Public Aquarium">
      <p className="hint">
        Every Secret here was rolled in secret on-chain and revealed by its owner with a verified decryption proof.
      </p>
      {fish.length === 0 && <p>The tank is empty. Nobody has shown off a Secret yet this season.</p>}
      <ul className="tank">
        {fish.map((f) => (
          <li key={String(f.tokenId)}>
            <FishArt
              fish={{ id: f.tokenId, valid: true, tier: 4, species: f.species, aura: f.aura, weight: f.weight, price: 0n, state: 2, name: "", en: "" }}
              size={88}
            />
            <b>{f.species === 0 ? "Raja Abyss" : "Ratu Palung"}</b>
            <small>
              Secret #{f.serial} · Season {f.season} · {f.weight} kg
            </small>
            <small>Owner: {f.ownerName}</small>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function BoardPanel() {
  const player = useStore((s) => s.player);
  const [rows, setRows] = useState<{ zone: string; odds: string[] }[]>([]);
  const [peek, setPeek] = useState<string>();
  const [peeking, setPeeking] = useState(false);
  const rod = player?.rodLevel ?? 0;
  useEffect(() => {
    const R = 2 ** 32;
    Promise.all(ZONES.map((z) => loadOdds(rod, z.id)))
      .then((list) =>
        setRows(
          list.map((o, i) => {
            const w = [o.secret, o.legend - o.secret, o.epic - o.legend, o.rare - o.epic].map(Number);
            return { zone: `${ZONES[i].name} (${ZONES[i].en})`, odds: w.map((x) => (x > 0 ? `1 in ${Math.round(R / x)}` : "—")) };
          }),
        ),
      )
      .catch(() => undefined);
  }, [rod]);
  return (
    <Sheet title="Verification Board">
      <div className="card">
        <h3>Odds per fish with your rod (level {rod})</h3>
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              {["Secret", "Legenda", "Epik", "Langka"].map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.zone}>
                <td>{r.zone}</td>
                {r.odds.map((o, i) => (
                  <td key={i}>{o}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">Read live from the contract. Nobody can change them during the season, not even us.</p>
      </div>
      <div className="card">
        <h3>Secrets left this season: ???</h3>
        <p className="hint">
          The counter is encrypted. It opens for everyone, with a proof, when the season ends.
        </p>
      </div>
      <div className="card">
        <h3>Try to peek at someone else’s catch</h3>
        <button
          disabled={peeking}
          onClick={async () => {
            setPeeking(true);
            setPeek(await act.peekStranger().catch((e) => String(e)));
            setPeeking(false);
          }}
        >
          {peeking ? "Trying…" : "Peek"}
        </button>
        {peek && <p className="peek">{peek}</p>}
      </div>
    </Sheet>
  );
}

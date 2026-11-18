// Glue between the HUD, the chain layer and the world. Status text always mirrors the real transaction stage
// (ART_BIBLE §12): no fake progress bars, no invented results.
import * as chain from "./chain/game";
import { requestAccount, type DiscoveredWallet } from "./chain/wallet";
import type { LocalAccount } from "viem";
import { RT_URL, ZONES } from "./config";
import { isSecret, type Fish } from "./fish";
import { emit } from "./game/bus";
import { connectPresence } from "./net/presence";
import { getState, setState, toast } from "./store";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
let stopPresence: (() => void) | undefined;

function friendly(e: unknown) {
  console.error(e);
  const m = (e as { shortMessage?: string; message?: string })?.shortMessage ?? (e as Error)?.message ?? String(e);
  if (/reject|denied|cancel/i.test(m)) return "Cancelled in your wallet.";
  if (/insufficient funds/i.test(m)) return "Your wallet has no Sepolia ETH for gas. Get some from a faucet first.";
  return m.length > 180 ? `${m.slice(0, 180)}…` : m;
}

async function guarded(label: string, f: () => Promise<void>) {
  if (getState().busy) return;
  setState({ busy: label });
  try {
    await f();
  } catch (e) {
    toast(friendly(e), "error", 8000);
  } finally {
    setState({ busy: undefined });
  }
}

export async function refresh(blockNumber?: bigint) {
  const a = getState().address;
  if (!a) return;
  const [player, ethBalance] = await Promise.all([chain.loadPlayer(a, blockNumber), chain.loadEth(a)]);
  setState({ player, ethBalance });
  const [pearls, bucket] = await Promise.all([chain.loadPearls(a, blockNumber), chain.loadBucket(a, blockNumber)]);
  setState({ pearls, bucket });
}

export function connect(w: DiscoveredWallet | { name: string; account: LocalAccount }) {
  return guarded("Connecting…", async () => {
    let address: `0x${string}`;
    if ("account" in w) {
      address = w.account.address;
      chain.startSession(w.account, address);
    } else {
      address = await requestAccount(w.provider);
      chain.startSession(w.provider, address);
    }
    const name = (await chain.loadName(address)) || short(address);
    setState({ address, walletName: w.name, name });
    emit("local-name", name);
    const [player, ethBalance] = await Promise.all([chain.loadPlayer(address), chain.loadEth(address)]);
    setState({ player, ethBalance });
    if (ethBalance === 0n) toast("This wallet has 0 Sepolia ETH. You need a little for gas (any Sepolia faucet).", "error", 12000);
    setState({ busy: "Sign once to read your own fish and Pearls…" });
    await chain.ensurePermit();
    setState({ busy: "Loading your bucket…" });
    const [pearls, bucket] = await Promise.all([chain.loadPearls(address), chain.loadBucket(address)]);
    setState({ pearls, bucket });
    stopPresence?.();
    stopPresence = connectPresence(RT_URL, address, name, chain.signLogin);
    void loadAquarium();
  });
}

export function claimStarter() {
  return guarded("Confirm in your wallet…", async () => {
    const r = await chain.claimStarter(() => setState({ busy: "Claiming your starter pack…" }));
    await refresh(r.blockNumber);
    toast("100 Pearls added. Only you can see your balance.");
  });
}

export function setName(name: string) {
  return guarded("Confirm in your wallet…", async () => {
    await chain.setName(name, () => setState({ busy: "Saving your name…" }));
    setState({ name });
    emit("local-name", name);
  });
}

export async function cast() {
  const s = getState();
  if (s.busy || s.cast.phase !== "idle" || s.nearZone === null || !s.player) return;
  const zone = ZONES[s.nearZone];
  if (s.player.rodLevel < zone.minRod) return toast(`${zone.name} needs rod level ${zone.minRod}.`, "error");
  const setCast = (patch: Partial<typeof s.cast>) => setState((st) => ({ cast: { ...st.cast, ...patch } }));
  setCast({ phase: "wallet", status: "Confirm the cast in your wallet…", results: [], shown: 0, tx: undefined });
  emit("local-anim", "cast");
  try {
    const { fish, receipt } = await chain.cast(
      zone.id,
      (tx) => {
        setCast({ phase: "casting", status: "Your hooks are beneath the surface… (waiting for the block)", tx });
        emit("local-anim", "fishing");
      },
      () => {
        setCast({ phase: "opening", status: "Something bites! Decrypting your catch — only you can see it…" });
        emit("local-anim", "reel");
      },
    );
    setCast({ phase: "reveal", status: "Your catch is ready!", results: fish, shown: 0 });
    emit("local-anim", "hold_unknown");
    void refresh(receipt.blockNumber).catch(() => undefined);
  } catch (e) {
    setCast({ phase: "idle", status: "" });
    emit("local-anim", "idle");
    toast(friendly(e), "error", 8000);
  }
}

export function nextReveal() {
  setState((st) => {
    const shown = st.cast.shown + 1;
    if (shown < st.cast.results.length) return { cast: { ...st.cast, shown } };
    emit("local-anim", "idle");
    return { cast: { phase: "idle", status: "", results: [], shown: 0 } };
  });
}

export function sellAll() {
  return guarded("Confirm the sale in your wallet…", async () => {
    const sellable = getState().bucket.filter((f: Fish) => f.state === 0 && !isSecret(f));
    if (sellable.length === 0) return toast("Nothing to sell. Secrets are never sold.");
    for (let i = 0; i < sellable.length; i += 40) {
      const batch = sellable.slice(i, i + 40);
      const r = await chain.sell(
        batch.map((f) => f.id),
        () => setState({ busy: `Selling ${batch.length} fish…` }),
      );
      await refresh(r.blockNumber);
    }
    toast("Sold. The payout is encrypted: only you can see how much you earned.");
  });
}

export function upgradeRod() {
  return guarded("Confirm in your wallet…", async () => {
    const res = await chain.upgradeRod((m) => setState({ busy: m }));
    await refresh();
    if (res?.paid) toast(`Rod upgraded to level ${res.level}!`);
    else toast("Not enough Pearls: the rod shop kept your rod as it was.", "error");
  });
}

export function flex(fishId: bigint) {
  return guarded("Confirm in your wallet…", async () => {
    const res = await chain.flex(fishId, (m) => setState({ busy: m }));
    await refresh();
    if (res.flexed) {
      toast("Your Secret is now a 1-of-1 NFT in the Public Aquarium!", "secret", 10000);
      emit("local-anim", "flex");
      setTimeout(() => emit("local-anim", "idle"), 3000);
      await loadAquarium();
    } else {
      toast("That fish was not a Secret, so it went back to your bucket.", "error");
    }
  });
}

export async function loadAquarium() {
  try {
    setState({ aquarium: await chain.loadAquarium() });
  } catch {
    /* the aquarium is decoration; retry on next open */
  }
}

export const peekStranger = () => chain.tryPeekStranger();

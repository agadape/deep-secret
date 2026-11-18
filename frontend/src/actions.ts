// Glue between the HUD, the chain layer and the world. Status text always mirrors the real transaction stage
// (ART_BIBLE §12): no fake progress bars, no invented results.
import * as chain from "./chain/game";
import { guestKey, localAccount, newSessionKey, requestAccount, storedSessionKey, type DiscoveredWallet } from "./chain/wallet";
import { parseEther, type EIP1193Provider, type LocalAccount } from "viem";
import { DRIP_URL, RT_URL, SESSION_HOURS, SESSION_REUSE_MARGIN_S, SESSION_VALUE_ETH, ZONES } from "./config";
import { isSecret, type Fish } from "./fish";
import { emit } from "./game/bus";
import { connectPresence } from "./net/presence";
import { getState, setState, toast } from "./store";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
let stopPresence: (() => void) | undefined;
/** MetaMask mode: kept so an expired session can be renewed without reconnecting. */
let walletLink: { provider: EIP1193Provider; player: `0x${string}` } | undefined;
/** Play-now mode: the guest key of this tab, for "Export key". */
let guest: `0x${string}` | undefined;
const MIN_GAS = parseEther("0.00005"); // same floor as the server's drip

function friendly(e: unknown) {
  console.error(e);
  const m = (e as { shortMessage?: string; message?: string })?.shortMessage ?? (e as Error)?.message ?? String(e);
  if (e instanceof chain.SessionExpiredError || /SessionExpired/.test(m)) {
    setState({ sessionExpired: true });
    return "Your 24-hour play session ended. Tap “Renew session”: one confirmation.";
  }
  if (/reject|denied|cancel/i.test(m)) return "Cancelled in your wallet.";
  if (/insufficient funds/i.test(m) && getState().mode === "wallet" && walletLink) {
    // the session key pays gas; renewing re-authorizes the same key and forwards fresh gas
    setState({ sessionExpired: true });
    return "Your session key ran out of gas. Tap “Renew session” to top it up (one confirmation).";
  }
  if (/insufficient funds/i.test(m)) return "No Sepolia ETH left for gas. Get some from a faucet first.";
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
  const [player, ethBalance] = await Promise.all([chain.loadPlayer(a, blockNumber), chain.loadEth(chain.gasAddress())]);
  setState({ player, ethBalance });
  const [pearls, b] = await Promise.all([chain.loadPearls(a, blockNumber), chain.loadBucket(a, blockNumber)]);
  setState({ pearls, bucket: b.fish, lockedFish: b.locked });
}

/** Shared tail of every login: name, chain state, the private-view permit, the bucket and presence. */
async function enterIsland(player: `0x${string}`, presenceAs: `0x${string}`) {
  const name = (await chain.loadName(player)) || short(player);
  setState({ address: player, name });
  emit("local-name", name);
  const [p, ethBalance] = await Promise.all([chain.loadPlayer(player), chain.loadEth(chain.gasAddress())]);
  setState({ player: p, ethBalance });
  if (ethBalance === 0n && getState().mode === "dev") toast("This wallet has 0 Sepolia ETH. You need a little for gas (any Sepolia faucet).", "error", 12000);
  // a local key (guest, session or dev) signs the permit silently; only a plain browser wallet would pop up here
  setState({ busy: "Opening your private view: only you can read your fish and Pearls…" });
  await chain.ensurePermit();
  setState({ busy: "Loading your bucket…" });
  const [pearls, b] = await Promise.all([chain.loadPearls(player), chain.loadBucket(player)]);
  setState({ pearls, bucket: b.fish, lockedFish: b.locked });
  stopPresence?.();
  // the presence server checks that the login signature matches the address, so sign as whoever holds the key
  stopPresence = connectPresence(RT_URL, presenceAs, name, chain.signLogin);
  void loadAquarium();
}

/** "Play now": a guest wallet in this browser, funded by the island's gas drip. Zero pop-ups. */
export function playNow() {
  return guarded("Preparing your guest wallet…", async () => {
    const g = guestKey();
    guest = g.key;
    const account = localAccount(g.key);
    chain.startSession(account, account.address);
    setState({ mode: "guest", walletName: "Guest", gasNote: undefined });
    if (!g.saved) toast("This browser cannot store the guest wallet: your fish last only until you close this tab.", "error", 12000);
    else if (g.created) toast("Your guest wallet lives in this browser. Clearing site data loses your fish, so use “Export key” to keep a copy.", "info", 12000);
    await fundGuest(account.address);
    await enterIsland(account.address, account.address);
  });
}

async function fundGuest(address: `0x${string}`) {
  if ((await chain.loadEth(address).catch(() => 0n)) >= MIN_GAS) return;
  setState({ busy: "Asking the island for a little free gas…" });
  let status = "unreachable";
  try {
    const res = await fetch(DRIP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
      signal: AbortSignal.timeout(15_000),
    });
    status = ((await res.json().catch(() => ({}))) as { status?: string }).status ?? `http_${res.status}`;
  } catch {
    /* server down or blocked: handled below */
  }
  if (status === "enough") return;
  if (status === "sent" || status === "pending") {
    setState({ busy: "Free gas is on its way: waiting for the block…" });
    if ((await chain.waitForBalance(address)) === 0n) setState({ gasNote: "The free gas is still confirming. Try casting again in a minute." });
    return;
  }
  const why: Record<string, string> = {
    address_limit: "This guest wallet already used its free gas today.",
    ip_limit: "Your network already used today’s free gas.",
    daily_budget_spent: "Today’s free gas is used up.",
    drip_disabled: "The free gas tap is closed on this server.",
    unreachable: "The island server cannot be reached for free gas.",
  };
  setState({
    gasNote: `${Object.hasOwn(why, status) ? why[status] : "Free gas is not available right now."} You can still walk around. To fish, top up this guest wallet from a Sepolia faucet, or use Connect MetaMask.`,
  });
}

/** Session-key mode: open bucket fish older than the key's grant with one wallet signature (no transaction). */
export function unlockOlderFish() {
  return guarded("Sign once in your wallet to open your older fish…", async () => {
    if (!walletLink) throw new Error("Reconnect your wallet to open older fish.");
    await chain.unlockWithWallet(walletLink.provider, walletLink.player, getState().lockedFish);
    await refresh();
  });
}

/** Copy the guest wallet address, e.g. to paste into a faucet. */
export async function copyGuestAddress() {
  const a = getState().address;
  if (!a) return;
  try {
    await navigator.clipboard.writeText(a);
    toast("Guest address copied. Paste it into a Sepolia faucet.");
  } catch {
    window.prompt("Your guest wallet address:", a);
  }
}

/** Copy the guest key so the player can keep their fish beyond this browser. */
export async function exportGuestKey() {
  if (!guest) return;
  try {
    await navigator.clipboard.writeText(guest);
    toast("Guest key copied. Keep it private: anyone with it can play as you and sell your fish.", "info", 9000);
  } catch {
    window.prompt("Copy your guest key and keep it private:", guest);
  }
}

/**
 * Reuse this browser's session key if the contract still accepts it for 10+ minutes; otherwise make a new one and
 * register it with ONE MetaMask transaction that also forwards a little ETH for gas.
 */
async function ensureSessionKey(provider: EIP1193Provider, player: `0x${string}`) {
  setState({ busy: "Checking your play session…" });
  const stored = storedSessionKey(player);
  const onchain = await chain.readSession(player);
  const now = Math.floor(Date.now() / 1000);
  const storedAccount = stored ? localAccount(stored) : undefined;
  if (storedAccount && storedAccount.address.toLowerCase() === onchain.key.toLowerCase() && onchain.expiresAt > now + SESSION_REUSE_MARGIN_S) {
    if ((await chain.loadEth(storedAccount.address).catch(() => 0n)) >= MIN_GAS) return { account: storedAccount, expiresAt: onchain.expiresAt };
  }
  // Re-authorize this browser's key when the contract allows it (unused, or already ours): its leftover gas and its
  // read grants stay usable. A new key only when there is none, or it was taken over elsewhere.
  let account = storedAccount;
  if (account) {
    const owner = await chain.keyOwner(account.address);
    if (owner !== "0x0000000000000000000000000000000000000000" && owner.toLowerCase() !== player.toLowerCase()) account = undefined;
  }
  if (!account) {
    const fresh = newSessionKey(player);
    if (!fresh.saved) toast("This browser cannot store the session key: you will need to confirm again after a reload.", "error", 10000);
    account = localAccount(fresh.key);
  }
  const expiresAt = now + SESSION_HOURS * 3600;
  setState({ busy: `One confirmation for a ${SESSION_HOURS}-hour session. After that, play without pop-ups.` });
  await chain.authorizeSession(provider, player, account.address, expiresAt, SESSION_VALUE_ETH, () =>
    setState({ busy: "Starting your session: waiting for the block…" }),
  );
  setState({ busy: "Topping up your session key with gas…" });
  await chain.waitForBalance(account.address);
  return { account, expiresAt };
}

export function connect(w: DiscoveredWallet | { name: string; account: LocalAccount }) {
  return guarded("Connecting…", async () => {
    if ("account" in w) {
      chain.startSession(w.account, w.account.address);
      setState({ mode: "dev", walletName: w.name });
      await enterIsland(w.account.address, w.account.address);
      return;
    }
    const player = await requestAccount(w.provider);
    walletLink = { provider: w.provider, player };
    setState({ mode: "wallet", walletName: w.name });
    const { account, expiresAt } = await ensureSessionKey(w.provider, player);
    chain.startSession(account, player, expiresAt);
    setState({ sessionExpiresAt: expiresAt, sessionExpired: false });
    await enterIsland(player, account.address);
  });
}

export function renewSession() {
  return guarded("Renewing your session…", async () => {
    if (!walletLink) throw new Error("Reload the page and connect your wallet again to renew the session.");
    const { provider, player } = walletLink;
    const { account, expiresAt } = await ensureSessionKey(provider, player);
    chain.startSession(account, player, expiresAt);
    setState({ sessionExpiresAt: expiresAt, sessionExpired: false });
    await chain.ensurePermit();
    stopPresence?.();
    stopPresence = connectPresence(RT_URL, account.address, getState().name ?? short(player), chain.signLogin);
    await refresh();
    toast("Session renewed for 24 hours.");
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

/** Close the reveal early (e.g. to show off a Secret); the rest of the catch is already in the bucket. */
export function endReveal() {
  setState({ cast: { phase: "idle", status: "", results: [], shown: 0 } });
  emit("local-anim", "idle");
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
      // every player (this one included) gets the public banner from the relayed Flexed event
      toast("Shown off: your Secret is now a 1-of-1 NFT in the Public Aquarium.", "secret", 6000);
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

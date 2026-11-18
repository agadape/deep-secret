import { nonceManager, type EIP1193Provider, type LocalAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { SEPOLIA_CHAIN_ID } from "../config";

export type DiscoveredWallet = { name: string; rdns: string; icon: string; provider: EIP1193Provider };

/** EIP-6963 discovery. Browser-extension wallets only: popups to other origins are cut off by COOP (SPIKE_LOG S20). */
export function discoverWallets(timeoutMs = 400): Promise<DiscoveredWallet[]> {
  return new Promise((resolve) => {
    const found = new Map<string, DiscoveredWallet>();
    const onAnnounce = (e: Event) => {
      const d = (e as CustomEvent).detail;
      found.set(d.info.rdns, { name: d.info.name, rdns: d.info.rdns, icon: d.info.icon, provider: d.provider });
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      const list = [...found.values()];
      const legacy = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
      if (list.length === 0 && legacy) list.push({ name: "Browser wallet", rdns: "injected", icon: "", provider: legacy });
      resolve(list);
    }, timeoutMs);
  });
}

export async function requestAccount(provider: EIP1193Provider): Promise<`0x${string}`> {
  const [account] = (await provider.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  if (Number(chainId) !== SEPOLIA_CHAIN_ID) {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
  }
  return account;
}

/**
 * A key held by this browser. The nonce is tracked locally because the load-balanced public RPC can report a
 * stale nonce right after a transaction (docs/FE_INTEGRATION_SESSIONS.md, "Nonce kunci lokal").
 */
export const localAccount = (key: `0x${string}`): LocalAccount => privateKeyToAccount(key, { nonceManager });

/** Local development only: a throwaway Sepolia key from .env.development.local (VITE_DEV_PRIVATE_KEY); Vite loads that file only in dev mode. */
export function devAccount(): LocalAccount | undefined {
  if (!import.meta.env.DEV) return undefined;
  const key = import.meta.env.VITE_DEV_PRIVATE_KEY as `0x${string}` | undefined;
  return key ? localAccount(key) : undefined;
}

// Storage can be missing or throw (private windows, blocked site data): fall back to a key that lives for this tab only.
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
    return read(k) === v;
  } catch {
    return false;
  }
};
const isKey = (v: string | null): v is `0x${string}` => !!v && /^0x[0-9a-fA-F]{64}$/.test(v);

const GUEST_KEY = "deepsecret.guestKey";

/** "Play now": the guest wallet lives in this browser only. `saved` is false when storage is unavailable. */
export function guestKey(): { key: `0x${string}`; created: boolean; saved: boolean } {
  const old = read(GUEST_KEY);
  if (isKey(old)) return { key: old, created: false, saved: true };
  const key = generatePrivateKey();
  return { key, created: true, saved: write(GUEST_KEY, key) };
}

const sessionSlot = (player: string) => `deepsecret.session.${player.toLowerCase()}`;

/** The session key this browser generated for a MetaMask player, if any. */
export function storedSessionKey(player: `0x${string}`): `0x${string}` | undefined {
  const v = read(sessionSlot(player));
  return isKey(v) ? v : undefined;
}

/** A fresh session key, saved before the authorize transaction so a closed tab cannot strand the forwarded gas. */
export function newSessionKey(player: `0x${string}`): `0x${string}` {
  const key = generatePrivateKey();
  write(sessionSlot(player), key);
  return key;
}

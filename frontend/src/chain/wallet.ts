import type { EIP1193Provider, LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
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

/** Local development only: a throwaway Sepolia key from .env.development.local (VITE_DEV_PRIVATE_KEY); Vite loads that file only in dev mode. */
export function devAccount(): LocalAccount | undefined {
  if (!import.meta.env.DEV) return undefined;
  const key = import.meta.env.VITE_DEV_PRIVATE_KEY as `0x${string}` | undefined;
  return key ? privateKeyToAccount(key) : undefined;
}

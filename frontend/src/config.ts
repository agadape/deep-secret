import { DeepSecretGame, PearlCoin, SecretFishNFT } from "./generated/contracts";

export const GAME = DeepSecretGame;
export const COIN = PearlCoin;
export const NFT = SecretFishNFT;

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
export const EXPLORER = "https://sepolia.etherscan.io";
export const FAUCET_HINT = "https://cloud.google.com/application/web3/faucet/ethereum/sepolia";
export const RT_URL: string = import.meta.env.VITE_RT_URL ?? "ws://localhost:8787/ws";
/** Gas drip for guest players lives on the same server as presence: ws(s)://host/ws -> http(s)://host/drip. */
export const DRIP_URL = RT_URL.replace(/^ws/, "http").replace(/\/ws\/?$/, "") + "/drip";

// Session keys (docs/FE_INTEGRATION_SESSIONS.md): one MetaMask confirmation buys a day of pop-up-free play.
export const SESSION_HOURS = 24;
export const SESSION_VALUE_ETH = "0.0003"; // forwarded to the key for gas
export const SESSION_REUSE_MARGIN_S = 600; // reuse a stored key only if it is valid for at least 10 more minutes

// Sepolia's base fee is ~20 wei; wallet default tips would overpay by orders of magnitude (SPIKE_LOG S16, S20).
export const FEES = { maxFeePerGas: 200_000n, maxPriorityFeePerGas: 100_000n } as const;
export const GAS = {
  claimStarter: 1_500_000n,
  setName: 300_000n,
  cast: 15_000_000n, // a session-key cast measured 13.2M on Sepolia (new storage slots are expensive)
  sell: 4_000_000n,
  requestRodUpgrade: 2_000_000n,
  finalize: 1_000_000n,
  flex: 600_000n,
  finalizeFlex: 1_200_000n,
} as const;

export const ZONES = [
  { id: 0, name: "Dermaga", en: "The Dock", minRod: 0 },
  { id: 1, name: "Karang", en: "The Reef", minRod: 2 },
  { id: 2, name: "Palung", en: "The Trench", minRod: 4 },
] as const;

export const DISCLAIMER = "This project is not audited, endorsed or operated by Zama. Use at your own risk.";

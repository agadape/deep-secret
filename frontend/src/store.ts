import { useSyncExternalStore } from "react";
import type { Fish } from "./fish";

export type CastPhase = "idle" | "wallet" | "casting" | "opening" | "reveal";
export type Panel = null | "bucket" | "shop" | "aquarium" | "board";

export type PlayerView = {
  starterClaimed: boolean;
  rodLevel: number;
  castCount: number;
  emberCount: number;
  upgradePending: boolean;
};

export type AquariumEntry = {
  tokenId: bigint;
  owner: string;
  ownerName: string;
  species: number;
  aura: boolean;
  weight: number;
  serial: number;
  season: number;
};

export type State = {
  address?: `0x${string}`;
  walletName?: string;
  /** guest = "Play now" browser wallet; wallet = MetaMask + session key; dev = local test key */
  mode?: "guest" | "wallet" | "dev";
  /** Unix seconds when the session key expires (wallet mode only). */
  sessionExpiresAt?: number;
  sessionExpired?: boolean;
  /** Persistent hint when the guest gas drip could not fund the wallet. */
  gasNote?: string;
  name?: string;
  ethBalance?: bigint; // balance of whoever pays gas (guest key, session key, or the wallet itself)
  player?: PlayerView;
  pearls?: bigint; // decrypted coin balance; only this player can see it
  bucket: Fish[];
  cast: { phase: CastPhase; status: string; results: Fish[]; shown: number; tx?: string };
  busy?: string;
  nearZone: number | null;
  nearBuilding: string | null;
  panel: Panel;
  online: number;
  room?: string;
  aquarium: AquariumEntry[];
  toast?: { kind: "info" | "error" | "secret"; text: string };
};

let state: State = {
  bucket: [],
  cast: { phase: "idle", status: "", results: [], shown: 0 },
  nearZone: null,
  nearBuilding: null,
  panel: null,
  online: 0,
  aquarium: [],
};
const listeners = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
}
export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
  );
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string, kind: "info" | "error" | "secret" = "info", ms = 5000) {
  setState({ toast: { kind, text } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: undefined }), ms);
}

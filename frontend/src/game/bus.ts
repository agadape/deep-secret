// Tiny typed event bus between React (HUD, chain) and Phaser (world). Phaser never sees fish data.

export type Anim = "idle" | "walk" | "cast" | "fishing" | "reel" | "hold_unknown" | "flex";
export type Dir = "up" | "down" | "left" | "right";
export type RemotePlayer = { id: number; name: string; x: number; y: number; dir: Dir; anim: Anim };

type Events = {
  "local-anim": Anim;
  "local-name": string;
  remote: { me: number | undefined; players: RemotePlayer[] };
  near: { zone: number | null; building: string | null };
  pos: { x: number; y: number; dir: Dir; anim: Anim };
  /** Public on-chain Flexed event relayed by the presence server: all of it is public once flexed. */
  "secret-flex": { player: string; species: number; serial: number; tokenId: string; tx?: string };
};

const target = new EventTarget();

export function emit<K extends keyof Events>(type: K, detail: Events[K]) {
  target.dispatchEvent(new CustomEvent(type, { detail }));
}

export function on<K extends keyof Events>(type: K, fn: (detail: Events[K]) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Events[K]>).detail);
  target.addEventListener(type, h);
  return () => target.removeEventListener(type, h);
}

/** Held directions from the on-screen pad (touch screens). */
export const pad = { up: false, down: false, left: false, right: false };

// Development only: lets automated UI checks walk the avatar.
if (import.meta.env.DEV) (window as unknown as { __pad: typeof pad }).__pad = pad;

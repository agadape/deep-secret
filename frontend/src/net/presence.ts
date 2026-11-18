// Cosmetic presence (SPIKE_LOG S21): position, facing and animation only. Never sends fish data.
import { emit, on, type RemotePlayer } from "../game/bus";
import { setState } from "../store";

type Signer = (message: string) => Promise<`0x${string}`>;

export function connectPresence(url: string, address: `0x${string}`, name: string, sign: Signer) {
  let ws: WebSocket | undefined;
  let me: number | undefined;
  let closed = false;
  let retryMs = 1000;
  let signature: { message: string; sig: `0x${string}` } | undefined;

  const offPos = on("pos", (p) => {
    if (ws?.readyState === WebSocket.OPEN && me !== undefined) ws.send(JSON.stringify({ t: "state", ...p, cts: Date.now() }));
  });

  const open = () => {
    ws = new WebSocket(url);
    ws.onmessage = async (ev) => {
      const m = JSON.parse(ev.data);
      if (m.t === "challenge") {
        // the server issues a fresh nonce per connection, so a reconnect needs a new signature
        const message: string = m.message;
        const sig = signature && signature.message === message ? signature.sig : await sign(message);
        signature = { message, sig };
        ws?.send(JSON.stringify({ t: "auth", address, signature: sig, name }));
      } else if (m.t === "welcome") {
        me = m.id;
        retryMs = 1000;
        setState({ room: m.room, online: m.players.length });
        emit("remote", { me, players: m.players as RemotePlayer[] });
      } else if (m.t === "snap") {
        setState({ online: m.players.length });
        emit("remote", { me, players: m.players as RemotePlayer[] });
      } else if (m.t === "chain" && m.event === "Flexed") {
        // public on-chain event relayed by the server: someone chose to show off a Secret
        const who = `${String(m.player).slice(0, 6)}…${String(m.player).slice(-4)}`;
        emit("secret-flex", { name: who, species: Number(m.species) === 0 ? "Raja Abyss" : "Ratu Palung" });
      } else if (m.t === "error") {
        setState({ room: undefined });
      }
    };
    ws.onclose = () => {
      me = undefined;
      setState({ room: undefined, online: 0 });
      emit("remote", { me: undefined, players: [] });
      if (!closed) setTimeout(open, (retryMs = Math.min(retryMs * 2, 15000)));
    };
  };
  open();

  return () => {
    closed = true;
    offPos();
    ws?.close();
  };
}

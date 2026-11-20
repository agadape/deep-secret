# Deep Secret — presence and gas-drip server

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

A small Node server (`ws` + `viem`) with two jobs:

1. **Presence**: players sign a free login message, then share only cosmetic state (name, position, facing, animation, emotes) in rooms of 30, at 10 snapshots per second. It never sees fish, balances, keys or decryption rights. It also relays public contract events to every room: `Cast`, `Flexed` (the only catch announcement) and `Snatched` (who targeted which fish id; the outcome stays encrypted).
2. **Gas drip** (`POST /drip {"address":"0x…"}`): funds guest "Play now" wallets with Sepolia ETH so they never need a faucet. Limits: 3 per address and 5 per IP per day, a daily budget, one in-flight drip per address.

| Endpoint | Use |
|---|---|
| `GET /ws` (WebSocket) | Presence |
| `POST /drip` | Gas for a guest wallet |
| `GET /health` | Rooms and player counts |

## Run locally

```bash
npm install
cp .env.example .env   # DRIP_PRIVATE_KEY = a throwaway Sepolia key; leave empty to disable the drip
npm start              # http://localhost:8787
```

## Host it

The server must stay awake (a cold start would drop everyone's presence), so use an always-on container, not a serverless function. One instance is enough for the demo: drip nonces and rate limits live in memory.

The `Dockerfile` here builds a small image (`node:22-alpine`, runs as the `node` user). Set these in the host's secret/env store, never in the image:

| Variable | Value |
|---|---|
| `DRIP_PRIVATE_KEY` | Testnet-only funding key |
| `ALLOWED_ORIGIN` | The frontend origin(s), comma-separated. Also enforced on the WebSocket handshake |
| `CLIENT_IP_HEADER` | The header your host sets with the real client IP (`fly-client-ip` on Fly.io, `cf-connecting-ip` behind Cloudflare). Without it the right-most `X-Forwarded-For` entry is used, which is the one the proxy appended |
| `SEPOLIA_RPC_URL` | `https://rpc.sepolia.ethpandaops.io` behaved most consistently in testing |
| `GAME_ADDRESS` | Optional; defaults to the current Sepolia deployment |
| `PORT` | Set by most hosts; defaults to 8787 |

The frontend then points `RT_URL` at `wss://<host>/ws` and derives the drip URL from it.

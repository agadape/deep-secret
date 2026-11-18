# Deep Secret — frontend

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

Browser client: a Phaser 3 pixel island (world) under a React HUD, talking to the Sepolia contracts in [`../contracts`](../contracts) through viem and `@zama-fhe/sdk`, plus a cosmetic presence server ([`../rt-spike`](../rt-spike)).

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173 (syncs ABIs + addresses from ../contracts first)
node ../rt-spike/server.mjs   # presence server on :8787 (optional; the game works solo without it)
```

Open the page in Chrome with MetaMask or Rabby on Sepolia. The page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (also in `vercel.json`), which the Zama SDK needs for fast WASM. Wallet popups from browser extensions work under these headers (SPIKE_LOG S20); QR/WalletConnect wallets are not supported for that reason.

### Development test key

For automated checks, `.env.development.local` may define `VITE_DEV_PRIVATE_KEY` (a throwaway Sepolia key). Vite loads that file only in dev mode, so it never reaches a production build. The connect screen then shows a "Dev: use test key" button.

`node scripts/e2e-ui.mjs` plays one full round in headless Chrome with that key (connect → walk to the dock → cast → reveal 5 fish → sell all) and saves screenshots to `test-shots/`. `MOBILE=1 LOOK=1` does a phone-sized walk-through without transactions.

## How it maps to the design

| Thing | Where |
|---|---|
| Island, zones, avatars, `???` silhouettes | `src/game/` (placeholder art drawn in code until the art pass) |
| HUD, bucket, rod shop, aquarium, verification board | `src/App.tsx`, `src/ui/` |
| Every chain action, retries for the load-balanced RPC and for decryption permission propagation | `src/chain/game.ts` |
| Honest status text for each transaction stage | `src/actions.ts` |
| Presence (position, facing, animation only — never fish data) | `src/net/presence.ts` |

What other players can see about you: your name, position, facing and animation. Every catch shows as the same black `???` silhouette, whatever it is (ART_BIBLE Addendum A2–A3).

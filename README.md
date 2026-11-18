# Deep Secret

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

A multiplayer pixel-art fishing game where every catch stays encrypted on-chain. Other players see you fishing, but your catch is always a black "???" — until you choose to show off a Secret fish, which becomes a verified 1-of-1 NFT in the Public Aquarium. Built on the Zama Protocol (FHEVM) for the Zama Developer Program Mainnet Season 5 "Confidential Gaming", deployed on Ethereum Sepolia.

| Folder | What |
|---|---|
| [`contracts/`](contracts) | Solidity: `DeepSecretGame`, `PearlCoin` (ERC-7984), `SecretFishNFT`. Tests, deploy, Sepolia smoke test |
| [`frontend/`](frontend) | Phaser 3 world + React HUD + Zama SDK |
| [`rt-spike/`](rt-spike) | Cosmetic realtime presence server (positions, animations, public events only) |
| [`GAME_SPEC.md`](GAME_SPEC.md) | Game design and technical spec (Indonesian) |
| [`docs/ART_BIBLE.md`](docs/ART_BIBLE.md) | Visual direction — read the Addendum first |
| [`docs/SAMBAR_EMBER.md`](docs/SAMBAR_EMBER.md) | Design of the "snatch a bucket" feature |
| [`SPIKE_LOG.md`](SPIKE_LOG.md) | Evidence (tx hashes, timings) for every FHE pattern the game relies on |
| [`reports/`](reports), [`research_notes/`](research_notes) | 2026 hackathon research behind the design |
| `spike-ws/`, `web-spike/` | Throwaway spike code kept as evidence |

Quick start: see [`contracts/README.md`](contracts/README.md) and [`frontend/README.md`](frontend/README.md). Never commit `.env` files: they hold testnet keys.

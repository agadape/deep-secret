# Deep Secret — contracts

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

Confidential multiplayer fishing on the Zama Protocol (FHEVM), Ethereum Sepolia. Design: [GAME_SPEC.md](../GAME_SPEC.md). Evidence for every FHE pattern used here: [SPIKE_LOG.md](../SPIKE_LOG.md).

## Contracts

| Contract | Role |
|---|---|
| [`DeepSecretGame`](contracts/DeepSecretGame.sol) | Season, starter pack, nicknames, `cast(zone)` (5 encrypted fish per cast with a hidden Secret quota), `sell`, two-step rod upgrade, two-step flex → NFT, season end with proof. No admin functions. |
| [`PearlCoin`](contracts/PearlCoin.sol) | ERC-7984 confidential coin. Only the game mints and burns; a short balance burns 0 instead of reverting. |
| [`SecretFishNFT`](contracts/SecretFishNFT.sol) | ERC-721 for Secret fish their owners chose to show. Fully on-chain metadata; minted only after a KMS-verified public decryption. |

### What is encrypted, and for whom

| Data | Visible to |
|---|---|
| Each fish: tier, species, weight, aura (packed `euint32`) and sale price (`euint64`) | Its owner only |
| Coin balances and every amount moved | Holder only |
| Secret fish left this season (`euint8`) | Nobody until `endSeason` |
| "Paid" bit of a rod upgrade | Public after the request (needed to raise the public rod level) |
| A flexed Secret's attributes | Public, with a decryption proof checked on-chain |
| Odds table, rod levels, zones, casts, sells (which fish ids) | Public |

## Commands

```bash
npm install
npm test                                    # 20 tests on the FHEVM mock
npx hardhat deploy --network sepolia        # needs .env, see .env.example
npx hardhat run scripts/smoke.ts --network sepolia
```

The public Sepolia RPC is load-balanced and sometimes reports a stale nonce right after a transaction; `hardhat deploy` is idempotent, so rerun it until it reports the game address.

## Current development deployment (Sepolia)

| Contract | Address |
|---|---|
| PearlCoin | `0x3408f2AcD38B09b8C8453b859fDbdd8b51E58594` |
| SecretFishNFT | `0x6AA8B50591b4282FA7f2A3496D85bA20bF3f70d7` |
| DeepSecretGame | `0x2C253892D001ed11A773a88f749358ff9Ea9442C` |

Season 1 (development): Secret 1 in 40 per fish, quota 20, starter 100, bait 5, open until 31 March 2027. The judging deployment will start a fresh season.

Smoke test on 18 November 2026: claim → name → cast (gas 11.2M) → 5 fish revealed → sell 5 (+446, balance matched) → rod upgrade 0 → 1 via public decryption proof. All passed.

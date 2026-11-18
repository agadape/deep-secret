# Deep Secret — contracts

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

Confidential multiplayer fishing on the Zama Protocol (FHEVM), Ethereum Sepolia. Design: [GAME_SPEC.md](../GAME_SPEC.md). Evidence for every FHE pattern used here: [SPIKE_LOG.md](../SPIKE_LOG.md).

## Contracts

| Contract | Role |
|---|---|
| [`DeepSecretGame`](contracts/DeepSecretGame.sol) | Season, starter pack, nicknames, `cast(zone)` (5 encrypted fish per cast with a hidden Secret quota), `sell`, two-step rod upgrade, two-step flex → NFT, season end with proof, session keys (`authorizeSession`: the wallet signs once, a browser key plays for it). No admin functions. |
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
npm test                                    # 25 tests on the FHEVM mock
npx hardhat deploy --network sepolia        # needs .env, see .env.example
npx hardhat run scripts/smoke.ts --network sepolia
npx hardhat run scripts/smoke-session.ts --network sepolia   # one wallet tx, then a session key plays
FISH_ID=0 npx hardhat run scripts/flex.ts --network sepolia   # show off a Secret
```

If the default public RPC returns stale nonces or balances, run with `SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io`.

The public Sepolia RPC is load-balanced and sometimes reports a stale nonce right after a transaction; `hardhat deploy` is idempotent, so rerun it until it reports the game address.

## Current development deployment (Sepolia)

| Contract | Address |
|---|---|
| PearlCoin | `0xdE587F7D525B015654e8922FDB49C6A753D7aDc6` |
| SecretFishNFT | `0x4FB9b6Dc3d861b01AaBd714DbBA0A0AD001698Fb` |
| DeepSecretGame | `0x6da1646B1cA6f41Ee163b77E290482d6B055799d` |

Season 1 (development): Secret 1 in 40 per fish, quota 20, starter 100, bait 5, open until 31 March 2027. The judging deployment will start a fresh season.

Smoke tests on 18 November 2026 (SPIKE_LOG S26): the player signs one `authorizeSession`; the session key then claims, casts (gas 12.5M), decrypts the 5 fish, sells and reads the player's balance. The first Secret was flexed into NFT #1 with a verified decryption proof. Earlier deployment `0x2C25…442C` (no session keys) is retired.

Gas note: Sepolia now charges far more for new accounts and new storage slots (an ETH transfer to a fresh address estimates ~207k gas). Use `cast` gas limit 15M and never hard-code 21k for transfers to new keys.

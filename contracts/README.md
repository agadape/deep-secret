# Deep Secret — contracts

> This project is not audited, endorsed or operated by Zama. Use at your own risk.

Confidential multiplayer fishing on the Zama Protocol (FHEVM), Ethereum Sepolia. Design: [GAME_SPEC.md](../GAME_SPEC.md). Evidence for every FHE pattern used here: [SPIKE_LOG.md](../SPIKE_LOG.md).

## Contracts

| Contract | Role |
|---|---|
| [`DeepSecretGame`](contracts/DeepSecretGame.sol) | Season, starter pack, nicknames, `cast(zone)` (5 encrypted fish per cast with a hidden Secret quota), `sell`, two-step rod upgrade, two-step flex → NFT, season end with proof, session keys (`authorizeSession`: the wallet signs once, a browser key plays for it), and Sambar Ember: blind `snatch` from another bucket, encrypted `setNet` traps, and the Pak Kumis practice bucket (`restockNpc`). No admin functions. |
| [`PearlCoin`](contracts/PearlCoin.sol) | ERC-7984 confidential coin. Only the game mints and burns; a short balance burns 0 instead of reverting. |
| [`SecretFishNFT`](contracts/SecretFishNFT.sol) | ERC-721 for Secret fish their owners chose to show. Fully on-chain metadata; minted only after a KMS-verified public decryption. |

### What is encrypted, and for whom

| Data | Visible to |
|---|---|
| Each fish: tier, species, weight, aura (packed `euint32`) and sale price (`euint64`) | Its owner only |
| Coin balances and every amount moved | Holder only |
| Secret fish left this season (`euint8`) | Nobody until `endSeason` |
| Outcome of a snatch (fish or Sandal Jepit) | The thief; the victim learns only about their own slot |
| Where a hidden net lies (`netFish`) | Its owner only (Pak Kumis: nobody) |
| "Paid" bit of a rod upgrade | Public after the request (needed to raise the public rod level) |
| A flexed Secret's attributes | Public, with a decryption proof checked on-chain |
| Odds table, rod levels, zones, casts, sells (which fish ids), who targeted which fish id, Sambar rules and cooldowns | Public |

## Commands

```bash
npm install
npm test                                    # 34 tests on the FHEVM mock
npx hardhat deploy --network sepolia        # needs .env, see .env.example
npx hardhat run scripts/smoke.ts --network sepolia
npx hardhat run scripts/smoke-session.ts --network sepolia   # one wallet tx, then a session key plays
FISH_ID=0 npx hardhat run scripts/flex.ts --network sepolia   # show off a Secret
npx hardhat run scripts/smoke-sambar.ts --network sepolia     # net, snatch, snatch into the net, Pak Kumis (~6 min)
```

If the default public RPC returns stale nonces or balances, run with `SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io`.

The public Sepolia RPC is load-balanced and sometimes reports a stale nonce right after a transaction; `hardhat deploy` is idempotent, so rerun it until it reports the game address.

`PearlCoin` and `SecretFishNFT` bind to one game forever (`setGame` is one-time). To deploy a new game, move the three JSON records out of `deployments/sepolia/` (old ones are kept in `deployments-archive/`) so all three contracts are deployed fresh.

## Current development deployment (Sepolia)

| Contract | Address |
|---|---|
| PearlCoin | `0x192529E31a9f1B104b65bcda023EE3AFD101A79A` |
| SecretFishNFT | `0x7d55BBC19477784A10840AF58a6108e59a7416e7` |
| DeepSecretGame | `0x7316ba642A6BB9966d6e713726Ac01EA148E96Eb` |

Season 1 (development): Secret 1 in 40 per fish, quota 20, starter 100, bait 5, open until 31 March 2027. Sambar uses the demo-season column of [SAMBAR_EMBER.md §1.7](../docs/SAMBAR_EMBER.md) (bait 5, net 3, short cooldowns). Deployed 18 November 2026; the frontend has not been switched to it yet ([FE_INTEGRATION_SAMBAR.md](../docs/FE_INTEGRATION_SAMBAR.md)). The judging deployment will start a fresh season.

Smoke tests on 18 November 2026 (SPIKE_LOG S26): the player signs one `authorizeSession`; the session key then claims, casts (gas 12.5M), decrypts the 5 fish, sells and reads the player's balance. The first Secret was flexed into NFT #1 with a verified decryption proof. Those ran on the previous deployment `0x6da1…799d` (session keys, no Sambar), now retired together with `0x2C25…442C` (no session keys).

Gas note: Sepolia now charges far more for new accounts and new storage slots (an ETH transfer to a fresh address estimates ~207k gas). Use `cast` gas limit 15M and never hard-code 21k for transfers to new keys.

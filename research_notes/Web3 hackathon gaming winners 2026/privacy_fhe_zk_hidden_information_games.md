# Hidden-information and privacy-tech games that won or placed in 2026 hackathons, bounties and builder programs (FHE, ZK, MPC, TEE)

Research date: 2026-11-16. Scope: 2026 winners first; older precedents are in one clearly labelled sub-section (max 8). "Search snippet" means the fact came from a search-result summary and the page itself was not fetched; treat those as lower confidence. Where nothing could be confirmed I write "not confirmed" and say what was searched.

Reader warning on terminology: Inco Lightning (used by most of the 2026 Inco winners below) exposes FHE-style encrypted types (`euint`, `elist`, `e.rand`) but its confidentiality is enforced by a TEE (Intel TDX enclave) plus a covalidator set that signs decryption attestations, per a winner's own README and Inco's own blog. It is therefore a TEE comparable with an FHE-like developer API, not a pure-FHE comparable. Sources: [Mentalist README](https://github.com/adipundir/mentalist), [Inco blog, 9 Jun 2026](https://www.inco.org/blog/confidential-onchain-games).

---

## Key Question 1: Which privacy-ecosystem hackathons / bounty seasons / builder programs ran in 2026 with winners announced?

### Takeaway
Ten 2026 events with published winners were confirmed across Inco, Zama, Arcium, Aztec (as a Solana sponsor track), MagicBlock, Midnight and Colosseum; the two richest sources of hidden-information *game* winners are the Inco x Megapot Summer Game Jam (Aug 2026) and the MLH x Midnight July 2026 hack. No 2026 winners lists with games could be confirmed for Fhenix, Aleo, Mina, Oasis, Secret, Phala, Partisia, Cartesi, RISC Zero, Succinct, ZK Hack or ETHGlobal sponsor prizes.

### Cited Findings

Confirmed 2026 events with winners announced (chronological):

- **Solana Privacy Hack** (Solana Foundation, online). Launched 12 Jan 2026 with a stated total prize pool of $70,000 across 3 tracks — [Solana Daily on X (search snippet)](https://x.com/solana_daily/status/2010591444759965949). Three main tracks (Private Payments, Private Launchpads, Open), each with a $15,000 top prize, plus sponsor prizes from Arcium, Inco and others — [Solana on X (search snippet)](https://x.com/solana/status/2009612856589942839). Sponsor-track winners announced by Solana Developers on 13 Feb 2026 — [Solana Developers on X (search snippet)](https://x.com/solana_devs/status/2022387550824927345). Event page: [solana.com/privacyhack](https://solana.com/privacyhack) (returned HTTP 429 on direct fetch; details above come from search snippets of that page and X posts).
  - Arcium track winners published 17 Feb 2026 — [Arcium Substack](https://arcium.substack.com/p/winners-of-solana-privacy-hack).
  - Inco track winners published 16 Feb 2026 — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners).
  - Aztec track: "Veil" won Best Overall (a payments project, not a game) — [@zktrivo on X (search snippet)](https://x.com/zktrivo/status/2024494048019698076).
  - MagicBlock track ($5,000: $2,500 / $1,500 / $1,000 for "real-time privacy") existed, per search snippets of [solana.com/privacyhack](https://solana.com/privacyhack); winners not confirmed.
- **Arbitrum Open House NYC Online Buildathon** (Arbitrum Foundation; Fhenix listed only as an ecosystem partner). 5–26 Feb 2026, 512 builders, $30,000 ($15k/$10k/$5k). Winners: Tilt Protocol, Fangorn, EqualFi. No game or FHE project among the three — [Arbitrum Foundation blog, 3 Mar 2026](https://blog.arbitrum.foundation/open-house-nyc-buildathon-concludes-meet-the-winning-teams/).
- **Zama Developer Program Mainnet Season 1** winners published 3 Apr 2026: 8 winners, none a game — [Zama blog](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-1-winners).
- **Zama Developer Program Mainnet Season 2** winners published 28 May 2026: 234 submissions; 7 Builder Track, 3 Bounty Track, 5 Special Bounty (APAC/OpenBuild) winners. Game or game-like winners: Cipher21 (blackjack, already known), Zerk (encrypted prediction market), SealPad (sealed-bid token sales) — [Zama blog](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners).
- **Colosseum Solana Frontier Hackathon** winners published 26 Jun 2026: 2,857 final projects, 10,000+ participants; Grand Champion CrowdBrain ($30,000); unordered Top 25 includes The Syndicate (mafia card league), Bench and Crafts — [Colosseum blog](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/).
- **MagicBlock Solana Blitz** weekend series (launched Feb 2026; "240+ projects built across seven Blitz weekends"). Blitz v6: 10–12 Jul 2026, winners 17 Jul 2026, 1,000 USDC pool, 41 mobile apps — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend).
- **MLH x Midnight July hack**: 17–19 Jul 2026 (48 hours), 84 teams, 7 winners across privacy-infrastructure and gaming tracks; winners post dated 20 Aug 2026 — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- **Zama Developer Program Mainnet Season 3** winners published 24 Jul 2026: 188 submissions, 9 winners, none a game — [Zama blog](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-3-winners).
- **Inco x Megapot Summer Game Jam**: build period 29 Jul – 14 Aug 2026; Inco track $3,000 / $1,500 / $500 USDC; Megapot track $5,000 total — [Inco blog, 28 Jul 2026](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build). Winners published 25 Aug 2026 — [Inco blog](https://www.inco.org/blog/summer-game-jam-winners).
- **Midnight "Hilo" hackathon**: winners announced live at Consensus Miami 2026; finance-oriented, four categories — [Midnight blog (search snippet)](https://midnight.network/blog/hilo-hackathon-winners-keep-privacy-on-track-across-four-categories).
- **Midnight Hackathon: May 2026** (MLH): 15–17 May 2026 — [MLH event page (search snippet)](https://events.mlh.com/events/14061-midnight-hackathon-may-2026). Winners not confirmed.

Events that exist but for which no winners list was found:

- **Fhenix "Privacy-by-Design dApp Buildathon"** on AKINDO: $50,000 grant, continuous multi-wave milestone-funded format, "not a weekend hackathon" — [Luma listing (search snippet)](https://luma.com/fhenix-buildathon). A project page self-reports "won $3,000 in Fhenix Buildathon" (Blindference; not a game) — [HackQuest project page (search snippet)](https://arbitrum-nyc.hackquest.io/projects/Blindference). A GitHub README describes itself as a "Wave 4 Submission" to the same buildathon — [FheForge repo (search snippet)](https://github.com/symulacr/FheForge).
- **Stellar Hacks: Real-World ZK**: submissions 15–29 Jun 2026; not a gaming track; winners not found — [Internshala listing (search snippet)](https://internshala.com/competitions/stellar-hacks-real-world-zk/).
- **ETHGlobal 2026**: event pages exist for Cannes 2026, New York 2026 and HackMoney 2026 — [ETHGlobal Cannes 2026](https://ethglobal.com/events/cannes2026), [ETHGlobal New York 2026](https://ethglobal.com/events/newyork2026), [HackMoney 2026](https://ethglobal.com/events/hackmoney2026). No 2026 FHE/ZK hidden-information game prize winner was surfaced.

### Inferences
- In 2026 the sponsor programs that explicitly asked for games were Inco (Summer Game Jam) and Midnight (gaming track); Zama's own Seasons 1–3 were finance/infrastructure themed and produced only one true game winner (Cipher21) before Season 4's lotteries. A dedicated "Confidential Gaming" bounty in Season 5 is therefore the first Zama season in 2026 where games are the stated theme, and the Inco jam (three weeks earlier format, same judging concerns) is the single closest comparable.
- Solana-side privacy events (Arcium, MagicBlock) rewarded game-*like* finance (prediction markets, sealed-bid auctions, opportunity markets, lotteries) far more than actual games.

### Gaps
- Fhenix: no official wave-winners page found. Searched "Fhenix CoFHE buildathon winners 2026 game", "Fhenix buildathon AKINDO wave winners 2026 CoFHE", "Fhenix Buildathon winners Wave Bluff and Barrel akindo Private By Design results". The AKINDO page itself was not fetched.
- Aztec: no 2026 Aztec-run hackathon or game jam winners found. Searched "Aztec Noir hackathon winners 2026 game", "NoirHack winners game Aztec", "Aztec game jam OR hackathon 2026 winners private game Noir battleship OR poker OR werewolf", "ZK Hack 2026 winners game Noir Aztec". Only a NoirHack submission form (no winners, no date) surfaced — [Tally form](https://tally.so/r/n9xbKE).
- Aleo: no 2026 hackathon winners found (searched "Aleo hackathon 2026 winners game zk"). zPrize 2026: not confirmed, not specifically searched beyond that query.
- Mina: no 2026 zkApp game winners found (searched "Mina zkApp OR Aleo OR Midnight hackathon winners 2026 game hidden information").
- Oasis (P4W3 / Sapphire), Secret Network, Phala: no 2026 winners with games found (searched "Oasis Sapphire hackathon winners 2026 game" and "Secret Network OR Phala OR Oasis 2026 hackathon winners game poker OR hidden information TEE winners announced"). Only 2024–2025 results surfaced.
- Partisia, Cartesi, RISC Zero, Succinct SP1: not searched individually; no 2026 game winners surfaced in any broader query. Not confirmed either way.
- MagicBlock track winners of Solana Privacy Hack: not confirmed. Blitz v0–v5 and v7–v8 winners: not confirmed from a fetched page. A search summary stated that Blitz v8 (Sep 2026) winners included BlitzMine (real-time mining game using on-chain VRF for winning-tile selection), Tenor (private multi-dealer FX RFQ on Private Ephemeral Rollups) and Oobe Protocol, but the underlying page was not identified or fetched; the nearest listed result was [Solana Compass MagicBlock page](https://solanacompass.com/projects/Magicblock). Treat as unverified.
- Midnight May 2026 hackathon gaming-track winners: not confirmed.
- Exact dates of Solana Privacy Hack conflict in snippets (one says 12–30 Jan 2026, another says submissions due 1 Feb; winners were scheduled for 10 Feb but sponsor-track posts are dated 13–17 Feb).

---

## Key Question 2: For each event — organizer, dates, prize pool, tracks, official winners link, and every winning or placing game / game-like project

### Takeaway
Across the confirmed 2026 events there are roughly 20 winning or placing projects that are games or game-like; only about nine are real games (Mentalist, Zunno, Hextract, AEGYLAX, pi River, Glass Bridge Royale, khel.fun Poker, The Casino & Church, Moonray, AmongUs Midnight, Cipher21), and the rest are betting, auction or lottery products.

### Cited Findings

**Inco x Megapot Summer Game Jam** — organizer Inco, cohost Megapot; 29 Jul – 14 Aug 2026; Inco track $3,000/$1,500/$500 USDC; judging: hidden mechanics, completeness, creativity, fun at 25% each; must use Inco Lightning on Base mainnet or Base Sepolia — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build). Winners — [winners post](https://www.inco.org/blog/summer-game-jam-winners):
- 1st: **Mentalist** (staked murder-mystery deduction).
- 2nd: **Zunno** (two-player Uno with encrypted hands).
- 3rd: **Hextract** (two-player fog-of-war extraction with sealed simultaneous orders).
- Honorable mentions: **AEGYLAX** (co-op planetary defense with hidden trajectory), **pi River** (heads-up Texas Hold'em vs bot or friend), **Glass Bridge Royale** (Squid-Game-style press-your-luck bridge).
- Megapot-track winners are not listed on the winners page that was fetched.

**Solana Privacy Hack — Inco prize** — [Inco blog, 16 Feb 2026](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners). Six winners in four headings, no placements or amounts given:
- Gaming: **khel.fun Poker**, **The Casino & Church**.
- Non-game: Zivo Exchange (private orderbook), VelvetSwap (confidential AMM), Bagel (payroll), DarkBridge (bridge).

**Solana Privacy Hack — Arcium track** — [Arcium Substack, 17 Feb 2026](https://arcium.substack.com/p/winners-of-solana-privacy-hack):
- Best Overall App ($5K): **Bench** — private "opportunity market"; stake, preference and vote size confidential via MPC; permissionless reveal after voting period.
- Best Integration ($3K): **Crafts** — first on-chain sealed-bid uniform-price auction on Solana; bids encrypted while clearing price is computed.
- Most <encrypted> Potential ($1K each): **Epoch** (prediction market with encrypted bet direction and size) and **Undesk** (private OTC desk; not a game).
- No actual game won the Arcium track.

**Zama Developer Program Mainnet Season 2** — [Zama blog, 28 May 2026](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners):
- **Cipher21** — confidential blackjack on FHEVM (Builder Track; already known, not re-researched).
- **Zerk** — encrypted prediction market on Sepolia; both the Yes/No choice and bet size are encrypted; aggregate resolves without exposing individual positions. Repo: https://github.com/Akhil-2310/zerk/ ; demo: https://zerk-six.vercel.app/ . (Same GitHub account, Akhil-2310, later placed 3rd in the Inco jam with Hextract — [Hextract repo](https://github.com/Akhil-2310/HEXTRACT).)
- **SealPad** — confidential token sales with sealed-bid mechanics (Special Bounty, APAC). Repo: https://github.com/YanYuanFE/sealpad .

**Zama Seasons 1 and 3** — no game among winners — [Season 1](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-1-winners), [Season 3](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-3-winners). A game that was submitted to the Season 3 Builder Track and is not on the winners list: **Crackd**, a Mastermind-style 1v1 code-breaking game on fhEVM — [Zama community forum, 7 Jul 2026](https://community.zama.org/t/crackd-a-confidential-1v1-code-breaking-game-where-your-code-is-encrypted-on-chain-fhevm/4506).

**MLH x Midnight July hack** — 17–19 Jul 2026, 84 teams, 7 winners, no placements or amounts published — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack):
- Gaming: **Moonray** (daily tournament slicing puzzle with sealed score commitments), **AmongUs Midnight** (multiplayer social deduction).
- Game-like in the infrastructure group: **MatchLock** (mutual-secret-choice matching), **NightPool** (dark-pool OTC with sealed-bid auction).

**MagicBlock Solana Blitz v6** — 10–12 Jul 2026, 1,000 USDC, 41 mobile apps — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend):
- 1st CapturGO (500 USDC; GPS rewards app, claim amounts and recipients hidden in a Private Ephemeral Rollup; not a game).
- 2nd **Perps Rider** (250 USDC; arcade racing game skinned over leveraged perps; no private state; VRF for crates and upgrades).
- 3rd **Hunch** (150 USDC; stake-and-climb fruit-slicing game; rows resolve on MagicBlock VRF; no private state mentioned).
- Wizardio's Choice (100 USDC): **VeilMarket** (private World Cup prediction markets; stakes hidden in a Private Ephemeral Rollup; resolved by VRF).
- Honorable mention: **Loofta Pot** (private lottery on Private Ephemeral Rollups).
- The article describes the privacy layer as "Intel TDX-backed confidential computing".

**Colosseum Solana Frontier Hackathon** — [Colosseum blog, 26 Jun 2026](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/):
- Top 25 (unordered, no per-project prize listed): **The Syndicate** — "skill-weighted, provably auditable mafia card league funded by USDC pack revenue"; link: https://arena.colosseum.org/projects/explore/the-syndicate . Hidden-information mechanics are not described on the page.
- Top 25 also includes **Bench** and **Crafts**, the same names as the Arcium-track winners above; a trade-press headline dated 6 May 2026 reads "Arcium ecosystem surpasses $7.5m with Bench and Crafts" — [FinTech Global (search snippet, title only)](https://fintech.global/2026/05/06/arcium-ecosystem-surpasses-7-5m-with-bench-and-crafts).

**Arbitrum Open House NYC Buildathon** — no game among winners — [Arbitrum Foundation blog](https://blog.arbitrum.foundation/open-house-nyc-buildathon-concludes-meet-the-winning-teams/). A Fhenix CoFHE game, **Bluff and Barrel**, is hosted on the Arbitrum Open House HackQuest sub-sites (NYC, Singapore, Dubai) but no award is listed for it — [HackQuest project page](https://hackquest.io/en/projects/Bluff-and-Barrel).

### Inferences
- "Bench" and "Crafts" appear to be the same Arcium-based teams graduating from a sponsor track (Feb 2026) to Colosseum Top 25 (Jun 2026); the Colosseum page itself does not state the Arcium link, so this is name-matching plus the trade headline, not a confirmed fact.
- Akhil-2310 winning at Zama Season 2 (Zerk) and then placing at the Inco jam (Hextract) suggests the same builders circulate across FHE-style programs, and that judges in both programs have recently seen that builder's work.

### Gaps
- Prize amounts per winner are not published for Zama Season 2, Inco's Solana Privacy Hack prize, or the MLH x Midnight July hack.
- Megapot-track winners of the Summer Game Jam were not on the fetched page.
- Whether Bluff and Barrel received any prize or Fhenix grant wave funding: not confirmed (HackQuest page lists no awards).

---

## Key Question 3: For each game — mechanic, what is hidden and from whom, which primitive, what is revealed and when, randomness, solo or multiplayer, latency/UX handling, why it won, links

### Takeaway
The 2026 winners that scored highest were not straight ports of casino games: Inco's first place went to a staked deduction game (one encrypted pick per case), and third to a simultaneous-sealed-order fog-of-war duel, with card-game ports (Uno, Hold'em) placing below them. Published judge quotes are almost non-existent; most "why it won" text is written by the sponsor's blog author.

### Cited Findings

#### Mentalist — 1st place, Inco track, Summer Game Jam (Aug 2026)
- What it is / loop: a murder mystery. Each case shows a crime scene and suspects with alibis; one alibi is impossible. Players listen to alibis for free (no transaction), then stake 0.10–5.00 USDC on one suspect, one entry per wallet per case. When the case closes, wrong guessers pay right guessers pro rata (`pot * yourStake / totalWinningStake`) — [winners post](https://www.inco.org/blog/summer-game-jam-winners), [README](https://github.com/adipundir/mentalist).
- Hidden, from whom: the killer's ID (encrypted locally by the case author; plaintext never in calldata, logs or repo) and each player's pick (encrypted on device). Spectators can see stakes but not who backed whom — [README](https://github.com/adipundir/mentalist).
- Primitive: Inco Lightning; the contract compares the encrypted pick with the encrypted answer "inside the TEE" and stores the result without granting the player access; security depends on the Intel TDX enclave and covalidator set — [README](https://github.com/adipundir/mentalist).
- Reveal: after the case closes, the player calls `unseal` to get the access grant, files a decryption attestation, and `resolve` verifies it on-chain. "Until money can no longer move, the answer stays hidden" — [README](https://github.com/adipundir/mentalist).
- Randomness: none described; the seven cases are hand-written fixed content — [README](https://github.com/adipundir/mentalist).
- Solo or multiplayer: asynchronous pari-mutuel pool; each player acts alone against a shared pot — [README](https://github.com/adipundir/mentalist).
- UX handling: investigation phase is entirely off-chain and wallet-free; only one staking transaction per case. Payouts optionally as Megapot jackpot tickets — [README](https://github.com/adipundir/mentalist).
- Stated limitations: cases are single-use (solving reveals the answer permanently); an operator who seals a wrong answer cannot be detected on-chain; if nobody wins, the pot becomes house surplus; most testing of encrypted bets used a mock because live covalidator coverage was limited — [README](https://github.com/adipundir/mentalist).
- Why it won: no judge commentary published — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Links: play https://mentalist-cases.vercel.app ; video https://youtu.be/a30wfJbb9Nw ; code https://github.com/adipundir/mentalist .
- Source conflict: a search-engine summary described Mentalist as "a tactical extraction game"; the fetched winners page shows that description belongs to Hextract. The fetched page is used here.

#### Zunno — 2nd place, Inco track, Summer Game Jam (Aug 2026)
- What it is / loop: two-player Uno on Base with standard rules (Draw Two, Skip, Reverse, Wild, Wild Draw Four). A creator opens a table, a second player joins — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Hidden: each hand is stored as `euint` handles readable only by its owner; the deck is one confidential `elist` — [README](https://github.com/ayush4345/zunno-inco).
- Reveal: a card is revealed only when played or at showdown, via covalidator attestation verified on-chain. To play, the player submits the claimed card value plus covalidator signatures; `playCard` calls `e.verifyDecryption` to check the claim against the stored handle, then applies Uno rules in plain Solidity — [README](https://github.com/ayush4345/zunno-inco).
- Randomness: encrypted on-chain generation (`e.randEuint8()`), deck shuffled in `startGame` — [README](https://github.com/ayush4345/zunno-inco).
- Multiplayer only (2 players). No solo mode described.
- UX handling: cards dealt in batches; `drawCard` and `playCard` can be relayed through an ERC-2771 forwarder so one off-chain signature replaces a wallet popup per move — [README](https://github.com/ayush4345/zunno-inco).
- Megapot tie-in: `startGame` buys a lottery ticket; a win is split among the table — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Stated limitations: unaudited prototype; client/server integration still in progress — [README](https://github.com/ayush4345/zunno-inco).
- Links: play https://zunno-inco.vercel.app ; video https://youtu.be/oyEMpmZfCKo ; code https://github.com/ayush4345/zunno-inco .

#### Hextract — 3rd place, Inco track, Summer Game Jam (Aug 2026)
- What it is / loop: two-player turn-based extraction duel on a 7x7 grid, max eight rounds. Each player has 2 integrity and 2 decoys. Each round both players privately queue two actions from Hold, Move, Scan, Attack, Decoy, Extract. Win by extracting at your home gate while carrying the Core; after round eight the carrier wins, otherwise the closer survivor — [README](https://github.com/Akhil-2310/HEXTRACT).
- Hidden: positions, integrity, decoys, both action queues, Core position and custody, scan results and the provisional outcome are all encrypted on-chain. Each wallet can decrypt only its own private report; a rival's exact cell is revealed only when encrypted Manhattan distance is at most two — [README](https://github.com/Akhil-2310/HEXTRACT).
- Partial-information design: scans return a coarse proximity band (no / faint / strong / contact); enemy decoys create false signals; relay towers amplify scans — [README](https://github.com/Akhil-2310/HEXTRACT).
- Sealed simultaneous orders: the browser packs both actions into one ciphertext; `submitActions` converts it to an `euint256`; the second player's submission resolves the round — [README](https://github.com/Akhil-2310/HEXTRACT).
- Reveal: outcome stays encrypted until `finalizeGame` verifies a covalidator attestation for the exact handle, then publishes winner or draw — [README](https://github.com/Akhil-2310/HEXTRACT).
- Randomness: `e.randBounded` places both operatives and the Core in hidden cells — [README](https://github.com/Akhil-2310/HEXTRACT).
- Solo: no on-chain bot, but an offline training simulator at `/game/demo` with enemy AI runs without a deployment — [README](https://github.com/Akhil-2310/HEXTRACT).
- Liveness: two missed planning windows forfeit the match — [README](https://github.com/Akhil-2310/HEXTRACT).
- Sponsor description of the technique: "Encrypted comparisons and math, so game logic never branches on readable data" — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Links: play https://hextract-chi.vercel.app ; video https://youtube.com/watch?v=_gZAtBtRUc4 ; code https://github.com/Akhil-2310/HEXTRACT .

#### AEGYLAX — honorable mention, Summer Game Jam (Aug 2026)
- Co-op planetary defense: players deploy Recon Probes that give noisy hints about an incoming strike, then each submits one private interception point. Successful defenders split the pool; if the planet falls, the round feeds a global jackpot funding a future free community round. The trajectory and each player's defense point stay encrypted until impact — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Links: play https://aegylax.vercel.app ; code https://github.com/mergelynth/aegylax-public .

#### pi River — honorable mention, Summer Game Jam (Aug 2026)
- Heads-up Texas Hold'em on Base Sepolia, playable against a bot or a friend, with progression, cosmetics and Megapot ticket credits — [winners post](https://www.inco.org/blog/summer-game-jam-winners). Full detail in Key Question 6.
- Links: play https://pi.sithunyein.com ; video https://youtu.be/G9p8otDQqBo ; code https://github.com/thesithunyein/pi-river .

#### Glass Bridge Royale — honorable mention, Summer Game Jam (Aug 2026)
- Squid-Game-style bridge of N steps, each with one safe and one shattering panel. Players stake and cross in join order; survivors split the pot weighted by how many panels each opened, so going first is riskier but pays more. The layout is drawn in a secure enclave and stored on Base as one encrypted word nobody can read — [winners post](https://www.inco.org/blog/summer-game-jam-winners).
- Links: play https://glassbridge-seven.vercel.app ; code https://github.com/gks2022004/glass-bridge-royale .

#### khel.fun Poker — Inco prize winner (Gaming), Solana Privacy Hack (Feb 2026)
- On-chain poker on Solana; shuffling uses Inco encrypted randomness (`e_rand`), dealing uses Inco encrypted compute so players cannot see cards they should not — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners). Demo: https://poker-solana-one.vercel.app/ . More in Key Question 6.

#### The Casino & Church — Inco prize winner (Gaming), Solana Privacy Hack (Feb 2026)
- Narrative-driven game about crypto speculation and belief; Inco powers the Casino side. Outcomes are determined by encrypted PRNGs; player positions are computed confidentially against encrypted random numbers; results can be decrypted only by the player; LPs can provide liquidity confidentially — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners). Demo: https://playcnc.fun/ .

#### Moonray — gaming-track winner, MLH x Midnight July hack (Jul 2026)
- Daily tournament puzzle: everyone gets the same seed-derived irregular board and slices it to find the optimal geometric solution while avoiding uncuttable obstacle nodes — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Hidden: the cut geometry never leaves the player's device. The chain receives only a nullifier (marks "has played") and a sealed score commitment, which opens in a later reveal window — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Primitive: ZK (Midnight Compact). Solo play against a shared daily leaderboard.
- Why it won (blog author's words, not a judge statement): the most complete build in the field — working contract, tests, finished interface, playable Preprod deployment; one of only two teams to deploy to Preprod — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Code: https://github.com/kaleababayneh/moonray .

#### AmongUs Midnight — gaming-track winner, MLH x Midnight July hack (Jul 2026)
- Online multiplayer social deduction: crew complete tasks while hidden impostors sabotage. Roles are committed per seat, votes are spent via nullifiers, and an ejected player's role is revealed only on elimination — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Why it won (blog author): "people genuinely wanted to play it" — strong user experience as the differentiator — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Code: https://github.com/SoumyaEXE/Among-Midnight .

#### MatchLock — winner (infrastructure group), MLH x Midnight July hack (Jul 2026)
- Two parties who privately choose each other derive a shared secret over the Jubjub curve without exchanging messages; nullifiers block fake matches. Because Compact lacks in-circuit encryption, the payload is encrypted client-side and stored as an opaque blob — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack). Code: https://github.com/ThunderRoar/MatchLock .

#### NightPool — winner (infrastructure group), MLH x Midnight July hack (Jul 2026)
- Dark-pool OTC desk with a sealed-bid auction; hides order prices and quantities while proving sufficient funds, using commitments, a Merkle membership tree and nullifiers against replay — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack). Code: https://github.com/KaranSinghBisht/nightpool .

#### Zerk — Builder Track winner, Zama Season 2 (May 2026)
- Prediction market on Ethereum Sepolia where both the Yes/No choice and the bet size are encrypted, so a participant can express a view without moving the market; the aggregate resolves without exposing individual positions — [Zama blog](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners).

#### Bench, Crafts, Epoch — Arcium track winners, Solana Privacy Hack (Feb 2026)
- Bench: staked voting "opportunity market"; stake, preference and vote size encrypted in Arcium's MPC network; permissionless reveal after voting. Crafts: sealed-bid uniform-price auction; bids stay encrypted while the clearing price is computed and settled. Epoch: prediction market with bet direction and size encrypted client-side and payout logic on confidential data — [Arcium Substack](https://arcium.substack.com/p/winners-of-solana-privacy-hack).

#### VeilMarket, Loofta Pot, Hunch, Perps Rider — MagicBlock Blitz v6 (Jul 2026)
- VeilMarket: bets execute gaslessly in an Ephemeral Rollup, stakes stay hidden in a Private Ephemeral Rollup, markets resolve by VRF. Loofta Pot: private lottery. Hunch and Perps Rider: real-time arcade games with VRF but no private state described — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend).

#### Non-winning 2026 FHE games worth knowing (no award confirmed)
- **Bluff and Barrel** (Fhenix CoFHE on Arbitrum Sepolia): 4-player Liar's-Bar-style bluffing with Russian Roulette elimination and USDC stakes. A target rank (Ace/King/Queen) is announced; a player plays 1–3 cards face-down claiming they match; others believe or call "LIAR!"; the loser of a challenge pulls the trigger on a 6-chamber revolver with one bullet at an unknown position; last alive wins stake x4 minus 5% fee. Three live modes (Basic 20 cards; Devil; Chaos) — [HackQuest page](https://hackquest.io/en/projects/Bluff-and-Barrel).
  - Hidden: player cards (`euint8`, owner-only via permit); bullet position (`euint8`, visible to nobody until the spin resolves; "the contract itself" cannot see it). Revealed: challenged cards, challenge result (`ebool`), spin result (`ebool`) — [HackQuest page](https://hackquest.io/en/projects/Bluff-and-Barrel).
  - Randomness: `FHE.randomEuint8` with draw-without-replacement implemented as `FHE.select` chains; Threshold Network decryption for reveals — [HackQuest page](https://hackquest.io/en/projects/Bluff-and-Barrel).
  - Cost: about 1,200 FHE operations per full game (5 rounds, 4 players); about 7.9M gas for the deal — [HackQuest page](https://hackquest.io/en/projects/Bluff-and-Barrel).
  - Links: https://bluff-and-barrel.vercel.app ; https://github.com/meetrgb45/liars-bar-2 ; videos https://youtu.be/s8qYCmv0wII and https://youtu.be/7864af9ZAgc .
- **Crackd** (Zama fhEVM on Sepolia): Mastermind-style 1v1; each player (or an AI "Vault") seals a 4-digit code stored as encrypted `euint8[4]`; guesses are scored on ciphertext; submitted to Zama Season 3 Builder Track; not on the Season 3 winners list — [forum post](https://community.zama.org/t/crackd-a-confidential-1v1-code-breaking-game-where-your-code-is-encrypted-on-chain-fhevm/4506), [Season 3 winners](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-3-winners). Demo: crackd-fhe.vercel.app ; code: github.com/martinvibes/Crackd-Fhe ; video: youtu.be/7PpS6Z971tI .

#### Earlier precedents (pre-2026; max 8, for novelty judging)
1. **Midnight Sea Battle Challenge** (results post 7 Feb 2025): the brief itself was Battleship; all three placed entries are Battleship. 1st Brick Towers (each player stakes 100 shielded tBTC, winner receives 200); judge Claude Barde called it "the best hackathon code I have seen so far". 2nd Edda Labs (four Compact circuits: join, commit grid, start, move). 3rd ShipySpace. Judged on Technology, Innovation, Completion, Documentation — [Midnight blog](https://midnight.network/blog/developers-navigate-public-and-private-states-in-the-midnight-sea-battle-challenge). Code: https://github.com/bricktowers/midnight-seabattle .
2. **LeoMafia** — "Private Onchain Mafia Game on Aleo"; project page dated June 2025 lists a ZK Hack Berlin win — [Devfolio (search snippet)](https://devfolio.co/projects/leomafia-0a98).
3. **Unchained Poker** — first prize, Secret Network Native dApp track, HackSecret 5 (held at EthDenver); built on Solana plus Secret Network; card values hidden from admins until players reveal — [Secret Network blog (search snippet)](https://scrt.network/blog/the-winners-of-hacksecret-5). Year not stated in the snippet.
4. **JackSeal** — encrypted Texas Hold'em on Fhenix, ETHOnline 2024; bets and cards are computed on without decryption; no award shown on the page — [ETHGlobal showcase (search snippet)](https://ethglobal.com/showcase/jackseal-60odo).
5. **Dégame** (Liar's Dice with FHE-hidden dice until final reveal) and **Token Tactics** (Risk-inspired fog-of-war strategy) — Inco bounty winners at ETHGlobal Brussels, 12–14 Jul 2024; judges praised Dégame for using FHE for game integrity — [Inco blog (search snippet)](https://www.inco.org/blog/ethglobal-brussels).
6. **Pawnstorm** (chess variant with secretly placed bombs) and **Knightfall** (fog-of-war chess; pieces hidden until in attack range) — ProvaHack 2.0, an internal Provable codefest on Aleo, 2–15 May 2025; no rankings published — [Provable blog](https://provable.com/blog/provahack-2.0-building-privacy-dapps-on-aleo). Code: https://github.com/mikebenfield/pawnstorm , https://github.com/dgrkotsonis/knightfall-aleo .
7. **Oasis Privacy4Web3 (2nd edition, 2024)** winners included Fair Fight (P2P 2D shooter), Treasure Hunt (hide/search P2P game), Rose Derby (horse betting) and a Sapphire Minesweeper using secure RNG for mine placement — [Oasis blog (search snippet)](https://oasis.net/blog/privacy4web3-hackathon-winners), [TechFlow (search snippet)](https://www.techflowpost.com/en-US/newsletter/32373).
8. **UpDown60** — Zama Developer Program Builder Track winner, December 2025: privacy-preserving BTC up/down betting dApp — [Zama community forum, 31 Dec 2025](https://community.zama.org/t/zama-developer-program-december-2025-winners/4127). Code: https://github.com/huaigu/UpDown60 .

### Inferences
- Common winning shape in 2026: one small, legible secret per decision (a pick, two queued orders, an interception point, a sealed score) rather than a large encrypted state machine. Mentalist needs one encrypted equality per player per case; Hextract packs a whole turn into one ciphertext.
- Reveal timing is treated as a design feature, not plumbing: "until money can no longer move" (Mentalist), "only on elimination" (AmongUs Midnight), "only within two tiles" (Hextract), "later reveal window" (Moonray).
- Coarse or lossy reveals (Hextract's four proximity bands, AEGYLAX's noisy probe hints) create deduction gameplay out of a single encrypted comparison; this is the "one-bit reveal" pattern in practice.
- Solo-playability shows up as a deliberate judge-facing convenience: pi River's bot, Hextract's offline simulator with AI, Crackd's AI "Vault", Moonray's solo daily puzzle, Mentalist's asynchronous pool. A judge can evaluate these alone without recruiting a second wallet.
- Where the blog author explained a win, the reasons were completeness/deployment (Moonray) and "people wanted to play it" (AmongUs Midnight) rather than cryptographic sophistication.

### Gaps
- No verbatim judge feedback exists for any 2026 Inco, Zama, Arcium or MagicBlock game winner in the pages fetched.
- Randomness method not described for Mentalist (none needed), AEGYLAX, pi River (beyond `shuffledRange`), Moonray (seed derivation) and AmongUs Midnight (role assignment).
- The Casino & Church and khel.fun Poker: no repo or write-up found, only demo links on Inco's post.
- The Syndicate (Colosseum Top 25): whether it uses any privacy tech is not stated on the winners page.
- AEGYLAX and Glass Bridge Royale READMEs were not fetched; details are from Inco's winners post only.

---

## Key Question 4: Which hidden-information genres have already been built repeatedly on privacy tech, and which are conspicuously absent?

### Takeaway
Poker/blackjack/card ports, lotteries, prediction-market betting, sealed-bid auctions and Battleship are heavily represented and are the first ideas sponsors themselves list; among 2026 winners the scarcer and better-placed genres were staked deduction, simultaneous-order fog-of-war, co-op hidden-target defense and sealed-score daily puzzles. On Zama's fhEVM specifically, the 2026 winners' game set is blackjack, lotteries and betting only.

### Cited Findings

Evidence of saturation:
- **Poker / blackjack / casual card ports.** 2026 winners or placers: khel.fun Poker — [Inco](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners); pi River (Hold'em) and Zunno (Uno) — [Inco](https://www.inco.org/blog/summer-game-jam-winners); Cipher21 (blackjack) — [Zama](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners). Non-winning or older: Bluff and Barrel — [HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel); JackSeal — [ETHGlobal](https://ethglobal.com/showcase/jackseal-60odo); Mental Poker on Aleo — [ETHGlobal](https://ethglobal.com/showcase/mental-poker-1e0kd); ProofPlay — [ETHGlobal](https://ethglobal.com/showcase/proofplay-kcxkk); POK3R NETWORK — [ETHGlobal](https://ethglobal.com/showcase/pok3r-network-v6131); Onchain ZK Shuffle Texas HoldEm — [ETHGlobal](https://ethglobal.com/showcase/onchain-zk-shuffle-texas-holdem-wuc8u); "Fully onchain poker w/ FHE on Base" — [Devfolio](https://devfolio.co/projects/fully-onchain-poker-w-fhe-on-base-aef4); Chainbluff — [Devfolio](https://devfolio.co/projects/chainbluff-279d); Mental Poker (created 28 Apr 2025) — [Devfolio](https://devfolio.co/projects/mental-poker-4b16); Unchained Poker — [Secret Network](https://scrt.network/blog/the-winners-of-hacksecret-5). (All ETHGlobal/Devfolio items are search snippets.)
- Sponsors list poker and blackjack first among suggested builds: Inco's jam brief opens with "Poker, blackjack, and other games of chance with hidden hands" — [Inco](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build); Inco ships a `ConfidentialDeck` base contract so card games need only rule code — [Inco docs](https://docs.inco.org/games/confidential-deck); Fhenix's 2024 ETHGlobal prize text named on-chain poker as the example use case — [ETHGlobal London prizes (search snippet)](https://ethglobal.com/events/london2024/prizes); writing on Arcium names poker and blackjack as the canonical hidden-state games — [BlockEden (search snippet)](https://blockeden.xyz/blog/2026/02/12/arcium-mainnet-alpha-encrypted-supercomputer-solana/).
- Despite that, in the Inco jam the Hold'em entry got only an honorable mention and the Uno port placed below a deduction game — [Inco](https://www.inco.org/blog/summer-game-jam-winners).
- **Lotteries.** Zama Season 4 winners were three no-loss lotteries (given in the brief; not re-researched). Loofta Pot private lottery was an honorable mention at Blitz v6 — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend). The Megapot track of the Inco jam is itself a lottery-integration track — [Inco](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build).
- **Prediction markets / up-down betting with hidden positions.** Zerk — [Zama](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners); Epoch and Bench — [Arcium](https://arcium.substack.com/p/winners-of-solana-privacy-hack); VeilMarket — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend); UpDown60 — [Zama forum](https://community.zama.org/t/zama-developer-program-december-2025-winners/4127); PriceProof — [Provable](https://provable.com/blog/provahack-2.0-building-privacy-dapps-on-aleo).
- **Sealed-bid auctions (as finance, not as games).** Crafts — [Arcium](https://arcium.substack.com/p/winners-of-solana-privacy-hack); SealPad — [Zama](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners); NightPool — [Midnight](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- **Battleship.** An entire Midnight challenge was Battleship; three placed implementations — [Midnight](https://midnight.network/blog/developers-navigate-public-and-private-states-in-the-midnight-sea-battle-challenge).
- **Guessing games with hidden answers (Wordle, Hangman, Mastermind, number guessing).** Crackd (Mastermind) — [Zama forum](https://community.zama.org/t/crackd-a-confidential-1v1-code-breaking-game-where-your-code-is-encrypted-on-chain-fhevm/4506); Inco's own Hangman demo and Melee Games' Wordle and Uno are cited as working examples — [Inco](https://www.inco.org/blog/confidential-onchain-games); Zama's Developer Program page lists a private multiplayer number-guessing game — [Zama (search snippet)](https://zama.ai/programs/developer-program); Inco's brief lists "Wordle, Sudoku, Geoguessr, and Hangman" — [Inco](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build).
- **Rock-paper-scissors, tic-tac-toe, dice, minesweeper.** FHE Rock Paper Scissors — [ETHGlobal (search snippet)](https://ethglobal.com/showcase/fhe-rock-paper-euzkg); ZK TicTacToe (Aleo "Best Use of Leo") — [ETHGlobal (search snippet)](https://ethglobal.com/showcase/zk-tictactoe-eh4iz); Dégame Liar's Dice — [Inco](https://www.inco.org/blog/ethglobal-brussels); Sapphire Minesweeper — [TechFlow](https://www.techflowpost.com/en-US/newsletter/32373); Inco docs mention Mines and casino-style games — [Inco](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build).
- **Social deduction (mafia / Among Us).** AmongUs Midnight (2026 winner) — [Midnight](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack); LeoMafia (2025) — [Devfolio](https://devfolio.co/projects/leomafia-0a98); The Syndicate mafia card league (2026 Top 25) — [Colosseum](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/). All three found are ZK or unspecified, none FHE.
- **Fog-of-war strategy.** Hextract (2026, 3rd) — [Inco](https://www.inco.org/blog/summer-game-jam-winners); Token Tactics (2024) — [Inco](https://www.inco.org/blog/ethglobal-brussels); Knightfall and Pawnstorm chess variants (2025) — [Provable](https://provable.com/blog/provahack-2.0-building-privacy-dapps-on-aleo). Present but far fewer than card games.

Genres that appeared once or not at all among winners found:
- Staked deduction / murder mystery: one (Mentalist, 1st) — [Inco](https://www.inco.org/blog/summer-game-jam-winners).
- Co-operative hidden-information: one (AEGYLAX, honorable mention) — [Inco](https://www.inco.org/blog/summer-game-jam-winners).
- Press-your-luck with a hidden layout: one (Glass Bridge Royale, honorable mention) — [Inco](https://www.inco.org/blog/summer-game-jam-winners).
- Daily asynchronous puzzle with sealed scores: one (Moonray; ZK, not FHE) — [Midnight](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Zama fhEVM 2026 winners that are games or game-like: Cipher21 (blackjack) and Zerk (prediction market) in Season 2; none in Seasons 1 and 3 — [S1](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-1-winners), [S2](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners), [S3](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-3-winners).
- Inco's June 2026 list of genres it considers possible includes several with no winner found in this research: PVP card battlers with concealed decks, lootboxes and mystery NFTs with sealed attributes, blind auctions for rare in-game items, confidential in-game economies, GeoGuessr-style location games, Sudoku, trivia — [Inco](https://www.inco.org/blog/confidential-onchain-games).

### Inferences
- Likely judge fatigue (many instances, sponsor templates exist, and weaker placement in the one head-to-head jam): Texas Hold'em, blackjack, Uno-style ports, lotteries, yes/no prediction markets, Battleship, Wordle/Hangman/Mastermind, rock-paper-scissors. For the Zama Season 5 bounty specifically, blackjack (Cipher21, Season 2) and lotteries (Season 4) have already won inside the same program.
- Conspicuously absent among the 2026 winners reviewed (this is absence in the sources found, not proof of non-existence):
  - On fhEVM/Zama: any winning fog-of-war or simultaneous-sealed-order strategy game, any social-deduction game, any co-op game, any deduction/mystery game, any poker.
  - Across all ecosystems: trick-taking games (Hearts, Spades, Bridge), Stratego-style hidden-rank games, hidden-movement games (Scotland Yard style) beyond Hextract, multi-player (3+) simultaneous-order negotiation games, auction-drafting or bidding games framed as *games* rather than DeFi, deck-builders or card battlers with concealed decks, roguelikes with encrypted maps or loot tables, sealed-attribute lootbox/NFT reveal games, bluffing dice since 2024's Dégame, and FHE-based (rather than ZK) social deduction.
- The pattern in the Inco jam podium (deduction 1st, Uno 2nd, fog-of-war 3rd, Hold'em only honorable mention) suggests novelty of the *hidden mechanic* outweighed familiarity when "hidden mechanics" and "creativity" were each 25% of the score.
- Mechanics that make confidentiality load-bearing for gameplay (bluffing, scouting, noisy hints, sealed simultaneous commitment) differentiate better than mechanics where encryption only guarantees dealer honesty.

### Gaps
- No source states explicitly that judges are tired of any genre; saturation is inferred from counts, sponsor templates and placements.
- The absence list is bounded by what the searches surfaced; non-English, Discord-only and X-only winner announcements (common for Fhenix, Aztec, MagicBlock) were not exhaustively covered.
- Zama Season 4 details were excluded by instruction, so any game other than the three lotteries in that season was not checked.

---

## Key Question 5: Published design write-ups or post-mortems on making encrypted / zk games feel good — concrete techniques

### Takeaway
No full post-mortem from a 2026 winning team was found; the concrete techniques come from winners' READMEs, one detailed project log (Bluff and Barrel), Inco's `ConfidentialDeck` docs and a couple of secondary articles. The recurring tricks are: keep exploration off-chain, pack a whole turn into one ciphertext, split heavy encrypted setup into its own transaction, relay moves via meta-transactions or silent wallets, reveal coarse bands instead of exact values, and always ship a bot or offline mode.

### Cited Findings

Transaction and gas shaping:
- Split the FHE deal into its own transaction (`dealNextRound`) because a combined transaction exceeded gas limits; set explicit per-function gas limits because `eth_estimateGas` returned unreliable values for FHE transactions; use a 2x baseFee floor for `maxFeePerGas`; auto-retry on 503 and gas errors (4 attempts with backoff). Reported cost: about 1,200 FHE operations per 4-player, 5-round game and about 7.9M gas for the deal. Known unsolved issues: multi-spin resolution in the fancier modes uses too much gas per transaction, and MetaMask shows inflated fee estimates for FHE-heavy transactions — [Bluff and Barrel, HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel).
- Pack two actions into one ciphertext (one `euint256`) so each player sends one encrypted submission per round; the second submission triggers resolution, so there is no separate "resolve" transaction — [Hextract README](https://github.com/Akhil-2310/HEXTRACT).
- Deal cards in batches; batch plaintext values and signatures for a single `settle(...)` call (`packForSettle`) — [Zunno README](https://github.com/ayush4345/zunno-inco), [Inco docs](https://docs.inco.org/games/confidential-deck).

Wallet friction and session handling:
- Relay `drawCard` and `playCard` through an ERC-2771 forwarder so one off-chain signature replaces a wallet popup per move — [Zunno README](https://github.com/ayush4345/zunno-inco).
- Google sign-in with a "silent play wallet" (Google-bound key in browser storage); a house wallet drips ETH to play wallets so the player never handles gas — [pi River README](https://github.com/thesithunyein/pi-river).
- Viewing your own cards costs a single signature via attested decrypt (`peekMyCards`); publicly revealed cards can be read by anyone without a wallet (`readRevealed`) — [Inco docs](https://docs.inco.org/games/confidential-deck).
- Session keys in smart-contract wallets let a player pre-authorize a stake and play many hands without signing each one — [dev.to poker field guide, 28 Jun 2026](https://dev.to/grinder-nl/blockchain-poker-in-2026-a-developers-field-guide-for-building-trustless-card-games-22a3) (author-experience article that promotes one product; low independence).

Latency masking and liveness:
- WebSocket relay for real-time sync with 3-second polling as fallback; on-chain turn timer via `forceTimeout()` (60 seconds in the final feature list) — [Bluff and Barrel, HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel).
- Two missed planning windows forfeit the match — [Hextract README](https://github.com/Akhil-2310/HEXTRACT).
- Keep the long "thinking" phase off-chain and wallet-free (listening to alibis makes no transaction), with one transaction at the moment of commitment — [Mentalist README](https://github.com/adipundir/mentalist).
- Keep the expensive private computation on the device and post only a nullifier plus a sealed score commitment, opened in a later reveal window — [Moonray, Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Provide a no-deployment offline simulator with AI, or a bot opponent, so the game is playable immediately — [Hextract README](https://github.com/Akhil-2310/HEXTRACT), [pi River README](https://github.com/thesithunyein/pi-river), [Crackd forum post](https://community.zama.org/t/crackd-a-confidential-1v1-code-breaking-game-where-your-code-is-encrypted-on-chain-fhevm/4506).

Reveal design (one-bit and coarse reveals):
- Compute the comparison privately, store the encrypted result without granting access, and grant it only once funds can no longer move (`unseal` then attest then `resolve`) — [Mentalist README](https://github.com/adipundir/mentalist).
- Reveal a proximity band (no / faint / strong / contact) rather than a position; reveal exact enemy state only when encrypted Manhattan distance is at most 2; state that visual fog is presentation only and secrecy is enforced by encrypted state plus access control — [Hextract README](https://github.com/Akhil-2310/HEXTRACT).
- Expose only `ebool` outcomes publicly (challenge result, spin result) while the underlying value (bullet position) stays encrypted — [Bluff and Barrel, HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel).
- Validate a move by having the player submit the claimed plaintext plus attestation signatures and checking it against the stored handle (`verifyDecryption`), then run game rules in ordinary Solidity, instead of evaluating rules on ciphertext — [Zunno README](https://github.com/ayush4345/zunno-inco), [Inco docs](https://docs.inco.org/games/confidential-deck).
- Keep the final outcome encrypted until a finalize call verifies an attestation for the exact handle — [Hextract README](https://github.com/Akhil-2310/HEXTRACT).

Encrypted-state hygiene rules (from Inco's card-game kit; conceptually parallel to fhEVM ACL rules):
- One operation produces values 1..n in a secret permutation (no per-card RNG, no `blockhash`); the draw pointer and list length are public — [Inco docs](https://docs.inco.org/games/confidential-deck).
- Call `allowThis()` on every stored handle or it may become unrecoverable in a later transaction; access grants and public reveals are irreversible, so a grant to the wrong address leaks the card permanently; never branch on encrypted values with `if` or `require` — [Inco docs](https://docs.inco.org/games/confidential-deck).

FHE scoring patterns on fhEVM:
- Mastermind feedback entirely on ciphertext: exact matches by `FHE.eq` per position with encrypted results summed; misplaced matches by `FHE.min` of per-digit counts minus exact matches; feedback handles granted to the guesser with `FHE.allow` and decrypted client-side through the relayer's `userDecrypt` — [Crackd forum post](https://community.zama.org/t/crackd-a-confidential-1v1-code-breaking-game-where-your-code-is-encrypted-on-chain-fhevm/4506).
- Encrypted draw-without-replacement built from `FHE.randomEuint8` plus `FHE.select` chains — [Bluff and Barrel, HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel).

ZK-side notes:
- Four small circuits (join, commit grid, start, move), each proving rule compliance while keeping state private — [Edda Labs, Midnight Sea Battle](https://midnight.network/blog/developers-navigate-public-and-private-states-in-the-midnight-sea-battle-challenge).
- Commit roles per seat, spend votes via nullifiers, reveal a role only on elimination — [AmongUs Midnight, Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- Where the proving language lacks in-circuit encryption, encrypt the payload client-side and store an opaque blob — [MatchLock, Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack).
- A reusable ZK game kit (ZKGameKit, 1st place Aligned Builders Hackathon, post dated 21 Jan 2025) bundles Socket.IO real-time updates, automatic batch transactions and a proof-verified leaderboard — [Aligned blog](https://blog.alignedlayer.com/aligned-hackathon-spotlight-vol-1-a-framework-for-zk-gaming).
- A Circom poker prototype added about 400 ms per hand, judged acceptable on Solana but not Ethereum L1 — [dev.to poker field guide](https://dev.to/grinder-nl/blockchain-poker-in-2026-a-developers-field-guide-for-building-trustless-card-games-22a3) (single-author claim).

General latency framing (secondary, unmeasured):
- One article argues latency rather than correctness is the main constraint for FHE games and that turn-based, social-deduction and asynchronous designs can absorb it, citing roughly 200–500 ms per operation — [Chainscore Labs (search snippet)](https://www.chainscorelabs.com/blog/gaming-and-metaverse-the-next-billion-users/privacy-in-social-games/why-homomorphic-encryption-could-unlock-new-social-game-genres). A separate FHE proof-of-concept write-up cites roughly 40–80 ms per FHE operation with much higher end-to-end latency once ciphertext transfer and threshold-network coordination are included — [Ethereum IPTF (search snippet)](https://iptf.ethereum.org/private-bonds-with-fhe). Neither is a measured fhEVM game benchmark.
- Inco claims "near-zero added latency" without figures — [Inco](https://www.inco.org/blog/confidential-onchain-games).

### Inferences
- Design the encrypted footprint first: count FHE operations and decryption round-trips per turn, then shape the rules so each turn is one encrypted submission and at most one decryption. Bluff and Barrel's roughly 1,200 FHE ops per game and gas-limit failures show what happens when a full card game is ported literally.
- Two validation styles exist: (a) compute rules on ciphertext (Crackd, Hextract, Mentalist's equality) and (b) owner decrypts then proves the plaintext against the handle (Zunno, ConfidentialDeck). Style (b) is cheaper but depends on an attestation service; on Zama fhEVM the nearest analogue is user decryption plus public decryption with proof verification, so the confidentiality-design judging criterion probably rewards style (a) where it is affordable.
- Asynchronous or "daily" structures (Mentalist cases, Moonray daily board) hide latency entirely because nobody is waiting on an opponent.
- Because irreversible ACL grants are the main foot-gun in every FHE-style stack, a submission that documents exactly who is granted what and when is directly addressing the "confidentiality design" criterion.

### Gaps
- No dedicated post-mortem or blog write-up by a 2026 winning game team was found (searched "FHE game design lessons latency decryption UX fhEVM game post-mortem"). Cipher21's own write-ups were out of scope by instruction.
- No measured end-to-end latency numbers (seconds per encrypted move or per decryption) were published by any of these teams.
- No fhEVM-specific write-up on session keys or batching for games was found; the session-key and meta-transaction examples are from Inco/Base projects.
- The Fhenix article "Trustless Gaming: Not All Is Fair Play" surfaced in search ([link](https://www.fhenix.io/blog/trustless-gaming-not-all-is-fair-play)) but was not fetched.

---

## Key Question 6: Poker specifically in 2026 — on-chain poker (FHE, MPC, ZK mental poker) that won a hackathon or launched; variant, dealing, evaluation, showdown, folding

### Takeaway
Two poker projects were confirmed as 2026 prize recipients, both on Inco Lightning (TEE-backed encrypted types): khel.fun Poker on Solana (Inco prize, Feb 2026) and pi River, heads-up Hold'em on Base Sepolia (honorable mention, Aug 2026). No 2026 hackathon-winning poker on pure FHE (Zama fhEVM or Fhenix), on Arcium MPC, or using ZK mental poker was confirmed, and no project published how it handles folded (mucked) hands.

### Cited Findings
- **khel.fun Poker** — listed under Gaming among Inco's Solana Privacy Hack prize winners (post dated 16 Feb 2026). Described as on-chain poker with "fairness guarantees"; shuffle uses Inco encrypted randomness (`e_rand`), dealing uses Inco encrypted compute so players cannot see cards they should not. Variant, hand evaluation, showdown and fold handling are not described. Demo: https://poker-solana-one.vercel.app/ — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners).
- **pi River** — honorable mention, Inco x Megapot Summer Game Jam (Aug 2026) — [Inco blog](https://www.inco.org/blog/summer-game-jam-winners). From the repo README — [pi River](https://github.com/thesithunyein/pi-river):
  - Variant: heads-up Texas Hold'em, against a bot or a friend ("Quick Play").
  - Dealing: Inco `shuffledRange` encrypted deal through `kit/ConfidentialDeck.sol`.
  - Hole cards: encrypted with Inco Lightning; each player decrypts only their own with `attestedDecrypt`, plaintext used only for the local UI; opponent cards stay sealed until showdown.
  - Showdown: the contract verifies covalidator attestations, then reveals and settles. Contracts include `CardLib.sol` and `HoldemEval.sol`; the README does not say whether evaluation runs on encrypted data or after reveal.
  - Folding: not addressed.
  - Onboarding: Google sign-in via Supabase, silent play wallet, house wallet drips gas.
  - Testnet only (Base Sepolia), "fun chips" plus testnet Megapot tickets.
- **Inco `ConfidentialDeck` template** (what both Inco poker entries most likely build on; confirmed for pi River): single-operation secret permutation shuffle with a public draw pointer; `_dealTo(player)` grants decrypt access to one player; `_revealCard` / `_dealFaceUp` make a card permanently public; settlement verifies covalidator-signed plaintexts against stored handles. Fold/muck handling is not covered in the docs — [Inco docs](https://docs.inco.org/games/confidential-deck).
- **Arcium encrypted poker** — a syndicated article states Arcium announced encrypted poker on Solana, designed by "sb_migliaccio" and "CatMcGeeCode" at a "Solana Developer Hackathon", using MPC so cards are encrypted and only results are published — [MEXC news reprint (search snippet; page could not be fetched due to a TLS certificate error)](https://www.mexc.com/news/134854). Date, hackathon name, variant and prize: not confirmed. Arcium's site describes the goal as hands that stay hidden until showdown — [Arcium build page (search snippet)](https://www.arcium.com/build-with-us).
- **Cipher21** (blackjack, not poker) remains the only card game among Zama's 2026 Developer Program winners found: every card encrypted on-chain, only the player decrypts their own hand, the contract deals, scores and settles without seeing cards — [Zama blog](https://www.zama.org/post/announcing-the-developer-program-mainnet-season-2-winners).
- **Adjacent bluffing card game on real threshold-FHE (no award confirmed):** Bluff and Barrel on Fhenix CoFHE. Cards are `euint8` visible only to the owner via permit; challenged cards are publicly decrypted through the Threshold Network; unchallenged claims are never revealed by design; about 7.9M gas to deal for four players — [HackQuest](https://hackquest.io/en/projects/Bluff-and-Barrel).
- **2026 launch claim (not a hackathon):** a dev.to "field guide" dated 28 Jun 2026 names ChainPoker (Texas Hold'em, cross-chain liquidity pooling, governance token per hands played) and recommends VDF randomness with off-chain shuffle and on-chain commitment; it says collusion is undetectable on-chain and offers no solution. The author's profile links to chainpoker.net, so treat as promotional — [dev.to](https://dev.to/grinder-nl/blockchain-poker-in-2026-a-developers-field-guide-for-building-trustless-card-games-22a3).
- **Prior-art poker (pre-2026):** JackSeal, Fhenix Hold'em, ETHOnline 2024 — [ETHGlobal](https://ethglobal.com/showcase/jackseal-60odo); Unchained Poker, HackSecret 5 first prize (Secret TEE + Solana) — [Secret Network](https://scrt.network/blog/the-winners-of-hacksecret-5); Mental Poker on Aleo (ZK plus commutative encryption) — [ETHGlobal](https://ethglobal.com/showcase/mental-poker-1e0kd); ProofPlay (ZK shuffle Hold'em) — [ETHGlobal](https://ethglobal.com/showcase/proofplay-kcxkk); "Fully onchain poker w/ FHE on Base", which argues FHE avoids the per-player ZK proofs mental poker needs — [Devfolio](https://devfolio.co/projects/fully-onchain-poker-w-fhe-on-base-aef4); Cartesi Texas HODL'em — [Cartesi on Medium](https://medium.com/cartesi/how-cartesi-is-changing-the-game-introducing-cartesi-texas-hodlem-181d319d3a01). (All search snippets.)

### Inferences
- Every confirmed 2026 poker prize used a dealer-less encrypted-deck template where the platform shuffles; none used player-contributed mental-poker shuffles. The trust model in those entries is the enclave plus covalidators, which a Zama judge would likely view as weaker than threshold FHE — an opening for an fhEVM entry, but also evidence that poker itself is no longer novel.
- Heads-up (2-player) with a bot is the practical ceiling teams reached in a two-to-three-week window; nobody shipped a confirmed multi-seat table with side pots on encrypted cards.
- Fold handling is the unaddressed design question: in Inco's kit a reveal is permanent and public, so the natural implementation is simply never to reveal folded cards. Whether any team proved that folded hands stay sealed forever (including from the house) is not documented; an fhEVM design that makes "mucked cards are never decryptable by anyone" an explicit, tested property would be differentiated.
- Hand evaluation on ciphertext (ranking five-to-seven encrypted cards) appears to be avoided in practice: pi River reveals at showdown via attestation and then settles, and Zunno validates plays on attested plaintext. Full encrypted hand ranking is likely too expensive, which favours smaller-hand variants or comparison-only showdowns if poker-like play is attempted on fhEVM.
- Given poker's sponsor-template status and its honorable-mention-only placement at the Inco jam, a poker entry would need a distinctive twist to score on novelty.

### Gaps
- No 2026 hackathon-winning poker on Zama fhEVM, Fhenix CoFHE, Arcium MPC or ZK mental poker was found. Searched "on-chain poker FHE OR MPC OR mental poker hackathon winner 2026", "Arcium encrypted poker Solana launch 2026 hidden cards MPC", "Arcium poker sb_migliaccio CatMcGee encrypted poker Solana hackathon", "khel.fun poker Solana Inco encrypted shuffle how it works Texas Hold'em", and an ethglobal.com-restricted search for 2026 encrypted poker.
- khel.fun Poker: variant, table size, evaluation, showdown and fold handling not documented in any source found; no repo located.
- pi River: whether `HoldemEval.sol` runs on encrypted values, how community cards are revealed, and bot design are not stated in the README.
- Arcium poker: original announcement, date and hackathon not located; only an undated syndicated reprint.
- No source describes side pots, all-in handling, disconnect/timeout rules or collusion mitigation for any encrypted poker project.

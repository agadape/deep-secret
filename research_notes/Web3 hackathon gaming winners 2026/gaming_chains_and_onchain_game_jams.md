# Gaming-specific web3 hackathons and on-chain game jams, 2026 (winners announced as of 2026-11-16)

Research notes for the Zama Developer Program Season 5 "Confidential Gaming" bounty report. Researched 2026-11-16.

**Reading guide and reliability flags**

- "Confirmed" = read on the organizer's own page or the winner's own repo. "Via search snippet" = seen only in a search-engine summary of the page (X posts and DoraHacks pages could not be opened directly: X returned HTTP 402, DoraHacks returned 405 / a human-verification wall, KuCoin reposts failed on a TLS error).
- The web-search budget for this session ran out before every chain on the brief could be searched a second time. Searches that did not run are listed in the Gaps of Question 1. "Not found" below therefore means "not found in the searches that ran", not "does not exist".
- Nothing below is invented. Where a rank, prize, date or link could not be confirmed it says "not confirmed".
- Important technology note for the Zama angle: every Inco Lightning and MagicBlock Private Ephemeral Rollup winner below gets its secrecy from a **TEE (Intel TDX)**, not from FHE or ZK. One winner's README says so in plain words: Inco "is TEE-based confidential compute running on Intel TDX. It is not FHE and it is not zero knowledge" — [Mentalist README](https://github.com/adipundir/mentalist).

---

## 1. Which gaming-specific events ran in 2026 with winners announced?

### Takeaway
Ten 2026 events with a gaming focus or a dedicated gaming track have confirmed winners; the two most useful for a confidential-gaming entry are the **Inco x Megapot Summer Game Jam** (Aug 2026, hidden-state games on Base) and the **MLH x Midnight July hack gaming track** (Jul 2026, ZK hidden-state games). The flagship fully-on-chain series, **Dojo Game Jam VIII** (Mar 2026), was held with 31 submissions but its winners could not be confirmed, and no 2026 MUD / Redstone / Autonomous Worlds, Ronin Forge, Immutable, Xai, Oasys, Saga, TON or Abstract game jam with announced winners was found.

### Cited Findings

**A. Gaming-specific events, winners confirmed (profiled in Questions 2 and 3)**

| # | Event | Chain / stack | When (2026) | Why it matters here |
|---|---|---|---|---|
| 1 | Inco x Megapot Summer Game Jam | Base + Inco Lightning (TEE) | Jul 29 – Aug 14; winners Aug 25 | Whole jam was "hidden mechanics" games — the closest analogue to the Zama bounty |
| 2 | MLH x Midnight July hack (gaming track) | Midnight (ZK, Compact) | Jul 17–19; winners post Aug 20 | Two hidden-state game winners |
| 3 | MagicBlock Solana Blitz series, v0–v9 | Solana + Ephemeral Rollups / Private ER (TEE) / VRF | Feb – Oct | Real-time game engine's hackathon series; games won in v6–v9 |
| 4 | EVE Frontier x Sui 2026 Hackathon | Sui + EVE Frontier live world | Mar 11–31; winners Apr 24 | Largest on-chain game-world modding event of the year |
| 5 | YGG Play x Verse8 "Casual Degen" track, BuidlHack 2026 | chain not named | Apr 14–18 | Crypto-native casual games, 120 teams |
| 6 | VibeBlitz #1 (vibecode.game by YGG x Minds by Animoca Brands) | web3 publisher; no on-chain component confirmed | winners Aug 10/11 | Genre signal only (idle auto-battler won) |

- Inco jam: build period July 29 – August 14, 2026, winners posted August 25, 2026 — [Inco resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build), [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Midnight July hack: 48-hour event July 17–19, 2026, 84 teams, seven winners across "privacy infrastructure and gaming tracks" — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Solana Blitz: series launched February 2026; 240+ projects across seven weekends by July; 330+ across nine editions by September — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend), [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)
- EVE Frontier x Sui: three weeks in March 2026, $80,000, 800+ participants, 123 submissions, winners announced April 24, 2026 — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/), [CCP press release](https://pressreleases.triplepointpr.com/2026/04/24/ccp-games-announces-winners-of-80000-eve-frontier-x-sui-2026-hackathon/)
- BuidlHack "Casual Degen": Builder Day April 14, final showcase April 18, 2026, Seoul, 120 teams — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- VibeBlitz: 72 games from 250+ participants, five winners picked by a judging panel after community voting (via search snippet) — [Animoca Brands announcement](https://www.animocabrands.com/announcement/vibeblitz-jam-ygg-minds-animoca-brands), [eGamers](https://egamers.io/idle-tactics-ascension-takes-top-prize-in-yggs-debut-vibeblitz-game-jam/)

**B. General 2026 hackathons whose gaming winners are relevant (not gaming-specific events)**

- **Solana Privacy Hack — Inco prize winners** (post dated February 16, 2026): two winners grouped under "Gaming" — khel.fun Poker and The Casino & Church. Hackathon dates and ranks are not stated on the page — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners)
- **Starknet Re{define} Hackathon** (Feb 1–28, 2026; theme "BTC x Privacy"; tracks Privacy, Bitcoin, Open; 248 projects on DoraHacks): Privacy Track 1st place reported as "Mental Poker SDK for Starknet" (via search snippet of the DoraHacks winners page; page could not be opened) — [DoraHacks winners page](https://dorahacks.io/hackathon/redefine/winner), [Starknet Africa on X](https://x.com/StarknetAfrica/status/2013224764832190860), [hackathon site](https://hackathon.starknet.org/)
- **Colosseum Frontier** (2,857 projects): MagicBlock-built winner Rosentica is "a battle arena for tokenized TCG cards, with matches running inside Ephemeral Rollups and VRF for rolls" — [MagicBlock June recap](https://www.magicblock.xyz/blog/june2026-recap)

**C. Held in 2026, winners not confirmed**

- **Dojo Game Jam VIII** (Dojo / Cartridge, Starknet): March 6–8, 2026, $15,000, 31 submission files in the repo; no winners section in the repo README and no results commit (last commit 2026-03-11). The previous edition's README did carry a winners section and X link, so the GJ8 announcement was probably made on X/Discord only — [gj8 directory](https://github.com/dojoengine/game-jams/tree/main/gj8), [repo](https://github.com/dojoengine/game-jams), [gj7 README for comparison](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)
- **Solana Blitz v9** ("Crypto World's Fair edition", 55 projects, results posted October 15, 2026): full ranked list not obtained; one builder self-reports 2nd place (BLACKOUT) — [KuCoin repost of MagicBlock post](https://www.kucoin.com/news/community/SOL/6ad0f449fa4b9e000754aee7), [BLACKOUT repo](https://github.com/Anshv784/blackout)
- **Solana Blitz v0, v1, v2, v4**: winners were announced on X but names were not obtained — [v0 post](https://x.com/magicblock/status/2026678583502962725), [March recap](https://www.magicblock.xyz/blog/march2026-recap), [April recap](https://www.magicblock.xyz/blog/april2026-recap)

**D. Excluded (with reason)**

- **Avalanche "Build Games" 2026** — excluded: despite the name it was an open builder competition, not a game event. Winners were Meridian (institutional credit infrastructure, $100,000), Forg3t Protocol (AI compliance, $75,000) and The Grotto (an Avalanche L1 for indie game publishing, $50,000); 2,000+ applicants, 20 finalists. Only The Grotto is game-related and it is a platform, not a game — [AVAX One interview, Apr 2, 2026](https://avax-one.com/inside-the-avalanche-build-games-a-conversation-with-avax-one-coo-pete-wylie/), [Avalanche launch post](https://www.avax.network/about/blog/avalanche-launches-1m-competition-build-games)
- **Axie Vibeathon** (Sky Mavis / Ronin) — excluded: winners not confirmed. 402 registered builders, 90 playable games, 20,000 bAXS pool; eight finalists named October 8, 2026; Round 2 ran October 11 – November 7 with a final showcase scheduled for November 12, 2026. No results article was found four days after the showcase date. Only 11 of the 90 games needed a Ronin wallet or used real Axie NFTs — [eGamers finalists article](https://egamers.io/axie-vibeathon-names-eight-finalists-heading-into-round-2-game-development-phase/), [eGamers close-out article](https://egamers.io/sky-mavis-closes-axie-vibeathon-as-90-community-built-games-go-live/), [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42984/axie-vibeathon-90-playable-games/)
- **Dojo Game Jam VII** — excluded as a 2025 event (October 31 – November 3, 2025). Kept as "background only" in Question 2 because GJ8 winners are unconfirmed — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)
- **INITIATE: The Initia Hackathon** — excluded: winners not confirmed. $25,000 pool, tagged Gaming, deadline extended to April 26, 2026 (via search snippet) — [DoraHacks listing](https://dorahacks.io/hackathon/initiate)
- **Midnight Hackathon (Devpost, with a gaming track)** — excluded: results page showed prizes but no winners (via search snippet) — [Devpost](https://midnight-hackathon-2026.devpost.com/)
- **Somnia x Cracked Labs Dreamathon** — excluded: a three-month incubator, not a jam; ten winning teams include BALL3 ("a competitive game"); year of the post not confirmed — [Somnia blog](https://blog.somnia.network/p/dreamathons-first-class-of-founders)
- **Starknet Re{Solve} Hackathon** (had an "On-Chain Worlds & Gaming" track with Cartridge and Dojo) — excluded: Devpost page returned 403; its update feed references the Dojo jam starting October 31, which places it in 2025 — [Devpost](https://resolve-starknet.devpost.com/)
- **MagicBlock Founders Camp, Bangkok** (Demo Day September 28, 2026; winners 8bit Studio, Decent Gaming, Loofta) — excluded: an accelerator-style program for 14 selected teams, not a jam — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)
- **ETHGlobal 2026 events** (HackMoney, Cannes, Lisbon, New York) — excluded: no dedicated gaming track was found; the Cannes top-10 list contained no project described as a game (via search snippet) — [X trending summary](https://x.com/i/trending/2040818861776494943?lang=en), [0G Lisbon recap](https://0g.ai/blog/ethglobal-lisbon-2026-recap)

### Inferences
- In 2026 the centre of gravity for on-chain game jams moved from "fully on-chain engine" jams (Dojo, MUD) toward **confidential-compute sponsors running game jams to showcase hidden state** (Inco, Midnight, MagicBlock Private ER). Three separate privacy stacks used games as their demo vehicle within about three months (Jul–Sep 2026). Zama's Season 5 bounty sits in the same pattern.
- The absence of any 2026 Lattice / MUD / Redstone / Autonomous Worlds event in search results suggests that scene ran no public prize jam this year, but this was only tested with one search and should not be stated as fact.
- The Solana Blitz series is not labelled "gaming", but games took most or all top places once themes allowed them (v6 mobile: 2 of 3; v8: 3 of 3), which makes it the most active recurring venue for real-time on-chain games in 2026.

### Gaps
- **Dojo Game Jam VIII winners**: not confirmed. Searched: "Dojo Game Jam 2026 winners Starknet", "Game Jam VIII / Game Jam 8 Dojo winners Cartridge March 2026", "Dojo Game Jam VIII winners announced ohayo_dojo", a title-based query, the repo README, gj8 README, commit log, issues and PR list. The official X account could not be opened.
- **Lattice MUD / Redstone / Autonomous Worlds / AW Assembly 2026**: one search returned only the May 2023 ETHGlobal Autonomous Worlds hackathon; the follow-up search did not run (budget). Not found.
- **Ronin Forge / Ronin hackathons**: the only Ronin result was a Ronin x ETHGlobal hackathon at EthCC Cannes with a $5K pool (year and winners not stated on the page) and the Axie Vibeathon above — [Ronin blog](https://blog.roninchain.com/p/ronin-is-heading-to-ethcc-cannes). Follow-up search did not run.
- **Immutable, Arbitrum / Xai, Oasys, Saga, Sonic SVM, Pirate Nation / Proof of Play, itch.io "onchain game jam", GDC-adjacent events**: one combined search for Immutable / Oasys / Initia returned nothing relevant; the combined search for Ronin Forge / Xai / Saga / Pirate Nation / Sonic SVM / Immutable did not run. Not found.
- **TON / Telegram and Abstract**: one search each; no 2026 game jam with winners found.
- **Megapot-track winners** of the Inco x Megapot jam: the Inco post lists only Inco-track winners. Not confirmed.

---

## 2. For each event: organizer, exact dates, prize pool, submissions, theme, official winners link, ranked winners

### Takeaway
Prize pools at 2026 gaming jams were small (roughly $1,000 to $15,000 per event, $80,000 for EVE Frontier), and fields were 30–120 entries, so a polished, complete entry stands out. Jams that set an explicit constraint set it around the sponsor's primitive ("hidden mechanics", "sealed in a Private ER", "Casual Degen") rather than a narrative theme.

### Cited Findings

#### 2.1 Inco x Megapot Summer Game Jam
- Organizer: Inco, co-hosted with Megapot — [winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Dates: build period July 29 – August 14, 2026; submissions closed August 14 at 6:00pm EDT; winners posted August 25, 2026 — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Prize pool: Inco track $3,000 / $1,500 / $500 USDC; Megapot track $5,000 total ($2,500 USD + $2,500 in Megapot tickets) — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Submissions: not stated on either page.
- Theme / constraint: "build a fun onchain game"; Inco-track games "had to leverage Inco Lightning to unlock new gaming dynamics powered by onchain confidentiality"; the sponsor primitive must be in the core loop, "not just a link to the product"; fresh work only; working public prototype, demo video and public repo required; teams up to 5; deployable on Base mainnet or Base Sepolia — [winners post](https://www.inco.org/blog/summer-game-jam-winners), [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Judging (Inco track): "Hidden mechanics (25%)", "Completeness (25%)", "Creativity (25%)", "Fun (25%)". Megapot track: depth of integration 30%, gameplay and originality 25%, working product and UX 25%, potential to attract and retain users 20% — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Organizer's suggested ideas: poker and games of chance; fog-of-war strategy; guessing games (Wordle / Hangman with encrypted target); confidential NFTs with hidden rarity (lootboxes); confidential NFT ownership and trading — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Workshops included Kamigotchi ("Building a World Onchain"), Semi (P2P real-money games) and Limitless (games on live prediction markets) — [resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Ranked winners, Inco track: **1st Mentalist, 2nd Zunno, 3rd Hextract**; honorable mentions (unranked): AEGYLAX, pi River, Glass Bridge Royale — [winners post](https://www.inco.org/blog/summer-game-jam-winners)

#### 2.2 MLH x Midnight July hack
- Organizer: Major League Hacking x Midnight; post by Jay Albert (Midnight DevRel), August 20, 2026 — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Dates: July 17–19, 2026 (48 hours). Prize pool: not stated. Field: 84 teams, 86 submissions in the Devpost gallery — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack), [Devpost gallery](https://midnight-hackathon-july-2026.devpost.com/project-gallery)
- Tracks: privacy infrastructure; gaming. Seven winners, no placements given.
- Gaming-track winners: **Moonray** (solo, Kaleab A. Gizaw) and **AmongUs Midnight** (Subarna Maity, Soumyadeep Dey, Ayush Kumar, Sourish Panda) — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Privacy-track winners with game-like mechanics: NightPool (sealed-bid dark-pool auction) and MatchLock (mutual-match reveal) — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)

#### 2.3 MagicBlock Solana Blitz series (v0–v9)
- Organizer: MagicBlock; weekend (later week-long) hackathons requiring Ephemeral Rollups, Private Ephemeral Rollups or VRF — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)

| Edition | Dates (2026) | Theme | Entries | Prize pool | Winners |
|---|---|---|---|---|---|
| v0 | winners posted Feb 25 | not stated | 30 | not confirmed | not confirmed |
| v1 | early March | not stated | 30 | not confirmed | not confirmed |
| v2 | Mar 20–22 | privacy apps | 40 | $1,500 (third-party listing) | not confirmed |
| v3 | kicked off Apr 3 | none stated; private payments / DeFi dominated | 40 | $1,000 USDC | 1st privRoll (private bulk payroll), 2nd Expensee (private salary streaming) — not games |
| v4 | a weekend in April | agentic | 32 | not confirmed | not confirmed |
| v5 | a weekend in June | trading (with FlashTrade) | 34 | not confirmed | 1st Ghost Stops (trailing stops on perps) — not a game |
| v6 | Jul 10–12 | mobile (Solana Mobile, Blueshift) | 41 | 1,000 USDC (500 / 250 / 150 / 100) | 1st CapturGO, 2nd Perps Rider, 3rd Hunch; Wizardio's Choice VeilMarket; HM Loofta Pot |
| v7 | one week in August | collaboration / "find your cofounder" | 65 from 25 countries | not confirmed | BlitzMine, Tenor, Oobe Protocol (ranks not stated) |
| v8 | started Sep 4, one week | "Global Startup Village"; open | 36 from 11 countries | not confirmed | Herd, Ultra Pong, Alerith (ranks not stated); Wizardio's Choice HoldOut |
| v9 | results Oct 15 | Crypto World's Fair edition, one week | 55 | not confirmed | 2nd BLACKOUT (self-reported); rest not confirmed |

- v0, v1, v2 rows — [MagicBlock v0 post](https://x.com/magicblock/status/2026678583502962725), [March recap](https://www.magicblock.xyz/blog/march2026-recap), [Venture Launch listing](https://x.com/venture_launch/status/2034217621881786710)
- v3, v4 rows — [April recap](https://www.magicblock.xyz/blog/april2026-recap), [March recap](https://www.magicblock.xyz/blog/march2026-recap); v3 winner names via search snippet of [MagicBlock X](https://x.com/magicblock/status/2042616236304163129)
- v5 row — [June recap](https://www.magicblock.xyz/blog/june2026-recap)
- v6 row — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)
- v7 row — [August recap](https://www.magicblock.xyz/blog/august2026-recap), [July recap](https://www.magicblock.xyz/blog/july2026-recap)
- v8 row — [September recap](https://www.magicblock.xyz/blog/september2026-recap)
- v9 row — [KuCoin repost](https://www.kucoin.com/news/community/SOL/6ad0f449fa4b9e000754aee7) (headline only), [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Source conflict: a search summary placed BlitzMine / Tenor / Oobe "under a combined v7 and v8 heading"; the August recap page read directly attributes them to v7, and the September recap gives a separate v8 list. The table follows the pages read directly.

#### 2.4 EVE Frontier x Sui 2026 Hackathon
- Organizer: CCP Games with the Sui Foundation. Dates: March 11–31, 2026; winners announced April 24, 2026 — [CCP press release](https://pressreleases.triplepointpr.com/2026/04/24/ccp-games-announces-winners-of-80000-eve-frontier-x-sui-2026-hackathon/), [BitPinas](https://bitpinas.com/feature/ccp-hackathon-winners/)
- Prize pool $80,000; 800+ participants; 123 submissions; theme "A Toolkit for Civilization"; submissions could be deployed into the live universe and community voting counted — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)
- Ranked winners: **1st CradleOS** (by modder Reality Anchor; $15,000 cash + $10,000 in SUI + trip to EVE Fanfest 2026), **2nd Blood Contract**, **3rd Civilization Control** — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)
- Category winners: Utility — EasyAssemblies; Technical implementation — Frontier Flow; Creative — Tribe Bazaar; Weirdest idea — Shadow Broker Protocol; Live frontier integration — Frontier Factional Warfare — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)

#### 2.5 YGG Play x Verse8 "Casual Degen" track, BuidlHack 2026
- Organizers: YGG Play and Verse8 (AI game-creation platform), during Korea BUIDL Week in Seoul. Builder Day April 14, final showcase April 18, 2026 — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- Prize pool $5,000 shared (split not stated); 120 teams submitted playable titles. An earlier headline said "over 90 games submitted" — [BitPinas results](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/), [BitPinas earlier article](https://bitpinas.com/feature/yggplay-verse8-hackathon/)
- Theme: "Casual Degen" — fast, accessible, crypto-native games built with Verse8's generative AI tools.
- Ranked winners: **1st Bank or Plank** (solo creator Wabbs), **2nd Dungeon Raising** (developer Daniel), **3rd (tie) Gas Wars, Black Hole Survivor, Attack on Idol** — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)

#### 2.6 VibeBlitz #1 (web3-adjacent; on-chain component not confirmed)
- Organizers: vibecode.game (YGG) with Minds by Animoca Brands; winners announced August 10–11, 2026; 250+ participants, 72 games, two-week build, community vote to 15 finalists, panel picked five winners; launch coverage called it a "$5,000" jam (all via search snippet) — [Animoca Brands](https://www.animocabrands.com/announcement/vibeblitz-jam-ygg-minds-animoca-brands), [eGamers](https://egamers.io/idle-tactics-ascension-takes-top-prize-in-yggs-debut-vibeblitz-game-jam/), [IT Brief](https://itbrief.co.uk/story/vibeblitz-game-jam-crowns-idle-tactics-as-first-winner)
- Winners: **1st Idle Tactics: Ascension** ($1,000 in YGG + $1,000 Minds credits), **2nd Tiny Realm** ($600 + $600), **4th Agent Fighter** ($300 + $300); 3rd and 5th not obtained. Judges: Gabby Dizon (YGG) and Mohamed AbdelKhalek (Animoca Brands) (via search snippet) — [Animoca Brands](https://www.animocabrands.com/announcement/vibeblitz-jam-ygg-minds-animoca-brands)

#### 2.7 Dojo Game Jam VIII (winners not confirmed)
- Organizer: Dojo / Cartridge (Starknet). Coding March 6 00:00 AOE – March 8 23:59 AOE, 2026 (moved back a week to avoid clashing with Starknet Re{define}) — [gj8 README](https://github.com/dojoengine/game-jams/tree/main/gj8), [Dojo X account, via search snippet](https://x.com/ohayo_dojo?lang=en)
- Prize pool $15,000: $10,000 General Track judged by "Dojo Sensei" and $5,000 Embeddable Game Standard (EGS) Track judged by Cartridge staff — [repo README](https://github.com/dojoengine/game-jams)
- Theme: none stated. Constraints: Dojo models and systems, Dojo SDK frontend, Cartridge Controller, deploy to Slot or Sepolia, teams up to 5, 72-hour window, vibe-coding allowed — [gj8 README](https://github.com/dojoengine/game-jams/tree/main/gj8)
- Judging: novel use of Dojo, originality of concept and mechanics, visual and game design, fun — [gj8 README](https://github.com/dojoengine/game-jams/tree/main/gj8)
- Submissions: 31 project files in the directory (listing may be truncated) — [gj8 directory](https://github.com/dojoengine/game-jams/tree/main/gj8)
- Winners: **not confirmed** (see Gaps in Question 1).

#### 2.8 Background only — Dojo Game Jam VII (2025)
- October 31 – November 3, 2025; $15,000; 24 projects ("highest turnout ever"); sponsors Starknet, StarkWare, Cartridge — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)
- Co-champions ($2,500 each): **Kanoodle Fusion** (spatial colour-blending polyomino puzzle, 50 levels) and **Survivor Valhalla** (composable auto-battler that uses Loot Survivor ERC-721s to build a "beast base" and attack other players' bases). Second place ($1,500 each): **Chance Master** (chess where three dice decide which piece may move), **Starkcity** (on-chain Monopoly-style, ERC-1155 properties), **Ghost Grid** (Phasmophobia-inspired ghost hunt on a grid) — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md), [winners announcement on X](https://x.com/ohayo_dojo/status/1995548529927094746)
- A secondary article lists further placings (3rd: Feral Forge, Charon, Witchcraft; 4th: DESTINY, TOMIE GAMES, Butu, Harvest Heist, Need For Bits), but that outlet's gameplay descriptions contradict the organizer's and should not be relied on — [gamingonbase.com](https://gamingonbase.com/2025/12/04/dojo-game-jam-vii-winners-kanoodle-fusion-and-survivor-valhalla-on-chain-gameplay-guide)

### Inferences
- Rubrics are short and evenly weighted. Inco gave "Hidden mechanics" the same 25% as "Fun" and "Completeness"; a Zama confidential-gaming rubric is likely to look similar, so a game where encryption is the loop but which is unfinished or dull forfeits half the score.
- Dojo's submission records track "jam_commits_pct" and classify entries as "Whole Game" versus "Feature" — organizers visibly care whether the work was done during the event. Inco likewise required disclosure of pre-existing work.
- Community voting or live deployment was part of judging at EVE Frontier, VibeBlitz and the Axie Vibeathon; a public playable link that survives judging week is close to mandatory.

### Gaps
- Submission counts for the Inco jam and prize pool for the Midnight hack are not published on the pages read.
- Per-place prize splits for BuidlHack, Solana Blitz v7–v9 and EVE Frontier 2nd/3rd are not stated in the sources read.
- Exact dates for Solana Blitz v1, v4, v5, v7 and v9 are not stated in the sources read.

---

## 3. For each winning game: what it is, loop, genre, session, what runs on-chain, players, hidden information and how it is handled, why it won, links

### Takeaway
Fifteen-plus confirmed winners are profiled below. The strongest ones make a single secret the entire game (which suspect is the killer, which panel is glass, where the opponent stands) and say explicitly why a transparent chain or commit-reveal would break it. Almost none publish judges' quotes; "why it won" is mostly the organizer's one-line description or the builder's own argument.

### Cited Findings

#### 3.1 Inco x Megapot Summer Game Jam (Inco track)

**Mentalist — 1st place**
- What: a murder-mystery prediction market. Seven hand-written cases; each suspect gives one spoken alibi and exactly one alibi is logically impossible. Players listen for free, then stake USDC on the killer — [Mentalist README](https://github.com/adipundir/mentalist)
- Loop: click a person and hear them (no transaction) → work out the impossible account → stake 0.10–5.00 USDC on one suspect, one entry per wallet per case → case closes → correct pickers split the whole pot pro rata (pari-mutuel), paid in Megapot lottery tickets plus USDC — [Mentalist README](https://github.com/adipundir/mentalist)
- Genre: deduction / betting. Session length: not stated; rooms hold 3–8 suspects and each case is single-use per player. Players: solo-playable against a shared pot.
- On-chain: `Mentalist.sol` on Base Sepolia holds stakes, the encrypted answer, per-player encrypted verdict bits and settlement; a keeper endpoint files verdicts and settles — [Mentalist README](https://github.com/adipundir/mentalist)
- Hidden information: (a) the killer's id, encrypted by the case author and stored as `euint256`; (b) each player's pick, encrypted on the player's machine; the contract compares them with `e.eq` inside the enclave and only grants the player access to their own result bit after the case closes. Handling: **TEE (Inco Lightning on Intel TDX) with covalidator attestations** — [Mentalist README](https://github.com/adipundir/mentalist), [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Builder on why not commit-reveal: the operator "would have to hold the answer until settlement, which means they could change it", and "a hash commitment over a person id drawn from a range of 3 to 8 is brute forced instantly" — [Mentalist README](https://github.com/adipundir/mentalist)
- Builder-stated limits: testnet only; cases are fixed content, not generated; the chain cannot verify that the sealed answer is the *correct* one; security "rests on hardware" — [Mentalist README](https://github.com/adipundir/mentalist)
- Why it won: no judges' comments published. Organizer's description stresses that "no one can see who was backed while the case is open" — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Links: [play](https://mentalist-cases.vercel.app), [video](https://youtu.be/a30wfJbb9Nw), [repo](https://github.com/adipundir/mentalist)

**Zunno — 2nd place**
- What: two-player UNO with encrypted hands. Loop: creator opens a table and funds an ETH pot → opponent joins → deck is shuffled confidentially and dealt in batches → players draw or play; the contract verifies each claimed card against the encrypted hand and applies standard rules (Draw Two, Skip, Reverse, Wild, Wild Draw Four) → first to empty their hand takes the escrow — [Zunno README](https://github.com/ayush4345/zunno-inco)
- Genre: card game. Session length: not stated. Players: 2 (multiplayer only).
- On-chain: `ZunnoInco.sol` on Base Sepolia (deck, hands, rule checks, escrow) plus an ERC-2771 forwarder so each move is one off-chain signature instead of a wallet popup; a server does matchmaking and turn orchestration with "no card custody" — [Zunno README](https://github.com/ayush4345/zunno-inco)
- Hidden information: hands and deck order. Handling: **TEE** — encrypted randomness (`e.randEuint8`), per-player decrypt permission (`e.allow`), and a played card is revealed through a covalidator attestation that the contract verifies (`e.verifyDecryption`) — [Zunno README](https://github.com/ayush4345/zunno-inco)
- Megapot tie-in: every table buys a lottery ticket; if it hits, the table splits it equally — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Status caveat from the builder: contracts build and test but "client/server integration is still WIP"; Base Sepolia only (the Inco post says "on Base") — [Zunno README](https://github.com/ayush4345/zunno-inco)
- Why it won: no judges' comments published.
- Links: [play](https://zunno-inco.vercel.app), [video](https://youtu.be/oyEMpmZfCKo), [repo](https://github.com/ayush4345/zunno-inco)

**Hextract — 3rd place**
- What: two-player turn-based extraction game on a 7×7 board; tagline "Find the Core. Fake the signal. Get out." — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Loop: each round both players privately queue two actions from Hold / Move / Scan / Attack / Decoy / Extract, sealed into one ciphertext → the contract resolves movement, scans, decoy signals, attacks, Core pickup and extraction on encrypted state → each player decrypts only their own report. Each player has 2 integrity and 2 decoys. Win by carrying the Core to your home gate — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Genre: fog-of-war tactics with simultaneous sealed orders. Session length: at most eight rounds; two missed planning windows forfeit. Players: 2 on-chain; an offline training mode against AI exists in the client — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- On-chain: `Hextract.sol` on Base Sepolia is the whole game engine; "Solidity never `if`s on secret state" — it uses `select`, encrypted compares and distance math — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Hidden information: spawn cells (`e.randBounded`), positions, integrity, decoys, both action queues, Core location and custody, scan results, and the provisional winner. A rival's exact cell is disclosed only when encrypted Manhattan distance is ≤ 2. Handling: **TEE** with attested decryption; the final outcome is published only after `finalizeGame` verifies a covalidator attestation — [Hextract README](https://github.com/Akhil-2310/HEXTRACT), [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Builder's argument: "A public Solidity board would leak both plans, both positions, and Core custody in storage and events, so the second submitter (or any spectator) could always snipe. Fog in the UI would be cosmetic." — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Why it won: no judges' comments published. The builder mapped the entry to each rubric line (hidden mechanics = "secrecy is the game loop, not decoration"; completeness = full create / join / resolve / timeout / settle flow; creativity = not "a standard card or guessing game"; fun = eight-round cap, bluffing via decoys) — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Links: [play](https://hextract-chi.vercel.app), [video](https://youtube.com/watch?v=_gZAtBtRUc4), [repo](https://github.com/Akhil-2310/HEXTRACT)

**Glass Bridge Royale — honorable mention**
- What: Squid Game's glass bridge. N steps, two panels each, one safe. Players stake and cross one at a time in join order over the same bridge; every step permanently reveals one panel to everyone, so each death helps the next player. Survivors split the pot weighted by how many panels they opened themselves — going first is riskier but pays more — [Glass Bridge README](https://github.com/gks2022004/glass-bridge-royale), [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Genre: push-your-luck elimination / betting. Session length: not stated. Players: multiplayer queue; a free practice bridge exists.
- Hidden information: the whole map is one encrypted 256-bit word drawn inside the enclave (`e.rand`), never granted to anyone. Three disclosure modes from one secret: nobody (unopened panels), everybody (the stepped-on panel, `e.reveal`), one address (a "bribed" future panel, `e.allow`). Handling: **TEE** — [Glass Bridge README](https://github.com/gks2022004/glass-bridge-royale)
- Builder's table of why alternatives fail: plaintext → anyone reads the map; commit-reveal → "all-or-nothing", opening one panel opens the whole bridge and the last revealer can abort; ZK → "cannot give one specific player a live, private read of one specific panel"; trusted server → operator can move panels — [Glass Bridge README](https://github.com/gks2022004/glass-bridge-royale)
- Links: [play](https://glassbridge-seven.vercel.app), [video](https://youtube.com/watch?v=ip52co7gIjo), [repo](https://github.com/gks2022004/glass-bridge-royale)

**AEGYLAX — honorable mention**
- What: co-op planetary defense. A creator funds a prize pool; an incoming strike's trajectory is generated and kept encrypted; players buy noisy hints with Recon Probes and commit one private intercept point; at impact everything is revealed and successful defenders split the pool; if the planet falls a global jackpot funds a future free round — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [AEGYLAX README](https://github.com/mergelynth/aegylax-public)
- Genre: pooled-stake guessing / co-op estimation. Session length: not stated. Players: multiplayer co-op.
- Hidden information: attack geometry, probe answers (decryptable only by the buyer), and each player's Defense Point (encrypted in the browser). Handling: the README says the live deployment runs on **Fhenix CoFHE** behind an `IConfidentialEngine` interface, with **Inco Lightning** as a second adapter chosen by config — so this entry is FHE-backed in its main deployment, unlike the other Inco winners — [AEGYLAX README](https://github.com/mergelynth/aegylax-public)
- Links: [play](https://aegylax.vercel.app), [video post](https://x.com/EricaCuiz/status/2088314557806604488), [repo](https://github.com/mergelynth/aegylax-public)

**pi River — honorable mention**
- What: confidential heads-up Texas Hold'em on Base Sepolia. Google sign-in creates a silent play wallet (no MetaMask); Quick Play against a bot or a friend; progression, cosmetics and Megapot ticket credits. Hole cards are encrypted with Inco Lightning when dealt (TEE) — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners)
- Genre: poker. Players: solo vs bot or 1v1. Session length: not stated.
- Links: [play](https://pi.sithunyein.com), [video](https://youtu.be/G9p8otDQqBo), [repo](https://github.com/thesithunyein/pi-river)

#### 3.2 MLH x Midnight July hack — gaming track

**Moonray (Moonray: Slicer)**
- What: a daily-tournament geometry puzzle. Everyone gets the same seed-derived board (two irregular plates with 8–14 "moonlets"); the player makes up to three straight cuts; a piece left holding exactly one moonlet collects it. Score = 10 per isolated moonlet plus a bonus for a full clear with fewer cuts — [Moonray README](https://github.com/kaleababayneh/moonray)
- Loop: play locally for free (practice needs no wallet) → "Prove run" generates a ZK proof that the hidden cuts are valid for today's seed and score what is claimed → a hidden score commitment is written under an anonymous nullifier → the player may reveal the score later, or never — [Moonray README](https://github.com/kaleababayneh/moonray)
- Genre: daily puzzle / score attack. Players: solo, asynchronous leaderboard. Session length: not stated (one board per day).
- On-chain: a Compact contract with four circuits (`submitRun`, `revealScore`, admin); never on-chain: cuts, pieces, secret key, nonce, unrevealed scores — [Moonray README](https://github.com/kaleababayneh/moonray)
- Hidden information: the solution and the score. Handling: **ZK proof + commitment + nullifier, optional later reveal**.
- Builder's reason: "Everyone plays the same board, so public solutions would be copy-pasted instantly and public scores would be sniped" — [Moonray README](https://github.com/kaleababayneh/moonray)
- Why it won: the organizer's write-up calls it the most complete build in the field — working contract, real tests, finished interface, playable Preprod deployment — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Links: [play](https://moonray-slicer.vercel.app), [repo](https://github.com/kaleababayneh/moonray)

**AmongUs Midnight**
- What: a multiplayer social-deduction game (crew complete tasks, hidden impostors sabotage) with secret roles and voting enforced on Midnight — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- How: an existing open-source Python Among Us clone (LAN multiplayer, up to about 5 players) retrofitted with a ZK fairness layer called "Shadow Protocol" with "zero UI changes" — [Among-Midnight README](https://github.com/SoumyaEXE/Among-Midnight)
- Hidden information: roles are committed per seat, votes are spent via nullifiers, an ejected player's role is revealed on elimination. Handling: **commitments + nullifiers (ZK) on Midnight**; real-time gameplay stays off-chain in the game server — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack), [Among-Midnight README](https://github.com/SoumyaEXE/Among-Midnight)
- Why it won: "a game people genuinely wanted to play", showing that user experience can be the differentiator — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Links: [repo](https://github.com/SoumyaEXE/Among-Midnight)

#### 3.3 MagicBlock Solana Blitz — game winners

**Perps Rider — v6, 2nd (250 USDC)**: perpetuals trading framed as arcade racing. Pick BTC / ETH / SOL, set leverage 10×–3,000×, race live prices until cash-out or liquidation. Pyth Lazer prices shape the track; positions tracked in an Ephemeral Rollup; car upgrades and crates via VRF; a shared social hub ("The Strip"). Hidden information: none stated; randomness by VRF. Link: perpsrider.com — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)

**Hunch — v6, 3rd (150 USDC)**: stake-and-climb game — slice rows of fruit without hitting the bust line; each slice is signed from the phone into an Ephemeral Rollup and row outcomes resolve through VRF. Built by @priyanshudotsol, a repeat Blitz winner. Genre: push-your-luck betting mini-game; solo. Hidden information: future row outcomes, by VRF — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)

**VeilMarket — v6, Wizardio's Choice (100 USDC)** and **Loofta Pot — v6, honorable mention**: a private prediction market for the 2026 World Cup (gasless bets in an ER, stakes hidden in a Private ER, VRF resolution) and a private lottery on Private ERs. Hidden information: stake sizes / participants; handled by **TEE (Private ER on Intel TDX)** — [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)

**BlitzMine — v7 winner (rank not stated)**: "a real-time mining game on an Ephemeral Rollup, with VRF-picked winning tiles." Genre: betting / tile-pick mini-game. Mechanics beyond that line: not confirmed — [MagicBlock August recap](https://www.magicblock.xyz/blog/august2026-recap)

**Herd — v8 winner (rank not stated)**: a party game for Solana Mobile in which "answers stay sealed in a Private Ephemeral Rollup." Hidden information: every player's answer until reveal; handled by **TEE**. Rules not confirmed (the name suggests a majority-matching party game, but that is not stated in the source) — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)

**Ultra Pong — v8 winner**: eight-player survival Pong with physics at 20 ticks per second in an Ephemeral Rollup. Real-time multiplayer; no hidden information stated — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)

**Alerith — v8 winner**: a 3D medieval MMORPG with a sub-50ms duel arena and VRF rare loot — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)

**BLACKOUT — v9, 2nd place (self-reported by the builder)**
- What: a real-time fog-of-war battle royale "sealed in a MagicBlock TEE". 2–8 seats, empty seats filled by on-chain bots (easy / medium / hard), solo or duos. Fixed 5:00 clock, three-stage shrinking zone. Players see only their flashlight cone plus sound pings (footsteps, gunshots, reloads). Last one standing triggers "lights-on", which unlocks the full replay — [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Session length: 5 minutes. Stakes: guests play free with a browser key; wallet users can join 0.01 or 0.05 SOL tables with a 10% house fee.
- On-chain: the game runs at 20 ticks per second inside a Private Ephemeral Rollup with a 50 ms crank and "no game server"; one VRF seed per night for spawns, loot and zone centres; room accounts, bank, tickets and leaderboard on Solana L1; a `settle` action pays the pot. Program deployed on Solana mainnet — [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Hidden information: world state has zero readers; each player's view is readable only by that seat's session key; spectators and RPC callers cannot read positions until lights-on. Handling: **TEE**. The builder states the limit: "the program can't prove privacy by itself." The site has a "Try to cheat" button that shows a denied read of a live room — [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Links: playblackout.fun, [repo](https://github.com/Anshv784/blackout), [Blitz announcement](https://x.com/magicblock/status/2110732865923383620)

#### 3.4 EVE Frontier x Sui 2026 (tools and systems inside a live game world, not standalone games)

- **CradleOS — 1st**: a management system letting player groups govern territory, coordinate resources, manage defenses and run logistics on shared on-chain infrastructure — [BitPinas](https://bitpinas.com/feature/ccp-hackathon-winners/). Link: [project page](https://r4wf0d0g23.github.io/Reality_Anchor_Eve_Frontier_Hackathon_2026/)
- **Blood Contract — 2nd**: a bounty system where players place rewards on targets, with automatic payouts that "turn PvP into a structured and repeatable activity" — [CCP press release](https://pressreleases.triplepointpr.com/2026/04/24/ccp-games-announces-winners-of-80000-eve-frontier-x-sui-2026-hackathon/). Link: bloodcontract.space
- **Civilization Control — 3rd**: control system for gates, trade routes and defenses — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)
- **Shadow Broker Protocol — "Weirdest idea"**: turns spycraft and intel into a tradeable resource; players buy, sell and weaponize information about other players' activities. Hidden-information handling: not stated in the sources read. Link: sb-protocol.com — [BitPinas](https://bitpinas.com/feature/ccp-hackathon-winners/), [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)
- A trade-press analysis of the field was headlined "Kill bounties, insurance and prediction markets" (article not read; headline only) — [BlockchainGamer.biz](https://www.blockchaingamer.biz/?p=42065)

#### 3.5 YGG Play x Verse8 "Casual Degen" (BuidlHack 2026)

- **Bank or Plank — 1st**: a 3D multiplayer pirate-themed digital board game; players gather and bank gold before a 5-minute limit, and adverse events can wipe unbanked loot. Genre: push-your-luck. Session: 5 minutes. On-chain parts: not stated — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- **Dungeon Raising — 2nd**: idle action game; no further detail — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- **Gas Wars, Black Hole Survivor, Attack on Idol — 3rd (tie)**: "lightweight games with embedded on-chain features"; no further detail — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- Why they won: top prizes went to projects that combined "simple, repeatable gameplay loops with on-chain mechanics" — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)

#### 3.6 VibeBlitz #1
- **Idle Tactics: Ascension — 1st**: browser-based pixel-art idle auto-battler. **Tiny Realm — 2nd**: RTS. **Agent Fighter — 4th**. On-chain component: none confirmed (via search snippet) — [Animoca Brands](https://www.animocabrands.com/announcement/vibeblitz-jam-ygg-minds-animoca-brands)

#### 3.7 Gaming winners at general 2026 hackathons
- **khel.fun Poker** (Solana Privacy Hack, Inco prize, Gaming): on-chain poker; shuffling uses encrypted randomness (`e_rand`) and dealing uses Inco encrypted compute. Link: poker-solana-one.vercel.app — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners)
- **The Casino & Church** (same, Gaming): a narrative game about speculation and belief; the Casino side uses encrypted PRNGs, compares confidential player positions against encrypted random numbers, results are decryptable only by the player, and LPs provide liquidity confidentially. Link: playcnc.fun — [Inco blog](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners)
- **Mental Poker SDK for Starknet** (Re{define}, Privacy Track 1st, via search snippet): "a reusable protocol for multiplayer card games with provable privacy" using Noir ZK proofs verified on-chain through Garaga. A related builder post describes trustless poker with a single shared encrypted deck where "every shuffle, deal, and reveal is backed by a ZK proof generated in the browser and verified on-chain"; whether that post is the same project is not confirmed — [DoraHacks winners page](https://dorahacks.io/hackathon/redefine/winner), [builder post on X](https://x.com/dpinoness/status/2029634669801542130)

#### 3.8 Dojo Game Jam VIII — entrants (NOT winners; listed because they show how FOCG builders handle hidden state)
All from the submission files in the [gj8 directory](https://github.com/dojoengine/game-jams/tree/main/gj8); each file is at `github.com/dojoengine/game-jams/blob/main/gj8/<id>.md`.

| Entrant | What it is | Hidden information and handling |
|---|---|---|
| [Dark Waters](https://github.com/dojoengine/game-jams/blob/main/gj8/dark-waters.md) | Battleship-style naval duel, solo dev, bot opponent, optional stakes | Fleets hidden behind Merkle commitments; shots by commit-reveal with Merkle proofs; timeout resolution |
| [Cipher](https://github.com/dojoengine/game-jams/blob/main/gj8/cipher.md) | Stratego-style hidden-rank war game, 10 pieces each, built entirely in the jam | Ranks as `poseidon_hash(rank, salt)`; two-phase combat — attacker's move writes a pending record and the defender must reveal the preimage |
| [Pokerstarks](https://github.com/dojoengine/game-jams/blob/main/gj8/pokerstarks.md) | 2–6 player Texas Hold'em, LLM bot for solo play | ElGamal-encrypted cards on the Grumpkin curve; each player makes a ZK shuffle proof (about 11 seconds) with Noir, verified via Garaga; optional hidden chip balances via Tongo confidential ERC20 |
| [Knock Order](https://github.com/dojoengine/game-jams/blob/main/gj8/knock-order.md) | 1v1 simultaneous-turn card fighter; both players secretly sequence 5 of 18 cards, resolved slot by slot by priority; best of 3 or 5; solo vs AI mode | "Moves are locked into the Dojo world" before either sees the other's; the file says "no hidden server state" and does not say the commitment is hashed |
| [GuessNFT](https://github.com/dojoengine/game-jams/blob/main/gj8/guess-nft.md) | "Guess Who?" over 999 NFTs | Player commits to a hidden character; every yes/no answer carries a Noir ZK proof verified on-chain |
| [Tweetle](https://github.com/dojoengine/game-jams/blob/main/gj8/tweetle.md) | Wordle clone with tournament mode | Each guess result proven by a Noir circuit; hidden word never revealed to server or client |
| [Contagion](https://github.com/dojoengine/game-jams/blob/main/gj8/contagion.md) | Social-deduction .io game with a hidden Patient Zero | Poseidon commitment to the role revealed at game end; ZK health proofs; real-time logic on a WebSocket server (classified "Offchain" gameplay) |
| [Hexed](https://github.com/dojoengine/game-jams/blob/main/gj8/hexd.md) | Asynchronous battle royale with fog of war on a 21×21 hex grid | "All game logic and randomness living entirely on-chain"; no cryptographic hiding described |
| [Athanor](https://github.com/dojoengine/game-jams/blob/main/gj8/athanor.md) | Competitive potion-brewing race: discover 30 secret recipes among 300 pairs | Hiding method not described in the summary |
| [House of Cards](https://github.com/dojoengine/game-jams/blob/main/gj8/house-of-cards.md) | Pixel casino town: coin toss and price prediction, then AI agents that bet for you | Cartridge VRF for randomness |
| [Knight Race](https://github.com/dojoengine/game-jams/blob/main/gj8/knight-race.md) | Wager on one of four knights, pro-rata payouts | Winner computed on-chain with "no off-chain randomness" |

Other GJ8 entrants by genre (one line each, same directory): Bloc Duel (two-player drafting card game from a shared pyramid), Tactical Beasts (1v1 hex tactics with Loot Survivor NFTs), Catacombs (cat roguelike with skill checks), Prophecy Roguelite (swipe-card prediction-market roguelite), Stark Tycoon (15-minute grid tycoon), Harvest Market (incremental farming), Rekkaimon Forge (creature collection and timed expeditions), Planets (colony builder), Token Defense (tower defense), Starkbound (artillery, Gunbound-like), 0xCIV (prompt-driven AI civilization strategy), Blokaz (Block Blast puzzle), Linot (Whot card game), Crypto Card War Game (card battler whose damage scales with live oracle prices), ParQuiz (Parchís + trivia with VRF dice), Checkers, Crossword Clash, Flag Trivia, Bounce Tale (platformer), Neon Sentinel (arcade shooter).

### Inferences
- The top three at the Inco jam are three different shapes of secret: **one hidden answer everyone bets against** (Mentalist), **per-player hidden hands** (Zunno), and **fully hidden simultaneous board state** (Hextract). First place went to the one with the smallest cryptographic surface and the strongest fiction — a single encrypted integer and one encrypted equality check — which suggests narrative and clarity beat technical ambition when "Fun" and "Creativity" are half the score.
- Mentalist and Moonray are both effectively **solo-playable against a shared pool or leaderboard**. That removes the matchmaking problem that makes two-player jam games hard for judges to try. Hextract, pi River, Dark Waters, Pokerstarks and Knock Order each added a bot or training mode for the same reason.
- Several winners attach a **money layer to a hidden-information core** (pari-mutuel pot in Mentalist, weighted survivor pot in Glass Bridge, staked tables in BLACKOUT, lottery tickets in Zunno). Stakes make secrecy matter to the player, which is what a "hidden mechanics" rubric line rewards.
- Builders who won or placed wrote an explicit "why this cannot be built on a transparent chain / with commit-reveal / with ZK" section. It reads as written for the judges and is a cheap pattern to reuse.

### Gaps
- No official judges' quotes were published for the Inco jam, Solana Blitz, EVE Frontier or Dojo; "why it won" is organizer description or builder argument except where marked.
- Session lengths are stated only for Hextract (≤ 8 rounds), BLACKOUT (5:00), Bank or Plank (5 minutes) and the entrant Stark Tycoon (15 minutes).
- pi River's repo and the Megapot-track winners were not read; Herd, BlitzMine, Ultra Pong, Alerith, HoldOut and all BuidlHack winners are described only by a single organizer line — the search for more detail did not run.
- Solana Blitz v9 first and third place, and whether BLACKOUT's "2nd" refers to the main Blitz ranking or a Superteam India sub-track, are not confirmed (the repo lists both).

---

## 4. Which winning games are weakened by on-chain transparency (best candidates for an encrypted-state redesign)?

### Takeaway
The clearest FHE-redesign candidates are the games that currently lean on a **hardware enclave** for secrecy (every Inco and MagicBlock Private ER winner) or on **commit-reveal / per-move ZK proofs** with their reveal steps, timeouts and proving delays (the Starknet entries and both Midnight games). In each case the builders themselves documented the weakness or the workaround.

### Cited Findings

**A. Secrecy rests on a TEE trust assumption (builder-acknowledged)**
- Mentalist: "The security claim rests on hardware. If the TDX enclave or the covalidator set is compromised, the answer is readable." It also cannot prove the sealed answer is correct, and there is no post-settlement reveal — [Mentalist README](https://github.com/adipundir/mentalist)
- Hextract: "This is TEE-backed confidential computation with covalidator attestations" — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Glass Bridge Royale: map "drawn inside an Intel TDX enclave" — [Glass Bridge README](https://github.com/gks2022004/glass-bridge-royale)
- Zunno: hands are held by "Inco's TEE-based confidential compute layer"; reveal needs covalidator signatures — [Zunno README](https://github.com/ayush4345/zunno-inco)
- BLACKOUT: "the program can't prove privacy by itself"; the TEE is the trust anchor — [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Herd, VeilMarket, Loofta Pot: sealed answers / stakes in Private Ephemeral Rollups, which use Intel TDX-backed confidential computing — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap), [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend)

**B. Designers explicitly worked around public state**
- Hextract: on a public board "the second submitter (or any spectator) could always snipe" — the game exists only because both orders are sealed before resolution — [Hextract README](https://github.com/Akhil-2310/HEXTRACT)
- Mentalist: without encrypted picks a spectator could "watch the informed money and copy it"; a hash commitment over 3–8 options is "brute forced instantly" — [Mentalist README](https://github.com/adipundir/mentalist)
- Moonray: same board for everyone, so "public solutions would be copy-pasted instantly and public scores would be sniped"; the workaround is local play + a 68 MB-prover-key ZK circuit + sealed score commitment + separate reveal window — [Moonray README](https://github.com/kaleababayneh/moonray)
- Glass Bridge Royale: commit-reveal is "all-or-nothing" and "the last revealer sees everyone else's outcome and can abort" — [Glass Bridge README](https://github.com/gks2022004/glass-bridge-royale)
- AmongUs Midnight: only roles and votes are on-chain (commitments and nullifiers); the game itself runs on an ordinary server — the chain replaces "an honor system" for role assignment and voting, nothing more — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack), [Among-Midnight README](https://github.com/SoumyaEXE/Among-Midnight)
- MatchLock (Midnight privacy track): "Because Compact lacks in-circuit encryption, the payload is encrypted client-side and stored on-chain as an opaque blob" — the contract cannot compute on the secret — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)

**C. Commit-reveal and per-move ZK in the Dojo GJ8 field (entrants, not confirmed winners)**
- Cipher: every combat needs a second transaction from the defender to reveal a rank preimage, so the turn is suspended until the opponent cooperates — [Cipher submission](https://github.com/dojoengine/game-jams/blob/main/gj8/cipher.md)
- Dark Waters: every shot is a commit, a reveal and a Merkle proof, with dedicated timeout-resolution logic — [Dark Waters submission](https://github.com/dojoengine/game-jams/blob/main/gj8/dark-waters.md)
- Pokerstarks: each player generates a ZK shuffle proof taking about 11 seconds before dealing — [Pokerstarks submission](https://github.com/dojoengine/game-jams/blob/main/gj8/pokerstarks.md)
- Contagion: proximity and infection logic run on a WebSocket server, i.e. a trusted server holds the real hidden state — [Contagion submission](https://github.com/dojoengine/game-jams/blob/main/gj8/contagion.md)

**D. Background (2025) — Dojo GJ7 winners with public-state exposure**
- Survivor Valhalla (co-champion): players "build a lineup to attack other players' bases" — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)
- Chance Master and Starkcity (second place): dice-driven chess and Monopoly where "every dice roll ... is verifiably fair" — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)
- Ghost Grid (second place): hunt for evidence on a grid "with all runs, evidence, and scores recorded onchain" — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)

### Inferences
Ranked shortlist of encrypted-state redesign candidates (this ranking is my inference from the findings above, not a claim made by any source):

1. **Simultaneous sealed-order tactics (Hextract pattern; also Knock Order, Cipher).** The most "FHE-native" loop: both players submit encrypted orders, the contract resolves on ciphertext with select / compare, each player decrypts only their own report. Hextract already avoids branching on secrets, which is the same programming discipline FHEVM requires. Redesign value: replace the enclave with FHE, and remove Cipher's "defender must come back and reveal" step entirely — the contract can compare encrypted ranks itself.
2. **One encrypted answer, many encrypted bets (Mentalist pattern; also AEGYLAX, Moonray's sealed scores, VeilMarket).** Tiny cryptographic surface: one encrypted equality or distance check per player, pari-mutuel settlement. Works solo against a pool, which suits judging. Mentalist's own open problems — fixed content and an unverifiable author — are design openings: an answer generated by on-chain encrypted randomness has no author to trust.
3. **Shared hidden map with progressive public reveal (Glass Bridge Royale pattern; also Hunch, BlitzMine, minesweeper-like "mining" games).** A single encrypted word of random bits, revealed one bit at a time, plus the "private peek for one address" twist. Cheap in FHE terms (one random draw, bit extraction, selective decryption).
4. **Hidden-hand card games (Zunno, pi River, khel.fun Poker, Pokerstarks, Mental Poker SDK).** Proven demand — five separate 2026 winners or placers are card games with hidden hands — but also the most crowded lane, and shuffling a full deck under encryption is the expensive part. Pokerstarks' 11-second shuffle proof per player and Zunno's unfinished client show the cost.
5. **Asynchronous base-raid auto-battlers (Survivor Valhalla, 2025 background).** If defensive lineups are public, an attacker can read the base and pick a perfect counter before attacking. Whether Survivor Valhalla actually stores lineups in the clear was not verified; flagged as a hypothesis worth checking, because an encrypted-lineup auto-battler would combine a genre that wins jams (see Question 5) with a clear confidentiality story.
6. **Real-time fog-of-war (BLACKOUT).** The best showcase of why hidden state matters, but 20 ticks per second is out of reach for FHE today; only a turn-based or asynchronous reduction of it (which is Hextract) is realistic.

Lower-confidence flags (entrants whose summaries describe hidden or random elements as "fully on-chain" with no hiding mechanism mentioned — likely readable from chain state, but not verified in code):
- Hexed's fog of war, Athanor's 30 secret recipes, Starkbound's "Poseidon-seeded wind", Knight Race's on-chain winner calculation with "no off-chain randomness", and Knock Order's move commitment — [gj8 directory](https://github.com/dojoengine/game-jams/tree/main/gj8)

Additional inferences:
- No source in this research described a mempool-reading bot actually exploiting a jam game. The transparency problem is discussed by builders as a design constraint, not as an observed attack.
- Only one placed entry (AEGYLAX, honorable mention) is documented as running on FHE (Fhenix CoFHE). FHE-backed game winners are close to absent from the 2026 record found here, so an FHEVM game that is complete and fun would be differentiated on trust model alone.

### Gaps
- Whether Survivor Valhalla, Hexed, Athanor, Knight Race, Starkbound and Knock Order really expose their hidden or random state on-chain was not checked in their contracts; those items are inferences from one-paragraph summaries.
- Shadow Broker Protocol (EVE Frontier) sells intel on a public chain; how it keeps unsold intel private is not stated in the sources read.
- No data was found on gas / latency cost of the TEE-based games versus ZK-based ones.

---

## 5. What genres and loops keep winning on-chain game jams in 2026, and what do judges praise?

### Takeaway
Short-session games built around one legible secret or one push-your-luck decision dominate: card games with hidden hands, deduction and social-deduction games, stake-and-reveal betting mini-games, and fog-of-war tactics. Published rubrics and organizer commentary consistently reward completeness and "a game people genuinely wanted to play" over technical depth; novelty of the hidden mechanic is weighted equally with fun, not above it.

### Cited Findings

**Genre tally across confirmed 2026 winners and placers in these notes**
- Hidden-hand card games: Zunno (2nd), pi River (HM), khel.fun Poker, Mental Poker SDK (Privacy 1st, via snippet) — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [Inco Solana Privacy Hack post](https://www.inco.org/blog/solana-privacy-hack-inco-prize-winners), [DoraHacks](https://dorahacks.io/hackathon/redefine/winner)
- Deduction / social deduction / party: Mentalist (1st), AmongUs Midnight, Herd — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack), [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)
- Betting / push-your-luck mini-games: Glass Bridge Royale (HM), AEGYLAX (HM), Hunch (3rd), BlitzMine, Perps Rider (2nd), Bank or Plank (1st), The Casino & Church — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend), [MagicBlock August recap](https://www.magicblock.xyz/blog/august2026-recap), [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- Fog-of-war strategy / tactics: Hextract (3rd), BLACKOUT (v9 2nd, self-reported) — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [BLACKOUT repo](https://github.com/Anshv784/blackout)
- Idle / auto-battler: Idle Tactics: Ascension (VibeBlitz 1st), Dungeon Raising (BuidlHack 2nd, "idle action") — [Animoca Brands](https://www.animocabrands.com/announcement/vibeblitz-jam-ygg-minds-animoca-brands), [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- Daily puzzle / score attack: Moonray — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- Real-time arcade / MMO: Ultra Pong, Alerith — [MagicBlock September recap](https://www.magicblock.xyz/blog/september2026-recap)
- Systems for a persistent world (governance, bounties, intel markets): CradleOS, Blood Contract, Civilization Control, Shadow Broker Protocol — [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)

**Supporting signals from finalists and entrant fields**
- Axie Vibeathon top-8 finalists (winners not confirmed): auto battler, tower defense / strategy, RPG, creature collector, two tactical RPGs, farming + combat, roguelite — [eGamers](https://egamers.io/axie-vibeathon-names-eight-finalists-heading-into-round-2-game-development-phase/)
- Dojo GJ8's 31 entrants cluster in card games (Knock Order, Bloc Duel, Linot, Crypto Card War Game, Pokerstarks), hidden-information duels (Dark Waters, Cipher, GuessNFT, Tweetle), roguelikes (Catacombs, Prophecy Roguelite), idle / incremental / tycoon (Harvest Market, Stark Tycoon, Planets, Rekkaimon Forge) and wagering (House of Cards, Knight Race) — [gj8 directory](https://github.com/dojoengine/game-jams/tree/main/gj8)
- Dojo GJ7 (2025, background) winners: puzzle (Kanoodle Fusion), auto-battler (Survivor Valhalla), dice-chess (Chance Master), Monopoly-like (Starkcity), deduction grid (Ghost Grid) — [gj7 README](https://github.com/dojoengine/game-jams/blob/main/gj7/README.md)

**What rubrics and organizers reward**
- Inco track: hidden mechanics, completeness, creativity, fun — 25% each — [Inco resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Megapot track: depth of integration 30%, gameplay and originality 25%, working product and UX 25%, potential to attract and retain users 20% — [Inco resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Dojo GJ8: novel use of Dojo, originality of concept and mechanics, visual and game design, fun — [gj8 README](https://github.com/dojoengine/game-jams/tree/main/gj8)
- Axie Vibeathon Round 1: Axie Core integration 35%, gameplay quality 25%, product vision 20%, feasibility 10%, prototype and documentation quality 10% — [eGamers](https://egamers.io/axie-vibeathon-names-eight-finalists-heading-into-round-2-game-development-phase/)
- Midnight: Moonray praised as the most complete build (working contract, real tests, finished interface, playable deployment); AmongUs Midnight as a game people wanted to play, with UX as the differentiator; MatchLock as "the cleverest small idea in the field" — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack)
- BuidlHack: "simple, repeatable gameplay loops with on-chain mechanics"; Verse8's CEO: "a step change in velocity" — [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/)
- Sponsor primitive must be in the core loop, "not just a link to the product" — [Inco resources post](https://www.inco.org/blog/summer-game-jam-resources-and-what-to-build)
- Solo builders win often: Moonray, Bank or Plank, Dungeon Raising, Hunch and CradleOS are credited to one person — [Midnight blog](https://midnight.network/blog/celebrating-seven-winners-from-mlh-x-midnight-july-hack), [BitPinas](https://bitpinas.com/feature/ygg-play-verse8-buidlhack-results/), [Solana Compass](https://solanacompass.com/news/magicblock-solana-blitz-v6-41-mobile-apps-three-winners-one-weekend), [BlockchainGamer.biz](https://www.blockchaingamer.biz/news/42111/eve-frontier-x-sui-2026-hackathon-winners-revealed/)
- Friction removal recurs among winners: Google sign-in with a silent wallet (pi River), ERC-2771 relayed moves instead of a popup per move (Zunno), free practice mode with no wallet (Moonray, Glass Bridge, Hextract), guest play with a browser key (BLACKOUT) — [Inco winners post](https://www.inco.org/blog/summer-game-jam-winners), [Zunno README](https://github.com/ayush4345/zunno-inco), [Moonray README](https://github.com/kaleababayneh/moonray), [BLACKOUT repo](https://github.com/Anshv784/blackout)

### Inferences
- **What wins in 2026 is "small secret, short session, money or leaderboard attached."** Roguelikes, idle games and auto-battlers are numerous in entrant fields (Dojo GJ8, Axie Vibeathon, VibeBlitz) and win the non-confidential jams, but none of the confidential-compute jam winners is a roguelike or auto-battler. That is an open lane: an auto-battler or roguelike whose depth comes from encrypted lineups, encrypted loot rolls or hidden enemy intent has genre appeal that jams reward and no direct precedent among 2026 hidden-state winners found here.
- **Completeness is the most repeatable edge.** It is an explicit 25% at Inco, the stated reason for Moonray, and half-finished entries still placed (Zunno's client was "still WIP" at 2nd place), which implies fields are thin on finished games. A fully playable loop with a bot or practice mode, tests and a live deployment likely outranks a more ambitious but partial build.
- **Judges need to be able to play alone in two minutes.** Solo-playable-against-a-pool designs (Mentalist, Moonray, Hunch, Glass Bridge practice bridge) and bot opponents appear in nearly every winner. Two-player-only games without a bot are a judging risk.
- **Poker and UNO are saturated as demos.** At least five 2026 winners or placers are hidden-hand card games across four different privacy stacks; another one would need a twist beyond "the hand is encrypted".
- **Composability is praised mainly inside established ecosystems** (Loot Survivor NFTs in Survivor Valhalla and Tactical Beasts, the Embeddable Game Standard track at Dojo, Megapot tickets at the Inco jam, Axie Core integration at 35%). For a standalone bounty it matters less than using the sponsor's primitive as the core loop.
- "Replayability" and "depth" are not named in any rubric found. The closest are "fun", "gameplay quality" and "potential to attract and retain users". Mentalist's builder lists its lack of replayability (fixed cases) as a known limit, and it still won — at jam scale, a memorable first play seems to count for more than long-term depth.

### Gaps
- No rubric or judge commentary was found for Solana Blitz or EVE Frontier beyond one-line project descriptions.
- The genre tally is a count over the winners found in this research, not over all 2026 on-chain game jams; Dojo GJ8's actual winners and the chains listed as "not found" in Question 1 could shift it.
- Newsletter coverage (WASD, Naavik) of 2026 on-chain game jams was not retrieved; the search budget ran out before those queries.

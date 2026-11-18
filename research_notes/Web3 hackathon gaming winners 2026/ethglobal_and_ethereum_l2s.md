# ETHGlobal and Ethereum L2 hackathons of 2026: winners, with depth on gaming / game-like projects

Research date: 2026-11-16. Method notes that apply to the whole file:

- ETHGlobal data was read directly from ethglobal.com (events list, event pages, prize pages, and the project showcase). The showcase was paginated per event in a browser and every project card was parsed. On the showcase, a project card carries one prize icon per awarding organisation; the icon belonging to the ETHGlobal organisation marks "Finalist". This was validated two ways: (a) for ETHGlobal Cannes 2026 the ten ETHGlobal-badged projects are exactly the ten finalists named by crypto.news; (b) every ETHGlobal-badged project page that was opened shows the line "Winner of: ETHGlobal - (trophy) <Event> Finalist". Finalists whose individual page was NOT opened are marked "(badge only)".
- Project counts per event are counts of unique project cards on the showcase on 2026-11-16, not official ETHGlobal statistics.
- The shared WebSearch budget for this research run was exhausted part-way through. All ETHGlobal findings come from direct page reads, so they are unaffected. The L2 / community-hackathon section is much thinner than intended: only pages whose URL was already known could be read, and several winners lists could not be located. Those are marked "not confirmed" with what was tried.
- ETHGlobal does not publish judges' comments on project pages. No judge rationale was found for any individual gaming project. Where "why it won" is discussed, it is inference from the prize track, and labelled as such.

## 1. Which ETHGlobal events ran in 2026, who were the finalists, and which finalists / sponsor-prize winners are games or game-like?

### Takeaway
ETHGlobal ran eight hackathons in 2026 (three online, five in person). Finalists are published for seven of them (63 finalist projects in total); ETHGlobal Mumbai (Nov 5-7) has sponsor prizes on the showcase but no finalist badges yet. Only four of the 63 finalists are true games (Clan World, Void Tactics, ETH Arcade, Défi), and none of them hides game state with cryptography; the wider "game-like" group is dominated by fast prediction / betting products.

### Cited Findings

#### 1a. Event list (calendar year 2026)

| Event | Dates | Format | Prize pool on event page | Projects on showcase | Finalists found |
|---|---|---|---|---|---|
| HackMoney 2026 | Jan 30 - Feb 11 | Online (async) | $75,000 | ~620 | 10 |
| ETHGlobal Cannes 2026 | Apr 3 - 5 | In person, Cannes | $150,000 | ~265 | 10 |
| Open Agents | Apr 24 - May 6 | Online (async) | $50,000 | ~468 | 7 |
| ETHGlobal New York 2026 | Jun 12 - 14 | In person, NYC | $175,000 | ~232 | 10 |
| ETHGlobal Lisbon 2026 | Jul 24 - 26 | In person, Lisbon | $100,000 | ~173 | 10 |
| ETHOnline 2026 | Sep 4 - 16 | Online (async) | $100,000 | ~812 | 8 |
| ETHGlobal Tokyo 2026 | Sep 25 - 27 | In person, Tokyo | $75,000 | ~254 | 8 |
| ETHGlobal Mumbai | Nov 5 - 7 | In person, Mumbai | ~$143,750 (sum of sponsor headline prizes) | ~622 | none badged yet |

- The full 2026 event list, with dates and locations, is on the ETHGlobal events page — [ETHGlobal events](https://ethglobal.com/events)
- HackMoney 2026: Jan 30 - Feb 11, async, $75,000 in prizes; prize sponsors Yellow ($15k), Uniswap Foundation ($10k), Sui ($10k), Arc ($10k), LI.FI ($6k), ENS ($5k) — [HackMoney 2026 event page](https://ethglobal.com/events/hackmoney2026)
- ETHGlobal Cannes 2026: Apr 3-5 at the Palais des Festivals, $150,000 in prizes; sponsors World ($20k), 0G, Arc, Hedera ($15k each), ENS, Uniswap Foundation, Flare, Ledger ($10k each), Chainlink ($7k), WalletConnect, Unlink, Dynamic ($5k each) — [Cannes 2026 event page](https://ethglobal.com/events/cannes2026); track detail — [Cannes 2026 prizes](https://ethglobal.com/events/cannes2026/prizes)
- Open Agents: Apr 24 - May 6, async, $50,000; sponsors 0G ($15k), Uniswap Foundation, Gensyn, ENS, KeeperHub ($5k each) — [Open Agents event page](https://ethglobal.com/events/openagents)
- ETHGlobal New York 2026: Jun 12-14, $175,000; partners Google Cloud, ENS, 1inch, Uniswap Foundation, Sui, World, Arc, Chainlink Labs, Ledger, Hedera, Privy, LI.FI, Canton Foundation, Dynamic, Unlink, Blink — [New York 2026 event page](https://ethglobal.com/events/newyork2026)
- ETHGlobal Lisbon 2026: Jul 24-26 at Pavilhão Carlos Lopes, $100,000; sponsors The Graph, World, Hedera, 0G ($15k each), Uniswap Foundation ($10k), 1inch ($7k), Sui ($6k), ENS ($5k). From 2026, projects may start from an existing repo (three tracks: From Scratch, Extend Open Source, Ship a Feature) — [Lisbon 2026 event page](https://ethglobal.com/events/lisbon2026)
- ETHOnline 2026: Sep 4-16, async, $100,000; sponsors The Graph and Hedera ($15k each), Arc ($10k), World and 1inch ($7k each), ENS, Uniswap Foundation, Ledger, Privy ($5k each), Chainlink and Bazantic ($3k each) — [ETHOnline 2026 event page](https://ethglobal.com/events/ethonline2026)
- ETHGlobal Tokyo 2026: Sep 25-27 at Toranomon Hills Forum, $75,000; World ($15k), ENS and Uniswap Foundation ($10k each), 1inch ($7k), Sui ($5k), Curvegrid ($3k), Intercepta ($2.5k). Top 10 teams get a Finalist Pack including a Devcon Mumbai pass — [Tokyo 2026 event page](https://ethglobal.com/events/tokyo2026); [Tokyo 2026 prizes](https://ethglobal.com/events/tokyo2026/prizes)
- ETHGlobal Mumbai: Nov 5-7, 2026. Sponsor headline prizes: Arkiv, 0G, Uniswap Foundation, Arc, Whitechain, Ethereum Foundation ($15k each), Hedera ($14.25k), World ($12.5k), ENS ($10k), 1inch ($7k), Definitive and Chainlink ($5k each). Finalists are paid per person by team size — [Mumbai prizes](https://ethglobal.com/events/mumbai/prizes)
- None of the eight events lists Zama, Fhenix or Inco as a prize sponsor (see sponsor lists in the event pages cited above). Fhenix only appears as co-host of two "Cocktails & Confidentiality" meetups (Hong Kong, Feb 11; Miami, May 4) — [ETHGlobal events](https://ethglobal.com/events)
- A Cannes World track rule worth knowing: World's MiniKit prize required Mini Apps to be "not gambling or chance based" — [Cannes 2026 prizes](https://ethglobal.com/events/cannes2026/prizes)

#### 1b. Finalists per event (game or game-like ones in bold)

HackMoney 2026 (10) — [showcase, HackMoney 2026](https://ethglobal.com/showcase?events=hackmoney2026)
- AutoPay (crypto subscriptions) — [page](https://ethglobal.com/showcase/autopay-n8ot7) (badge only)
- **Blip Market** (tap-to-trade micro price-range bets) — [page](https://ethglobal.com/showcase/blip-market-8edo8)
- **PulsePlay** (5-15 second sports micro-betting) — [page](https://ethglobal.com/showcase/pulseplay-j9e7x)
- claw2claw (P2P trading for bots) — [page](https://ethglobal.com/showcase/claw2claw-3uxgx) (badge only)
- GrimSwap (privacy DEX, ZK-SNARK + stealth addresses) — [page](https://ethglobal.com/showcase/grimswap-ntdmp) (badge only)
- BorrowBot — [page](https://ethglobal.com/showcase/borrowbot-o41nr) (badge only)
- Xpack — [page](https://ethglobal.com/showcase/xpack-myrx1) (badge only)
- Oikonomos — [page](https://ethglobal.com/showcase/oikonomos-w6z57) (badge only)
- router402 — [page](https://ethglobal.com/showcase/router402-b717q) (badge only)
- Magnee — [page](https://ethglobal.com/showcase/magnee-dude7) (badge only)

ETHGlobal Cannes 2026 (10) — [showcase, Cannes 2026](https://ethglobal.com/showcase?events=cannes2026); list independently reported by [crypto.news](https://crypto.news/ai-agents-privacy-and-prediction-markets-define-ethglobal-cannes-2026-finalists/)
- EVM PORST — [page](https://ethglobal.com/showcase/evm-porst-kkcfo); maki — [page](https://ethglobal.com/showcase/maki-564eg); ALMA — [page](https://ethglobal.com/showcase/alma-07pzd); npmguard — [page](https://ethglobal.com/showcase/npmguard-aeihd); Corpus — [page](https://ethglobal.com/showcase/corpus-j7an5); VEIL VPN — [page](https://ethglobal.com/showcase/veil-vpn-c643n); ENShell — [page](https://ethglobal.com/showcase/enshell-6t95y) (all badge only)
- DIVE (AI swarm oracle for prediction-market settlement; infrastructure, not a game) — [page](https://ethglobal.com/showcase/dive-5hxbp) (badge only)
- **Défi** (gamified 1v1 live trading duel) — [page](https://ethglobal.com/showcase/defi-e9zii)
- **PaintGlobal** (NFC-wristband art contest with swipe voting and auctions) — [page](https://ethglobal.com/showcase/paintglobal-v4pwo)

Open Agents (7) — [showcase, Open Agents](https://ethglobal.com/showcase?events=openagents)
- **Clan World: Ælder Whispers** (four AI agents play a fully on-chain strategy game) — [page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)
- Mnemosyne — [page](https://ethglobal.com/showcase/mnemosyne-4ga04); Aegis402 — [page](https://ethglobal.com/showcase/aegis402-o8x6z); DAIO — [page](https://ethglobal.com/showcase/daio-zce3h); Slopstock — [page](https://ethglobal.com/showcase/slopstock-7zgd6); Common OS — [page](https://ethglobal.com/showcase/common-os-ywv7j); LPlens — [page](https://ethglobal.com/showcase/lplens-7sijq) (all badge only)

ETHGlobal New York 2026 (10) — [showcase, New York 2026](https://ethglobal.com/showcase?events=newyork2026)
- **Void Tactics** (fully on-chain tactical fleet combat) — [page](https://ethglobal.com/showcase/void-tactics-ag25f)
- Prediction-market finance (game-adjacent, not games): Canary — [page](https://ethglobal.com/showcase/canary-kh3h7); Cumulant — [page](https://ethglobal.com/showcase/cumulant-xfzya); LYNX — [page](https://ethglobal.com/showcase/lynx-ta08o) (badge only)
- UNSU — [page](https://ethglobal.com/showcase/unsu-o1e71); Immunity — [page](https://ethglobal.com/showcase/immunity-eg56a); Distro — [page](https://ethglobal.com/showcase/distro-h393v); Accrue — [page](https://ethglobal.com/showcase/accrue-racfy); Proof of Scan — [page](https://ethglobal.com/showcase/proof-of-scan-trx38); The Wallet Shift — [page](https://ethglobal.com/showcase/the-wallet-shift-pqdxy) (badge only)

ETHGlobal Lisbon 2026 (10; no games) — [showcase, Lisbon 2026](https://ethglobal.com/showcase?events=lisbon2026)
- ArcBook — [page](https://ethglobal.com/showcase/arcbook-twp2a); Glassbox402 — [page](https://ethglobal.com/showcase/glassbox402-qyepd); KOLlateral — [page](https://ethglobal.com/showcase/kollateral-ho1d1); Hands Unchained — [page](https://ethglobal.com/showcase/hands-unchained-6kdf3); Lean Silicon — [page](https://ethglobal.com/showcase/lean-silicon-f134z); ethui agentic wallet — [page](https://ethglobal.com/showcase/ethui-agentic-wallet-6ohfx); Carte Bleue — [page](https://ethglobal.com/showcase/carte-bleue-ftuuc); Lortnoc Tahc (hidden messages inside Telegram small talk) — [page](https://ethglobal.com/showcase/lortnoc-tahc-y1d3j); explorador.pt — [page](https://ethglobal.com/showcase/explorador-pt-35okq); Happy Hour (punch-card loyalty) — [page](https://ethglobal.com/showcase/happy-hour-v3o03) (all badge only)

ETHOnline 2026 (8 badged) — [showcase, ETHOnline 2026](https://ethglobal.com/showcase?events=ethonline2026)
- **ETH Arcade** (handheld arcade console where the ETH price is the game) — [page](https://ethglobal.com/showcase/eth-arcade-96wyn)
- TARE — [page](https://ethglobal.com/showcase/tare-ozced); OpenBook — [page](https://ethglobal.com/showcase/openbook-8ngw6); Cordon — [page](https://ethglobal.com/showcase/cordon-vw3kh); Petri — [page](https://ethglobal.com/showcase/petri-mjy1y); OnchainRouter — [page](https://ethglobal.com/showcase/onchainrouter-8r4jm); LeekDIYHardwareWallet — [page](https://ethglobal.com/showcase/leekdiyhardwarewallet-5qssg); Novi Corpus — [page](https://ethglobal.com/showcase/novi-corpus-qtfxd) (all badge only)

ETHGlobal Tokyo 2026 (8 badged; prize page says top 10) — [showcase, Tokyo 2026](https://ethglobal.com/showcase?events=tokyo2026)
- **OddsFlow** (one balance backing many prediction-market orders) — [page](https://ethglobal.com/showcase/oddsflow-fwsnb)
- **Kura** (vault + fractional auction for physical Magic: The Gathering cards) — [page](https://ethglobal.com/showcase/kura-so3wx)
- Omamoris — [page](https://ethglobal.com/showcase/omamoris-rn3nc); yohaku — [page](https://ethglobal.com/showcase/yohaku-m2d72); Takarabako — [page](https://ethglobal.com/showcase/takarabako-qmgg5); Patio Station — [page](https://ethglobal.com/showcase/patio-station-17k0a); watermark — [page](https://ethglobal.com/showcase/watermark-68230); Enconomy — [page](https://ethglobal.com/showcase/enconomy-9m8x8) (all badge only)

ETHGlobal Mumbai — no project carries the ETHGlobal finalist badge as of 2026-11-16, and the event page text contains no finalist list; about 75 projects carry sponsor prizes — [showcase, Mumbai](https://ethglobal.com/showcase?events=mumbai); [Mumbai event page](https://ethglobal.com/events/mumbai)

#### 1c. Game / game-like sponsor-prize winners that were not finalists

- HackMoney 2026, ENS "Integrate ENS" prize pool: Ethereal (match-3), YieldBall.eth (no-loss pachinko), AgentArena (AI agents battle in BTC arenas), Yield Empire (DeFi city-builder), Wambling3 (rock-paper-scissors betting), stakeroom, Prophit (bets on live game streams), Rizzz.fun (predict winning reels), NoCap-Lottery (no-loss lottery), Voidmarket (commit-reveal prediction market in Telegram), CircEveryBid (sealed-bid auctions). ENS "Most creative use of ENS for DeFi": GridGame-HyperSwiper. Yellow trading/prediction track: draw-fi (2nd), House Protocol (3rd). Each is profiled in section 3 with its page link.
- Cannes 2026: Predict It! (Arc prediction markets 1st), PolyPOP (Arc prediction markets 2nd), GhostBet (Unlink Best Private Application) — pages linked in section 3.
- New York 2026: Tap Tap Revolution (ENS pool), Playce (Blink scratch track), WorldColony (Arc 2nd + ENS pool), JuryDuty (Blink continuity), Calibre (ENS continuity 2nd), Trade Royale (Privy best AI agent), Daemon Hall (ENS pool) — pages linked in section 3.
- Lisbon 2026: TreasureHunt (World "Selfie Check Beta - Continuity" 2nd) — [page](https://ethglobal.com/showcase/treasurehunt-ctkmi)
- Mumbai: Ethereum Game Box (0G "Physical AI" best build on real hardware + ENS "Best Use of ENSv2" 1st), session (Chainlink "Best use of CCIP 2.0"), Bid3 (Arkiv from-scratch 2nd) — pages linked in section 3.

### Inferences
- True games are a small minority of ETHGlobal finalists in 2026: 4 of 63 (about 6%). Adding prediction / betting / collectibles products raises the game-like share to roughly 13 of 63 (about 21%). The finalist slate is dominated by AI-agent infrastructure, payments (x402), wallets and privacy tooling.
- Games win ETHGlobal sponsor prizes mainly by being a vivid demo of a sponsor's technology (Yellow state channels and ENS records at HackMoney; Arc USDC settlement at Cannes / New York). That is the same dynamic a Zama bounty rewards: the game must make the sponsor primitive (encrypted state) the visible core of play.
- Since Lisbon 2026, ETHGlobal allows continuing projects ("Continuity" prizes), and one gaming finalist (Void Tactics) was explicitly a pre-existing game extended at the event.

### Gaps
- ETHGlobal Mumbai finalists: not confirmed. The showcase had no finalist badges ten days after the event; a search for an announcement returned nothing before the search budget ran out.
- ETHOnline 2026 and Tokyo 2026 each show 8 finalist-badged projects where 10 might be expected. Whether two finalists per event are missing from the showcase or the slates were smaller is not confirmed.
- Per-event hacker and submission counts were not found on ETHGlobal pages (they show "800+ attendees" generically). A figure of 382 hackers from 47 countries for Lisbon appeared only in a search summary of sponsor recap coverage and was not verified against a primary page — [The Graph recap](https://thegraph.com/blog/ethglobal-lisbon-2026-winners/)
- "Badge only" finalists were not opened individually; their one-line descriptions come from the showcase cards.

## 2. Which L2 / Ethereum-aligned hackathons ran in 2026 with announced winners?

### Takeaway
Confirmed 2026 events outside ETHGlobal are the ETHDenver 2026 BUIDLathon (Feb 18-21), ETHMumbai 2026 (Mar 13-15), ETHPrague 2026 (May 8-10), the Base Batches 2026 programme, and the Mantle Global Hackathon 2025 (which ran into 2026), but a winners list could not be retrieved for any of them. No L2-run hackathon gaming winner could be confirmed in this pass.

### Cited Findings

ETHDenver 2026 BUIDLathon
- Organiser ETHDenver, hosted on Devfolio; on-site Feb 18-21, 2026 in Denver, with bounties announced virtually on Feb 11 so teams could start a week early — [ETHDenver 2026 on Devfolio](https://ethdenver2026.devfolio.co/)
- Prize total listed as $130,000: Hedera, 0G Labs and ADI Foundation $25,000 each, Canton Network $15,000, ETHDenver, Base and Kite AI $10,000 each, QuickNode $2,000 — [ETHDenver 2026 on Devfolio](https://ethdenver2026.devfolio.co/)
- Five tracks: ETHERSPACE (user-owned internet), Devtopia (infrastructure), New France Village (future of finance), Futurllama (frontier tech, AI, DePIN), Prosperia (privacy, governance, public goods). There is no dedicated gaming track — [ETHDenver 2026 on Devfolio](https://ethdenver2026.devfolio.co/)
- Prize pool fell from about $1.03 million in 2025 to about $132,000, and on-site hacking shrank from eight days to four — [Wu Blockchain](https://wublock.substack.com/p/ethdenver-2026-observations-side); [crypto.news](https://crypto.news/ethdenver-2026-fewer-side-events-more-ai-agents-and-builder-focus/)
- Judging format: main-track teams pitched for five minutes to 2-3 judges; participants reported that clear, quick, memorable and humorous demos mattered more than technical polish, and that mass-market use cases beat projects built around Web3 features — [Wu Blockchain](https://wublock.substack.com/p/ethdenver-2026-observations-side)
- Only two winning projects are described, neither a game: an AI-agent advertising protocol that took third place in the Base sponsor prize, and an unnamed "AI girlfriend" product with crypto tipping. GameFi projects were present but none is named — [Wu Blockchain](https://wublock.substack.com/p/ethdenver-2026-observations-side)

ETHMumbai 2026 (community hackathon, separate from ETHGlobal Mumbai)
- Mar 13-15, 2026 in Mumbai; 300 hackers, 42 hours; tracks DeFi, Privacy, AI; prize pool $10,050 (ETHMumbai, BitGo, ENS, HeyElsa $2,000 each; Base $1,050; Fileverse $1,000). No winners shown on the page — [ETHMumbai 2026 on Devfolio](https://ethmumbai2026.devfolio.co/)

ETHPrague 2026
- May 8-10, 2026 at the Municipal House, Prague, with a hackathon "focused on real-world impact"; the site links to results at ethprague2026.devfolio.co/projects. Prize pool and winners are not on the page — [ETHPrague 2026](https://2026.ethprague.com/)

Base
- Base Batches 2026 is an accelerator-style programme, not a weekend hackathon: Startup track (applications Feb 17 - Mar 9, virtual programme Mar 23 - May 15), Student track, and a Robotics track run by Virtuals, with a Demo Day in San Francisco in late May. Startup prizes: $10k grant for each of the top 15 teams, and at least 3 teams eligible for $50k from the Base Ecosystem Fund — [Base Batches](https://www.basebatches.xyz/)
- The page lists 12 accepted Startup teams and no Demo Day winners. Consumer / game-adjacent entries: JPEG App (opinion markets on photo content) and Onsight (social, chat-native prediction markets). Privacy entry: Opal (private DEX with a sealed matching engine). None is a game — [Base Batches](https://www.basebatches.xyz/)
- Base also sponsored bounties inside ETHDenver 2026 ($10,000) and ETHMumbai 2026 ($1,050) — [ETHDenver 2026 on Devfolio](https://ethdenver2026.devfolio.co/); [ETHMumbai 2026 on Devfolio](https://ethmumbai2026.devfolio.co/)

Mantle
- Mantle Global Hackathon 2025 (on HackQuest): event period Oct 15 - Dec 31, 2025; submissions open until Jan 15, 2026; Demo Days Feb 3-4, 2026; reward announcement scheduled Feb 7, 2026. Prize pool $150,000: $30,000 grand prize, six track prizes of $15,000, plus community choice, best integration, best UX and incubation grants — [HackQuest](https://www.hackquest.io/hackathons/Mantle-Global-Hackathon-2025)
- It has a "GameFi & Social" track ($8,000 / $5,000 / $2,000) whose stated focus is consumer apps that integrate RWA or yield logic, token incentive design and retention tools. No winners are listed on the page — [HackQuest](https://www.hackquest.io/hackathons/Mantle-Global-Hackathon-2025)

Devcon / Devconnect-related
- ETHGlobal Tokyo finalists received a "Devcon Mumbai pass", and ETHGlobal Mumbai (Nov 5-7) plus Pragma Mumbai (Nov 6) are the ETHGlobal events attached to that week. No separate Devcon hackathon with winners was found — [Tokyo 2026 prizes](https://ethglobal.com/events/tokyo2026/prizes); [ETHGlobal events](https://ethglobal.com/events)

Excluded, with reasons
- ETHGlobal Buenos Aires (Nov 21-23, 2025) and ETHOnline 2025 (Oct 10-31, 2025): held in 2025 — [ETHGlobal events](https://ethglobal.com/events)
- ETHGlobal Cannes / New York / Tokyo / Lisbon 2027: upcoming, no winners — [ETHGlobal events](https://ethglobal.com/events)
- Mantle Global Hackathon 2025: build period was almost entirely in 2025 and only judging fell in 2026; kept above for context but winners are not confirmed — [HackQuest](https://www.hackquest.io/hackathons/Mantle-Global-Hackathon-2025)
- ETHGlobal Mumbai overall finalists: event held, sponsor prizes published, finalists not yet visible — [showcase, Mumbai](https://ethglobal.com/showcase?events=mumbai)
- Base Batches 2026: no Demo Day winners published on the programme page — [Base Batches](https://www.basebatches.xyz/)

### Inferences
- The dedicated-L2 hackathon circuit looks thinner in 2026 than in earlier years, with L2s (Base especially) appearing as bounty sponsors inside community events or running accelerator programmes rather than standalone hackathons. This is a tentative reading from a small number of pages, not a verified market-wide finding.
- ETHDenver's shift to short pitches judged on clarity and memorability suggests a hidden-information game needs a demo whose secret-state moment is understandable in under a minute.
- Mantle's GameFi track brief (yield / RWA integration, retention) indicates L2 "gaming" tracks in this cycle reward financialised consumer apps more than game design.

### Gaps
- ETHDenver 2026 finalists and track winners: not confirmed. The Devfolio projects page returned zero projects to the reader, ethdenver.com/buidlathon returned 404, and guessed recap URLs on Devfolio and Hedera did not exist. One search was run before the search budget was exhausted and returned no winners list.
- ETHMumbai 2026 and ETHPrague 2026 winners: not confirmed. Their Devfolio project galleries are client-rendered and were not readable; no follow-up search was possible.
- Mantle Global Hackathon winners (including GameFi & Social): not confirmed. The HackQuest page lists none and a guessed Mantle blog URL had no such post.
- Arbitrum (Open House and any gaming catalyst events): not confirmed. openhouse.arbitrum.io returned HTTP 429 twice.
- Optimism / Superchain, Polygon, zkSync, Linea, Scroll, ETHCC, ETHBerlin, ETHIndia: not researched. No searches could be run after the budget was exhausted, so absence here means "not checked", not "did not happen".
- Base "Builder Quest" / Onchain Summer style buildathons in 2026: not checked for the same reason.

## 3. Profiles of each gaming or game-like winner / finalist

### Takeaway
The four finalist games are a multi-agent negotiation strategy game, a fully on-chain tactics game, a hardware arcade price game and a 1v1 trading duel; the larger pool of prize-winning game-like projects is mostly seconds-long prediction or arcade loops settled in USDC, usually with off-chain play and on-chain escrow. Hidden information is rare, and where it exists it is handled by commit-reveal, a shielded pool, or a privately operated chain, never by FHE.

### Cited Findings

Each profile gives: what it is and the core loop; what runs on-chain; solo or multiplayer; hidden information and how it is handled; prize; links. "Judges" is omitted per project because no judge comments were published.

#### Finalists

Clan World: Ælder Whispers — Open Agents finalist
- A fully on-chain strategy game in which four autonomous AI agents (long-lived Claude sessions) act as rival clan elders competing for resources, building bases, defending against bandits and negotiating alliances. Each agent reasons once per tick and submits clan orders on-chain via a CLI — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)
- On-chain: Solidity Diamond proxy on Base Sepolia holding the tick engine, missions, markets, bandits and an ERC-7857 "intelligent NFT"; agent memory is stored on 0G storage — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)
- Multiplayer between agents; humans are owners / spectators. Signature mechanic: every ten ticks an elder's chat history is wiped and only what it chose to save survives, and that saved memory is transferable as an NFT — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)
- Hidden information: yes, in the social layer only. Agents talk on a public channel and through private peer-to-peer "whispers" routed over a Gensyn AXL mesh, enabling secret alliances and betrayal. Game state itself is public. No ZK, TEE or FHE — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)
- Links: demo https://app.clan-world.com ; repo https://github.com/OmniPass-world/clan-world — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)

Void Tactics — ETHGlobal New York 2026 finalist; also World "Track C (existing projects integrating World ID)" 2nd place and Dynamic "Best Wallet Glow Up"
- Turn-based tactical space combat: players build fleets of NFT ships under a threat budget and fight on a 17x11 grid with movement, weapons, shields, special abilities, line of sight and permanent ship destruction — [project page](https://ethglobal.com/showcase/void-tactics-ag25f)
- On-chain: everything. The Solidity contracts on Base Sepolia are the game engine (no game server); ship art and metadata are generated and stored on-chain; match results and tournaments are recorded on-chain; replays are stored on Walrus with the blob id committed on-chain — [project page](https://ethglobal.com/showcase/void-tactics-ag25f)
- Multiplayer PvP with lobbies and tournaments; World ID proofs verified on-chain give one verified human one tournament entry — [project page](https://ethglobal.com/showcase/void-tactics-ag25f)
- Hidden information: none described; state is public. The core game pre-dated the hackathon and the event work was three sponsor integrations (Dynamic, World ID, Walrus) — [project page](https://ethglobal.com/showcase/void-tactics-ag25f)
- Links: demo https://void-tactics-fe-eth-ny-26.vercel.app/ ; original https://www.voidtactics.xyz ; repos https://github.com/briandoyle81/void-tactics-fe-eth-ny-26 and https://github.com/briandoyle81/warpflow-contracts — [project page](https://ethglobal.com/showcase/void-tactics-ag25f)

ETH Arcade — ETHOnline 2026 finalist
- An open-source handheld console (Raspberry Pi Zero W, 3.5-inch screen, rotary knob, two buttons, speaker, 3D-printed case) plus a Python SDK for games driven by live markets. First game "Box Run": turn the knob to place a box on the ETH price chart, press to stake; each round lasts ten seconds and pays out if the price finishes inside the box — [project page](https://ethglobal.com/showcase/eth-arcade-96wyn)
- On-chain: session funding and settlement in USDC through an escrow contract on Arc testnet (player funds locked alongside a house reserve); rounds run off-chain and the designated device reports the final balance; price comes from Uniswap v3/v4 Substreams via The Graph; identity and leaderboard are ENSv2 subnames and records — [project page](https://ethglobal.com/showcase/eth-arcade-96wyn)
- Solo against the house, pass-and-play socially. Hidden information: none. Trust sits in the device reporting the result — [project page](https://ethglobal.com/showcase/eth-arcade-96wyn)
- Links: demo https://etharcade.fun/ ; repo https://github.com/team-somehow/eth-arcade — [project page](https://ethglobal.com/showcase/eth-arcade-96wyn)

Défi — ETHGlobal Cannes 2026 finalist
- Gamified 1v1 trading duel: a player sets a stake and a duration from 60 seconds to 7 days, shares an invite link, and both players independently choose pair, leverage and direction; whoever has the better profit-and-loss percentage when the timer ends wins. Friendly mode uses testnet faucet USDC, Duel mode uses mainnet funds — [project page](https://ethglobal.com/showcase/defi-e9zii)
- On-chain: real leveraged positions opened through Gains Network contracts on Arbitrum / Base; stake swapped via Uniswap API; embedded MPC wallets from Dynamic. A NestJS backend tracks positions and streams PnL each second — [project page](https://ethglobal.com/showcase/defi-e9zii)
- Multiplayer 1v1. Hidden information: none described (opponents choose independently, but positions are ordinary on-chain trades) — [project page](https://ethglobal.com/showcase/defi-e9zii)
- Links: demo https://defi.wakushi.com/ ; repo https://github.com/Camillemtd/dueldefi — [project page](https://ethglobal.com/showcase/defi-e9zii)

Blip Market — HackMoney 2026 finalist
- Tap-based micro-prediction: users stake USDC on price-time cells of a grid laid over a live chart and win if the price touches that band within the window. Zero-sum outcomes — [project page](https://ethglobal.com/showcase/blip-market-8edo8)
- On-chain: USDC stakes and payouts on Base through a treasury contract with a relayer; prices and settlement data come from Coinbase's exchange WebSocket feed rather than an on-chain oracle — [project page](https://ethglobal.com/showcase/blip-market-8edo8)
- Solo against a pool. Hidden information: none. Link: demo https://blipmarkets.com/ (no repo listed) — [project page](https://ethglobal.com/showcase/blip-market-8edo8)

PulsePlay — HackMoney 2026 finalist
- Real-time betting on single sports plays (next pitch ball or strike, penalty scored or not) in markets lasting 5-15 seconds, made feasible by Yellow Network state channels: one signature, then unlimited instant gasless bets. Two market models, an LMSR automated market maker and a peer-to-peer order book — [project page](https://ethglobal.com/showcase/pulseplay-j9e7x)
- On-chain: only channel funding and settlement; a Fastify + SQLite hub runs the market engine and state machine — [project page](https://ethglobal.com/showcase/pulseplay-j9e7x)
- Multiplayer market. Hidden information: none. Links: demo https://hackmoney.mikail.xyz/ ; repo https://github.com/Pulse-Play-HackMoney/pulse-play — [project page](https://ethglobal.com/showcase/pulseplay-j9e7x)

PaintGlobal — ETHGlobal Cannes 2026 finalist
- An on-chain art contest built around the hackathon's painting workshop: each attendee uploads one artwork to a public gallery, others vote with a Tinder-style swipe, a leaderboard ranks works, and pieces are auctioned as NFTs. Identity comes from the NFC chip in the event wristband — [project page](https://ethglobal.com/showcase/paintglobal-v4pwo)
- Multiplayer and event-bound. Hidden information: none. Link: repo https://github.com/Lasssssa/PaintGlobal — [project page](https://ethglobal.com/showcase/paintglobal-v4pwo)

OddsFlow — ETHGlobal Tokyo 2026 finalist; 1inch "Build an Aqua App" 1st place
- A market-maker tool, not a game: one sDAI balance backs fixed-price limit orders across many Seer prediction markets through 1inch Aqua, with custom opcodes that halt orders the moment a market resolves. Runs on Gnosis Chain — [project page](https://ethglobal.com/showcase/oddsflow-fwsnb)
- Links: demo https://oddsflow-teal.vercel.app ; repo https://github.com/salviega/oddsflow — [project page](https://ethglobal.com/showcase/oddsflow-fwsnb)

Kura — ETHGlobal Tokyo 2026 finalist; Uniswap Foundation "Best Uniswap Stack Contribution" 1st and ENS "Best Use of ENSv2" 3rd
- A vault for physical Magic: The Gathering cards. A shop scans a card, the owner receives an on-chain twin, splits it into shards and sells half in a Uniswap continuous clearing auction open only to World ID-verified humans; the proceeds seed a Uniswap v4 pool; anyone reaching 80% of shards can buy out the rest and collect the card. Collectibles finance rather than a game — [project page](https://ethglobal.com/showcase/kura-so3wx)
- Links: demo https://www.kuravault.xyz ; repo https://github.com/PaoloRollo/kura — [project page](https://ethglobal.com/showcase/kura-so3wx)

#### Sponsor-prize winners with hidden information (closest comparables)

Daemon Hall (internal name DarkBox) — New York 2026, ENS "Integrate ENS" prize pool
- A "sealed" arena where players deposit USDC, register an autonomous trading agent and give it private voice or text instructions; agents trade YES/NO prediction markets for the length of the game. During play the public sees only a leaderboard of PnL and aggregate market stats; balances, positions and order books stay hidden. At the end the whole environment is unsealed: chain history, every transaction, positions and instruction logs are published for audit and replay — [project page](https://ethglobal.com/showcase/daemon-hall-d14u4)
- How the hiding works: play happens on a privately operated hidden EVM devnet holding "shadow USDC" backed 1:1 by real deposits on Base / Arc; a bridge mints and burns it; withdrawals are authorised by a TEE-isolated signer and limited to idle balance; agents only see filtered indexer data; login is via Telegram. This is operator-trust plus a TEE for one key plus full post-game disclosure, not cryptographic privacy of state — [project page](https://ethglobal.com/showcase/daemon-hall-d14u4)
- Links: demo https://daemonhall.repo.box/ ; repo https://github.com/TeeSQL/darkbox — [project page](https://ethglobal.com/showcase/daemon-hall-d14u4)

Trade Royale — New York 2026, Privy "Best AI agent built with Privy"
- A mobile PWA "battle royale of trading": players buy in with USDC, write a strategy prompt for a personal Claude trading agent, and the agent trades live for the match while the player can inject instructions; the leaderboard re-ranks in real time and the winner takes the entire pot — [project page](https://ethglobal.com/showcase/trade-royale-esviu)
- Hidden information: each player's vault holdings are shielded with Unlink's zk privacy layer (Groth16 proofs) so rivals cannot see positions or copy trades; the team frames privacy as the anti-cheat. Settlement: a Chainlink CRE workflow snapshots each vault's value at the bell and the contract pays the pot after verifying the oracle network's signature — [project page](https://ethglobal.com/showcase/trade-royale-esviu)
- Links: demo http://traderoyale.xyz/ ; repo https://github.com/Charlie85270/TradeRoyale — [project page](https://ethglobal.com/showcase/trade-royale-esviu)

GhostBet — Cannes 2026, Unlink "Best Private Application"
- A prediction market on Base where individual bets are invisible: users deposit privately through Unlink, then bet from ephemeral burner wallets unlinked from their identity, so only aggregate pool totals appear on-chain; winnings return to the private balance. The burner is created and funded server-side, which is a trust assumption — [project page](https://ethglobal.com/showcase/ghostbet-11i4u)
- Link: repo https://github.com/GuillaumeLepin/ghostbet — [project page](https://ethglobal.com/showcase/ghostbet-11i4u)

Voidmarket — HackMoney 2026, ENS "Integrate ENS" prize pool
- A Telegram Mini App prediction market on Arc testnet where bets are hidden until resolution: a player commits a salted hash of their side and reveals after the market resolves, preventing last-minute copying. Adds team play: "Clusters" of bettors and "Novas", 1v1 cluster battles with prize pools. Gasless through Circle developer wallets — [project page](https://ethglobal.com/showcase/voidmarket-hph0e)
- Hidden information handled by plain commit-reveal (keccak256 of direction and salt, stored as an ENS text record). The showcase tagline says "ZK powered", but the description and build notes describe only commit-reveal — [project page](https://ethglobal.com/showcase/voidmarket-hph0e); tagline on [showcase, HackMoney 2026](https://ethglobal.com/showcase?events=hackmoney2026)
- Links: demo https://voidmarket-ethglobal.vercel.app ; repo https://github.com/DarthStormerXII/voidmarket — [project page](https://ethglobal.com/showcase/voidmarket-hph0e)

House Protocol — HackMoney 2026, Yellow trading / prediction track 3rd place
- "Anyone can be the house": liquidity providers deposit into an ERC-4626 vault that bankrolls betting games; developers use an SDK to build games on that liquidity; play runs off-chain in Yellow state channels. Fairness uses commit-reveal: the app commits a hashed seed before the game and reveals it on-chain afterwards — [project page](https://ethglobal.com/showcase/house-protocol-wratk)
- Links: demo https://house-protocol.kwek.dev ; repo https://github.com/kelvinkn17/house-protocol — [project page](https://ethglobal.com/showcase/house-protocol-wratk)

CircEveryBid — HackMoney 2026, ENS "Integrate ENS" prize pool
- Sealed-bid continuous clearing auctions on Uniswap v4: bids are Poseidon hash commitments with a nullifier registry to prevent double bidding, so bid amounts stay private — [project page](https://ethglobal.com/showcase/circeverybid-4add3)
- Links: demo https://circeverybid.vercel.app/ ; repo https://github.com/tatdz/CircEveryBid1 — [project page](https://ethglobal.com/showcase/circeverybid-4add3)

TreasureHunt — Lisbon 2026, World "Selfie Check Beta - Continuity" 2nd place
- A production scavenger hunt for physical events: players tap NFC tags hidden around a venue, claim token rewards gaslessly, climb a leaderboard and spend tokens on merch. At Lisbon the team added free ENS names carrying live score records, World ID sybil gates and clues encrypted with Sui's Seal. Has run at real events including ETHDenver — [project page](https://ethglobal.com/showcase/treasurehunt-ctkmi)
- Links: demo https://ethglobal.treasurehunt.pt/ ; repo https://github.com/dindonero/treasure-hunt-ethglobal — [project page](https://ethglobal.com/showcase/treasurehunt-ctkmi)

#### Other sponsor-prize winners (games and betting loops, no hidden information)

- Ethereum Game Box (Mumbai; 0G "Physical AI" best build on real hardware, ENS "Best Use of ENSv2" 1st): a Raspberry Pi tabletop console where friends tap NFC wallet badges to join, stake test USDC and play Quick Draw or Stock Duel; the Box signs results with a hardware key and a relayer pays gas; an AI judge running on 0G private inference reads the match log and decides payouts, and the team shipped a deliberately rigged game to test it. Demo https://gamebox-names.pages.dev ; repo https://github.com/TaraxioT/ethereum-game-box — [project page](https://ethglobal.com/showcase/ethereum-game-box-x3wr8)
- session (Mumbai; Chainlink "Best use of CCIP 2.0"): a multiplayer layer inside coding-agent sessions; while two developers wait for their agents, they play chess with five-minute clocks, a shared-course flappy game, or solo puzzles (sudoku, crossword, KenKen, maze). A central relay server is the authority for moves, clocks and the USDC ledger. Demo https://sessionp2p.vercel.app ; repo https://github.com/Vib-UX/session — [project page](https://ethglobal.com/showcase/session-1jxip)
- Bid3 (Mumbai; Arkiv from-scratch 2nd): live auctions with physical ESP32 bidding paddles; every accepted bid, hammer result and payment is written to a public record. Demo https://bid3.vercel.app/ ; repo https://github.com/Madxfury/Bid3 — [project page](https://ethglobal.com/showcase/bid3-wjw68)
- Tap Tap Revolution (New York; ENS pool): mobile head-to-head arcade game; both sides tap future price cells on a scrolling BTC / ETH / SOL board, closest predictions score, winner takes the escrowed USDC pot on Arc; play a friend via QR or an AI agent with its own ENS name. Demo http://taptaprevolution.nyc ; repo https://github.com/jcruzfff/taptap-revolution — [project page](https://ethglobal.com/showcase/tap-tap-revolution-fnvdt)
- Playce (New York; Blink scratch track): geofenced venue check-in, then sponsor-skinned mini-games such as staked head-to-head chess on Lichess and a camera-based AR battle; winners get soulbound badges on Base. Demo https://playce-nyc.up.railway.app/ ; repo https://github.com/Vib-UX/playce — [project page](https://ethglobal.com/showcase/playce-0emjn)
- WorldColony (New York; Arc stablecoin logic 2nd + ENS pool): 200 AI "ant" agents research World Cup fixtures from knowledge graphs, self-organise into debate rooms and bet on matches. Demo https://www.worldcolony.nyc ; repo https://github.com/Vainglorious/ethglobalnyc — [project page](https://ethglobal.com/showcase/worldcolony-fxehh)
- JuryDuty (New York; Blink continuity): social prediction markets on everyday events among friends. Repo https://github.com/simranmerchant/jury-duty — [project page](https://ethglobal.com/showcase/juryduty-zos15)
- Calibre (New York; ENS continuity 2nd): esports prediction market styled as a competitive game with rankings; prices pegged to Polymarket by a bot and maintained with an LMSR. Demo https://app.hicalibre.gg/ ; repo https://github.com/HANSEL-LI/calibre-onchain — [project page](https://ethglobal.com/showcase/calibre-9avv4)
- Predict It! (Cannes; Arc prediction markets 1st): bet on pre-recorded penalty kicks before watching the clip, with payouts from historical probabilities; solo build. Demo https://predict-it-one.vercel.app/ ; repo https://github.com/Gonzacolo/predict-it — [project page](https://ethglobal.com/showcase/predict-it-h10o0)
- PolyPOP (Cannes; Arc prediction markets 2nd): tag a bot on X to turn a disagreement into a short-duration peer-to-peer market. Repo https://github.com/0731jiangyujilv/polypop — [project page](https://ethglobal.com/showcase/polypop-qjuge)
- Ethereal (HackMoney; ENS pool): match-3 game where each move is a signed off-chain state update in a Yellow channel between player and a "House" node, settled on-chain at session end. Demo https://ethereal-ashen-phi.vercel.app/ ; repo https://github.com/tricodex/ethereal — [project page](https://ethglobal.com/showcase/ethereal-u92s0)
- YieldBall.eth (HackMoney; ENS pool): no-loss pachinko; deposit 100 USDC into Aave and the accrued interest becomes balls; physics parameters are read from the player's ENS text records. Demo https://yieldballeth.vercel.app/ ; repo https://github.com/Joel-29/YieldBall.eth — [project page](https://ethglobal.com/showcase/yieldball-eth-9vfg6)
- GridGame-HyperSwiper (HackMoney; ENS most creative use for DeFi): real-time multiplayer trading arena with ENS subdomains as player profiles and Yellow channels for low latency. Demo https://grid-games-production.up.railway.app/ ; repo https://github.com/0xgeorgemathew/grid-games — [project page](https://ethglobal.com/showcase/gridgame-hyperswiper-dytxo)
- AgentArena (HackMoney; ENS pool): five AI agents per match battle in live BTC-indexed sessions with entry fees and payouts; each agent's prompt hash and model are stored in ENS records. Demo https://agentarena.bikz.cc/ ; repo https://github.com/Bikz/AgentArena — [project page](https://ethglobal.com/showcase/agentarena-rhq1o)
- Yield Empire (HackMoney; ENS pool): browser city-builder where buildings are real DeFi protocols; actions are gasless in Yellow channels and settlement executes real testnet deposits. Demo https://yield-empire-hackmoney2026.vercel.app ; repo https://github.com/IronicDeGawd/Yield-Empire-Hackmoney2026 — [project page](https://ethglobal.com/showcase/yield-empire-6bci5)
- Wambling3 (HackMoney; ENS pool): rock-paper-scissors betting with per-game escrow clones and referee-signed payouts, so a trusted referee wallet decides outcomes. Repo https://github.com/PostboxRetinal/wambling3 — [project page](https://ethglobal.com/showcase/wambling3-4hirj)
- draw-fi (HackMoney; Yellow trading / prediction 2nd): draw a price path on a live chart for the next 1-5 minutes; the curve becomes 60 directional predictions that open a position scored on accuracy. Demo https://draw-fi.vercel.app ; repo https://github.com/fabianferno/draw-fi — [project page](https://ethglobal.com/showcase/draw-fi-xaqhv)
- Rizzz.fun (HackMoney; ENS pool): short videos compete in challenges and viewers predict winners with one deposit and unlimited gasless predictions. Demo https://rizzz-fun.vercel.app/ ; repo https://github.com/rohitshukla11/Rizzz.fun — [project page](https://ethglobal.com/showcase/rizzz-fun-u44gc)
- Prophit (HackMoney; ENS pool): streamers or moderators create yes/no predictions for viewers of a live game stream. Demo https://prophit-tv.vercel.app ; repo https://github.com/TheRealRajdeep/Prophit — [project page](https://ethglobal.com/showcase/prophit-syrb2)
- stakeroom (HackMoney; ENS pool): betting / staking rooms with off-chain updates on Yellow and a leaderboard. Demo https://stakeroom.vercel.app/ ; repo https://github.com/ahsenkamal/stakeroom — [project page](https://ethglobal.com/showcase/stakeroom-9ca8h)
- NoCap-Lottery (HackMoney; ENS pool): no-loss weekly lottery where only yield is paid as prizes; uses verifiable randomness. Demo https://no-cap-lottery.vercel.app/ ; repo https://github.com/XohamOG/NoCap-Lottery — [project page](https://ethglobal.com/showcase/nocap-lottery-opx3z)

### Inferences
- "Why it won" (inference, not judge statements): the finalist games each pair a legible loop with an unusual hook that demos well — AI agents betraying each other with tradable memory (Clan World), "the contracts are the game" with on-chain art (Void Tactics), a physical console you can hand to a judge (ETH Arcade), and trading turned into a timed duel (Défi).
- Most prize-winning "games" keep gameplay off-chain (state channels, a relay, a backend or a device) and use the chain for escrow and settlement. Only Void Tactics and Clan World put the rules themselves on-chain.
- Where information is hidden, teams reached for the cheapest tool that demos: commit-reveal (Voidmarket, House Protocol), commitments with nullifiers (CircEveryBid), a shielded pool SDK (Trade Royale, GhostBet), or simply a private chain with a later reveal (Daemon Hall). Each leaves a trust gap (a server, an operator, or a reveal step) that encrypted on-chain computation would close.
- Daemon Hall's "hidden during play, fully transparent after reveal" framing and Trade Royale's "privacy doubles as the anti-cheat" line are reusable pitches for an FHE game.

### Gaps
- No judge comments, scores or rationale were found for any of these projects; ETHGlobal pages list only the prize name.
- Demo videos are embedded on ETHGlobal project pages but direct video URLs were not extracted.
- Demo and repo links were copied from project pages and not opened, so their current availability is unverified.
- Solo-versus-multiplayer and hidden-information readings come from each team's own description; contracts were not audited.
- Roughly 280 further game-like submissions without prizes exist across the eight events and were not profiled individually (a subset is listed in section 4).

## 4. Did any 2026 finalist or winner use FHE, ZK or TEEs to build a hidden-information game?

### Takeaway
No ETHGlobal 2026 finalist or prize-winning game used FHE (Zama, Fhenix or Inco) as far as could be determined. The nearest prize-winning comparables use a ZK shielded pool (Trade Royale, GhostBet), a private chain plus TEE signer (Daemon Hall) or commit-reveal (Voidmarket, House Protocol); the most relevant hidden-information game designs sit among non-winning submissions.

### Cited Findings

Prize-winning or finalist projects
- FHE: none found among finalists or among the game-like prize winners opened in section 3. The only FHE mentions seen in showcase one-liners are non-game, non-prize projects: Cipher Lend ("confidential interactions using FHE"), QuantumPools ("protected by FHE") — [showcase, HackMoney 2026](https://ethglobal.com/showcase?events=hackmoney2026); and Arcanum ("secrets vault ... sealed with FHE") — [showcase, Cannes 2026](https://ethglobal.com/showcase?events=cannes2026)
- ZK: Trade Royale shields vault holdings with Unlink (Groth16) — [project page](https://ethglobal.com/showcase/trade-royale-esviu); GhostBet hides bets with Unlink private balances and burner wallets — [project page](https://ethglobal.com/showcase/ghostbet-11i4u); CircEveryBid uses Poseidon commitments and nullifiers for sealed bids — [project page](https://ethglobal.com/showcase/circeverybid-4add3). No finalist or prize-winning game was found using Noir, RISC Zero or SP1.
- TEE: Daemon Hall keeps its withdrawal signer in a TEE while the hidden state lives on a private chain — [project page](https://ethglobal.com/showcase/daemon-hall-d14u4); Ethereum Game Box uses 0G private inference for its AI judge — [project page](https://ethglobal.com/showcase/ethereum-game-box-x3wr8)
- Commit-reveal: Voidmarket (hidden bet side) — [project page](https://ethglobal.com/showcase/voidmarket-hph0e); House Protocol (provably fair seed) — [project page](https://ethglobal.com/showcase/house-protocol-wratk)
- Off-chain private channel: Clan World's private agent whispers over a peer-to-peer mesh — [project page](https://ethglobal.com/showcase/clan-world-aelder-g4i6y)

Non-winning hidden-information games (no prize listed; included as design comparables only)
- Agent Werewolf (Open Agents): eight LLM agents play a full Werewolf game in 3-5 turns; every speech, vote and elimination is hashed into a Merkle tree with the root committed on-chain; inference runs in a TEE on 0G Compute. The team states the motivating problem directly: on a centralised server "the server knows everything, including which players are werewolves". Demo https://agent-werewolf.vercel.app/ ; repo https://github.com/Agent-Werewolf/dashboard — [project page](https://ethglobal.com/showcase/agent-werewolf-du3ee)
- Mental Poker (Tokyo): three-player decentralised poker using mental-poker shuffles and decryption proofs on Aleo, with an EVM-wallet front end and ENS names; begun at ETHGlobal Trifecta in 2025. Repo https://github.com/henrikkv/poker — [project page](https://ethglobal.com/showcase/mental-poker-ihhmq)
- Infinite Gambit (Mumbai): simultaneous chess on an unbounded board; players stake to deploy an army at a secretly chosen spawn point, and each cycle every army's moves are committed as a hash and revealed together, then resolved simultaneously. Commit-reveal, with an offline mode. Demo https://infinite-gambit.netlify.app/play/ ; repo https://github.com/wighawag/infinite-gambit — [project page](https://ethglobal.com/showcase/infinite-gambit-856ps)
- The Last Alibi (Lisbon): AI detective game; one hidden case out of 64 combinations of suspect, room, weapon and time is cryptographically committed before play; the player questions lying AI suspects, requests up to five certified warrants and makes one irreversible accusation; built with ZK components (Groth16 / Circom) on Sui. Repo https://github.com/pradykst/The-Last-Alibi — [project page](https://ethglobal.com/showcase/the-last-alibi-dctaw)
- Sekaigent (Lisbon): secret-agent missions on 0G mainnet; players own AI operatives with encrypted private intelligence and submit sealed plays; hidden success criteria are commit-revealed after the deadline and graded by a deterministic rubric; a mission tax funds the prize pool. Demo https://sekaigent-web.vercel.app/ ; repo https://github.com/chevoisiatesalvati/sekaigent — [project page](https://ethglobal.com/showcase/sekaigent-opxax)
- Fan Fare (Tokyo): sealed-bid Vickrey auction for limited merch as a Uniswap v4 hook, one hidden bid per World ID-verified human, winners pay the second-highest bid. Demo https://fanfare-drop.vercel.app/ ; repo https://github.com/TheGreatFellow/fan-fare-eth-tokyo — [project page](https://ethglobal.com/showcase/fan-fare-jdjsq)
- mazeking (Lisbon): solve a deterministically generated maze locally, then prove with a zero-knowledge proof verified on-chain that the solution is valid, and mint an NFT. Repo https://github.com/vividn/mazeking_ethlisbon — [project page](https://ethglobal.com/showcase/mazeking-ndm3f)
- Chain Bluff (HackMoney): two-player Texas Hold'em with dealing and betting in Yellow state channels; no cryptographic card privacy described. Repo https://github.com/Akhil-2310/poker-next — [project page](https://ethglobal.com/showcase/chain-bluff-tgfd9)
- PlayFrens (HackMoney): poker with friends by ENS name; all game logic runs server-side on a poker engine, so the server sees hands. Repo https://github.com/RathodDeven/playfrens — [project page](https://ethglobal.com/showcase/playfrens-6tdia)
- Knockout (HackMoney): elimination card battler with simultaneous rounds of attack / defence cards, off-chain session engine, on-chain stake settlement. Repo https://github.com/dkwhitedevil/Knockout — [project page](https://ethglobal.com/showcase/knockout-kfnsx)
- Higher!! (HackMoney): crash game on Yellow channels with outcomes generated server-side. Repo https://github.com/akashbiswas0/Higher — [project page](https://ethglobal.com/showcase/higher-sxhr8)
- Other sealed-bid entries visible in one-liners without prizes: BlindPool and Ghost Finance — [showcase, HackMoney 2026](https://ethglobal.com/showcase?events=hackmoney2026); Glasshouse (second-price sealed-bid auctions in 1inch SwapVM), Kairos and BO-Sealed-Bid — [showcase, ETHOnline 2026](https://ethglobal.com/showcase?events=ethonline2026)

### Inferences
- Confidential gaming is close to open ground at ETHGlobal in 2026: hidden-information games were submitted at most events, but none reached finalist status and none used FHE. An FHEVM game would be differentiated against this field, not crowded.
- The non-winning poker and card entries mostly trust a server or channel counterparty with the cards, which is precisely the weakness FHE addresses. That they did not place suggests that a familiar card game with a trusted dealer is not enough by itself to impress judges.
- The designs with the most distinctive hidden-state mechanics are: secretly chosen spawn plus simultaneous committed moves (Infinite Gambit), a committed hidden case narrowed by limited certified queries (The Last Alibi), hidden scoring criteria revealed after sealed submissions (Sekaigent), second-price sealed bids (Fan Fare, Glasshouse), and hidden roles with verifiable transcripts (Agent Werewolf). All map naturally to encrypted state with selective decryption, and each currently needs a reveal phase that FHE could remove.
- Sponsor absence explains part of the FHE gap: with no Zama / Fhenix / Inco prize at any of the eight events, teams had no prize incentive to adopt FHE.

### Gaps
- An attempt to scan the full text of all ~585 prize-winning ETHGlobal project pages for FHE / ZK / TEE keywords was throttled by the site after ~40 pages (those 40 showed no FHE use). The "no FHE game among winners" finding therefore rests on showcase one-liners for all projects plus full-page reads of the ~45 game-like projects profiled here. A prize winner that mentions FHE only deep in its description could have been missed.
- Whether any of the non-winning hidden-information games won prizes outside ETHGlobal's showcase (for example sponsor side awards not recorded there) is unknown.
- No Inco-, Fhenix- or Zama-based game was found in any 2026 L2 or community hackathon, but those events' winners lists were not retrievable (see section 2), so this is unverified rather than negative.

## 5. Recurring patterns among gaming finalists and winners

### Takeaway
The winning pattern in 2026 is a very short, instantly legible loop with real stakes (seconds to minutes, USDC pot, winner-takes-all or pool payout), wrapped in zero-friction onboarding and often a physical or AI-agent hook; markets and price feeds substitute for designed game content more often than not.

### Cited Findings
- Genre mix among finalists: one multi-agent strategy game (Clan World), one tactics game (Void Tactics), one arcade price game (ETH Arcade), one trading duel (Défi), and several prediction / micro-betting products (Blip Market, PulsePlay, OddsFlow) — pages cited in section 1b.
- Session length is very short: PulsePlay markets last 5-15 seconds — [PulsePlay](https://ethglobal.com/showcase/pulseplay-j9e7x); ETH Arcade rounds last ten seconds — [ETH Arcade](https://ethglobal.com/showcase/eth-arcade-96wyn); draw-fi predictions cover 1-5 minutes — [draw-fi](https://ethglobal.com/showcase/draw-fi-xaqhv); session's games fit inside a few-minute agent wait, with five-minute chess clocks — [session](https://ethglobal.com/showcase/session-1jxip); Défi duels start at 60 seconds — [Défi](https://ethglobal.com/showcase/defi-e9zii); Agent Werewolf finishes a full game in 3-5 turns — [Agent Werewolf](https://ethglobal.com/showcase/agent-werewolf-du3ee)
- Stakes: USDC buy-ins with winner-takes-pot are standard (Trade Royale, Tap Tap Revolution, Défi, Ethereum Game Box) — pages cited in section 3. A "no-loss" variant funds prizes from yield only (YieldBall.eth, NoCap-Lottery) — [YieldBall.eth](https://ethglobal.com/showcase/yieldball-eth-9vfg6); [NoCap-Lottery](https://ethglobal.com/showcase/nocap-lottery-opx3z)
- AI agents as players or opponents recur across events: Clan World (agents play, humans own), AgentArena, WorldColony (200 agents), Trade Royale (your agent trades for you), Daemon Hall (agents trade from whispered instructions), Tap Tap Revolution (AI opponent with ENS identity), Agent Werewolf — pages cited in sections 3 and 4.
- Physical hardware is a repeated differentiator: ETH Arcade handheld (finalist), Ethereum Game Box tabletop console (two sponsor prizes), Bid3 paddles, PaintGlobal NFC wristbands (finalist), TreasureHunt NFC tags — pages cited in sections 1b and 3.
- Distribution and onboarding: embedded or MPC wallets (Dynamic in Défi and Void Tactics, Privy in Playce and Prophit), gasless play via state channels or relayers, mobile-first web or PWA (Trade Royale, Tap Tap Revolution), Telegram Mini App (Voidmarket) and Telegram login (Daemon Hall) — pages cited in section 3. No Farcaster mini-app was seen among the profiled winners.
- World ID is used as a sybil gate for competitive fairness: one verified human per tournament entry (Void Tactics), verified-human-only bidding (Kura, Fan Fare), sybil gates (TreasureHunt) — [Void Tactics](https://ethglobal.com/showcase/void-tactics-ag25f); [Kura](https://ethglobal.com/showcase/kura-so3wx); [Fan Fare](https://ethglobal.com/showcase/fan-fare-jdjsq); [TreasureHunt](https://ethglobal.com/showcase/treasurehunt-ctkmi). World's own MiniKit track excluded gambling or chance-based apps — [Cannes 2026 prizes](https://ethglobal.com/events/cannes2026/prizes)
- Identity and leaderboards live in ENS records rather than a database in many winners (ETH Arcade, Ethereum Game Box, GridGame-HyperSwiper, AgentArena, Voidmarket) — pages cited in section 3.
- Off-chain play with on-chain settlement is the default architecture: Yellow state channels (PulsePlay, Ethereal, YieldBall.eth, Yield Empire, House Protocol), a relay or backend (session, Défi), or a trusted device (ETH Arcade). Fully on-chain rules are the exception (Void Tactics, Clan World) — pages cited in section 3.
- Sponsor recaps describe judging as live demos combined with repo-level review (0G on Lisbon) — [0G recap](https://0g.ai/blog/ethglobal-lisbon-2026-recap); at ETHDenver, five-minute pitches rewarded clarity, humour and mass-market framing over technical polish — [Wu Blockchain](https://wublock.substack.com/p/ethdenver-2026-observations-side)

### Inferences
- For a Zama "Confidential Gaming" entry, the transferable recipe is: a loop that resolves in under a minute or two, a stake and payout that make the outcome matter, one-tap onboarding, and a single "you could not do this without encryption" moment that is visible in the demo.
- Hidden information is underused as a game mechanic in this field; most winners avoid it by using public price feeds as the source of uncertainty. A game whose uncertainty comes from other players' encrypted choices (sealed bids, simultaneous secret moves, hidden roles, hidden scoring criteria) would stand apart from the price-prediction crowd.
- AI opponents solve the cold-start problem for multiplayer games in judging (a judge can play immediately). A solo-playable mode against an agent or the house appears in most winning stake games.
- Fully on-chain rules were rewarded when framed as permanence and composability (Void Tactics' "the contracts are the game"). FHEVM games are on-chain by construction, so that framing is available.
- A post-game "unseal" (Daemon Hall) is a strong audit and spectator feature: keep state encrypted during play, then make the full match publicly replayable afterwards.

### Gaps
- These patterns describe ETHGlobal only. L2-run and community hackathons could not be sampled for gaming winners (section 2), so patterns specific to Base, Arbitrum, Mantle or Polygon gaming tracks are unknown.
- No quantitative judge scoring data exists publicly, so the patterns describe what won, not a measured causal effect.
- Counts of game-like projects depend on keyword matching of one-line descriptions and are approximate.

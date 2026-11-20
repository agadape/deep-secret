// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, ebool, euint8, euint32, euint64, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {PearlCoin} from "./PearlCoin.sol";
import {SecretFishNFT} from "./SecretFishNFT.sol";

/// @title DeepSecretGame — confidential multiplayer fishing (GAME_SPEC.md §6, §10).
/// @notice What stays encrypted: every catch (species, weight, aura, tier, sale price), coin balances, and how many
///         Secret fish are left this season. What is public: the odds table, rod levels, zones, who cast when, and
///         Secret fish whose owners chose to show them off (verified by a KMS decryption proof).
///         There is no admin: odds, quota and prices are fixed for the whole season at deployment.
/// @dev Packed fish layout (euint32): tier bits 0-2 | species bits 3-4 | aura bit 5 | weight bits 8-15 | valid bit 16.
///      packed == 0 is "Sandal Jepit" (bait not paid). Tiers: 0 Biasa, 1 Langka, 2 Epik, 3 Legenda, 4 Secret.
contract DeepSecretGame is ZamaEthereumConfig {
    // ---------------------------------------------------------------- types

    struct SeasonConfig {
        uint32 number;
        uint64 endsAt;
        uint8 secretQuota;
        uint64 starterAmount;
        uint64 baitPrice;
        // odds per fish at Dermaga with rod level 0, as "1 in N"
        uint32 secretOneIn;
        uint32 legendOneIn;
        uint32 epicOneIn;
        uint32 rareOneIn;
        uint16 rodBonusPct; // per rod level, added to the Legenda and Secret odds
        uint16 reefBonusPct; // Karang: added to Langka, Epik and Legenda odds
        uint16 trenchBonusPct; // Palung: added to Secret odds
        uint64[4] rodPrices; // price of rod level 1..4
    }

    struct Fish {
        address owner;
        uint32 season;
        uint64 caughtAt; // Sambar hook: "still wet" rule
        euint32 packed;
        euint64 price;
        ebool isSecret;
        uint8 state;
        uint8 origin; // Sambar hook: 0 cast, 1 snatched, 2 NPC
        bool targeted; // Sambar hook: already targeted once
    }

    struct PlayerState {
        bool starterClaimed;
        uint8 rodLevel;
        uint16 castCount; // Sambar hook
        uint32 emberCount; // Sambar hook: fish in state EMBER
        bool upgradePending;
        ebool upgradePaid;
        // Sambar Ember
        bool shieldBroken; // a newcomer who snatches from a player loses the newcomer shield
        bool hasNet;
        uint8 targetedInWindow;
        uint64 lastSnatchAt; // as thief
        uint64 lastTargetedAt; // as victim
        uint64 windowStart; // start of the victim's current one-hour window
        euint32 netFish; // fish id guarded by the hidden net
    }

    /// @dev Public, season-locked rules of Sambar Ember (docs/SAMBAR_EMBER.md §1.7).
    struct SambarConfig {
        uint64 snatchBait;
        uint64 netCost;
        uint32 thiefCooldown;
        uint32 pairCooldown;
        uint32 victimCooldown;
        uint32 wetSeconds;
        uint32 npcRestockCooldown;
        uint8 maxTargetedPerHour;
        uint16 minThiefCasts;
        uint16 shieldCasts;
        uint8 minEmber;
    }

    /// @dev A short-lived key that may play on the player's behalf, so the wallet signs once per session.
    struct Session {
        address key;
        uint64 expiresAt;
    }

    struct Odds {
        uint32 secret;
        uint32 legend;
        uint32 epic;
        uint32 rare;
    }

    // ---------------------------------------------------------------- constants

    uint8 public constant FISH_PER_CAST = 5;
    uint8 public constant MAX_ROD_LEVEL = 4;
    uint8 public constant ZONES = 3; // 0 Dermaga, 1 Karang, 2 Palung
    uint256 public constant MAX_SELL = 40;
    uint8 public constant MAX_NAME_BYTES = 16;
    uint64 public constant MAX_SESSION = 7 days;
    uint256 public constant SESSION_SHARE_LIMIT = 40; // newest bucket fish shared with a new key
    /// @notice Pak Kumis, the NPC whose bucket anyone can practise on. No key exists for this address.
    address public constant PAK_KUMIS = address(uint160(0xF15A0001));
    uint8 public constant NPC_FISH = 6;

    uint8 public constant ORIGIN_CAST = 0;
    uint8 public constant ORIGIN_SNATCHED = 1;
    uint8 public constant ORIGIN_NPC = 2;

    uint8 public constant STATE_EMBER = 0;
    uint8 public constant STATE_SOLD = 1;
    uint8 public constant STATE_FLEXED = 2;
    uint8 public constant STATE_OFFERED = 3; // reserved for the market
    uint8 public constant STATE_FLEX_PENDING = 4;

    uint8 public constant TIER_SECRET = 4;

    // ---------------------------------------------------------------- storage

    PearlCoin public immutable coin;
    SecretFishNFT public immutable nft;
    SeasonConfig private _cfg;

    euint8 private _secretsLeft;
    bool public seasonEndRequested;
    bool public seasonEnded;
    uint8 public secretsLeftAtEnd;
    uint32 public flexedCount;

    Fish[] private _fish;
    mapping(address => uint256[]) private _fishIds;
    mapping(address => PlayerState) private _players;
    mapping(address => string) public names;
    mapping(address player => Session) private _sessions;
    mapping(address key => address player) public playerOfKey;

    SambarConfig private _sambar;
    mapping(address thief => mapping(address victim => uint64)) public lastPairSnatch;
    uint64 public lastNpcRestock;
    uint8 public npcFresh; // Pak Kumis's fish nobody has targeted yet

    // ---------------------------------------------------------------- events

    event StarterClaimed(address indexed player);
    event NameSet(address indexed player, string name);
    event Cast(address indexed player, uint8 zoneId, uint256 firstFishId);
    event Sold(address indexed player, uint256 count);
    event RodUpgradeRequested(address indexed player, uint8 toLevel, bytes32 paidHandle);
    event RodUpgradeFinalized(address indexed player, uint8 rodLevel, bool paid);
    event FlexRequested(address indexed player, uint256 indexed fishId, bytes32 packedHandle);
    event Flexed(
        address indexed player,
        uint256 indexed fishId,
        uint256 tokenId,
        uint8 species,
        uint8 aura,
        uint8 weight,
        uint32 serial
    );
    event FlexRejected(address indexed player, uint256 indexed fishId);
    event SessionAuthorized(address indexed player, address indexed key, uint64 expiresAt, uint256 sharedFish);
    event SessionRevoked(address indexed player, address indexed key);
    /// @notice Who snatched from whom, which fish was targeted and which record the thief received. Never the result.
    event Snatched(address indexed thief, address indexed victim, uint256 targetFishId, uint256 newFishId);
    event NetSet(address indexed owner);
    event NpcRestocked(address indexed npc, uint256 firstFishId, uint8 count);
    event ShieldBroken(address indexed player);
    event SeasonEndRequested(uint32 season, bytes32 secretsLeftHandle);
    event SeasonEnded(uint32 season, uint8 secretsLeft, uint8 secretsCaught, uint32 secretsFlexed);

    // ---------------------------------------------------------------- errors

    error SeasonClosed();
    error SeasonStillOpen();
    error AlreadyClaimed();
    error BadZone();
    error RodTooWeak(uint8 required);
    error NotYourFish(uint256 fishId);
    error WrongState(uint256 fishId, uint8 state);
    error BadSellCount();
    error UpgradePending();
    error NoUpgradePending();
    error MaxRod();
    error BadName();
    error BadSession();
    error SessionExpired(address key);
    /// @dev 1 thief has not cast enough, 2 thief cooldown, 3 victim has the newcomer shield, 4 pair cooldown,
    ///      5 victim cooldown, 6 victim hourly limit, 7 victim bucket too small, 8 fish not targetable,
    ///      9 cannot snatch from yourself, 10 NPC restock not due
    error SambarBlocked(uint8 reason);

    // ---------------------------------------------------------------- setup

    constructor(PearlCoin coin_, SecretFishNFT nft_, SeasonConfig memory cfg, SambarConfig memory sambar) {
        require(cfg.secretOneIn > 0 && cfg.legendOneIn > 0 && cfg.epicOneIn > 0 && cfg.rareOneIn > 0, "odds");
        require(cfg.endsAt > block.timestamp, "endsAt");
        coin = coin_;
        nft = nft_;
        _cfg = cfg;
        _sambar = sambar;
        _secretsLeft = FHE.asEuint8(cfg.secretQuota);
        FHE.allowThis(_secretsLeft);
    }

    // ---------------------------------------------------------------- player actions

    /// @notice Let `key` play for you until `expiresAt`: cast, sell, upgrade and flex without a wallet popup.
    ///         Fish, coins and NFTs stay yours. The key gets read access to your newest bucket fish and to your
    ///         balance, and any ETH sent along is forwarded to it for gas.
    function authorizeSession(address key, uint64 expiresAt) external payable {
        if (key == address(0) || key == msg.sender || key.code.length != 0) revert BadSession();
        if (playerOfKey[msg.sender] != address(0)) revert BadSession(); // a session key cannot own sessions
        if (expiresAt <= block.timestamp || expiresAt > block.timestamp + MAX_SESSION) revert BadSession();
        address current = playerOfKey[key];
        if (current != address(0) && current != msg.sender) revert BadSession();
        Session storage old = _sessions[msg.sender];
        if (old.key != address(0) && old.key != key) delete playerOfKey[old.key];
        _sessions[msg.sender] = Session({key: key, expiresAt: expiresAt});
        playerOfKey[key] = msg.sender;

        uint256 shared = _shareBucket(msg.sender, key);
        coin.shareBalance(msg.sender, key);
        if (msg.value > 0) {
            (bool ok, ) = key.call{value: msg.value}("");
            require(ok, "gas forward failed");
        }
        emit SessionAuthorized(msg.sender, key, expiresAt, shared);
    }

    function revokeSession() external {
        Session memory sn = _sessions[msg.sender];
        if (sn.key == address(0)) revert BadSession();
        delete playerOfKey[sn.key];
        delete _sessions[msg.sender];
        emit SessionRevoked(msg.sender, sn.key);
    }

    function claimStarter() external {
        address who = _actor();
        PlayerState storage p = _players[who];
        if (p.starterClaimed) revert AlreadyClaimed();
        p.starterClaimed = true;
        euint64 amount = FHE.asEuint64(_cfg.starterAmount);
        FHE.allowTransient(amount, address(coin));
        coin.mint(who, amount);
        emit StarterClaimed(who);
    }

    function setName(string calldata name) external {
        uint256 len = bytes(name).length;
        if (len == 0 || len > MAX_NAME_BYTES) revert BadName();
        address who = _actor();
        names[who] = name;
        emit NameSet(who, name);
    }

    /// @notice Pay one bait and roll five encrypted fish. A short balance does not revert: the five fish become
    ///         Sandal Jepit, so the transaction never reveals whether the player could pay.
    function cast(uint8 zoneId) external returns (uint256 first) {
        _requireOpen();
        if (zoneId >= ZONES) revert BadZone();
        address who = _actor();
        PlayerState storage p = _players[who];
        uint8 required = zoneMinRod(zoneId);
        if (p.rodLevel < required) revert RodTooWeak(required);
        Odds memory o = oddsFor(p.rodLevel, zoneId);

        ebool paid = _charge(who, _cfg.baitPrice);
        (euint32[5] memory r, ebool[5] memory secret) = _rollSecrets(o.secret, paid);
        first = _fish.length;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            _rollFish(o, r[i], secret[i], paid, who, msg.sender != who ? msg.sender : address(0), ORIGIN_CAST);
        }
        p.castCount += 1;
        p.emberCount += FISH_PER_CAST;
        emit Cast(who, zoneId, first);
    }

    /// @notice Sell fish from your bucket. The payout is the encrypted sum of their prices; nobody sees it.
    ///         Secret fish are priced at 0 and must not be sold (the app never offers it).
    function sell(uint256[] calldata fishIds) external {
        uint256 count = fishIds.length;
        if (count == 0 || count > MAX_SELL) revert BadSellCount();
        address who = _actor();
        euint64[] memory vals = new euint64[](count);
        for (uint256 i = 0; i < count; i++) {
            Fish storage f = _ownedFish(fishIds[i], who);
            if (f.state != STATE_EMBER) revert WrongState(fishIds[i], f.state);
            f.state = STATE_SOLD;
            vals[i] = f.price;
        }
        // pairwise reduction: depth log2(count) instead of count
        uint256 n = count;
        while (n > 1) {
            uint256 half = n / 2;
            for (uint256 i = 0; i < half; i++) vals[i] = FHE.add(vals[2 * i], vals[2 * i + 1]);
            if (n % 2 == 1) vals[half] = vals[n - 1];
            n = half + (n % 2);
        }
        FHE.allowTransient(vals[0], address(coin));
        coin.mint(who, vals[0]);
        _players[who].emberCount -= uint32(count);
        emit Sold(who, count);
    }

    /// @notice Step 1 of a rod upgrade: pay under encryption, then the "paid" bit is opened for public decryption.
    function requestRodUpgrade() external {
        address who = _actor();
        PlayerState storage p = _players[who];
        if (p.upgradePending) revert UpgradePending();
        if (p.rodLevel >= MAX_ROD_LEVEL) revert MaxRod();
        ebool paid = _charge(who, _cfg.rodPrices[p.rodLevel]);
        FHE.allowThis(paid);
        FHE.makePubliclyDecryptable(paid);
        p.upgradePending = true;
        p.upgradePaid = paid;
        emit RodUpgradeRequested(who, p.rodLevel + 1, FHE.toBytes32(paid));
    }

    /// @notice Step 2 (anyone can submit): verify the KMS-signed "paid" bit and raise the public rod level if paid.
    function finalizeRodUpgrade(address who, bytes calldata cleartexts, bytes calldata proof) external {
        PlayerState storage p = _players[who];
        if (!p.upgradePending) revert NoUpgradePending();
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(p.upgradePaid);
        FHE.checkSignatures(handles, cleartexts, proof);
        bool paid = abi.decode(cleartexts, (bool));
        p.upgradePending = false;
        if (paid) p.rodLevel += 1;
        emit RodUpgradeFinalized(who, p.rodLevel, paid);
    }

    /// @notice Step 1 of showing off a fish: its packed attributes become publicly decryptable.
    function flex(uint256 fishId) external {
        address who = _actor();
        Fish storage f = _ownedFish(fishId, who);
        if (f.state != STATE_EMBER) revert WrongState(fishId, f.state);
        f.state = STATE_FLEX_PENDING;
        _players[who].emberCount -= 1;
        FHE.makePubliclyDecryptable(f.packed);
        emit FlexRequested(who, fishId, FHE.toBytes32(f.packed));
    }

    /// @notice Step 2 (anyone can submit): verify the KMS proof. A Secret becomes a 1-of-1 NFT and goes to the
    ///         Public Aquarium; anything else goes back to the bucket.
    function finalizeFlex(uint256 fishId, bytes calldata cleartexts, bytes calldata proof) external {
        Fish storage f = _fish[fishId];
        if (f.state != STATE_FLEX_PENDING) revert WrongState(fishId, f.state);
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(f.packed);
        FHE.checkSignatures(handles, cleartexts, proof);
        uint256 v = abi.decode(cleartexts, (uint256));

        if (v & 7 != TIER_SECRET) {
            f.state = STATE_EMBER;
            _players[f.owner].emberCount += 1;
            emit FlexRejected(f.owner, fishId);
            return;
        }
        f.state = STATE_FLEXED;
        _mintSecret(f, fishId, v);
    }

    function _mintSecret(Fish storage f, uint256 fishId, uint256 v) private {
        SecretFishNFT.Meta memory m = SecretFishNFT.Meta({
            fishId: fishId,
            season: f.season,
            serial: ++flexedCount,
            species: uint8((v >> 3) & 3),
            aura: uint8((v >> 5) & 1),
            weight: uint8((v >> 8) & 255)
        });
        uint256 tokenId = nft.mint(f.owner, m);
        emit Flexed(f.owner, fishId, tokenId, m.species, m.aura, m.weight, m.serial);
    }

    // ---------------------------------------------------------------- Sambar Ember

    /// @notice Pay a bait and blindly snatch one fish from someone's bucket. You always get a sack: the fish, or a
    ///         Sandal Jepit if the slot was guarded by the owner's hidden net, was a Secret (immune), or you could not
    ///         pay. Nobody but you learns which; the owner learns only about their own slot.
    function snatch(address victim, uint256 fishId) external returns (uint256 newFishId) {
        _requireOpen();
        address thief = _actor();
        Fish storage f = _checkSnatch(thief, victim, fishId);
        bool npc = victim == PAK_KUMIS;
        PlayerState storage v = _players[victim];

        ebool paid = _charge(thief, _sambar.snatchBait);
        ebool hit = v.hasNet ? FHE.eq(v.netFish, uint32(fishId)) : FHE.asEbool(false);
        ebool ok = FHE.and(paid, FHE.and(FHE.not(hit), FHE.not(f.isSecret)));

        newFishId = _giveSack(thief, f, ok);
        // the victim's slot keeps its id but holds a Sandal Jepit if the snatch succeeded
        f.packed = FHE.select(ok, FHE.asEuint32(0), f.packed);
        f.price = FHE.select(ok, FHE.asEuint64(0), f.price);
        _grantRead(f.packed, f.price, victim);

        if (!npc) {
            // a caught thief's bait goes to the victim; always minted (often 0) so success and failure look alike
            euint64 reward = FHE.select(FHE.and(paid, hit), FHE.asEuint64(_sambar.snatchBait), FHE.asEuint64(0));
            FHE.allowTransient(reward, address(coin));
            coin.mint(victim, reward);
        }
        emit Snatched(thief, victim, fishId, newFishId);
    }

    /// @notice Hide your net under one fish id (encrypted input). Any id is allowed, so a net can also be a bluff.
    function setNet(externalEuint32 encFishId, bytes calldata proof) external {
        address who = _actor();
        euint32 id = FHE.fromExternal(encFishId, proof);
        ebool paid = _charge(who, _sambar.netCost);
        PlayerState storage p = _players[who];
        euint32 previous = p.hasNet ? p.netFish : FHE.asEuint32(type(uint32).max);
        p.netFish = FHE.select(paid, id, previous);
        p.hasNet = true;
        FHE.allowThis(p.netFish);
        FHE.allow(p.netFish, who);
        emit NetSet(who);
    }

    /// @notice Refill Pak Kumis's practice bucket (anyone can call when it runs low): six fish from the Dermaga
    ///         table without Secrets, and a net hidden by on-chain randomness.
    function restockNpc() external returns (uint256 first) {
        _requireOpen();
        if (npcFresh >= 3 || block.timestamp < lastNpcRestock + _sambar.npcRestockCooldown) revert SambarBlocked(10);
        lastNpcRestock = uint64(block.timestamp);
        Odds memory o = oddsFor(0, 0);
        o.secret = 0; // the NPC never holds Secrets and never touches the quota
        ebool no = FHE.asEbool(false);
        ebool yes = FHE.asEbool(true);
        first = _fish.length;
        for (uint8 i = 0; i < NPC_FISH; i++) {
            _rollFish(o, FHE.randEuint32(), no, yes, PAK_KUMIS, address(0), ORIGIN_NPC);
        }
        PlayerState storage n = _players[PAK_KUMIS];
        n.emberCount += NPC_FISH;
        npcFresh = NPC_FISH;
        // the net lands on one of 8 ids starting at the first new fish: 6 of 8 guard a fish
        n.netFish = FHE.add(FHE.asEuint32(FHE.randEuint8(8)), uint32(first));
        n.hasNet = true;
        FHE.allowThis(n.netFish);
        emit NpcRestocked(PAK_KUMIS, first, NPC_FISH);
    }

    function sambarConfig() external view returns (SambarConfig memory) {
        return _sambar;
    }

    /// @notice After the season closes anyone can open the hidden Secret counter, proving the quota was respected.
    function endSeason() external {
        if (block.timestamp < _cfg.endsAt) revert SeasonStillOpen();
        if (seasonEndRequested) revert SeasonClosed();
        seasonEndRequested = true;
        FHE.makePubliclyDecryptable(_secretsLeft);
        emit SeasonEndRequested(_cfg.number, FHE.toBytes32(_secretsLeft));
    }

    function finalizeSeason(bytes calldata cleartexts, bytes calldata proof) external {
        require(seasonEndRequested && !seasonEnded, "not pending");
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(_secretsLeft);
        FHE.checkSignatures(handles, cleartexts, proof);
        uint8 left = uint8(abi.decode(cleartexts, (uint256)));
        seasonEnded = true;
        secretsLeftAtEnd = left;
        emit SeasonEnded(_cfg.number, left, _cfg.secretQuota - left, flexedCount);
    }

    // ---------------------------------------------------------------- views

    function season() external view returns (SeasonConfig memory) {
        return _cfg;
    }

    function zoneMinRod(uint8 zoneId) public pure returns (uint8) {
        return zoneId == 0 ? 0 : zoneId == 1 ? 2 : 4;
    }

    /// @notice The public odds table as cumulative 32-bit thresholds: a fish is Secret if r < secret,
    ///         Legenda if r < legend, Epik if r < epic, Langka if r < rare, else Biasa.
    function oddsFor(uint8 rodLevel, uint8 zoneId) public view returns (Odds memory o) {
        uint256 range = 2 ** 32;
        uint256 wSecret = range / _cfg.secretOneIn;
        uint256 wLegend = range / _cfg.legendOneIn;
        uint256 wEpic = range / _cfg.epicOneIn;
        uint256 wRare = range / _cfg.rareOneIn;
        uint256 rod = 100 + uint256(rodLevel) * _cfg.rodBonusPct;
        wSecret = (wSecret * rod) / 100;
        wLegend = (wLegend * rod) / 100;
        if (zoneId == 1) {
            uint256 reef = 100 + uint256(_cfg.reefBonusPct);
            wLegend = (wLegend * reef) / 100;
            wEpic = (wEpic * reef) / 100;
            wRare = (wRare * reef) / 100;
        } else if (zoneId == 2) {
            wSecret = (wSecret * (100 + uint256(_cfg.trenchBonusPct))) / 100;
        }
        uint256 cap = range - 1;
        uint256 c = _min(wSecret, cap);
        o.secret = uint32(c);
        c = _min(c + wLegend, cap);
        o.legend = uint32(c);
        c = _min(c + wEpic, cap);
        o.epic = uint32(c);
        c = _min(c + wRare, cap);
        o.rare = uint32(c);
    }

    function sessionOf(address who) external view returns (Session memory) {
        return _sessions[who];
    }

    /// @notice The key currently allowed to play for `who`, or zero. PearlCoin uses it to share balance reads.
    function activeKeyOf(address who) external view returns (address) {
        Session memory sn = _sessions[who];
        return sn.expiresAt > block.timestamp ? sn.key : address(0);
    }

    function player(address who) external view returns (PlayerState memory) {
        return _players[who];
    }

    function fishCount() external view returns (uint256) {
        return _fish.length;
    }

    function getFish(uint256 fishId) external view returns (Fish memory) {
        return _fish[fishId];
    }

    function fishIdsOf(address who) external view returns (uint256[] memory) {
        return _fishIds[who];
    }

    /// @notice Handle of the hidden Secret counter. Only this contract may decrypt it until the season ends.
    function secretsLeftHandle() external view returns (euint8) {
        return _secretsLeft;
    }

    // ---------------------------------------------------------------- internals

    function _requireOpen() private view {
        if (seasonEndRequested || block.timestamp >= _cfg.endsAt) revert SeasonClosed();
    }

    /// @dev The player this call acts for: the caller, or the player whose session key is the caller.
    ///      An expired key reverts instead of silently acting as its own empty account.
    function _actor() private view returns (address) {
        address owner_ = playerOfKey[msg.sender];
        if (owner_ == address(0)) return msg.sender;
        if (_sessions[owner_].expiresAt <= block.timestamp) revert SessionExpired(msg.sender);
        return owner_;
    }

    /// @dev All public Sambar rules (docs/SAMBAR_EMBER.md §1.2), checked in plaintext so anyone can verify them.
    function _checkSnatch(address thief, address victim, uint256 fishId) private returns (Fish storage f) {
        if (thief == victim) revert SambarBlocked(9);
        SambarConfig memory c = _sambar;
        PlayerState storage t = _players[thief];
        PlayerState storage v = _players[victim];
        uint64 nowTs = uint64(block.timestamp);
        if (t.castCount < c.minThiefCasts) revert SambarBlocked(1);
        if (t.lastSnatchAt != 0 && nowTs < t.lastSnatchAt + c.thiefCooldown) revert SambarBlocked(2);
        if (victim != PAK_KUMIS) {
            if (v.castCount < c.shieldCasts && !v.shieldBroken) revert SambarBlocked(3);
            uint64 lastPair = lastPairSnatch[thief][victim];
            if (lastPair != 0 && nowTs < lastPair + c.pairCooldown) revert SambarBlocked(4);
            if (v.lastTargetedAt != 0 && nowTs < v.lastTargetedAt + c.victimCooldown) revert SambarBlocked(5);
            if (nowTs >= v.windowStart + 1 hours) {
                v.windowStart = nowTs;
                v.targetedInWindow = 0;
            }
            if (v.targetedInWindow >= c.maxTargetedPerHour) revert SambarBlocked(6);
            if (v.emberCount < c.minEmber) revert SambarBlocked(7);
            lastPairSnatch[thief][victim] = nowTs;
            v.lastTargetedAt = nowTs;
            v.targetedInWindow += 1;
            if (!t.shieldBroken && t.castCount < c.shieldCasts) emit ShieldBroken(thief);
            t.shieldBroken = true;
        }
        f = _fish[fishId];
        if (f.owner != victim || f.state != STATE_EMBER || f.targeted || nowTs < f.caughtAt + c.wetSeconds) {
            revert SambarBlocked(8);
        }
        f.targeted = true;
        if (victim == PAK_KUMIS) npcFresh -= 1;
        t.lastSnatchAt = nowTs;
    }

    /// @dev The thief's new record: the snatched fish if `ok`, otherwise a Sandal Jepit. Always created.
    function _giveSack(address thief, Fish storage f, ebool ok) private returns (uint256 id) {
        euint32 packed = FHE.select(ok, f.packed, FHE.asEuint32(0));
        euint64 price = FHE.select(ok, f.price, FHE.asEuint64(0));
        _grantRead(packed, price, thief);
        if (msg.sender != thief) {
            FHE.allow(packed, msg.sender);
            FHE.allow(price, msg.sender);
        }
        ebool notSecret = FHE.asEbool(false);
        FHE.allowThis(notSecret);
        id = _fish.length;
        _fishIds[thief].push(id);
        _fish.push(
            Fish({
                owner: thief,
                season: _cfg.number,
                caughtAt: uint64(block.timestamp),
                packed: packed,
                price: price,
                isSecret: notSecret,
                state: STATE_EMBER,
                origin: ORIGIN_SNATCHED,
                targeted: false
            })
        );
        _players[thief].emberCount += 1;
    }

    /// @dev This contract, the owner and the owner's live session key may read a fish record.
    function _grantRead(euint32 packed, euint64 price, address owner_) private {
        FHE.allowThis(packed);
        FHE.allowThis(price);
        FHE.allow(packed, owner_);
        FHE.allow(price, owner_);
        Session memory sn = _sessions[owner_];
        if (sn.key != address(0) && sn.expiresAt > block.timestamp) {
            FHE.allow(packed, sn.key);
            FHE.allow(price, sn.key);
        }
    }

    function _ownedFish(uint256 fishId, address who) private view returns (Fish storage f) {
        f = _fish[fishId];
        if (f.owner != who) revert NotYourFish(fishId);
    }

    /// @dev Give a new session key read access to the newest fish still in the bucket (bounded for gas).
    function _shareBucket(address who, address key) private returns (uint256 shared) {
        uint256[] storage ids = _fishIds[who];
        for (uint256 i = ids.length; i > 0 && shared < SESSION_SHARE_LIMIT; i--) {
            Fish storage f = _fish[ids[i - 1]];
            if (f.state != STATE_EMBER && f.state != STATE_FLEX_PENDING) continue;
            FHE.allow(f.packed, key);
            FHE.allow(f.price, key);
            shared++;
        }
    }

/// @dev Five random draws and which of them may become Secret, enforcing the hidden quota under encryption.
    ///      A tree sum keeps the sequential FHE depth low (SPIKE_LOG S7, S17); if the batch would overflow the quota,
    ///      none of its Secret rolls count and they fall back to Legenda.
    function _rollSecrets(uint32 secretThreshold, ebool paid) private returns (euint32[5] memory r, ebool[5] memory secret) {
        ebool allowed = FHE.and(FHE.gt(_secretsLeft, 0), paid);
        euint8[5] memory ones;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            r[i] = FHE.randEuint32();
            secret[i] = FHE.and(FHE.lt(r[i], secretThreshold), allowed);
            ones[i] = FHE.select(secret[i], FHE.asEuint8(1), FHE.asEuint8(0));
        }
        euint8 n = FHE.add(FHE.add(FHE.add(ones[0], ones[1]), FHE.add(ones[2], ones[3])), ones[4]);
        ebool overflow = FHE.gt(n, _secretsLeft);
        _secretsLeft = FHE.select(overflow, _secretsLeft, FHE.sub(_secretsLeft, n));
        FHE.allowThis(_secretsLeft);
        ebool keep = FHE.not(overflow);
        for (uint8 i = 0; i < FISH_PER_CAST; i++) secret[i] = FHE.and(secret[i], keep);
    }

        /// @dev Burns `amount` coins; returns an encrypted "paid in full" bit instead of reverting on a short balance.
    function _charge(address from, uint64 amount) private returns (ebool paid) {
        euint64 a = FHE.asEuint64(amount);
        FHE.allowTransient(a, address(coin));
        euint64 burned = coin.burn(from, a);
        paid = FHE.eq(burned, amount);
    }

    function _rollFish(
        Odds memory o,
        euint32 r,
        ebool isSecret,
        ebool paid,
        address who,
        address reader,
        uint8 origin
    ) private {
        (euint32 packed, euint64 price) = _rollAttributes(o, r, isSecret, paid);
        _storeFish(packed, price, isSecret, who, reader, origin);
    }

    /// @dev Tier, species, weight, aura and sale price of one fish, all under encryption.
    function _rollAttributes(
        Odds memory o,
        euint32 r,
        ebool isSecret,
        ebool paid
    ) private returns (euint32 packed, euint64 price) {
        ebool isLegend = FHE.lt(r, o.legend);
        ebool isEpic = FHE.lt(r, o.epic);
        ebool isRare = FHE.lt(r, o.rare);
        // a Secret roll over quota keeps tier Legenda because o.secret < o.legend
        euint8 tier = FHE.select(isRare, FHE.asEuint8(1), FHE.asEuint8(0));
        tier = FHE.select(isEpic, FHE.asEuint8(2), tier);
        tier = FHE.select(isLegend, FHE.asEuint8(3), tier);
        tier = FHE.select(isSecret, FHE.asEuint8(TIER_SECRET), tier);

        euint8 weight = FHE.randEuint8();
        ebool aura = FHE.lt(FHE.randEuint8(), 16);
        euint8 species = FHE.select(isSecret, FHE.randEuint8(2), FHE.randEuint8(4));

        packed = FHE.asEuint32(tier);
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(species), 3));
        packed = FHE.or(packed, FHE.select(aura, FHE.asEuint32(32), FHE.asEuint32(0)));
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(weight), 8));
        packed = FHE.or(packed, uint32(1) << 16);
        packed = FHE.select(paid, packed, FHE.asEuint32(0));

        price = _price(isRare, isEpic, isLegend, isSecret, aura, weight);
        price = FHE.select(paid, price, FHE.asEuint64(0));
    }

    function _storeFish(
        euint32 packed,
        euint64 price,
        ebool isSecret,
        address who,
        address reader,
        uint8 origin
    ) private {
        FHE.allowThis(packed);
        FHE.allow(packed, who);
        FHE.allowThis(price);
        FHE.allow(price, who);
        FHE.allowThis(isSecret);
        FHE.allow(isSecret, who);
        if (reader != address(0)) {
            // a session key cast this: let it read the catch (the tier inside `packed` already says Secret or not;
            // every extra ACL entry is a new storage slot, which is expensive on Sepolia today)
            FHE.allow(packed, reader);
            FHE.allow(price, reader);
        }

        _fishIds[who].push(_fish.length);
        _fish.push(
            Fish({
                owner: who,
                season: _cfg.number,
                caughtAt: uint64(block.timestamp),
                packed: packed,
                price: price,
                isSecret: isSecret,
                state: STATE_EMBER,
                origin: origin,
                targeted: false
            })
        );
    }

    /// @dev Biasa 2, Langka 8, Epik 30, Legenda 150, plus weight; aura doubles; Secret is never sold (0).
    function _price(
        ebool isRare,
        ebool isEpic,
        ebool isLegend,
        ebool isSecret,
        ebool aura,
        euint8 weight
    ) private returns (euint64 price) {
        price = FHE.select(isRare, FHE.asEuint64(8), FHE.asEuint64(2));
        price = FHE.select(isEpic, FHE.asEuint64(30), price);
        price = FHE.select(isLegend, FHE.asEuint64(150), price);
        price = FHE.add(price, FHE.asEuint64(weight));
        price = FHE.select(aura, FHE.shl(price, 1), price);
        price = FHE.select(isSecret, FHE.asEuint64(0), price);
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}

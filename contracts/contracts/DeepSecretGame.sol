// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, ebool, euint8, euint32, euint64} from "@fhevm/solidity/lib/FHE.sol";
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

    // ---------------------------------------------------------------- setup

    constructor(PearlCoin coin_, SecretFishNFT nft_, SeasonConfig memory cfg) {
        require(cfg.secretOneIn > 0 && cfg.legendOneIn > 0 && cfg.epicOneIn > 0 && cfg.rareOneIn > 0, "odds");
        require(cfg.endsAt > block.timestamp, "endsAt");
        coin = coin_;
        nft = nft_;
        _cfg = cfg;
        _secretsLeft = FHE.asEuint8(cfg.secretQuota);
        FHE.allowThis(_secretsLeft);
    }

    // ---------------------------------------------------------------- player actions

    function claimStarter() external {
        PlayerState storage p = _players[msg.sender];
        if (p.starterClaimed) revert AlreadyClaimed();
        p.starterClaimed = true;
        euint64 amount = FHE.asEuint64(_cfg.starterAmount);
        FHE.allowTransient(amount, address(coin));
        coin.mint(msg.sender, amount);
        emit StarterClaimed(msg.sender);
    }

    function setName(string calldata name) external {
        uint256 len = bytes(name).length;
        if (len == 0 || len > MAX_NAME_BYTES) revert BadName();
        names[msg.sender] = name;
        emit NameSet(msg.sender, name);
    }

    /// @notice Pay one bait and roll five encrypted fish. A short balance does not revert: the five fish become
    ///         Sandal Jepit, so the transaction never reveals whether the player could pay.
    function cast(uint8 zoneId) external returns (uint256 first) {
        _requireOpen();
        if (zoneId >= ZONES) revert BadZone();
        PlayerState storage p = _players[msg.sender];
        uint8 required = zoneMinRod(zoneId);
        if (p.rodLevel < required) revert RodTooWeak(required);
        Odds memory o = oddsFor(p.rodLevel, zoneId);

        ebool paid = _charge(msg.sender, _cfg.baitPrice);
        ebool allowed = FHE.and(FHE.gt(_secretsLeft, 0), paid);

        euint32[5] memory r;
        ebool[5] memory wantsSecret;
        euint8[5] memory ones;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            r[i] = FHE.randEuint32();
            wantsSecret[i] = FHE.and(FHE.lt(r[i], o.secret), allowed);
            ones[i] = FHE.select(wantsSecret[i], FHE.asEuint8(1), FHE.asEuint8(0));
        }
        // tree sum keeps the sequential FHE depth low (SPIKE_LOG S7, S17)
        euint8 n = FHE.add(FHE.add(FHE.add(ones[0], ones[1]), FHE.add(ones[2], ones[3])), ones[4]);
        ebool overflow = FHE.gt(n, _secretsLeft);
        _secretsLeft = FHE.select(overflow, _secretsLeft, FHE.sub(_secretsLeft, n));
        FHE.allowThis(_secretsLeft);
        ebool keep = FHE.not(overflow);

        first = _fish.length;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            _rollFish(o, r[i], FHE.and(wantsSecret[i], keep), paid);
        }
        p.castCount += 1;
        p.emberCount += FISH_PER_CAST;
        emit Cast(msg.sender, zoneId, first);
    }

    /// @notice Sell fish from your bucket. The payout is the encrypted sum of their prices; nobody sees it.
    ///         Secret fish are priced at 0 and must not be sold (the app never offers it).
    function sell(uint256[] calldata fishIds) external {
        uint256 count = fishIds.length;
        if (count == 0 || count > MAX_SELL) revert BadSellCount();
        euint64[] memory vals = new euint64[](count);
        for (uint256 i = 0; i < count; i++) {
            Fish storage f = _ownedFish(fishIds[i]);
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
        coin.mint(msg.sender, vals[0]);
        _players[msg.sender].emberCount -= uint32(count);
        emit Sold(msg.sender, count);
    }

    /// @notice Step 1 of a rod upgrade: pay under encryption, then the "paid" bit is opened for public decryption.
    function requestRodUpgrade() external {
        PlayerState storage p = _players[msg.sender];
        if (p.upgradePending) revert UpgradePending();
        if (p.rodLevel >= MAX_ROD_LEVEL) revert MaxRod();
        ebool paid = _charge(msg.sender, _cfg.rodPrices[p.rodLevel]);
        FHE.allowThis(paid);
        FHE.makePubliclyDecryptable(paid);
        p.upgradePending = true;
        p.upgradePaid = paid;
        emit RodUpgradeRequested(msg.sender, p.rodLevel + 1, FHE.toBytes32(paid));
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
        Fish storage f = _ownedFish(fishId);
        if (f.state != STATE_EMBER) revert WrongState(fishId, f.state);
        f.state = STATE_FLEX_PENDING;
        _players[msg.sender].emberCount -= 1;
        FHE.makePubliclyDecryptable(f.packed);
        emit FlexRequested(msg.sender, fishId, FHE.toBytes32(f.packed));
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

    function _ownedFish(uint256 fishId) private view returns (Fish storage f) {
        f = _fish[fishId];
        if (f.owner != msg.sender) revert NotYourFish(fishId);
    }

    /// @dev Burns `amount` coins; returns an encrypted "paid in full" bit instead of reverting on a short balance.
    function _charge(address from, uint64 amount) private returns (ebool paid) {
        euint64 a = FHE.asEuint64(amount);
        FHE.allowTransient(a, address(coin));
        euint64 burned = coin.burn(from, a);
        paid = FHE.eq(burned, amount);
    }

    function _rollFish(Odds memory o, euint32 r, ebool isSecret, ebool paid) private {
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

        euint32 packed = FHE.asEuint32(tier);
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(species), 3));
        packed = FHE.or(packed, FHE.select(aura, FHE.asEuint32(32), FHE.asEuint32(0)));
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(weight), 8));
        packed = FHE.or(packed, uint32(1) << 16);
        packed = FHE.select(paid, packed, FHE.asEuint32(0));

        euint64 price = _price(isRare, isEpic, isLegend, isSecret, aura, weight);
        price = FHE.select(paid, price, FHE.asEuint64(0));

        FHE.allowThis(packed);
        FHE.allow(packed, msg.sender);
        FHE.allowThis(price);
        FHE.allow(price, msg.sender);
        FHE.allowThis(isSecret);
        FHE.allow(isSecret, msg.sender);

        _fishIds[msg.sender].push(_fish.length);
        _fish.push(
            Fish({
                owner: msg.sender,
                season: _cfg.number,
                caughtAt: uint64(block.timestamp),
                packed: packed,
                price: price,
                isSecret: isSecret,
                state: STATE_EMBER,
                origin: 0,
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

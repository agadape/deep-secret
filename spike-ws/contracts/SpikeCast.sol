// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, ebool, euint8, euint32, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/// @title SpikePearl — confidential game coin; only the game may mint or burn (spike S18).
contract SpikePearl is ZamaEthereumConfig, ERC7984 {
    address public immutable game;

    constructor(address game_) ERC7984("Mutiara (Spike)", "cMTRspike", "") {
        game = game_;
    }

    modifier onlyGame() {
        require(msg.sender == game, "only game");
        _;
    }

    function mint(address to, euint64 amount) external onlyGame returns (euint64 minted) {
        minted = _mint(to, amount);
        FHE.allowTransient(minted, msg.sender);
    }

    /// @dev Burns `amount` or 0 when the balance is short (no revert), and returns what was burned.
    function burn(address from, euint64 amount) external onlyGame returns (euint64 burned) {
        burned = _burn(from, amount);
        FHE.allowTransient(burned, msg.sender);
    }
}

/// @title SpikeCast — spike S17: one transaction pays bait, rolls 5 encrypted fish and enforces an
/// encrypted per-season Secret quota. Mirrors GAME_SPEC §10.2. Throwaway code.
/// @dev packed layout: tier bits 0-2 | species bits 3-4 | aura bit 5 | weight bits 8-15 | valid bit 16.
///      packed == 0 means "Sandal Jepit" (bait unpaid). Tier: 0 Biasa, 1 Langka, 2 Epik, 3 Legenda, 4 Secret.
contract SpikeCast is ZamaEthereumConfig {
    struct Fish {
        address owner;
        euint32 packed;
        euint64 price;
        ebool isSecret;
    }

    uint8 public constant FISH_PER_CAST = 5;
    uint64 public constant BAIT = 5;

    // Demo-season odds as cumulative 32-bit thresholds: Secret 1/40, Legenda 1/25, Epik 1/8, Langka 1/3.
    uint32 public constant T_SECRET = uint32(uint256(2 ** 32) / 40);
    uint32 public constant T_LEGEND = T_SECRET + uint32(uint256(2 ** 32) / 25);
    uint32 public constant T_EPIC = T_LEGEND + uint32(uint256(2 ** 32) / 8);
    uint32 public constant T_RARE = T_EPIC + uint32(uint256(2 ** 32) / 3);

    SpikePearl public immutable coin;
    uint64 public immutable starterAmount;
    euint8 private _remaining;
    Fish[] private _fish;
    mapping(address => bool) public claimed;

    event Cast(address indexed player, uint256 firstFishId);

    constructor(uint8 quota, uint64 starter) {
        coin = new SpikePearl(address(this));
        starterAmount = starter;
        _remaining = FHE.asEuint8(quota);
        FHE.allowThis(_remaining);
    }

    function claimStarter() external {
        require(!claimed[msg.sender], "already claimed");
        claimed[msg.sender] = true;
        euint64 amount = FHE.asEuint64(starterAmount);
        FHE.allowTransient(amount, address(coin));
        coin.mint(msg.sender, amount);
    }

    function cast() external returns (uint256 first) {
        ebool paid = _payBait();
        ebool allowed = FHE.and(FHE.gt(_remaining, 0), paid);

        euint32[5] memory r;
        ebool[5] memory wantsSecret;
        euint8[5] memory ones;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            r[i] = FHE.randEuint32();
            wantsSecret[i] = FHE.and(FHE.lt(r[i], T_SECRET), allowed);
            ones[i] = FHE.select(wantsSecret[i], FHE.asEuint8(1), FHE.asEuint8(0));
        }
        // tree sum keeps the sequential depth at 3 adds
        euint8 n = FHE.add(FHE.add(FHE.add(ones[0], ones[1]), FHE.add(ones[2], ones[3])), ones[4]);
        ebool overflow = FHE.gt(n, _remaining);
        _remaining = FHE.select(overflow, _remaining, FHE.sub(_remaining, n));
        FHE.allowThis(_remaining);
        ebool keep = FHE.not(overflow);

        first = _fish.length;
        for (uint8 i = 0; i < FISH_PER_CAST; i++) {
            _rollFish(r[i], FHE.and(wantsSecret[i], keep), paid);
        }
        emit Cast(msg.sender, first);
    }

    function _payBait() private returns (ebool paid) {
        euint64 bait = FHE.asEuint64(BAIT);
        FHE.allowTransient(bait, address(coin));
        euint64 burned = coin.burn(msg.sender, bait);
        paid = FHE.eq(burned, BAIT);
    }

    function _rollFish(euint32 r, ebool isSecret, ebool paid) private {
        (euint8 tier, ebool isRare, ebool isEpic, ebool isLegend) = _tier(r, isSecret);
        euint8 weight = FHE.randEuint8();
        ebool aura = FHE.lt(FHE.randEuint8(), 16);
        euint8 species = FHE.select(isSecret, FHE.randEuint8(2), FHE.randEuint8(4));

        euint32 packed = _pack(tier, species, aura, weight);
        packed = FHE.select(paid, packed, FHE.asEuint32(0));

        euint64 price = _price(isRare, isEpic, isLegend, isSecret, aura, weight);
        price = FHE.select(paid, price, FHE.asEuint64(0));

        FHE.allowThis(packed);
        FHE.allow(packed, msg.sender);
        FHE.allowThis(price);
        FHE.allow(price, msg.sender);
        FHE.allowThis(isSecret);
        FHE.allow(isSecret, msg.sender);
        _fish.push(Fish({owner: msg.sender, packed: packed, price: price, isSecret: isSecret}));
    }

    /// A Secret roll that is over quota keeps tier 3 (Legenda) because T_SECRET < T_LEGEND.
    function _tier(
        euint32 r,
        ebool isSecret
    ) private returns (euint8 tier, ebool isRare, ebool isEpic, ebool isLegend) {
        isLegend = FHE.lt(r, T_LEGEND);
        isEpic = FHE.lt(r, T_EPIC);
        isRare = FHE.lt(r, T_RARE);
        tier = FHE.select(isRare, FHE.asEuint8(1), FHE.asEuint8(0));
        tier = FHE.select(isEpic, FHE.asEuint8(2), tier);
        tier = FHE.select(isLegend, FHE.asEuint8(3), tier);
        tier = FHE.select(isSecret, FHE.asEuint8(4), tier);
    }

    function _pack(euint8 tier, euint8 species, ebool aura, euint8 weight) private returns (euint32 packed) {
        packed = FHE.asEuint32(tier);
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(species), 3));
        packed = FHE.or(packed, FHE.select(aura, FHE.asEuint32(32), FHE.asEuint32(0)));
        packed = FHE.or(packed, FHE.shl(FHE.asEuint32(weight), 8));
        packed = FHE.or(packed, uint32(1) << 16);
    }

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

    function fishCount() external view returns (uint256) {
        return _fish.length;
    }

    function getFish(uint256 id) external view returns (address owner, euint32 packed, euint64 price, ebool isSecret) {
        Fish storage f = _fish[id];
        return (f.owner, f.packed, f.price, f.isSecret);
    }

    /// Spike-only: lets the mock debugger read the hidden quota. The real game exposes it only at season end.
    function remainingHandle() external view returns (euint8) {
        return _remaining;
    }
}

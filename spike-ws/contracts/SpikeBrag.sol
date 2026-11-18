// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint16} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SpikeBrag — can a three-card poker hand be dealt, ranked and compared entirely under encryption?
/// @dev Throwaway. Card index c in 0..51, rank = c / 4 (0 = Two … 12 = Ace), suit = c % 4.
contract SpikeBrag is ZamaEthereumConfig {
    struct Hand {
        euint8[3] player;
        euint8[3] dealer;
        ebool dealerPlays;
        ebool playerWins;
        ebool tie;
        bool dealt;
    }

    mapping(address => Hand) private _hands;

    event Dealt(address indexed player);
    event Showdown(address indexed player, bytes32 dealerPlays, bytes32 playerWins, bytes32 tie);

    /// Six distinct cards in one tx; the player may read only their own three.
    function deal() external {
        euint8[6] memory sorted;
        euint8[6] memory drawn;
        for (uint8 i = 0; i < 6; i++) {
            euint8 c = FHE.rem(FHE.randEuint8(), 52 - i);
            for (uint8 j = 0; j < i; j++) {
                c = FHE.add(c, FHE.select(FHE.ge(c, sorted[j]), FHE.asEuint8(1), FHE.asEuint8(0)));
            }
            drawn[i] = c;
            euint8 carry = c;
            for (uint8 j = 0; j < i; j++) {
                euint8 lo = FHE.min(carry, sorted[j]);
                carry = FHE.max(carry, sorted[j]);
                sorted[j] = lo;
            }
            sorted[i] = carry;
        }
        Hand storage h = _hands[msg.sender];
        for (uint8 i = 0; i < 3; i++) {
            h.player[i] = drawn[i];
            h.dealer[i] = drawn[i + 3];
            FHE.allowThis(drawn[i]);
            FHE.allowThis(drawn[i + 3]);
            FHE.allow(drawn[i], msg.sender);
        }
        h.dealt = true;
        emit Dealt(msg.sender);
    }

    /// Rank both hands blind. The dealer "plays" with Queen-high or better, or on a random bluff.
    /// Everything is opened afterwards so the spike can check the circuit against a plain reference.
    function showdown() external {
        Hand storage h = _hands[msg.sender];
        require(h.dealt, "no hand");
        euint16 ps = _score(h.player);
        euint16 ds = _score(h.dealer);
        // Queen-high = category 0, top rank 10 -> 10 << 8
        ebool qualifies = FHE.ge(ds, uint16(10) << 8);
        ebool bluff = FHE.and(FHE.randEbool(), FHE.randEbool()); // 25%
        h.dealerPlays = FHE.or(qualifies, bluff);
        h.playerWins = FHE.gt(ps, ds);
        h.tie = FHE.eq(ps, ds);
        FHE.allowThis(h.dealerPlays);
        FHE.allowThis(h.playerWins);
        FHE.allowThis(h.tie);
        FHE.makePubliclyDecryptable(h.dealerPlays);
        FHE.makePubliclyDecryptable(h.playerWins);
        FHE.makePubliclyDecryptable(h.tie);
        for (uint8 i = 0; i < 3; i++) {
            FHE.makePubliclyDecryptable(h.player[i]);
            FHE.makePubliclyDecryptable(h.dealer[i]);
        }
        h.dealt = false;
        emit Showdown(msg.sender, FHE.toBytes32(h.dealerPlays), FHE.toBytes32(h.playerWins), FHE.toBytes32(h.tie));
    }

    /// score = category << 12 | a << 8 | b << 4 | c, comparable with a single encrypted `gt`.
    /// Categories: 5 straight flush, 4 three of a kind, 3 straight, 2 flush, 1 pair, 0 high card.
    function _score(euint8[3] storage cards) private returns (euint16) {
        (euint8 lo, euint8 mid, euint8 hi) = _sortedRanks(cards);
        ebool flush = FHE.and(
            FHE.eq(FHE.rem(cards[0], 4), FHE.rem(cards[1], 4)),
            FHE.eq(FHE.rem(cards[1], 4), FHE.rem(cards[2], 4))
        );
        ebool pairLow = FHE.eq(lo, mid);
        ebool pair = FHE.or(pairLow, FHE.eq(mid, hi));
        // wheel: Ace-Two-Three
        ebool wheel = FHE.and(FHE.and(FHE.eq(lo, 0), FHE.eq(mid, 1)), FHE.eq(hi, 12));
        euint16 cat = _category(lo, mid, hi, flush, wheel);
        return _pack(cat, lo, mid, hi, pair, pairLow, wheel);
    }

    function _sortedRanks(euint8[3] storage cards) private returns (euint8 lo, euint8 mid, euint8 hi) {
        euint8 r0 = FHE.div(cards[0], 4);
        euint8 r1 = FHE.div(cards[1], 4);
        euint8 r2 = FHE.div(cards[2], 4);
        euint8 a = FHE.min(r0, r1);
        euint8 b = FHE.max(r0, r1);
        lo = FHE.min(a, r2);
        euint8 t = FHE.max(a, r2);
        mid = FHE.min(b, t);
        hi = FHE.max(b, t);
    }

    function _category(euint8 lo, euint8 mid, euint8 hi, ebool flush, ebool wheel) private returns (euint16 cat) {
        ebool pairLow = FHE.eq(lo, mid);
        ebool pairHigh = FHE.eq(mid, hi);
        ebool run = FHE.and(FHE.eq(mid, FHE.add(lo, 1)), FHE.eq(hi, FHE.add(mid, 1)));
        ebool straight = FHE.or(run, wheel);
        cat = FHE.select(FHE.or(pairLow, pairHigh), FHE.asEuint16(1), FHE.asEuint16(0));
        cat = FHE.select(flush, FHE.asEuint16(2), cat);
        cat = FHE.select(straight, FHE.asEuint16(3), cat);
        cat = FHE.select(FHE.and(pairLow, pairHigh), FHE.asEuint16(4), cat);
        cat = FHE.select(FHE.and(straight, flush), FHE.asEuint16(5), cat);
    }

    /// Tie-breakers: a pair leads with the paired rank (always `mid`), then the kicker; a wheel plays Three-high.
    function _pack(
        euint16 cat,
        euint8 lo,
        euint8 mid,
        euint8 hi,
        ebool pair,
        ebool pairLow,
        ebool wheel
    ) private returns (euint16 score) {
        euint8 top = FHE.select(pair, mid, FHE.select(wheel, mid, hi));
        euint8 second = FHE.select(wheel, lo, mid);
        euint8 third = FHE.select(pair, FHE.select(pairLow, hi, lo), FHE.select(wheel, FHE.asEuint8(0), lo));
        score = FHE.shl(cat, 12);
        score = FHE.add(score, FHE.shl(FHE.asEuint16(top), 8));
        score = FHE.add(score, FHE.shl(FHE.asEuint16(second), 4));
        score = FHE.add(score, FHE.asEuint16(third));
    }

    function getPlayerCards(address p) external view returns (euint8[3] memory) {
        return _hands[p].player;
    }

    function getDealerCards(address p) external view returns (euint8[3] memory) {
        return _hands[p].dealer;
    }

    function getResult(address p) external view returns (ebool dealerPlays, ebool playerWins, ebool tie) {
        Hand storage h = _hands[p];
        return (h.dealerPlays, h.playerWins, h.tie);
    }
}

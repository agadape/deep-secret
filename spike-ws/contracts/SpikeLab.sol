// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SpikeLab — throwaway contract proving the FHEVM primitives a confidential game needs.
/// @dev Not production code. Each function isolates one capability so a failure is attributable.
contract SpikeLab is ZamaEthereumConfig {
    uint8 public constant DICE = 5;
    uint8 public constant HAND = 5;

    mapping(address => euint8[5]) private _dice;
    mapping(address => euint8[5]) private _cards;
    mapping(address => euint8) private _guess;
    mapping(address => euint8) private _count;
    mapping(address => ebool) private _hit;
    mapping(address => bool) public finalized;
    mapping(address => bool) public hitClear;
    euint8 private _stressAcc;

    event Rolled(address indexed player);
    event Dealt(address indexed player);
    event Settled(address indexed player, bytes32 hitHandle);
    event Finalized(address indexed player, bool hit);

    // S2 — encrypted on-chain randomness, non power-of-two range, readable only by the roller.
    function roll() external {
        for (uint8 i = 0; i < DICE; i++) {
            euint8 d = FHE.add(FHE.rem(FHE.randEuint8(), 6), 1);
            _dice[msg.sender][i] = d;
            FHE.allowThis(d);
            FHE.allow(d, msg.sender);
        }
        finalized[msg.sender] = false;
        emit Rolled(msg.sender);
    }

    function getDice(address player) external view returns (euint8[5] memory) {
        return _dice[player];
    }

    // S3 — encrypted player input with proof.
    function submitGuess(externalEuint8 input, bytes calldata proof) external {
        euint8 g = FHE.fromExternal(input, proof);
        _guess[msg.sender] = g;
        FHE.allowThis(g);
        FHE.allow(g, msg.sender);
    }

    // S4 — blind computation over hidden state; only one bit is opened to the public.
    function settle() external {
        euint8 g = _guess[msg.sender];
        euint8 count = FHE.asEuint8(0);
        for (uint8 i = 0; i < DICE; i++) {
            ebool same = FHE.eq(_dice[msg.sender][i], g);
            count = FHE.add(count, FHE.select(same, FHE.asEuint8(1), FHE.asEuint8(0)));
        }
        ebool hit = FHE.ge(count, 2);
        _count[msg.sender] = count;
        _hit[msg.sender] = hit;
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
        FHE.allowThis(hit);
        FHE.makePubliclyDecryptable(hit);
        emit Settled(msg.sender, FHE.toBytes32(hit));
    }

    function getCount(address player) external view returns (euint8) {
        return _count[player];
    }

    function getHit(address player) external view returns (ebool) {
        return _hit[player];
    }

    // S5 — anyone submits the KMS-signed cleartext; the contract verifies it before acting on it.
    function finalize(address player, bool clearHit, bytes calldata decryptionProof) external {
        require(!finalized[player], "already finalized");
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(_hit[player]);
        FHE.checkSignatures(handles, abi.encode(clearHit), decryptionProof);
        finalized[player] = true;
        hitClear[player] = clearHit;
        emit Finalized(player, clearHit);
    }

    // S6 — deal HAND distinct cards from 52 without replacement, entirely encrypted.
    // Draw r_i uniformly in [0, 52-i) then shift it past every earlier card (kept sorted ascending).
    function dealDistinct() external {
        euint8[5] memory sorted;
        for (uint8 i = 0; i < HAND; i++) {
            // rand over 256 then rem (52-i): bias < 1/256*... acceptable for a spike, measured not assumed
            euint8 c = FHE.rem(FHE.randEuint8(), 52 - i);
            for (uint8 j = 0; j < i; j++) {
                c = FHE.add(c, FHE.select(FHE.ge(c, sorted[j]), FHE.asEuint8(1), FHE.asEuint8(0)));
            }
            // insertion into the sorted prefix
            euint8 carry = c;
            for (uint8 j = 0; j < i; j++) {
                ebool lt = FHE.lt(carry, sorted[j]);
                euint8 lo = FHE.select(lt, carry, sorted[j]);
                euint8 hi = FHE.select(lt, sorted[j], carry);
                sorted[j] = lo;
                carry = hi;
            }
            sorted[i] = carry;
        }
        for (uint8 i = 0; i < HAND; i++) {
            _cards[msg.sender][i] = sorted[i];
            FHE.allowThis(sorted[i]);
            FHE.allow(sorted[i], msg.sender);
        }
        emit Dealt(msg.sender);
    }

    function getCards(address player) external view returns (euint8[5] memory) {
        return _cards[player];
    }

    // S7 — probe the per-transaction HCU ceiling with n rounds of eq + select + add on euint8.
    function stress(uint16 n) external {
        euint8 acc = FHE.asEuint8(1);
        euint8 probe = FHE.randEuint8();
        for (uint16 i = 0; i < n; i++) {
            ebool e = FHE.eq(probe, acc);
            acc = FHE.add(acc, FHE.select(e, FHE.asEuint8(2), FHE.asEuint8(1)));
        }
        _stressAcc = acc;
        FHE.allowThis(acc);
        FHE.allow(acc, msg.sender);
    }

    function getStress() external view returns (euint8) {
        return _stressAcc;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC7984} from "@openzeppelin/confidential-contracts/interfaces/IERC7984.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {ERC7984ERC20Wrapper} from "@openzeppelin/confidential-contracts/token/ERC7984/extensions/ERC7984ERC20Wrapper.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title SpikePot — proves a game contract can take ERC-7984 stakes and pay a winner, all encrypted.
/// @dev Throwaway. No access control on payout on purpose.
contract SpikePot is ZamaEthereumConfig {
    IERC7984 public immutable token;
    mapping(address => euint64) private _staked;
    euint64 private _pot;

    event Staked(address indexed player);
    event Paid(address indexed winner);

    constructor(IERC7984 token_) {
        token = token_;
    }

    /// Public ante, encrypted transfer. Player must have called token.setOperator(this, until).
    function stakeFixed(uint64 amount) external {
        _pull(FHE.asEuint64(amount));
    }

    /// Hidden stake size.
    function stakeHidden(externalEuint64 enc, bytes calldata proof) external {
        _pull(FHE.fromExternal(enc, proof));
    }

    function _pull(euint64 amount) private {
        FHE.allowTransient(amount, address(token));
        // `got` is 0 (not a revert) when the player's balance is short.
        euint64 got = token.confidentialTransferFrom(msg.sender, address(this), amount);
        euint64 mine = FHE.add(_staked[msg.sender], got);
        _staked[msg.sender] = mine;
        FHE.allowThis(mine);
        FHE.allow(mine, msg.sender);
        _pot = FHE.add(_pot, got);
        FHE.allowThis(_pot);
        emit Staked(msg.sender);
    }

    function stakedOf(address player) external view returns (euint64) {
        return _staked[player];
    }

    function payout(address winner) external {
        euint64 pot = _pot;
        FHE.allowTransient(pot, address(token));
        token.confidentialTransfer(winner, pot);
        _pot = FHE.asEuint64(0);
        FHE.allowThis(_pot);
        emit Paid(winner);
    }
}

/// Local stand-ins for Sepolia's USDTMock / cUSDTMock (0xa7dA…e9b0 / 0x4E7B…4491).
contract LocalUSDT is ERC20 {
    constructor() ERC20("Tether USD (Local)", "USDTLocal") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract LocalCUSDT is ZamaEthereumConfig, ERC7984ERC20Wrapper {
    constructor(IERC20 underlying_) ERC7984("Confidential USDT (Local)", "cUSDTLocal", "") ERC7984ERC20Wrapper(underlying_) {}
}

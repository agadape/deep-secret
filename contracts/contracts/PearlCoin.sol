// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Minimal view of the game's session directory.
interface ISessionDirectory {
    function activeKeyOf(address player) external view returns (address);
}

/// @title PearlCoin — Deep Secret's in-game currency ("Koin Mutiara").
/// @notice ERC-7984 confidential token: every balance and amount is encrypted and readable only by its holder.
///         Only the game contract can mint (sell catches, starter pack) or burn (bait, rod upgrades).
contract PearlCoin is ZamaEthereumConfig, ERC7984, Ownable {
    address public game;

    event GameSet(address indexed game);

    error OnlyGame();
    error GameAlreadySet();

    constructor(address owner_) ERC7984("Deep Secret Pearl", "PEARL", "") Ownable(owner_) {}

    modifier onlyGame() {
        if (msg.sender != game) revert OnlyGame();
        _;
    }

    /// @notice One-time wiring to the game contract. There is no way to change it afterwards.
    function setGame(address game_) external onlyOwner {
        if (game != address(0)) revert GameAlreadySet();
        require(game_ != address(0), "zero address");
        game = game_;
        emit GameSet(game_);
    }

    function mint(address to, euint64 amount) external onlyGame returns (euint64 minted) {
        minted = _mint(to, amount);
        FHE.allowTransient(minted, msg.sender);
    }

    /// @dev Burns `amount`, or 0 when the balance is short: ERC-7984 never reverts on a short balance.
    ///      The game compares the returned amount with the price to learn, under encryption, whether it was paid.
    function burn(address from, euint64 amount) external onlyGame returns (euint64 burned) {
        burned = _burn(from, amount);
        FHE.allowTransient(burned, msg.sender);
    }

    /// @notice Lets a player's freshly authorized session key read the current balance.
    function shareBalance(address account, address key) external onlyGame {
        euint64 balance = confidentialBalanceOf(account);
        if (FHE.isInitialized(balance)) FHE.allow(balance, key);
    }

    /// @dev Every new balance handle is also readable by the holder's live session key, so the HUD can show the
    ///      balance without a wallet signature during a session.
    function _update(address from, address to, euint64 amount) internal override returns (euint64 transferred) {
        transferred = super._update(from, to, amount);
        _shareWithSessionKey(from);
        _shareWithSessionKey(to);
    }

    function _shareWithSessionKey(address account) private {
        if (account == address(0) || game == address(0)) return;
        address key = ISessionDirectory(game).activeKeyOf(account);
        if (key != address(0)) FHE.allow(confidentialBalanceOf(account), key);
    }
}

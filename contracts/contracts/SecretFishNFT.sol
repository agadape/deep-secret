// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title SecretFishNFT — 1-of-1 tokens for Secret fish their owners chose to show the world.
/// @notice Minted only by the game after a KMS-verified public decryption of the fish, so every attribute here is
///         provably the one the chain rolled in secret. Metadata lives fully on-chain.
contract SecretFishNFT is ERC721, Ownable {
    struct Meta {
        uint256 fishId;
        uint32 season;
        uint32 serial;
        uint8 species;
        uint8 aura;
        uint8 weight;
    }

    address public game;
    string public imageBaseURI;
    uint256 public totalMinted;
    mapping(uint256 tokenId => Meta) public meta;

    event GameSet(address indexed game);
    event ImageBaseURISet(string uri);

    error OnlyGame();
    error GameAlreadySet();

    constructor(address owner_) ERC721("Deep Secret Fish", "DSFISH") Ownable(owner_) {}

    function setGame(address game_) external onlyOwner {
        if (game != address(0)) revert GameAlreadySet();
        require(game_ != address(0), "zero address");
        game = game_;
        emit GameSet(game_);
    }

    /// @notice Cosmetic only: where the pixel-art images are hosted. Attributes cannot be changed.
    function setImageBaseURI(string calldata uri) external onlyOwner {
        imageBaseURI = uri;
        emit ImageBaseURISet(uri);
    }

    function mint(address to, Meta calldata m) external returns (uint256 tokenId) {
        if (msg.sender != game) revert OnlyGame();
        tokenId = ++totalMinted;
        meta[tokenId] = m;
        _safeMint(to, tokenId);
    }

    function speciesName(uint8 species) public pure returns (string memory) {
        return species == 0 ? "Raja Abyss" : "Ratu Palung";
    }

    function auraName(uint8 aura) public pure returns (string memory) {
        return aura == 0 ? "None" : "Glow";
    }

    // JSON needs double quotes inside the literals.
    // solhint-disable quotes
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Meta memory m = meta[tokenId];
        string memory name = string.concat(
            speciesName(m.species),
            " - Secret #",
            Strings.toString(m.serial),
            " (Season ",
            Strings.toString(m.season),
            ")"
        );
        string memory image = bytes(imageBaseURI).length == 0
            ? ""
            : string.concat(',"image":"', imageBaseURI, "secret-", Strings.toString(m.species), ".png", '"');
        string memory json = string.concat(
            '{"name":"',
            name,
            '","description":"A Secret fish from Deep Secret. Its attributes were rolled under encryption '
            'on-chain and revealed with a verified decryption proof."',
            image,
            ',"attributes":[{"trait_type":"Species","value":"',
            speciesName(m.species),
            '"},{"trait_type":"Weight","value":',
            Strings.toString(m.weight),
            '},{"trait_type":"Aura","value":"',
            auraName(m.aura),
            '"},{"trait_type":"Season","value":',
            Strings.toString(m.season),
            '},{"trait_type":"Serial","value":',
            Strings.toString(m.serial),
            '},{"trait_type":"Fish ID","value":',
            Strings.toString(m.fishId),
            "}]}"
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }
    // solhint-enable quotes
}

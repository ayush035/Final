// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImageNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("ImageNFT", "IMGNFT") {
        _tokenIdCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIdCounter += 1;
        return tokenId;
    }

    function mintMyNFT(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIdCounter += 1;
        return tokenId;
    }
}

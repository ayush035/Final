 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImageNFT {
    string[] private _tokenURIs;
    uint256 private _tokenIdCounter;

    constructor() {
        _tokenIdCounter = 0;
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        _tokenURIs.push(tokenURI);
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(tokenId < _tokenURIs.length, "Token ID does not exist");
        return _tokenURIs[tokenId];
    }

    function getUserNFTs(address owner) public view returns (uint256[] memory) {
        // Implement logic to retrieve NFTs owned by the address
        // ...
    }
}
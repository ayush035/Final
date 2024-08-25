// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/introspection/IERC165.sol";
import "@zetachain/toolkit/contracts/BytesHelperLib.sol";
import "@zetachain/toolkit/contracts/OnlySystem.sol";

contract NFTStaking is zContract, OnlySystem {
    SystemContract public systemContract;
    uint256 public immutable chainID;
    uint256 constant BITCOIN = 18332;

    uint256 public rewardRate = 1;

    error WrongChain(uint256 chainID);
    error UnknownAction(uint8 action);
    error Overflow();
    error Underflow();
    error WrongAmount();
    error NotAuthorized();
    error NoRewardsToClaim();

    struct StakeInfo {
        uint256 tokenId;
        uint256 startTime;
        address owner;
    }

    IERC721 public nftContract;
    mapping(bytes => StakeInfo) public stakes;
    mapping(bytes => bool) public isStaked;

    event Staked(address indexed user, uint256 tokenId, uint256 startTime);
    event Unstaked(address indexed user, uint256 tokenId, uint256 reward);

    constructor(
        address _nftContract,
        uint256 chainID_,
        address systemContractAddress
    ) {
        nftContract = IERC721(_nftContract);
        systemContract = SystemContract(systemContractAddress);
        chainID = chainID_;
    }

    function onCrossChainCall(
        zContext calldata context,
        address, // zrc20
        uint256, // amount
        bytes calldata message
    ) external virtual override onlySystem(systemContract) {
        if (chainID != context.chainID) {
            revert WrongChain(context.chainID);
        }

        uint8 action = chainID == BITCOIN
            ? uint8(message[0])
            : abi.decode(message, (uint8));

        address user = abi.decode(context.origin, (address));

        if (action == 1) {
            (uint256 tokenId) = abi.decode(message[1:], (uint256));
            stake(user, tokenId);
        } else if (action == 2) {
            (uint256 tokenId) = abi.decode(message[1:], (uint256));
            unstake(user, tokenId);
        } else {
            revert UnknownAction(action);
        }
    }

    function stake(address user, uint256 tokenId) internal {
        require(nftContract.ownerOf(tokenId) == user, "You must own the NFT to stake it");
        require(!isStaked[abi.encode(tokenId)], "NFT is already staked");

        nftContract.transferFrom(user, address(this), tokenId);

        bytes memory stakeId = abi.encode(tokenId);
        stakes[stakeId] = StakeInfo({
            tokenId: tokenId,
            startTime: block.timestamp,
            owner: user
        });

        isStaked[stakeId] = true;
        emit Staked(user, tokenId, block.timestamp);
    }

    function unstake(address user, uint256 tokenId) internal {
        bytes memory stakeId = abi.encode(tokenId);
        require(isStaked[stakeId], "NFT is not staked");
        StakeInfo memory stakeInfo = stakes[stakeId];
        require(stakeInfo.owner == user, "You are not the owner of this stake");

        uint256 stakingDuration = block.timestamp - stakeInfo.startTime;
        uint256 reward = calculateReward(stakingDuration);

        // Transfer the reward (to be implemented according to your reward logic)
        // Transfer the NFT back to the user
        nftContract.transferFrom(address(this), user, tokenId);

        delete stakes[stakeId];
        isStaked[stakeId] = false;

        emit Unstaked(user, tokenId, reward);
    }

    function calculateReward(uint256 stakingDuration) internal view returns (uint256) {
        return stakingDuration * rewardRate;
    }
}

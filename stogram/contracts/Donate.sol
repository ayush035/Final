// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import getNFTowner from '.contracts.ImageNFT'
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract Donation {
    address public targetAddress = getNFTowner; // The address to receive donations
    IERC20 public metisToken;

    // Event to log donations
    event DonationReceived(address donor, uint256 amount);

    constructor(address _metisToken) {
        metisToken = IERC20(_metisToken); // Set the METIS token address
    }

    // Donate METIS to the target address
    function donate(uint256 amountInUnits) external {
        require(amountInUnits > 0, "Amount must be greater than 0");

        // Get the number of decimals for the token (e.g., 18 for METIS)
        uint8 decimals = metisToken.decimals();

        // Convert the input amount to the smallest unit (e.g., METIS has 18 decimals)
        uint256 amount = amountInUnits * 10 ** uint256(decimals);

        // Transfer METIS tokens from the donor to this contract
        require(metisToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Transfer all the tokens from the contract to the target address
        require(metisToken.transfer(targetAddress, amount), "Transfer to target address failed");

        emit DonationReceived(msg.sender, amount); // Emit donation event
    }

    // Get the balance of METIS tokens in the contract
    function contractBalance() external view returns (uint256) {
        return metisToken.balanceOf(address(this));
    }
}

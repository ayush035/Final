// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostDonation {
    address payable public donationAddress;

    event DonationReceived(address indexed donor, uint256 amount);

    constructor(address payable _donationAddress) {
        donationAddress = _donationAddress;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation amount must be greater than zero");
        donationAddress.transfer(msg.value);
        emit DonationReceived(msg.sender, msg.value);
    }

    function setDonationAddress(address payable newAddress) external {
        require(newAddress != address(0), "New address cannot be zero address");
        donationAddress = newAddress;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
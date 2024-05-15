// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract AccountCreation {

    struct Account {
        address owner;
        string username;
        bool exists;
    }

    mapping(address => Account) public accounts;
    mapping(string => address) public usernames;

    event AccountCreated(address indexed owner, string username);

    function createAccount(string memory _username) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(accounts[msg.sender].exists == false, "Account already exists");
        require(usernames[_username] == address(0), "Username is already taken");

        Account storage newAccount = accounts[msg.sender];
        newAccount.owner = msg.sender;
        newAccount.username = _username;
        newAccount.exists = true;

        usernames[_username] = msg.sender;

        emit AccountCreated(msg.sender, _username);
    }

    function getAccount(address _user) public view returns (address owner, string memory username) {
        return (accounts[_user].owner, accounts[_user].username);
    }
}
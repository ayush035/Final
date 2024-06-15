// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UsernameRegistry {
    // Mapping from address to username
    mapping(address => string) public addressToUsername;
    // Mapping from username to address
    mapping(string => address) public usernameToAddress;

    event UsernameMinted(address indexed user, string username);
    event UsernameNotAvailable(address indexed user, string username);

    function mintUsername(string memory _username) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        // Check if the username is already taken
        if (usernameToAddress[_username] != address(0)) {
            emit UsernameNotAvailable(msg.sender, _username);
            return;
        }

        // Assign the username to the caller's address
        addressToUsername[msg.sender] = _username;
        usernameToAddress[_username] = msg.sender;

        emit UsernameMinted(msg.sender, _username);
    }

    function isUsernameAvailable(string memory _username) public view returns (bool) {
        return usernameToAddress[_username] == address(0);
    }

    function getUsername(address _address) public view returns (string memory) {
        return addressToUsername[_address];
    }
}

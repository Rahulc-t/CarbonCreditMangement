// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WalletLogin {
    address public admin;
    mapping(address => bool) public users;
    mapping(address => string) public usernames;

    event UserRegistered(address indexed user, string username);
    event LoginSuccessful(address indexed user);

    constructor() {
        admin = msg.sender;
        users[admin] = true;  // The deployer (admin) is also considered a user
        usernames[admin] = "Admin";  // Set admin's default username
        emit UserRegistered(admin, "Admin");
    }

    // Function for any address to register itself with a username
    function register(string calldata username) external {
        require(!users[msg.sender], "You are already registered");
        require(bytes(username).length > 0, "Username cannot be empty");

        users[msg.sender] = true;
        usernames[msg.sender] = username;

        emit UserRegistered(msg.sender, username);
    }

    // Function to login using the wallet address
    function login() external view returns (string memory) {
        if (msg.sender == admin) {
            return "Logged in as Admin";
        } else if (users[msg.sender]) {
            return string(abi.encodePacked("Logged in as User: ", usernames[msg.sender]));
        } else {
            return "Address not registered";
        }
    }

    // Function to check if a wallet address is a registered user
    function isUser(address user) external view returns (bool) {
        return users[user];
    }

    // Function to get the username of a registered user
    function getUsername(address user) external view returns (string memory) {
        require(users[user], "This address is not a registered user");
        return usernames[user];
    }
}

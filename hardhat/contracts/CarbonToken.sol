// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonToken is ERC20, Ownable {
    struct Certificate {
        string message;
        uint256 timestamp;
        address issuedTo;
    }

    mapping(address => Certificate[]) public certificates;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event CertificateIssued(address indexed to, string message);

    constructor() ERC20("CarbonToken", "CARB") Ownable(msg.sender) {}

    // Function to mint tokens to a specific user (only admin can call)
    function mintTokens(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Function to burn tokens from a user's account (only admin can call)
    function burnTokens(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit TokensBurned(from, amount);
        
        // Issue certificate after burning tokens
        _issueCertificate(from, amount);
    }

    // Internal function to issue a certificate
    function _issueCertificate(address to, uint256 burnedAmount) internal {
        string memory certificateMessage = string(
            abi.encodePacked(
                "Certificate: ",
                "Project approved. ",
                burnedAmount,
                " tokens burned successfully."
            )
        );

        Certificate memory newCertificate = Certificate({
            message: certificateMessage,
            timestamp: block.timestamp,
            issuedTo: to
        });

        certificates[to].push(newCertificate);

        emit CertificateIssued(to, certificateMessage);
    }

    // Function to view certificates of a user
    function getCertificates(address user) external view returns (Certificate[] memory) {
        return certificates[user];
    }
}

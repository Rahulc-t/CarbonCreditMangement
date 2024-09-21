// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importing necessary OpenZeppelin libraries
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ProjectNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter; // Variable to keep track of token IDs

    // Struct to store project information
    struct Project {
        string name;
        string description;
        string ipfsHash; // IPFS Pinata hash for the image
        uint256 price; // Price for the NFT in wei
    }

    // Mapping from token ID to project details and creator
    mapping(uint256 => Project) public projects;
    mapping(uint256 => address) public projectCreators;
    mapping(address => uint256[]) private _ownedTokens; // Mapping to store owned NFTs by address

    // Event to be emitted when a project NFT is created
    event ProjectNFTCreated(uint256 indexed tokenId, address indexed creator, string name, string description, string ipfsHash, uint256 price);

    constructor() ERC721("ProjectNFT", "PNFT") {}

    // Function to create a new Project NFT with IPFS hash for the image
    function createProjectNFT(string memory name, string memory description, string memory ipfsHash, uint256 priceInWei) public returns (uint256) {
        require(bytes(name).length > 0, "Project name is required");
        require(bytes(description).length > 0, "Project description is required");
        require(bytes(ipfsHash).length > 0, "IPFS hash is required");
        require(priceInWei > 0, "Price must be greater than 0 wei");

        _tokenIdCounter++; // Increment the token ID counter
        uint256 newItemId = _tokenIdCounter; // Get the new token ID

        // Mint the NFT to the project creator (msg.sender)
        _safeMint(msg.sender, newItemId);

        // Set the token URI (IPFS Pinata hash)
        _setTokenURI(newItemId, ipfsHash);

        // Store the project details in the struct
        projects[newItemId] = Project(name, description, ipfsHash, priceInWei);

        // Map the NFT to the project creator (msg.sender)
        projectCreators[newItemId] = msg.sender;

        // Add the new token to the creator's list of owned tokens
        _ownedTokens[msg.sender].push(newItemId);

        // Emit the event for NFT creation
        emit ProjectNFTCreated(newItemId, msg.sender, name, description, ipfsHash, priceInWei);

        return newItemId;
    }

    // Function to buy an NFT by its token ID (in wei)
    function buyNFT(uint256 tokenId) public payable {
        require(_tokenIdCounter >= tokenId, "NFT does not exist"); // Check if the token ID is valid
        Project memory project = projects[tokenId];
        require(msg.value >= project.price, "Insufficient Ether sent"); // Check if the sent value is sufficient in wei

        address projectCreator = projectCreators[tokenId];

        // Transfer the NFT to the buyer
        _transfer(projectCreator, msg.sender, tokenId);

        // Transfer Ether (in wei) to the project creator
        payable(projectCreator).transfer(msg.value);

        // Remove the token from the previous owner's list and add it to the new owner's list
        _removeTokenFromOwner(projectCreator, tokenId);
        _ownedTokens[msg.sender].push(tokenId);
    }

    // Function to get the details of a project by its token ID
    function getProjectDetails(uint256 tokenId) public view returns (string memory, string memory, string memory, uint256) {
        require(_tokenIdCounter >= tokenId, "NFT does not exist"); // Check if the token ID is valid
        Project memory project = projects[tokenId];
        return (project.name, project.description, project.ipfsHash, project.price);
    }

    // Function to list all NFTs created with their token IDs
    function listAllNFTs() public view returns (uint256[] memory, Project[] memory) {
        uint256 totalNFTs = _tokenIdCounter;
        uint256[] memory tokenIds = new uint256[](totalNFTs);
        Project[] memory allProjects = new Project[](totalNFTs);

        for (uint256 i = 1; i <= totalNFTs; i++) {
            tokenIds[i - 1] = i;
            allProjects[i - 1] = projects[i];
        }
        
        return (tokenIds, allProjects);
    }

    // Function to get the NFTs owned by a specific address with details
    function getOwnedNFTsWithDetails(address owner) public view returns (Project[] memory) {
        uint256[] memory ownedTokenIds = _ownedTokens[owner];
        Project[] memory ownedProjects = new Project[](ownedTokenIds.length);

        for (uint256 i = 0; i < ownedTokenIds.length; i++) {
            ownedProjects[i] = projects[ownedTokenIds[i]];
        }

        return ownedProjects;
    }

    // Internal function to remove token from owner's list
    function _removeTokenFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage ownedTokens = _ownedTokens[owner];
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (ownedTokens[i] == tokenId) {
                // Move the last token into the place to delete
                ownedTokens[i] = ownedTokens[ownedTokens.length - 1];
                ownedTokens.pop(); // Remove the last token
                break;
            }
        }
    }
}

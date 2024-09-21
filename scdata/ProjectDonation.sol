// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./CarbonToken.sol";

contract ProjectDonation is CarbonToken {
    struct Project {
        string name;
        string website;
        string description;
        uint256 tokenRequired;
        uint256 tokenReceived;
        bool isActive;
        address creator;
    }

    Project[] public projects;

    event ProjectCreated(uint256 indexed projectId, string name, uint256 tokenRequired);
    event DonationReceived(uint256 indexed projectId, address donor, uint256 amount);
    event ProjectFunded(uint256 indexed projectId);

    // Modifier to check if the project is active
    modifier isActiveProject(uint256 projectId) {
        require(projectId < projects.length, "Project does not exist.");
        require(projects[projectId].isActive, "Project is not active.");
        _;
    }

    // Function to create a new project
    function createProject(
        string memory name,
        string memory website,
        string memory description,
        uint256 tokenRequired
    ) external {
        require(tokenRequired > 0, "Token requirement must be greater than zero.");
        
        projects.push(Project({
            name: name,
            website: website,
            description: description,
            tokenRequired: tokenRequired,
            tokenReceived: 0,
            isActive: true,
            creator: msg.sender
        }));

        emit ProjectCreated(projects.length - 1, name, tokenRequired);
    }

    // Function to view all active projects
    function getActiveProjects() external view returns (Project[] memory) {
        uint256 activeCount = 0;

        // Count the number of active projects
        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].isActive) {
                activeCount++;
            }
        }

        // Create an array to store active projects
        Project[] memory activeProjects = new Project[](activeCount);
        uint256 j = 0;

        // Populate the active projects array
        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].isActive) {
                activeProjects[j] = projects[i];
                j++;
            }
        }

        return activeProjects;
    }

    // // Function to donate to a project
    // function donateToProject(uint256 projectId, uint256 amount) external isActiveProject(projectId) {
    //     Project storage project = projects[projectId];

    //     // Ensure the donation does not exceed the required tokens
    //     require(amount > 0, "Donation must be greater than zero.");
    //     require(project.tokenReceived + amount <= project.tokenRequired, "Donation exceeds required amount.");

    //     // Transfer tokens from the donor to this contract
    //     _transfer(msg.sender, address(this), amount);

    //     // Update project token received
    //     project.tokenReceived += amount;

    //     emit DonationReceived(projectId, msg.sender, amount);

    //     // If the project has received the required tokens, mark it as funded
    //     if (project.tokenReceived >= project.tokenRequired) {
    //         project.isActive = false;
    //         emit ProjectFunded(projectId);
    //     }
    // }
    // Function to donate to a project
function donateToProject(uint256 projectId, uint256 amount) external isActiveProject(projectId) {
    Project storage project = projects[projectId];

    // Ensure the donation is greater than zero
    require(amount > 0, "Donation must be greater than zero.");

    uint256 excessAmount = 0;
    uint256 remainingTokensNeeded = project.tokenRequired - project.tokenReceived;

    // If the donation exceeds the required amount, calculate the excess
    if (amount > remainingTokensNeeded) {
        excessAmount = amount - remainingTokensNeeded;
        amount = remainingTokensNeeded; // Only donate the needed amount
    }

    // Transfer the needed amount of tokens from the donor to this contract
    _transfer(msg.sender, address(this), amount);

    // Update project token received
    project.tokenReceived += amount;

    emit DonationReceived(projectId, msg.sender, amount);

    // If the project has received the required tokens, mark it as funded
    if (project.tokenReceived >= project.tokenRequired) {
        project.isActive = false;
        emit ProjectFunded(projectId);
    }

    // Refund the excess amount to the donor, if any
    if (excessAmount > 0) {
        _transfer(address(this), msg.sender, excessAmount);
    }
}


    // Function to get details of a project by its ID
    function getProject(uint256 projectId) external view returns (Project memory) {
        require(projectId < projects.length, "Project does not exist.");
        return projects[projectId];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectSubmission {
    
    // Struct to represent a project
    struct Project {
        address submitter;
        string pinataHash; // Hash of the project PDF stored on IPFS/Pinata
        uint256 carbonTokenAmount; // Amount of carbon tokens requested
        bool approved;
        bool reviewed;
    }

    // State variables
    address public admin;
    Project[] public projects; // Array to store all project submissions

    // Events for logging submission and approval/rejection
    event ProjectSubmitted(address indexed submitter, uint256 projectId, string pinataHash, uint256 carbonTokenAmount);
    event ProjectApproved(uint256 projectId, address indexed submitter, uint256 carbonTokenAmount);
    event ProjectRejected(uint256 projectId, address indexed submitter);

    // Modifier to restrict access to the admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action.");
        _;
    }

    // Constructor to set the admin of the contract
    constructor() {
        admin = msg.sender;
    }

    // Function to submit a new project
    function submitProject(string memory _pinataHash, uint256 _carbonTokenAmount) external {
        require(bytes(_pinataHash).length > 0, "Pinata hash cannot be empty.");
        require(_carbonTokenAmount > 0, "Requested carbon token amount must be greater than 0.");

        // Create a new project
        projects.push(Project({
            submitter: msg.sender,
            pinataHash: _pinataHash,
            carbonTokenAmount: _carbonTokenAmount,
            approved: false,
            reviewed: false
        }));

        // Emit event for the submission
        uint256 projectId = projects.length - 1;
        emit ProjectSubmitted(msg.sender, projectId, _pinataHash, _carbonTokenAmount);
    }

    // Function for the admin to approve a project
    function approveProject(uint256 _projectId) external onlyAdmin {
        require(_projectId < projects.length, "Invalid project ID.");
        Project storage project = projects[_projectId];
        require(!project.reviewed, "Project already reviewed.");

        project.approved = true;
        project.reviewed = true;

        // Emit event for the approval
        emit ProjectApproved(_projectId, project.submitter, project.carbonTokenAmount);
    }

    // Function for the admin to reject a project
    function rejectProject(uint256 _projectId) external onlyAdmin {
        require(_projectId < projects.length, "Invalid project ID.");
        Project storage project = projects[_projectId];
        require(!project.reviewed, "Project already reviewed.");

        project.approved = false;
        project.reviewed = true;

        // Emit event for the rejection
        emit ProjectRejected(_projectId, project.submitter);
    }

    // Function to get the details of a project by ID
    function viewProject(uint256 _projectId) external view returns (address, string memory, uint256, bool, bool) {
        require(_projectId < projects.length, "Invalid project ID.");
        Project memory project = projects[_projectId];
        return (project.submitter, project.pinataHash, project.carbonTokenAmount, project.approved, project.reviewed);
    }

    // Function to view all projects submitted by a particular user
    function viewUserProjects(address _user) external view returns (Project[] memory) {
        uint256 projectCount = 0;

        // Count the number of projects submitted by the user
        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].submitter == _user) {
                projectCount++;
            }
        }

        // Create an array to hold the user's projects
        Project[] memory userProjects = new Project[](projectCount);
        uint256 index = 0;

        // Populate the array with the user's projects
        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].submitter == _user) {
                userProjects[index] = projects[i];
                index++;
            }
        }

        return userProjects;
    }

    // Function to get the total number of projects
    function getProjectCount() external view returns (uint256) {
        return projects.length;
    }

    // Function for the admin to transfer ownership
    function transferOwnership(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero.");
        admin = newAdmin;
    }
}

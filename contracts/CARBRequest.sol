// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarbonTokenApproval {

    // Struct to hold the details of each approval request
    struct Request {
        address requester;
        string pinataHash; // Hash of the PDF stored on IPFS/Pinata
        bool approved;
        bool reviewed;
    }

    // Array to store all requests
    Request[] public requests;

    // Address of the admin who will approve/reject requests
    address public admin;

    // Events for logging request submission and status changes
    event RequestSubmitted(address indexed requester, uint256 requestId, string pinataHash);
    event RequestApproved(uint256 requestId, address indexed requester);
    event RequestRejected(uint256 requestId, address indexed requester);

    // Modifier to ensure only admin can call certain functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }

    // Constructor to initialize the admin
    constructor() {
        admin = msg.sender; // Deployer is the admin
    }

    // Function to submit a request for carbon token approval
    function submitRequest(string memory _pinataHash) external {
        require(bytes(_pinataHash).length > 0, "Pinata hash cannot be empty.");

        // Create a new request
        requests.push(Request({
            requester: msg.sender,
            pinataHash: _pinataHash,
            approved: false,
            reviewed: false
        }));

        // Emit the event for request submission
        uint256 requestId = requests.length - 1;
        emit RequestSubmitted(msg.sender, requestId, _pinataHash);
    }

    // Function to view a request's details by ID
    function viewRequest(uint256 _requestId) external view returns (address, string memory, bool, bool) {
        require(_requestId < requests.length, "Invalid request ID.");
        Request memory req = requests[_requestId];
        return (req.requester, req.pinataHash, req.approved, req.reviewed);
    }

    // Function for admin to approve a request
    function approveRequest(uint256 _requestId) external onlyAdmin {
        require(_requestId < requests.length, "Invalid request ID.");
        Request storage req = requests[_requestId];
        require(!req.reviewed, "Request already reviewed.");

        req.approved = true;
        req.reviewed = true;

        emit RequestApproved(_requestId, req.requester);
    }

    // Function for admin to reject a request
    function rejectRequest(uint256 _requestId) external onlyAdmin {
        require(_requestId < requests.length, "Invalid request ID.");
        Request storage req = requests[_requestId];
        require(!req.reviewed, "Request already reviewed.");

        req.approved = false;
        req.reviewed = true;

        emit RequestRejected(_requestId, req.requester);
    }

    // Function to view all requests for a particular user
    function viewUserRequests(address _user) external view returns (Request[] memory) {
        uint256 requestCount = 0;

        // Count the number of requests made by the user
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].requester == _user) {
                requestCount++;
            }
        }

        // Create an array to hold the user's requests
        Request[] memory userRequests = new Request[](requestCount);
        uint256 index = 0;

        // Populate the array with the user's requests
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].requester == _user) {
                userRequests[index] = requests[i];
                index++;
            }
        }

        return userRequests;
    }

    // Function to get the total number of requests
    function getRequestCount() external view returns (uint256) {
        return requests.length;
    }

    // Function for the admin to transfer ownership to a new admin
    function transferOwnership(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero.");
        admin = newAdmin;
    }
}

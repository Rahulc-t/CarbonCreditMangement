import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CarbonTokenABI from '../scdata/CarbonToken.json'; // ABI for CarbonToken contract
import CarbonTokenApprovalABI from '../scdata/CarbonTokenApproval.json'; // ABI for CarbonTokenApproval contract
import { CarbonTokenCarbonToken, CarbonTokenApprovalCarbonTokenApproval } from '../scdata/deployed_addresses.json'; // Deployed addresses of the contracts

const MintRequests = () => {
  const [provider, setProvider] = useState(null);
  const [carbonTokenContract, setCarbonTokenContract] = useState(null);
  const [approvalContract, setApprovalContract] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tokenAmount, setTokenAmount] = useState({});
  const [loadingRequestId, setLoadingRequestId] = useState(null); // Track loading state per request

  useEffect(() => {
    const loadContracts = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);
          await _provider.send('eth_requestAccounts', []); // Request wallet connection

          const signer = await _provider.getSigner();

          const _carbonTokenContract = new ethers.Contract(CarbonTokenCarbonToken, CarbonTokenABI.abi, signer);
          const _approvalContract = new ethers.Contract(CarbonTokenApprovalCarbonTokenApproval, CarbonTokenApprovalABI.abi, signer);

          setCarbonTokenContract(_carbonTokenContract);
          setApprovalContract(_approvalContract);

          // Load requests
          await loadRequests(_approvalContract);
        } catch (error) {
          console.error('Error loading contracts', error);
        }
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadContracts();
  }, []);

  const loadRequests = async (contract) => {
    try {
      const requestCount = await contract.getRequestCount();
      const requestsArray = [];

      for (let i = 0; i < requestCount; i++) {
        const request = await contract.viewRequest(i);
        requestsArray.push({
          id: i,
          requester: request[0],
          pinataHash: request[1],
          approved: request[2],
          reviewed: request[3],
        });
      }

      // Sort requests: unapproved and unreviewed first
      const sortedRequests = requestsArray.sort((a, b) => {
        if (!a.approved && !a.reviewed) return -1; // a should come before b
        if (a.approved || a.reviewed) return 1; // b should come before a
        return 0;
      });

      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleTokenInput = (id, value) => {
    setTokenAmount((prev) => ({ ...prev, [id]: value }));
  };

  const handleMint = async (requestId, requesterAddress) => {
    const amount = tokenAmount[requestId];

    if (!amount || amount <= 0) {
      alert('Please enter a valid token amount.');
      return;
    }

    try {
      setLoadingRequestId(requestId); // Set loading for the specific request

      // Mint tokens to the requester
      const tx = await carbonTokenContract.mintTokens(requesterAddress, ethers.parseUnits(amount, 18));
      await tx.wait();

      // Approve the request in the approval contract and set approved to true
      await approvalContract.approveRequest(requestId);

      alert('Tokens minted and request approved.');

      // Update the request status locally
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, approved: true, reviewed: true } // Set approved and reviewed to true
            : request
        )
      );

    } catch (error) {
      console.error('Error minting tokens or approving request:', error);
      alert('Error processing the request. Please try again.');
    } finally {
      setLoadingRequestId(null); // Clear loading state after the request is processed
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Carbon Token Requests</h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500">No pending requests at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="mb-4">
                {/* <h2 className="text-lg font-semibold text-gray-700">Request #{request.id}</h2> */}
                <p className="text-sm text-gray-500 break-all"><strong>Requester Address:</strong> {request.requester}</p>
                <p className="text-sm text-gray-500 break-all">
  <strong>Certificate URL:</strong>{" "}
  <a
    href={`https://coral-fancy-badger-36.mypinata.cloud/ipfs/${request.pinataHash}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline"
  >
    https://coral-fancy-badger-36.mypinata.cloud/ipfs/{request.pinataHash}
  </a>
</p>

              </div>

              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${request.approved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    Approved: {request.approved ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${request.reviewed ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                    Reviewed: {request.reviewed ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {!request.approved && !request.reviewed && (
                <>
                  <div className="mb-4">
                    <input
                      type="number"
                      value={tokenAmount[request.id] || ''}
                      onChange={(e) => handleTokenInput(request.id, e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      placeholder="Enter amount of tokens to mint"
                      disabled={loadingRequestId === request.id}
                    />
                  </div>

                  <button
                    onClick={() => handleMint(request.id, request.requester)}
                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out ${loadingRequestId === request.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loadingRequestId === request.id}
                  >
                    {loadingRequestId === request.id ? 'Processing...' : 'Mint Tokens'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MintRequests;

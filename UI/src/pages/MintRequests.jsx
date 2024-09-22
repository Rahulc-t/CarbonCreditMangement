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
  const [loading, setLoading] = useState(false);

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

      // Filter only unreviewed requests
      const unreviewedRequests = requestsArray.filter(request => !request.reviewed);
      setRequests(unreviewedRequests);
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
      setLoading(true);

      // Mint tokens to the requester
      const tx = await carbonTokenContract.mintTokens(requesterAddress, ethers.parseUnits(amount, 18));
      await tx.wait();

      // Approve the request in the approval contract
      await approvalContract.approveRequest(requestId);

      alert('Tokens minted and request approved.');

      // Reload requests
      await loadRequests(approvalContract);
    } catch (error) {
      console.error('Error minting tokens or approving request:', error);
      alert('Error processing the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Token Requests</h1>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border p-4 rounded shadow-lg">
              <p><strong>Requester Address:</strong> {request.requester}</p>
              <p><strong>Pinata IPFS Hash:</strong> {request.pinataHash}</p>
              <p><strong>Approved:</strong> {request.approved ? 'Yes' : 'No'}</p>
              <p><strong>Reviewed:</strong> {request.reviewed ? 'Yes' : 'No'}</p>

              <div className="mt-2">
                <input
                  type="number"
                  value={tokenAmount[request.id] || ''}
                  onChange={(e) => handleTokenInput(request.id, e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter amount of tokens to mint"
                />
              </div>

              <button
                onClick={() => handleMint(request.id, request.requester)}
                className="bg-green-500 text-white py-2 px-4 mt-2 rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Mint Tokens'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No pending requests at the moment.</p>
      )}
    </div>
  );
};

export default MintRequests;
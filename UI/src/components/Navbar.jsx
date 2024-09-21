import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {abi} from '../scdata/CarbonToken.json'; // ABI of the CarbonToken contract
import{CarbonTokenCarbonToken} from "../scdata/deployed_addresses.json"

const Navbar = ({ username, onLogout }) => {
  const [tokenBalance, setTokenBalance] = useState(0n); // Using BigInt for balance
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const carbonTokenAddress = "0xYourContractAddress"; // Replace with your deployed contract address

  // Load the contract and user's token balance
  useEffect(() => {
    const loadProviderAndContract = async () => {
      // Check if Web3 is available (MetaMask)
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(_provider);
        await _provider.send('eth_requestAccounts', []); // Request wallet connection

        const signer = await _provider.getSigner();
        const carbonTokenContract = new ethers.Contract(CarbonTokenCarbonToken, abi, signer);
        setContract(carbonTokenContract);

        // Fetch the token balance for the connected user
        const userAddress = await signer.getAddress();
        const balance = await carbonTokenContract.balanceOf(userAddress);
        setTokenBalance(balance);
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadProviderAndContract();
  }, []);

  // Convert BigInt balance to human-readable format (assuming 18 decimals)
  const formattedBalance = ethers.formatUnits(tokenBalance, 18);

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white">
        <h1 className="text-xl font-bold">CarbonToken</h1>
        <p>{`Your Balance: ${formattedBalance} CARB`}</p>
      </div>
      <div className="text-white flex items-center space-x-4">
        <span>{`Hello, ${username}`}</span>
        <button 
          onClick={onLogout} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

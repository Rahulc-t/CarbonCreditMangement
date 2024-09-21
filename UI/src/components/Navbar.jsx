import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom'; // For navigating to the login and home pages
import { abi } from '../scdata/CarbonToken.json'; // ABI of the CarbonToken contract
import { CarbonTokenCarbonToken } from "../scdata/deployed_addresses.json";

const Navbar = () => {
  const [tokenBalance, setTokenBalance] = useState(0n); // Using BigInt for balance
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [username, setUsername] = useState('');
  const [userAddress, setUserAddress] = useState(''); // Store user's wallet address
  const navigate = useNavigate(); // Hook for navigation

  // Load the contract and user's token balance
  useEffect(() => {
    const loadProviderAndContract = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);
          await _provider.send('eth_requestAccounts', []); // Request wallet connection

          const signer = await _provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address); // Store user address as username
          setUsername(address); // Set address as the username

          const carbonTokenContract = new ethers.Contract(CarbonTokenCarbonToken, abi, signer);
          setContract(carbonTokenContract);

          // Fetch the token balance for the connected user
          const balance = await carbonTokenContract.balanceOf(address);
          setTokenBalance(balance);
        } catch (error) {
          console.error("Error loading provider or contract", error);
        }
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadProviderAndContract();
  }, []);

  // Handle logout and redirect to login page
  const handleLogout = () => {
    setProvider(null); // Clear the provider
    setContract(null); // Clear the contract
    setUserAddress(''); // Clear the user address
    navigate('/'); // Redirect to login page
  };

  // Navigate to the home page
  const goToHome = () => {
    navigate('/homepage');
  };

  // Convert BigInt balance to human-readable format (assuming 18 decimals)
  const formattedBalance = ethers.formatUnits(tokenBalance, 18);

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white">
        <h1 className="text-xl font-bold">CarbonToken</h1>
        <p>{`Your Balance: ${formattedBalance} CARB`}</p>
      </div>
      <div className="text-white flex items-center space-x-4">
        <button 
          onClick={goToHome} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Home
        </button>
        <span>{`Hello, ${userAddress ? userAddress : 'Guest'}`}</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi } from '../scdata/WalletLogin.json'; // Import the ABI for WalletLogin contract
import { WalletLoginWalletLogin } from "../scdata/deployed_addresses.json";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState('');
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminAddr, setAdminAddr] = useState('');
  const walletLoginContractAddress = '0xYourContractAddress'; // Replace with your deployed contract address

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Interact with the WalletLogin contract to check if the user is registered
      const walletLoginContract = new ethers.Contract(WalletLoginWalletLogin, abi, signer);
      const isRegistered = await walletLoginContract.isUser(address);
      setIsUserRegistered(isRegistered);

      // Fetch the admin address
      const adminAddress = await walletLoginContract.admin();
      setAdminAddr(adminAddress); // Set the admin address after fetching
    } else {
      alert('Please install MetaMask to use this feature.');
    }
  };

  // Function to register a new user
  const registerUser = async () => {
    if (!username) {
      alert('Please enter a username.');
      return;
    }
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletLoginContract = new ethers.Contract(WalletLoginWalletLogin, abi, signer);

    try {
      const tx = await walletLoginContract.register(username);
      await tx.wait();
      setIsUserRegistered(true);
      setLoading(false);
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure both account and adminAddr are set before checking if the user is an admin
    if (account && adminAddr && isUserRegistered) {
      if (adminAddr.toLowerCase() === account.toLowerCase()) {
        alert('Welcome back, Admin. Redirecting to admin dashboard...');
        navigate("/admin-dashboard"); // Redirect to admin dashboard if user is admin
      } else {
        alert('Welcome back, redirecting to profile page...');
        navigate("/homepage"); // Redirect to homepage for regular users
      }
    }
  }, [account, isUserRegistered, adminAddr, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-100">
      {!account ? (
        <button
          onClick={connectMetaMask}
          className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 ease-in-out"
        >
          Connect to MetaMask
        </button>
      ) : isUserRegistered ? (
        <div className="text-center">
          <p className="text-lg text-green-800 font-bold mb-4">You are already registered!</p>
          <button
            onClick={() => alert('Redirecting to profile page...')}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 ease-in-out"
          >
            Go to Profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-lg text-green-800 font-bold mb-4">Please register your username:</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="p-2 rounded-full border-2 border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          />
          <button
            onClick={registerUser}
            className={`bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 ease-in-out ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

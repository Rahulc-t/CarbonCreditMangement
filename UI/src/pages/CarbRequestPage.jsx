import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {abi} from '../scdata/CarbonTokenApproval.json'; // Your ABI file
import {CarbonTokenApprovalCarbonTokenApproval} from "../scdata/deployed_addresses.json"
const CarbRequestPage = () => {
    const [file, setFile] = useState(null);
    const [ipfsHash, setIpfsHash] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [account, setAccount] = useState('');
    const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your contract address

    const pinataApi = import.meta.env.VITE_PINATA_API;
    const pinataSecretApi = import.meta.env.VITE_PINATA_SECRET_API;

    useEffect(() => {
        const loadAccount = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);
            await fetchUserRequests(address);
        };

        loadAccount();
    }, []);

    // Function to handle file change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Function to upload file to Pinata
    const uploadToPinata = async () => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            body: formData,
            headers: {
                pinata_api_key: pinataApi,
                pinata_secret_api_key: pinataSecretApi,
            },
        });

        const data = await response.json();
        return data.IpfsHash; // Return the IPFS hash
    };

    // Function to submit a request
    const submitRequest = async (e) => {
        e.preventDefault();

        // Upload file to Pinata
        const hash = await uploadToPinata();
        setIpfsHash(hash);

        // Interact with the smart contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CarbonTokenApprovalCarbonTokenApproval, abi, signer);

        try {
            const tx = await contract.submitRequest(hash);
            await tx.wait();
            console.log('Request submitted');
            await fetchUserRequests(account);
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    // Function to fetch user's pending requests
    const fetchUserRequests = async (userAddress) => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CarbonTokenApprovalCarbonTokenApproval, abi, signer);
        

        try {
            const userRequests = await contract.viewUserRequests(userAddress);
            const pending = userRequests.filter((req) => !req.reviewed); // Get pending requests
            setPendingRequests(pending);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold">Submit a Carbon Token Approval Request</h1>

            {/* Form to submit a request */}
            <form onSubmit={submitRequest} className="mt-5">
                <input type="file" onChange={handleFileChange} required className="border p-2" />
                <button type="submit" className="bg-blue-500 text-white p-2 mt-2">Submit Request</button>
            </form>

            <h2 className="mt-10 text-xl font-semibold">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {pendingRequests.length === 0 ? (
                    <p>No pending requests</p>
                ) : (
                    pendingRequests.map((req, index) => (
                        <div key={index} className="border p-4">
                            <h3 className="font-bold">Request #{index + 1}</h3>
                            <p>IPFS Hash: {req.pinataHash}</p>
                            <p>Status: {req.approved ? 'Approved' : 'Pending'}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CarbRequestPage;

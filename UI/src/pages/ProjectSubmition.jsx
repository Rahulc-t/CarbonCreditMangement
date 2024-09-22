import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProjectSubmissionABI from '../scdata/ProjectSubmission.json'; // ABI for the ProjectSubmission contract
import { ProjectSubmissionProjectSubmission } from '../scdata/deployed_addresses.json'; // Address of the deployed ProjectSubmission contract

const ProjectSubmissionAddress = ProjectSubmissionProjectSubmission;

const pinataApi = import.meta.env.VITE_PINATA_API;
const pinataSApi = import.meta.env.VITE_PINATA_SECRET_API;

const ProjectSubmition = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [file, setFile] = useState(null); // File for uploading
  const [carbonTokenAmount, setCarbonTokenAmount] = useState('');
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [pinataHash, setPinataHash] = useState(''); // Store the Pinata IPFS hash
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProviderAndContract = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);
          await _provider.send('eth_requestAccounts', []); // Request wallet connection

          const signer = await _provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);

          const submissionContract = new ethers.Contract(ProjectSubmissionAddress, ProjectSubmissionABI.abi, signer);
          setContract(submissionContract);

          // Load submitted projects
          await loadUserProjects(submissionContract, address);
        } catch (error) {
          console.error('Error loading provider or contract', error);
        }
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadProviderAndContract();
  }, []);

  const loadUserProjects = async (submissionContract, userAddress) => {
    try {
      setLoading(true);
      const userProjects = await submissionContract.viewUserProjects(userAddress);
      setSubmittedProjects(userProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    // Create form data to send the file
    let formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

    //   const response = await fetch(url, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${btoa(`${PINATA_API_KEY}:${PINATA_SECRET_API_KEY}`)}`, // Authorization using API key and secret
    //     },
    //     body: formData,
    //   });
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            body: formData,
            headers: {
                pinata_api_key: pinataApi,
                pinata_secret_api_key: pinataSApi,
            },
        });

      const result = await response.json();
      if (response.ok) {
        setPinataHash(result.IpfsHash); // Save the hash from the response
        alert('File uploaded successfully to Pinata!');
      } else {
        console.error('Error uploading file to Pinata:', result);
        alert('File upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!pinataHash || !carbonTokenAmount || carbonTokenAmount <= 0) {
      alert('Please enter a valid Pinata hash and carbon token amount.');
      return;
    }

    try {
      const tx = await contract.submitProject(pinataHash, ethers.parseUnits(carbonTokenAmount, 18));
      await tx.wait(); // Wait for transaction to be mined
      alert('Project submitted successfully!');

      // Clear input fields
      setFile(null);
      setCarbonTokenAmount('');
      setPinataHash('');

      // Reload submitted projects
      await loadUserProjects(contract, userAddress);
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit a Project for Approval</h1>

      {/* Project Submission Form */}
      <div className="mb-8">
        <div className="mb-4">
          <label className="block font-bold mb-1">Upload Project File (PDF):</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleFileUpload}
            className="bg-blue-500 text-white py-2 px-4 mt-2 rounded"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload to Pinata'}
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-1">Carbon Token Amount Requested:</label>
          <input
            type="number"
            value={carbonTokenAmount}
            onChange={(e) => setCarbonTokenAmount(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter the amount of carbon tokens"
          />
        </div>

        <button
          onClick={handleSubmitProject}
          className="bg-blue-500 text-white py-2 px-4 rounded"
          disabled={!pinataHash}
        >
          Submit Project
        </button>
      </div>

      {/* Submitted Projects Section */}
      <h2 className="text-xl font-bold mb-4">My Submitted Projects</h2>
      {loading ? (
        <p>Loading your submitted projects...</p>
      ) : submittedProjects.length > 0 ? (
        <div className="space-y-4">
          {submittedProjects.map((project, index) => (
            <div key={index} className="border p-4 rounded shadow-lg">
              <p><strong>Pinata IPFS Hash:</strong> {project.pinataHash}</p>
              <p><strong>Carbon Token Amount:</strong> {ethers.formatUnits(project.carbonTokenAmount, 18)} CARB</p>
              <p><strong>Approved:</strong> {project.approved ? 'Yes' : 'No'}</p>
              <p><strong>Reviewed:</strong> {project.reviewed ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No projects submitted yet.</p>
      )}
    </div>
  );
};

export default ProjectSubmition;

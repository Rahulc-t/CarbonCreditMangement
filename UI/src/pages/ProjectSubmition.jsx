import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import  ProjectSubmissionABI from '../scdata/ProjectSubmission.json'; // ABI for the ProjectSubmission contract
import { ProjectSubmissionProjectSubmission } from '../scdata/deployed_addresses.json'; // Address of the deployed ProjectSubmission contract
const ProjectSubmissionAddress=ProjectSubmissionProjectSubmission
const ProjectSubmition = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [pinataHash, setPinataHash] = useState('');
  const [carbonTokenAmount, setCarbonTokenAmount] = useState('');
  const [submittedProjects, setSubmittedProjects] = useState([]);
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
      setPinataHash('');
      setCarbonTokenAmount('');

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
          <label className="block font-bold mb-1">Pinata IPFS Hash:</label>
          <input
            type="text"
            value={pinataHash}
            onChange={(e) => setPinataHash(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter Pinata IPFS hash of the project"
          />
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

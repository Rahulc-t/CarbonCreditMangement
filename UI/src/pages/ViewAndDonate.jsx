import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProjectDonationABI  from '../scdata/ProjectDonation.json'; // ABI for ProjectDonation contract
import { ProjectDonationProjectDonation } from '../scdata/deployed_addresses.json'; // Address of ProjectDonation contract
const ProjectDonationAddress=ProjectDonationProjectDonation
const ViewAndDonate = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [projects, setProjects] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [donationAmount, setDonationAmount] = useState({}); // For storing donation inputs per project

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

          const donationContract = new ethers.Contract(ProjectDonationAddress, ProjectDonationABI.abi, signer);
          setContract(donationContract);

          // Load active projects
          await loadActiveProjects(donationContract, address);
        } catch (error) {
          console.error("Error loading provider or contract", error);
        }
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadProviderAndContract();
  }, []);

  const loadActiveProjects = async (donationContract, userAddress) => {
    try {
      const activeProjects = await donationContract.getActiveProjects();
      // Filter out projects created by the current user
      const filteredProjects = activeProjects.filter(project => project.creator.toLowerCase() !== userAddress.toLowerCase());
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching active projects:', error);
    }
  };

  // Handle donation submission for a specific project
  const handleDonate = async (projectId) => {
    if (!donationAmount[projectId] || donationAmount[projectId] <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    try {
      const amountInWei = ethers.parseUnits(donationAmount[projectId], 18); // Convert to wei (assuming 18 decimals)
      const tx = await contract.donateToProject(projectId, amountInWei);
      await tx.wait(); // Wait for transaction to be mined
      alert('Donation successful!');
      
      // Reload projects to update donation progress
      await loadActiveProjects(contract, userAddress);
    } catch (error) {
      console.error('Error making donation:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Donate to Carbon Token Projects</h1>

      {/* Display Active Projects */}
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div key={index} className="border p-4 rounded shadow-lg">
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p><strong>Website:</strong> <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">{project.website}</a></p>
              <p><strong>Description:</strong> {project.description}</p>
              <p><strong>Tokens Required:</strong> {ethers.formatUnits(project.tokenRequired, 18)} CARB</p>
              <p><strong>Tokens Received:</strong> {ethers.formatUnits(project.tokenReceived, 18)} CARB</p>
              <p><strong>Status:</strong> {project.isActive ? 'Active' : 'Funded'}</p>

              {/* Progress Bar */}
              <div className="bg-gray-200 rounded-full h-4 my-2">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${(Number(project.tokenReceived) / Number(project.tokenRequired)) * 100}%` }}
                ></div>
              </div>

              {/* Donation Input and Button */}
              {project.isActive && (
                <div className="flex items-center space-x-4 mt-4">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={donationAmount[project.tokenRequired] || ''}
                    onChange={(e) => setDonationAmount({ ...donationAmount, [project.tokenRequired]: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={() => handleDonate(index)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Donate
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No active projects available for donation.</p>
        )}
      </div>
    </div>
  );
};

export default ViewAndDonate;

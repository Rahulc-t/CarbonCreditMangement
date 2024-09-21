import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi as ProjectDonationABI } from '../scdata/ProjectDonation.json'; // Import the ABI for the contract
import { ProjectDonationProjectDonation } from '../scdata/deployed_addresses.json'; // Contract address
const ProjectDonationAddress=ProjectDonationProjectDonation
const SubmitDonation = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [tokenRequired, setTokenRequired] = useState('');
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    // Initialize provider and contract when the component mounts
    const loadProviderAndContract = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);
          await _provider.send('eth_requestAccounts', []); // Request wallet connection

          const signer = await _provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);

          const donationContract = new ethers.Contract(ProjectDonationAddress, ProjectDonationABI, signer);
          setContract(donationContract);

          // Load active projects
          await loadActiveProjects(donationContract);
        } catch (error) {
          console.error("Error loading provider or contract", error);
        }
      } else {
        console.log('Please install MetaMask.');
      }
    };

    loadProviderAndContract();
  }, []);

  const loadActiveProjects = async (donationContract) => {
    try {
      // Fetch the active projects from the smart contract
      const activeProjects = await donationContract.getActiveProjects();
      setProjects(activeProjects);
    } catch (error) {
      console.error('Error fetching active projects:', error);
    }
  };

  // Handle form submission to create a new project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !website || !description || !tokenRequired) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Submit project to the smart contract
      const tx = await contract.createProject(name, website, description, ethers.parseUnits(tokenRequired, 18));
      await tx.wait(); // Wait for the transaction to be mined
      alert('Project submitted successfully!');

      // Reload the active projects after submission
      await loadActiveProjects(contract);
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Your Project for Donations</h1>

      {/* Form to submit a new project */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Project Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter project website"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Project Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter project description"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold">Carbon Tokens Required</label>
          <input
            type="number"
            value={tokenRequired}
            onChange={(e) => setTokenRequired(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter token amount"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Project</button>
      </form>

      {/* Active Projects Section */}
      <h2 className="text-xl font-bold mt-8">Your Active Projects</h2>
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div key={index} className="border p-4 rounded">
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p><strong>Website:</strong> {project.website}</p>
              <p><strong>Description:</strong> {project.description}</p>
              <p><strong>Tokens Required:</strong> {ethers.formatUnits(project.tokenRequired, 18)} CARB</p>
              <p><strong>Tokens Received:</strong> {ethers.formatUnits(project.tokenReceived, 18)} CARB</p>
              <p><strong>Status:</strong> {project.isActive ? 'Active' : 'Funded'}</p>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${(Number(project.tokenReceived) / Number(project.tokenRequired)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p>No active projects found.</p>
        )}
      </div>
    </div>
  );
};

export default SubmitDonation;

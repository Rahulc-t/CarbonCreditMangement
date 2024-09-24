import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import carbonTokenAbi from "../scdata/CarbonToken.json";
import projectSubmissionAbi from "../scdata/ProjectSubmission.json";

// Contract addresses
const carbonTokenAddress = "0xbbA9cF75beEB542862405826D749B75BFfa98870";
const projectSubmissionAddress = "0xbF3fcC35C6d9Fc1725f36E825e9630C47fbE979f";

const ProjectRequests = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [carbonTokenContract, setCarbonTokenContract] = useState(null);
  const [projectSubmissionContract, setProjectSubmissionContract] = useState(null);
  const [projects, setProjects] = useState([]);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        const carbonToken = new ethers.Contract(carbonTokenAddress, carbonTokenAbi.abi, signer);
        const projectSubmission = new ethers.Contract(projectSubmissionAddress, projectSubmissionAbi.abi, signer);

        setCarbonTokenContract(carbonToken);
        setProjectSubmissionContract(projectSubmission);

        // Get current user account
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        // Check if current account is admin
        const admin = await projectSubmission.admin();
        setIsAdmin(admin.toLowerCase() === accounts[0].toLowerCase());

        // Fetch all projects
        const projectCount = await projectSubmission.getProjectCount();
        let projectList = [];

        // Fetch project details in parallel
        for (let i = 0; i < projectCount; i++) {
          const project = await projectSubmission.viewProject(i);
          projectList.push({
            id: i,
            submitter: project[0],
            pinataHash: project[1],
            carbonTokenAmount: project[2].toString(), // Convert BigNumber to string
            approved: project[3],
            reviewed: project[4],
          });
        }
        setProjects(projectList);
      } else {
        alert("Please install MetaMask!");
      }
    };
    init();
  }, []);

  const approveProject = async (projectId) => {
    try {
      const project = projects.find((proj) => proj.id === projectId);
      if (!project) return;

      // Burn the tokens instead of minting
      await projectSubmissionContract.approveProject(projectId);
      await carbonTokenContract.burnTokens(project.submitter, project.carbonTokenAmount);

      alert("Project approved and tokens burned!");
    } catch (error) {
      console.error(error);
      alert("Error approving project");
    }
  };

  const rejectProject = async (projectId) => {
    try {
      await projectSubmissionContract.rejectProject(projectId);
      alert("Project rejected.");
    } catch (error) {
      console.error(error);
      alert("Error rejecting project");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center">Project Requests</h1>
      {!isAdmin ? (
        <p className="text-red-500 text-center">You are not authorized to view this page. Only admins can manage projects.</p>
      ) : (
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 sm:p-8 overflow-x-auto">
          {projects.length === 0 ? (
            <p className="text-center">No projects found.</p>
          ) : (
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2">Project ID</th>
                  <th className="px-2 sm:px-4 py-2">Submitter</th>
                  <th className="px-2 sm:px-4 py-2">Pinata Hash</th>
                  <th className="px-2 sm:px-4 py-2">Carbon Token Amount</th>
                  <th className="px-2 sm:px-4 py-2">Status</th>
                  <th className="px-2 sm:px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 sm:px-4 py-2">{project.id}</td>
                    <td className="px-2 sm:px-4 py-2 truncate max-w-xs">{project.submitter}</td>
                    <td className="px-2 sm:px-4 py-2 truncate max-w-xs">{project.pinataHash}</td>
                    <td className="px-2 sm:px-4 py-2">{project.carbonTokenAmount}</td>
                    <td className="px-2 sm:px-4 py-2">
                      {project.reviewed ? (project.approved ? "Approved" : "Rejected") : "Pending"}
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      {!project.reviewed && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveProject(project.id)}
                            className="bg-green-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectProject(project.id)}
                            className="bg-red-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;

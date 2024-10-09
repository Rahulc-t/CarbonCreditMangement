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

        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const admin = await projectSubmission.admin();
        setIsAdmin(admin.toLowerCase() === accounts[0].toLowerCase());

        const projectCount = await projectSubmission.getProjectCount();
        let projectList = [];

        for (let i = 0; i < projectCount; i++) {
          const project = await projectSubmission.viewProject(i);
          projectList.push({
            id: i,
            submitter: project[0],
            pinataHash: project[1],
            carbonTokenAmount: project[2].toString(),
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
      <h1 className="text-3xl sm:text-5xl font-bold mb-8 text-center text-gray-800">
        Project Requests
      </h1>
      {!isAdmin ? (
        <p className="text-red-500 text-center">
          You are not authorized to view this page. Only admins can manage projects.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {projects.length === 0 ? (
            <p className="text-center text-gray-600">No projects found.</p>
          ) : (
            projects.map((project, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Project ID: {project.id}</h2>
                <p className="text-gray-700 mb-2 break-words">
                  <strong>Submitter:</strong> {project.submitter}
                </p>
                <p className="text-gray-700 mb-2 break-words">
                  <strong>Certificate URL:</strong>
                  <a
                    href={`https://coral-fancy-badger-36.mypinata.cloud/ipfs/${project.pinataHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {`https://coral-fancy-badger-36.mypinata.cloud/ipfs/${project.pinataHash}`}
                  </a>
                </p>
                <p className="text-gray-700 mb-2 break-words">
                  <strong>Carbon Token Amount:</strong> {project.carbonTokenAmount}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Status:</strong> {project.reviewed ? (project.approved ? "Approved" : "Rejected") : "Pending"}
                </p>
                {!project.reviewed && (
                  <div className="flex justify-between">
                    <button
                      onClick={() => approveProject(project.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectProject(project.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;

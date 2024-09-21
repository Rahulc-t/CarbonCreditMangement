import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation

const Homepage = () => {
  const navigate = useNavigate();

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Welcome to the Carbon Token Platform</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        
        {/* Submit for Carbon Token */}
        <button 
          onClick={() => handleNavigation('/submit-carbon-token')} 
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Submit for Carbon Token
        </button>
        
        {/* List Carbon Token */}
        <button 
          onClick={() => handleNavigation('/list-carbon-token')} 
          className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          List Carbon Token
        </button>

        {/* Buy Carbon Token */}
        <button 
          onClick={() => handleNavigation('/buy-carbon-token')} 
          className="bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 transition duration-300"
        >
          Buy Carbon Token
        </button>

        {/* Request for Certificates */}
        <button 
          onClick={() => handleNavigation('/request-certificates')} 
          className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-300"
        >
          Request for Certificates
        </button>

        {/* List Donation */}
        <button 
          onClick={() => handleNavigation('/list-donation')} 
          className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
        >
          List Donation
        </button>

        {/* View Donation */}
        <button 
          onClick={() => handleNavigation('/view-donation')} 
          className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition duration-300"
        >
          View Donation
        </button>

        {/* List Project */}
        <button 
          onClick={() => handleNavigation('/list-project')} 
          className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition duration-300"
        >
          List Project
        </button>
        
      </div>
    </div>
  );
};

export default Homepage;

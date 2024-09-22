import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Welcome to the Carbon Token Platform</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        
        
        <button 
          onClick={() => handleNavigation('/mint-requests')} 
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Mint Token
        </button>
        
        
        <button 
          onClick={() => handleNavigation('/list-carbon-token')} 
          className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Issue Certificate
        </button>
        
      </div>
    </div>
  );
};

export default AdminDashboard;

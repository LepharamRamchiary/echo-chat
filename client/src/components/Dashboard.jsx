import React, { useState } from 'react';
import { User, CheckCircle } from 'lucide-react';


// Dashboard Component
const Dashboard = ({ userData, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-800">Dashboard</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

     

      
    </div>
  );
};

export default Dashboard;

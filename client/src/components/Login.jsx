import React, { useState } from 'react';
import { LogIn, User, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const Login = ({ onSuccess, onRegisterClick }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullname: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFullnameField, setShowFullnameField] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'phoneNumber') {
      const digits = value.replace(/\D/g, '').substring(0, 10);
      setFormData(prev => ({ ...prev, [field]: digits }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError(''); 
  };

  const validateForm = () => {
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    return true;
  };

  const loginUserAPI = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          phoneNumber: userData.phoneNumber,
          fullname: userData.fullname || undefined 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const apiResponse = await loginUserAPI(formData);
      
      console.log('Login successful:', apiResponse);
      
      if (apiResponse.data.accessToken) {
        await localStorage.setItem('token', apiResponse.data.accessToken);
        console.log('Access Token:', apiResponse.data.accessToken);
      }
      
      if (onSuccess) {
        onSuccess({
          user: apiResponse.data.user,
          accessToken: apiResponse.data.accessToken,
          message: apiResponse.message
        });
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('404')) {
        errorMessage = 'User not found. Please register first.';
      } else if (err.message.includes('400') && err.message.includes('verify')) {
        errorMessage = 'Please verify your phone number first.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid phone number.';
      } else if (err.message.includes('network') || err.name === 'TypeError') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                +91
              </span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Enter 10-digit number"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowFullnameField(!showFullnameField)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showFullnameField ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showFullnameField && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange('fullname', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.phoneNumber}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">Don't have an account?</p>
              <button
                onClick={onRegisterClick}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm mt-1 disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          <p>By signing in, you agree to our</p>
          <p>Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

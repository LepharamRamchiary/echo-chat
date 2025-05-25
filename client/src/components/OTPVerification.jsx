import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

// API configuration
const API_BASE_URL = 'http://localhost:8000/api/v1/user'; // Update this to your backend URL

// OTP Verification Component
const OTPVerification = ({ userData, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits to match backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < otp.length - 1) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  // API call to verify OTP
  const verifyOTPAPI = async (phoneNumber, otpCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if needed
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('OTP verification API error:', error);
      throw error;
    }
  };

  // API call to resend OTP (register again)
  const resendOTPAPI = async (phoneNumber, fullname) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          fullname: fullname
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Resend OTP API error:', error);
      throw error;
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiResponse = await verifyOTPAPI(userData.phoneNumber, otpString);
      
      console.log('OTP verification successful:', apiResponse);
      
      // Call onSuccess with the API response data
      if (onSuccess) {
        onSuccess({
          ...userData,
          isVerified: true,
          accessToken: apiResponse.data.accessToken,
          user: apiResponse.data.user,
          message: apiResponse.message
        });
      }
    } catch (err) {
      // Handle different types of errors
      let errorMessage = 'Invalid or expired OTP. Please try again.';
      
      if (err.message.includes('404')) {
        errorMessage = 'User not found. Please register again.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid or expired OTP.';
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

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setError('');

    try {
      const apiResponse = await resendOTPAPI(userData.phoneNumber, userData.fullName);
      
      console.log('OTP resent successfully:', apiResponse);
      
      // Reset timer and OTP inputs
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      
      // Show success message briefly
      setError(''); // Clear any previous errors
      
      // You might want to show a success message
      // For now, we'll just reset the form
    } catch (err) {
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (err.message.includes('network') || err.name === 'TypeError') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onBack}
          disabled={loading || resendLoading}
          className="mb-6 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back to Registration
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold">+91 {userData.phoneNumber}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                data-index={index}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || resendLoading}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength="1"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || resendLoading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={timer > 0 || loading || resendLoading}
              className="text-green-600 hover:text-green-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ? (
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Resending...</span>
                </div>
              ) : timer > 0 ? (
                `Resend in ${timer}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Make sure you have a stable internet connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
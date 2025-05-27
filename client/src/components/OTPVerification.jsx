import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const OTPVerification = ({ userData, onSuccess, onBackToRegister }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 
  const [timer, setTimer] = useState(60);
  const [infoMessage, setInfoMessage] = useState(userData?.message || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);


  useEffect(() => {
    if (successMessage && isVerified) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        if (onSuccess) {
          onSuccess({
            ...userData,
            isVerified: true,
            message: successMessage
          });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, isVerified, userData, onSuccess]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    setError('');

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

  const verifyOTPAPI = async (phoneNumber, otpCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
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

  const resendOTPAPI = async (phoneNumber, fullname) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/register`, {
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
    setSuccessMessage('');

    try {
      const apiResponse = await verifyOTPAPI(userData.phoneNumber, otpString);
      
      console.log('OTP verification successful:', apiResponse);
      
      setSuccessMessage(apiResponse.message || 'Phone number verified successfully!');
      setIsVerified(true);
      
      const responseData = {
        ...userData,
        isVerified: true,
        accessToken: apiResponse.data.accessToken,
        user: apiResponse.data.user,
        message: apiResponse.message
      };

      console.log('Verification complete, showing success message...');
      
    } catch (err) {
  
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
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setError('');
    setSuccessMessage(''); 

    try {
      const apiResponse = await resendOTPAPI(userData.phoneNumber, userData.fullName);
      
      console.log('OTP resent successfully:', apiResponse);
      
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      setIsVerified(false);
      
      setInfoMessage('OTP sent successfully to your phone number.');
      
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
        
        {infoMessage && !successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
            {infoMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <button
          onClick={onBackToRegister}
          disabled={loading || resendLoading || isVerified}
          className="mb-6 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back to Registration
        </button>

        <div className="text-center mb-8">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 ${
            isVerified 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-green-500 to-blue-500'
          }`}>
            {isVerified ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <MessageSquare className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isVerified ? 'Verified!' : 'Verify OTP'}
          </h1>
          <p className="text-gray-600">
            {isVerified ? (
              'Your phone number has been verified successfully'
            ) : (
              <>
                Enter the 6-digit code sent to<br />
                <span className="font-semibold">+91 {userData.phoneNumber}</span>
              </>
            )}
          </p>
        </div>

        {!isVerified ? (
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
                  className="sm:w-12 sm:h-12 h-10 w-10 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        ) : (
          <div className="text-center">
            <div className="animate-pulse">
              <p className="text-gray-600">Redirecting you shortly...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
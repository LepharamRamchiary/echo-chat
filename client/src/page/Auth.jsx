import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import OTPVerification from '../components/OTPVerification';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

const Auth = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial view from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const urlView = queryParams.get('view');
  
  const [currentView, setCurrentView] = useState(() => {
    // First check URL, then localStorage, then default to 'login'
    return urlView || localStorage.getItem('currentView') || 'login';
  });
  
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Update view when URL changes
  useEffect(() => {
    if (urlView && urlView !== currentView) {
      setCurrentView(urlView);
    }
  }, [urlView, currentView]);

  // Listen for user data changes
  useEffect(() => {
    const handleUserDataChange = () => {
      const stored = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (!stored && !token) {
        // User data cleared, reset state
        setUserData(null);
        setAuthToken(null);
        setCurrentView('login');
      }
    };

    window.addEventListener('userDataChanged', handleUserDataChange);
    return () => window.removeEventListener('userDataChanged', handleUserDataChange);
  }, []);

  // Sync currentView with localStorage
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [currentView, userData]);

  // Sync authToken with localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
  }, [authToken]);

  // Handle successful login
  const handleLoginSuccess = (data) => {
    console.log('Login successful:', data);
    
    // Ensure proper data structure for login
    const formattedData = {
      user: data.user || {
        fullname: data.fullname || data.fullName,
        phoneNumber: data.phoneNumber,
        isVerified: true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: true
    };
    
    setUserData(formattedData);
    setAuthToken(data.accessToken);
    
    // Store in localStorage with proper structure
    localStorage.setItem('userData', JSON.stringify(formattedData));
    localStorage.setItem('token', data.accessToken);
    
    // Call parent's auth success handler
    if (onAuthSuccess) {
      onAuthSuccess(formattedData);
    }
    
    setCurrentView('dashboard');
    navigate('/dashboard');
  };

  // Handle successful registration
  const handleRegistrationSuccess = (data) => {
    console.log('Registration successful:', data);
    
    // Store registration data temporarily for OTP verification
    const registrationData = {
      fullName: data.fullName,
      fullname: data.fullName, // Store both formats for compatibility
      phoneNumber: data.phoneNumber,
      message: data.message,
      isVerified: false
    };
    
    setUserData(registrationData);
    setCurrentView('otp');
    navigate('/auth?view=otp');
  };

  // Handle successful OTP verification
  const handleOTPSuccess = (data) => {
    console.log('OTP verification successful:', data);
    
    // Combine registration data with verification response
    const completeUserData = {
      user: {
        fullname: userData.fullName || userData.fullname, // Use registration fullname
        phoneNumber: userData.phoneNumber,
        isVerified: true,
        ...data.user // Merge any additional user data from API
      },
      accessToken: data.accessToken,
      isVerified: true,
      message: data.message
    };
    
    setUserData(completeUserData);
    setAuthToken(data.accessToken);
    
    // Store in localStorage with proper structure
    localStorage.setItem('userData', JSON.stringify(completeUserData));
    localStorage.setItem('token', data.accessToken);
    
    console.log('Stored complete user data:', completeUserData);
    
    // Call parent's auth success handler
    if (onAuthSuccess) {
      onAuthSuccess(completeUserData);
    }
    
    // After successful verification, redirect to dashboard instead of login
    setCurrentView('dashboard');
    navigate('/dashboard');
  };

  // Navigation handlers
  const handleSwitchToRegister = () => {
    setCurrentView('register');
    navigate('/auth?view=register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
    navigate('/auth?view=login');
  };

  const handleBackToRegister = () => {
    setCurrentView('register');
    navigate('/auth?view=register');
  };

  const handleLogout = () => {
    setUserData(null);
    setAuthToken(null);
    setCurrentView('login');
    localStorage.removeItem('userData');
    localStorage.removeItem('currentView');
    localStorage.removeItem('token');
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new Event('userDataChanged'));
    
    navigate('/auth?view=login');
  };

  // If user is already verified and has token, redirect to dashboard
  useEffect(() => {
    if (authToken && userData?.isVerified && currentView !== 'dashboard') {
      navigate('/dashboard');
    }
  }, [authToken, userData, currentView, navigate]);

  switch (currentView) {
    case 'login':
      return (
        <Login 
          onSuccess={handleLoginSuccess}
          onRegisterClick={handleSwitchToRegister}
        />
      );
      
    case 'register':
      return (
        <Register 
          onSuccess={handleRegistrationSuccess}
          onLoginClick={handleSwitchToLogin}
        />
      );
      
    case 'otp':
      return (
        <OTPVerification 
          userData={userData}
          onSuccess={handleOTPSuccess}
          onBackToRegister={handleBackToRegister}
        />
      );
      
    case 'dashboard':
      return (
        <Dashboard 
          userData={userData}
          onLogout={handleLogout}
        />
      );
      
    default:
      return (
        <Login 
          onSuccess={handleLoginSuccess}
          onRegisterClick={handleSwitchToRegister}
        />
      );
  }
};

export default Auth;
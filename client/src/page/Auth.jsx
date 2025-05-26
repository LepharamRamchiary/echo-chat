import React, { useState, useEffect } from 'react';
import Register from '../components/Register';
import OTPVerification from '../components/OTPVerification';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

const Auth = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState(() => {
    const stored = localStorage.getItem('login');
    return stored || 'login';
  });
  
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [currentView, userData]);

  // Handle successful login
  const handleLoginSuccess = (data) => {
    console.log('Login successful:', data);
    setUserData(data);
    setCurrentView('dashboard');
    
    // Call the parent callback to update global auth state
    if (onAuthSuccess) {
      onAuthSuccess(data);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = (data) => {
    setUserData(data);
    setCurrentView('otp');
  };

  // Handle successful OTP verification
  const handleOTPSuccess = (data) => {
    setUserData(data);
    setCurrentView('login');
  };

  // Navigation handlers
  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleBackToRegister = () => {
    setCurrentView('register');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('login');
    localStorage.removeItem('userData');
    localStorage.removeItem('currentView');
  };

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
          user={userData?.user}
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
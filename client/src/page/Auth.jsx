import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import OTPVerification from '../components/OTPVerification';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

const Auth = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const urlView = queryParams.get('view');
  
  const [currentView, setCurrentView] = useState(() => {
    return urlView || localStorage.getItem('currentView') || 'login';
  });
  
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    if (urlView && urlView !== currentView) {
      setCurrentView(urlView);
    }
  }, [urlView, currentView]);

  useEffect(() => {
    const handleUserDataChange = () => {
      const stored = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (!stored && !token) {
        setUserData(null);
        setAuthToken(null);
        setCurrentView('login');
      }
    };

    window.addEventListener('userDataChanged', handleUserDataChange);
    return () => window.removeEventListener('userDataChanged', handleUserDataChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [currentView, userData]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
  }, [authToken]);

  const handleLoginSuccess = (data) => {
    const formattedData = {
      user: data.user || {
        fullname: data.fullname,
        phoneNumber: data.phoneNumber,
        isVerified: true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: true
    };
    
    setUserData(formattedData);
    setAuthToken(data.accessToken);
    
    localStorage.setItem('userData', JSON.stringify(formattedData));
    localStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(formattedData);
    }
    
    setCurrentView('dashboard');
    navigate('/dashboard');
  };
  const handleRegistrationSuccess = (data) => {
    console.log('Registration successful:', data);
    const registrationData = {
      fullname: data.fullName,
      phoneNumber: data.phoneNumber,
      message: data.message,
      isVerified: false
    };
    
    setUserData(registrationData);
    setCurrentView('otp');
    navigate('/auth?view=otp');
  };
  const handleOTPSuccess = (data) => {
    const completeUserData = {
      user: {
        fullname: userData.fullName || userData.fullname, 
        phoneNumber: userData.phoneNumber,
        isVerified: true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: true,
      message: data.message
    };
    
    setUserData(completeUserData);
    setAuthToken(data.accessToken);
    
    localStorage.setItem('userData', JSON.stringify(completeUserData));
    localStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(completeUserData);
    }
    
    setCurrentView('login');
    navigate('/auth?view=login');
  };


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
    
    window.dispatchEvent(new Event('userDataChanged'));
    
    navigate('/auth?view=login');
  };

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
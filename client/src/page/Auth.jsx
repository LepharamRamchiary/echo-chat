import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Register from '../components/Register';
import OTPVerification from '../components/OTPVerification';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

const Auth = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function to safely access localStorage
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
      } catch (error) {
        console.warn('localStorage access failed:', error);
      }
      return null;
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn('localStorage write failed:', error);
      }
    },
    removeItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('localStorage remove failed:', error);
      }
    }
  };
  

  // Get initial view from URL params
  const getInitialView = useCallback(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlView = queryParams.get('view');
    
    if (urlView && ['login', 'register', 'otp', 'dashboard'].includes(urlView)) {
      return urlView;
    }
    
    // Check if user is already authenticated
    const storedToken = safeLocalStorage.getItem('token');
    const storedUserData = safeLocalStorage.getItem('userData');
    
    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.isVerified) {
          return 'dashboard';
        }
      } catch (error) {
        console.warn('Invalid stored user data:', error);
        safeLocalStorage.removeItem('userData');
        safeLocalStorage.removeItem('token');
      }
    }
    
    return 'login';
  }, [location.search]);

  const [currentView, setCurrentView] = useState(getInitialView);
  const [userData, setUserData] = useState(() => {
    const stored = safeLocalStorage.getItem('userData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Invalid stored user data:', error);
        safeLocalStorage.removeItem('userData');
      }
    }
    return null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return safeLocalStorage.getItem('token') || null;
  });

  const [isNavigating, setIsNavigating] = useState(false);

  // Update view when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlView = queryParams.get('view');
    
    if (urlView && ['login', 'register', 'otp', 'dashboard'].includes(urlView) && urlView !== currentView) {
      setCurrentView(urlView);
    }
  }, [location.search, currentView]);

  // Handle authentication state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = safeLocalStorage.getItem('userData');
      const token = safeLocalStorage.getItem('token');
      
      if (!stored || !token) {
        setUserData(null);
        setAuthToken(null);
        if (currentView === 'dashboard') {
          setCurrentView('login');
          navigate('/auth?view=login', { replace: true });
        }
      }
    };

    // Listen for storage changes (for multiple tabs)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, [currentView, navigate]);

  // Persist data to localStorage
  useEffect(() => {
    if (userData) {
      safeLocalStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    if (authToken) {
      safeLocalStorage.setItem('token', authToken);
    } else {
      safeLocalStorage.removeItem('token');
    }
  }, [authToken]);

  // Add this useEffect in your App component
useEffect(() => {
  const handleMobileNavigation = () => {
    const path = window.location.pathname;
    if (path.includes('/auth') && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  };

  // Handle initial load
  handleMobileNavigation();

  // Listen for further changes
  window.addEventListener('popstate', handleMobileNavigation);
  return () => window.removeEventListener('popstate', handleMobileNavigation);
}, [isAuthenticated, navigate]);

  // Replace navigateWithLoading with this:
const navigateWithLoading = useCallback((path) => {
  setIsNavigating(true);
  // Use full path including the base
  navigate(path, { replace: true });
  // No need for setTimeout - it might cause race conditions
  setIsNavigating(false);
}, [navigate]);

  const handleLoginSuccess = useCallback((data) => {
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
    
    safeLocalStorage.setItem('userData', JSON.stringify(formattedData));
    safeLocalStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(formattedData);
    }
    
    setCurrentView('dashboard');
    navigateWithLoading('/dashboard');
  }, [onAuthSuccess, navigateWithLoading]);

  const handleRegistrationSuccess = useCallback((data) => {
    console.log('Registration successful:', data);
    const registrationData = {
      fullname: data.fullName,
      phoneNumber: data.phoneNumber,
      message: data.message,
      isVerified: false
    };
    
    setUserData(registrationData);
    setCurrentView('otp');
    navigateWithLoading('/auth?view=otp');
  }, [navigateWithLoading]);

  const handleOTPSuccess = useCallback((data) => {
    const completeUserData = {
      user: {
        fullname: userData?.fullName || userData?.fullname, 
        phoneNumber: userData?.phoneNumber,
        isVerified: true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: true,
      message: data.message
    };
    
    setUserData(completeUserData);
    setAuthToken(data.accessToken);
    
    safeLocalStorage.setItem('userData', JSON.stringify(completeUserData));
    safeLocalStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(completeUserData);
    }
    
    setCurrentView('dashboard');
    navigateWithLoading('/dashboard');
  }, [userData, onAuthSuccess, navigateWithLoading]);

  const handleSwitchToRegister = useCallback(() => {
    setCurrentView('register');
    navigateWithLoading('/auth?view=register');
  }, [navigateWithLoading]);

  const handleSwitchToLogin = useCallback(() => {
    setCurrentView('login');
    navigateWithLoading('/auth?view=login');
  }, [navigateWithLoading]);

  const handleBackToRegister = useCallback(() => {
    setCurrentView('register');
    navigateWithLoading('/auth?view=register');
  }, [navigateWithLoading]);

  const handleLogout = useCallback(() => {
    setUserData(null);
    setAuthToken(null);
    setCurrentView('login');
    
    safeLocalStorage.removeItem('userData');
    safeLocalStorage.removeItem('token');
    
    window.dispatchEvent(new Event('userDataChanged'));
    
    navigateWithLoading('/auth?view=login');
  }, [navigateWithLoading]);

  // Auto-redirect to dashboard if authenticated
  useEffect(() => {
    if (authToken && userData?.isVerified && currentView !== 'dashboard' && !isNavigating) {
      setCurrentView('dashboard');
      navigateWithLoading('/dashboard');
    }
  }, [authToken, userData, currentView, isNavigating, navigateWithLoading]);

  // Show loading state during navigation
  if (isNavigating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

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
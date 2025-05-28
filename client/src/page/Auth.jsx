import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Register from '../components/Register';
import OTPVerification from '../components/OTPVerification';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

// Safe localStorage access utility (move to separate file if reused)
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

const Auth = ({ onAuthSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial view from URL params or auth state
  const getInitialView = useCallback(() => {
    const urlView = searchParams.get('view');
    
    if (urlView && ['login', 'register', 'otp', 'dashboard'].includes(urlView)) {
      return urlView;
    }
    
    // Check authentication state
    const storedToken = safeLocalStorage.getItem('token');
    const storedUserData = safeLocalStorage.getItem('userData');
    
    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.isVerified) {
          return 'dashboard';
        }
        return 'otp'; // If not verified but has data
      } catch (error) {
        console.warn('Invalid stored user data:', error);
        safeLocalStorage.removeItem('userData');
        safeLocalStorage.removeItem('token');
      }
    }
    
    return 'login'; // Default view
  }, [searchParams]);

  const [currentView, setCurrentView] = useState(() => getInitialView());
  const [userData, setUserData] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const token = safeLocalStorage.getItem('token');
    const userDataStr = safeLocalStorage.getItem('userData');
    
    if (token) setAuthToken(token);
    if (userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr));
      } catch (error) {
        console.warn('Failed to parse user data:', error);
        safeLocalStorage.removeItem('userData');
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Handle view changes based on authentication
  useEffect(() => {
    if (!isInitialized) return;

    // If authenticated and verified, go to dashboard
    if (authToken && userData?.isVerified && currentView !== 'dashboard') {
      setCurrentView('dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // If has user data but not verified, go to OTP
    if (userData && !userData.isVerified && currentView !== 'otp') {
      setCurrentView('otp');
      navigate('/auth?view=otp', { replace: true });
      return;
    }

    // Default to login if no auth
    if (!authToken && currentView !== 'login' && currentView !== 'register') {
      setCurrentView('login');
      navigate('/auth?view=login', { replace: true });
    }
  }, [authToken, userData, currentView, navigate, isInitialized]);

  // Event handlers
  const handleLoginSuccess = useCallback((data) => {
    const formattedData = {
      user: data.user || {
        fullname: data.fullname,
        phoneNumber: data.phoneNumber,
        isVerified: data.isVerified || true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: data.isVerified || true
    };
    
    setUserData(formattedData);
    setAuthToken(data.accessToken);
    
    safeLocalStorage.setItem('userData', JSON.stringify(formattedData));
    safeLocalStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(formattedData);
    }
    
    if (formattedData.isVerified) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth?view=otp', { replace: true });
    }
  }, [onAuthSuccess, navigate]);

  const handleRegistrationSuccess = useCallback((data) => {
    const registrationData = {
      fullname: data.fullName,
      phoneNumber: data.phoneNumber,
      message: data.message,
      isVerified: false
    };
    
    setUserData(registrationData);
    safeLocalStorage.setItem('userData', JSON.stringify(registrationData));
    navigate('/auth?view=otp', { replace: true });
  }, [navigate]);

  const handleOTPSuccess = useCallback((data) => {
    const completeUserData = {
      ...userData,
      user: {
        fullname: userData?.fullname,
        phoneNumber: userData?.phoneNumber,
        isVerified: true,
        ...data.user
      },
      accessToken: data.accessToken,
      isVerified: true
    };
    
    setUserData(completeUserData);
    setAuthToken(data.accessToken);
    
    safeLocalStorage.setItem('userData', JSON.stringify(completeUserData));
    safeLocalStorage.setItem('token', data.accessToken);
    
    if (onAuthSuccess) {
      onAuthSuccess(completeUserData);
    }
    
    navigate('/dashboard', { replace: true });
  }, [userData, onAuthSuccess, navigate]);

  const handleLogout = useCallback(() => {
    setUserData(null);
    setAuthToken(null);
    
    safeLocalStorage.removeItem('userData');
    safeLocalStorage.removeItem('token');
    
    // Dispatch event to sync other tabs
    window.dispatchEvent(new Event('storage'));
    
    navigate('/auth?view=login', { replace: true });
  }, [navigate]);

  // Navigation helpers
  const navigateToRegister = useCallback(() => {
    navigate('/auth?view=register', { replace: true });
  }, [navigate]);

  const navigateToLogin = useCallback(() => {
    navigate('/auth?view=login', { replace: true });
  }, [navigate]);

  const navigateBackToRegister = useCallback(() => {
    navigate('/auth?view=register', { replace: true });
  }, [navigate]);

  // Render appropriate component based on currentView
  if (!isInitialized) {
    return (
      <div className="auth-loading">
        <div>Loading...</div>
      </div>
    );
  }

  switch (currentView) {
    case 'login':
      return (
        <Login 
          onSuccess={handleLoginSuccess}
          onRegisterClick={navigateToRegister}
        />
      );
      
    case 'register':
      return (
        <Register 
          onSuccess={handleRegistrationSuccess}
          onLoginClick={navigateToLogin}
        />
      );
      
    case 'otp':
      return userData ? (
        <OTPVerification 
          userData={userData}
          onSuccess={handleOTPSuccess}
          onBack={navigateBackToRegister}
        />
      ) : (
        navigateToLogin()
      );
      
    case 'dashboard':
      return authToken ? (
        <Dashboard 
          userData={userData}
          onLogout={handleLogout}
        />
      ) : (
        navigateToLogin()
      );
      
    default:
      return navigateToLogin();
  }
};

export default Auth;
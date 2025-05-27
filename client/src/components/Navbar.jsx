import React, { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const logoutAPI = async () => {
  try {
    const userData = localStorage.getItem("userData");
    let accessToken = null;

    if (userData) {
      const parsedData = JSON.parse(userData);
      accessToken = parsedData.accessToken;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/user/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    console.error("Logout API error:", error);
    return { success: false, error: error.message };
  }
};

function Navbar({ user, onLogout, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [localAuthStatus, setLocalAuthStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize local state from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setLocalUser(parsedData);
        setLocalAuthStatus(true);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setLocalAuthStatus(false);
      }
    } else {
      setLocalAuthStatus(false);
    }
    setIsLoading(false);
  }, []);

  // Update local state when props change
  useEffect(() => {
    if (user !== undefined && isAuthenticated !== undefined) {
      setLocalUser(user);
      setLocalAuthStatus(isAuthenticated);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Determine current auth state (prioritize props if available, fallback to local state)
  const currentUser = user !== undefined ? user : localUser;
  const currentAuthStatus = isAuthenticated !== undefined ? isAuthenticated : localAuthStatus;

  const loginToChat = () => {
    console.log('Login to Chat clicked, currentAuthStatus:', currentAuthStatus);
    
    // Close menus first
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // Navigate based on authentication status
    if (currentAuthStatus) {
      navigate('/dashboard');
    } else {
      navigate('/auth?view=login');
    }
  };

  const getFirstName = (fullname) => {
    if (!fullname) return "";
    return fullname.split(" ")[0];
  };

  const handleLogout = async () => {
    try {
      const result = await logoutAPI();

      if (result.success) {
        console.log("Logout successful:", result.data.message);
      } else {
        console.warn("Logout API failed:", result.error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear local storage and local state
      localStorage.removeItem("userData");
      setLocalUser(null);
      setLocalAuthStatus(false);
      
      // Close menus first
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      
      // Call parent logout handler
      if (onLogout) {
        onLogout();
      }
      
      // Navigate to home
      navigate("/");
    }
  };

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    if (currentAuthStatus) {
      navigate("/dashboard");
    } else {
      navigate("/auth?view=login");
    }
  };

  const handleMobileRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Mobile register clicked, currentAuthStatus:", currentAuthStatus);
    
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    if (currentAuthStatus) {
      navigate("/dashboard");
    } else {
      navigate("/auth?view=login");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    }
  };

  // Debug log to track user state
  useEffect(() => {
    console.log('Navbar - user:', user, 'isAuthenticated:', isAuthenticated);
    console.log('Navbar - currentUser:', currentUser, 'currentAuthStatus:', currentAuthStatus);
  }, [user, isAuthenticated, currentUser, currentAuthStatus]);

  // Show loading state briefly to prevent flashing
  if (isLoading && !currentUser && !currentAuthStatus) {
    return (
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-blue-600 cursor-pointer"
              >
                TwinTalk
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 rounded-md h-8 w-24"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              TwinTalk
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {currentAuthStatus && currentUser ? (
              <>
                <button
                  onClick={handleDashboardClick}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Message
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                  >
                    <User size={18} />
                    <span>{getFirstName(currentUser.fullname)}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">
                          {currentUser.fullname || "User"}
                        </div>
                        <div className="text-gray-500">{currentUser.phoneNumber}</div>
                      </div>
                      <button
                        onClick={handleDashboardClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Message
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={loginToChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Login to Chat
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden relative z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
              {currentAuthStatus && currentUser ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <div className="font-medium">{currentUser.fullname || "User"}</div>
                    <div className="text-gray-500">{currentUser.phoneNumber}</div>
                  </div>

                  <button
                    onClick={handleDashboardClick}
                    className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Message
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleMobileRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium w-full text-center transition duration-300 relative z-50"
                >
                  Login to Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleOverlayClick}
        />
      )}
    </nav>
  );
}

export default Navbar;
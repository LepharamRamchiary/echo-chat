import React, { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simple API call for logout
const logoutAPI = async () => {
  try {
    const userData = localStorage.getItem("userData");
    let accessToken = null;

    if (userData) {
      const parsedData = JSON.parse(userData);
      accessToken = parsedData.accessToken;
    }

    const response = await fetch("http://localhost:8000/api/v1/user/logout", {
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

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for user data in localStorage
  useEffect(() => {
    const checkUserData = () => {
      const stored = localStorage.getItem("userData");
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData?.user || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUserData();

    // Listen for localStorage changes
    window.addEventListener("storage", checkUserData);

    return () => {
      window.removeEventListener("storage", checkUserData);
    };
  }, []);

  // Extract first name from fullname
  const getFirstName = (fullname) => {
    if (!fullname) return "";
    return fullname.split(" ")[0];
  };

  const handleLogout = async () => {
    try {
      // Call the logout API
      const result = await logoutAPI();

      if (result.success) {
        console.log("Logout successful:", result.data.message);
      } else {
        console.warn("Logout API failed:", result.error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clear local data and redirect, regardless of API response
      localStorage.removeItem("userData");
      localStorage.removeItem("currentView");
      setUser(null);
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);

      // Redirect to home page
      navigate("/");
    }
  };

  const handleDashboardClick = () => {
    navigate("/auth"); // Since your dashboard is handled within Auth component
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleMobileRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Mobile register clicked");
    
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    
    navigate("/auth");
  };

  // Handle overlay click - but exclude clicks on menu content
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on its children
    if (e.target === e.currentTarget) {
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              EchoChat
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Dashboard Link */}
                <button
                  onClick={handleDashboardClick}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Dashboard
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                  >
                    <User size={18} />
                    <span>{getFirstName(user.fullname)}</span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">
                          {user.fullname || "User"}
                        </div>
                        <div className="text-gray-500">{user.phoneNumber}</div>
                      </div>
                      <button
                        onClick={handleDashboardClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
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
              /* Register Button for non-authenticated users */
              <button
                onClick={() => navigate("/auth")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Register
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - MOVED OUTSIDE OF OVERLAY */}
        {isMenuOpen && (
          <div className="md:hidden relative z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <div className="font-medium">{user.fullname || "User"}</div>
                    <div className="text-gray-500">{user.phoneNumber}</div>
                  </div>

                  {/* Dashboard Link */}
                  <button
                    onClick={handleDashboardClick}
                    className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Dashboard
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                /* Fixed Register Button for non-authenticated users */
                <button
                  onClick={handleMobileRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium w-full text-center transition duration-300 relative z-50"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdowns when clicking outside - MODIFIED */}
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
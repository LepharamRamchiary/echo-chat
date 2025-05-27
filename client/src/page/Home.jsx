import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isloading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUser(parsedData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleGetStarted = () => {
    console.log('Get Started clicked, isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      // User is logged in, navigate to dashboard
      navigate('/dashboard');
    } else {
      // User is not logged in, navigate to register
      navigate('/auth?view=register');
    }
  };

  const handleLogout = () => {
    // Clear localStorage and state
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show loading state briefly to prevent button flashing
  if (isloading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar user={user} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
        
        {/* Hero Section with loading state */}
        <section className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Welcome to
                <span className="text-blue-600 block">TwinTalk</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Hi there! Just a heads-up — when you send a request, you'll receive the same response twice. 
                So don't be surprised if you see duplicate replies like this. It's part of how the system currently works!
              </p>
              <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-32 mx-auto"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
      
      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome to
              <span className="text-blue-600 block">TwinTalk</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Hi there! Just a heads-up — when you send a request, you'll receive the same response twice. 
              So don't be surprised if you see duplicate replies like this. It's part of how the system currently works!
            </p>
            <button 
              onClick={handleGetStarted} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-semibold transition duration-300 transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dual Responses</h3>
              <p className="text-gray-600 text-sm">Experience unique conversations with our twin response system that provides comprehensive answers.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Get instant responses powered by advanced AI technology for seamless communication.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm">Your conversations are protected with enterprise-grade security and reliability.</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
              <div>
                <h4 className="text-2xl sm:text-3xl font-bold text-blue-600">2x</h4>
                <p className="text-gray-600 text-sm">Responses</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-bold text-green-600">24/7</h4>
                <p className="text-gray-600 text-sm">Available</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-bold text-purple-600">100%</h4>
                <p className="text-gray-600 text-sm">Accurate</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-bold text-orange-600">∞</h4>
                <p className="text-gray-600 text-sm">Possibilities</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* <Footer /> */}
    </div>
  );
}

export default Home;
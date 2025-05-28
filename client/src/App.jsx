import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./page/Auth";
import Dashboard from "./components/Dashboard";
import Home from "./page/Home";
import PageNotFound from "./page/PageNotFound";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        return userData?.user || userData || null; 
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
        return null;
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        return userData?.accessToken || null;
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        return null;
      }
    }
    return localStorage.getItem("token") || null; 
  });

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("userData");
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData?.user || userData || null);
          setAccessToken(userData?.accessToken || null);
        } catch (error) {
          console.error("Error parsing storage data:", error);
          setUser(null);
          setAccessToken(null);
        }
      } else {
        setUser(null);
        setAccessToken(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, []);

  const handleAuthSuccess = (authData) => {

    const userData = authData.user || authData;
    const token = authData.accessToken;
    
    setUser(userData);
    setAccessToken(token);
    
    localStorage.setItem("userData", JSON.stringify(authData));
    if (token) {
      localStorage.setItem("token", token);
    }
    
    window.dispatchEvent(new Event('userDataChanged'));
  };

  const handleLogout = () => {
    
    setUser(null);
    setAccessToken(null);
    
    localStorage.removeItem("userData");
    localStorage.removeItem("currentView");
    localStorage.removeItem("token");
    
    window.dispatchEvent(new Event('userDataChanged'));
  };

  const isAuthenticated = user && accessToken && user.isVerified !== false;

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
        <div className="pt-16">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  user={user} 
                  isAuthenticated={isAuthenticated} 
                  onLogout={handleLogout} 
                />
              } 
            />
            <Route
              path="/auth"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Auth onAuthSuccess={handleAuthSuccess} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard userData={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/auth?view=login" replace />
                )
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
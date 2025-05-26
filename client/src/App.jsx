// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Home from './page/Home'
// import Auth from './page/Auth'
// import './index.css'

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home/>} />
//         <Route path="/auth" element={<Auth/>} />
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './page/Auth';
import Dashboard from './components/Dashboard';
import Home from './page/Home'; // Your home component

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const userData = JSON.parse(stored);
      return userData?.user || null;
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const userData = JSON.parse(stored);
      return userData?.accessToken || null;
    }
    return null;
  });

  // Handle user authentication state changes
  const handleAuthSuccess = (authData) => {
    setUser(authData.user);
    setAccessToken(authData.accessToken);
    localStorage.setItem('userData', JSON.stringify(authData));
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('currentView');
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        
        <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/auth" 
              element={<Auth onAuthSuccess={handleAuthSuccess} />} 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Auth onAuthSuccess={handleAuthSuccess} />
                )
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
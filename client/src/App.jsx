import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Auth from "./page/Auth";
import Dashboard from "./components/Dashboard";
import Home from "./page/Home";
import PageNotFound from "./page/PageNotFound";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      const userData = JSON.parse(stored);
      return userData?.user || null;
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      const userData = JSON.parse(stored);
      return userData?.accessToken || null;
    }
    return null;
  });

  const handleAuthSuccess = (authData) => {
    setUser(authData.user);
    setAccessToken(authData.accessToken);
    localStorage.setItem("userData", JSON.stringify(authData));
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("currentView");
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />

        <div className="pt-16">
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
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

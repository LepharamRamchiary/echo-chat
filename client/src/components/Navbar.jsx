import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-blue-600">EchoChat</h1>
          </div>

          {/* Register Button - Desktop */}
          <div className="hidden md:block">
            <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300">
              Register
            </button>
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium w-full text-center transition duration-300">
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
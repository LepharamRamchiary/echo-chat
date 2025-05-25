import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, Send, User, LogOut, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const Register = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'verify', 'chat'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const chatEndRef = useRef(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('chat');
      fetchChatHistory();
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      
      setSuccess(response.message);
      setCurrentView('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiCall('/users/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp })
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setSuccess(response.message);
      setCurrentView('chat');
      fetchChatHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiCall('/users/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setSuccess(response.message);
      setCurrentView('chat');
      fetchChatHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await apiCall('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      
      setChats(prev => [...prev, response.data]);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await apiCall('/chat/history');
      setChats(response.data.chats);
    } catch (err) {
      console.error('Failed to fetch chat history:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setChats([]);
    setCurrentView('login');
    setPhoneNumber('');
    setOtp('');
    setMessage('');
    setError('');
    setSuccess('');
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  // Login View
  const LoginView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue chatting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                pattern="[6-9][0-9]{9}"
                maxLength="10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentView('register')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // Register View
  const RegisterView = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Register with your phone number</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                pattern="[6-9][0-9]{9}"
                maxLength="10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // OTP Verification View
  const VerifyView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to<br />
            <span className="font-medium">+91 {phoneNumber}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
              required
              maxLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleRegister}
              className="text-purple-500 hover:text-purple-600 font-medium"
              disabled={loading}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // Chat View (You can customize this as needed)
  const ChatView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-gray-900">{user?.fullname || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-600 font-medium"
          >
            <LogOut className="w-5 h-5 mr-1" /> Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4">
          {chats.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">No messages yet. Start the conversation!</div>
          ) : (
            chats.map((chat, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    chat.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition duration-300 flex items-center"
            disabled={loading || !message.trim()}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );

  // Main render
  return (
    <>
      {currentView === 'login' && <LoginView />}
      {currentView === 'register' && <RegisterView />}
      {currentView === 'verify' && <VerifyView />}
      {currentView === 'chat' && <ChatView />}
    </>
  );
};

export default Register;
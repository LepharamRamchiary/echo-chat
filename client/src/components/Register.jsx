import React, { useState } from "react";
import { Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const Register = ({ onSuccess, onLoginClick }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    if (field === "phoneNumber") {
      const digits = value.replace(/\D/g, "").substring(0, 10);
      setFormData((prev) => ({ ...prev, [field]: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError("");
  };

  const validateForm = () => {
    if (formData.fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters long");
      return false;
    }
    if (formData.fullName.trim().length > 50) {
      setError("Full name cannot exceed 50 characters");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-digit Indian phone number");
      return false;
    }
    return true;
  };

  const registerUserAPI = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: userData.phoneNumber,
          fullname: userData.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Registration API error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const apiResponse = await registerUserAPI(formData);

      console.log("Registration successful:", apiResponse);

      if (onSuccess) {
        onSuccess({
          ...formData,
          message: apiResponse.message,
          data: apiResponse.data,
        });
      }
    } catch (err) {
      let errorMessage = "Failed to register. Please try again.";

      if (
        err.message.includes("409") ||
        err.message.includes("already exists")
      ) {
        errorMessage = "User with this phone number already exists";
      } else if (err.message.includes("400")) {
        errorMessage = "Invalid input. Please check your details.";
      } else if (err.message.includes("network") || err.name === "TypeError") {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Enter your details to get started</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                +91
              </span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                placeholder="Enter 10-digit number"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              loading || !formData.fullName.trim() || !formData.phoneNumber
            }
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              "Send OTP"
            )}
          </button>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">Already have an account?</p>
              <button
                onClick={onLoginClick}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm mt-1 disabled:opacity-50"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>By creating an account, you agree to our</p>
            <p>Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
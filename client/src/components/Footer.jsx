import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">EchoChat</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              When you send a request, you'll receive the same response twice.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">Facebook</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">LinkedIn</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@yourlogo.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 YourLogo. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
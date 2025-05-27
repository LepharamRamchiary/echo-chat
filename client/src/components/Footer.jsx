import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-400 mb-3">TwinTalk</h3>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            When you send a request, you'll receive the same response twice.
          </p>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy;{new Date().getFullYear()} TwinTalk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
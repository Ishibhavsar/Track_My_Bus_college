import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* App Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-soft">
            <div className="text-white text-2xl font-bold">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Track My Bus
        </h1>
        
        {/* Subtitle */}
        <div className="mb-12">
          <span className="inline-block bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-gray-700 font-medium border border-white/30">
            Campus Travel Companion
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full text-lg"
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/signup')}
            className="btn-secondary w-full text-lg"
          >
            New Student? Register here
          </button>
        </div>

        {/* Additional info */}
        <p className="text-gray-600 text-sm mt-8 opacity-80">
          Real-time bus tracking for students, drivers, and coordinators
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

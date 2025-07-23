import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PersistentNavNoMessageProps {
  children: React.ReactNode;
}

const PersistentNavNoMessage: React.FC<PersistentNavNoMessageProps> = ({ children }) => {
  const { logout } = useAuth();
  // No notifications count or clearNotifications needed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="h-16 px-4 flex items-center justify-between" style={{ backgroundColor: '#09D0EF' }}>
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black hover:text-gray-800 focus:outline-none p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors w-10 h-10 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-2xl font-extrabold text-black tracking-tight">prok</span>
        </div>
        
        {/* Search Button - Center */}
        <div className="flex-1 flex justify-center">
          <Link to="/find-people" className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium">Search People & Organizations</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notifications button (top right) */}
          <Link 
            to="/notifications" 
            className="text-black hover:text-gray-800 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors w-10 h-10 flex items-center justify-center relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l-1.5 1.5H6l-1.5-1.5V9.75a6 6 0 0 1 6-6z" />
            </svg>
          </Link>
          <Link to="/" className="text-black hover:text-gray-800 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors w-10 h-10 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <Link 
                to="/dashboard/profile" 
                className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                View/Edit Profile
              </Link>
              <Link 
                to="/dashboard/posts" 
                className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create/My Posts
              </Link>
              <Link 
                to="/jobs" 
                className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link 
                to="/network" 
                className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Network
              </Link>
              <Link 
                to="/dashboard/settings" 
                className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <hr className="my-2 border-gray-300" />
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-40">
        <div className="flex justify-around items-center h-16 px-4">
          {/* Home Button */}
          <Link to="/" className="flex flex-col items-center justify-center flex-1 h-full text-black hover:bg-opacity-10 hover:bg-cyan-500 transition-colors py-2">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Create Post Button */}
          <Link to="/dashboard/create-post" className="flex flex-col items-center justify-center flex-1 h-full text-black hover:bg-opacity-10 hover:bg-cyan-500 transition-colors py-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors" style={{ backgroundColor: '#09D0EF' }}>
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Create Post</span>
          </Link>

          {/* Find People Button */}
          <Link to="/find-people" className="flex flex-col items-center justify-center flex-1 h-full text-black hover:bg-opacity-10 hover:bg-cyan-500 transition-colors py-2">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-medium">Find People</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PersistentNavNoMessage; 
import React from 'react';
import { Link } from 'react-router-dom';

const MessageList: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 p-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">prok</Link>
        <div className="space-x-4">
          <Link to="/messages" className="text-white hover:underline font-semibold">Messages</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Your conversations will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageList; 
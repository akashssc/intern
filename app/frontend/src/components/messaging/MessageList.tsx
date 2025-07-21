import React from 'react';
import PersistentNavNoMessage from '../navigation/PersistentNavNoMessage';

const MessageList: React.FC = () => {
  return (
    <PersistentNavNoMessage>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow border border-gray-300">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-black">Messages</h1>
            <div className="text-center py-8 text-black">
              <div className="bg-cyan-100 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <div className="font-semibold text-cyan-700 mb-1">Prok Team</div>
                <div className="text-black">Hello user, welcome to Prok! - The Prok Team</div>
                <div className="text-xs text-gray-500 mt-2">Just now</div>
              </div>
              <p>No messages yet</p>
              <p className="text-sm mt-2">Your conversations will appear here</p>
            </div>
          </div>
        </div>
        <div className="text-lg text-gray-500 mb-4 text-center mt-8">Messages are still under development.</div>
      </div>
    </PersistentNavNoMessage>
  );
};

export default MessageList; 
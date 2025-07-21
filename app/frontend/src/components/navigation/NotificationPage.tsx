import React from 'react';
import PersistentNav from './PersistentNav';

const NotificationPage: React.FC = () => {
  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-4 text-black">Notifications</h1>
        <div className="bg-cyan-100 rounded-lg p-4 mb-4 w-full text-center">
          <div className="font-semibold text-cyan-700 mb-1">Prok Team</div>
          <div className="text-black">This is a sample notification from the Prok Team.</div>
          <div className="text-xs text-gray-500 mt-2">Just now</div>
        </div>
        <div className="text-lg text-gray-500 mt-4">Notifications are still under development.</div>
      </div>
    </PersistentNav>
  );
};

export default NotificationPage; 
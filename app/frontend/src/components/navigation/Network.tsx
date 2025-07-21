import React from 'react';
import PersistentNav from './PersistentNav';

const Network: React.FC = () => {
  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-4 text-black">Network</h1>
        <div className="text-xl text-gray-600">Network option coming soon</div>
      </div>
    </PersistentNav>
  );
};

export default Network; 
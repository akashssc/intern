import React from 'react';
import PersistentNav from '../navigation/PersistentNav';

const JobList: React.FC = () => {
  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-4 text-black">Jobs</h1>
        <div className="text-xl text-gray-600">Jobs option coming soon</div>
      </div>
    </PersistentNav>
  );
};

export default JobList; 
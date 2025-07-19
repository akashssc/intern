import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { profile, user } = useAuth();
  const avatar = profile?.avatar;
  const username = profile?.username || user?.username;
  console.log('[DEBUG Navbar] avatar:', avatar);
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            {/* Navigation items will be implemented here */}
          </div>
          <div className="flex items-center">
            <Link to="/profile">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-800 overflow-hidden">
                {typeof avatar === 'string' && avatar ? (
                  <img
                    src={`${import.meta.env.PROD ? (import.meta.env.VITE_API_URL || 'https://intern-3ypr.onrender.com') : 'http://localhost:5000'}/uploads/${avatar}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  (username?.[0]?.toUpperCase() || '?')
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import PersistentNav from '../navigation/PersistentNav';

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button className="w-full flex justify-between items-center px-4 py-2 rounded-t font-semibold transition-colors" style={{ backgroundColor: '#09D0EF' }} onClick={() => setOpen(o => !o)}>
        <span className="text-black">{title}</span>
        <span className="text-black">{open ? '-' : '+'}</span>
      </button>
      {open && <div className="border border-gray-300 border-t-0 rounded-b bg-white p-4">{children}</div>}
    </div>
  );
};

const ProfileView: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedProfile, setCachedProfile] = useState<any>(null);

  useEffect(() => {
    refreshProfile(); // Always fetch the latest profile from the backend on mount
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('profile_cache', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (isOffline) {
      const cached = localStorage.getItem('profile_cache');
      if (cached) setCachedProfile(JSON.parse(cached));
    } else {
      setCachedProfile(null);
    }
  }, [isOffline]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshProfile();
    } catch (err) {
      setError('Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  const avatar = profile?.avatar;
  const username = profile?.username || user?.username;
  console.log('[DEBUG ProfileView] avatar:', avatar);
  const email = profile?.email || user?.email;
  const title = profile?.title || 'Insert Title';
  const location = profile?.location || 'Insert Location';
  const bio = profile?.bio || 'Insert Bio';
  const phone = profile?.phone || '';
  const linkedin = profile && (profile as any).social ? (profile as any).social.linkedin : '';
  const github = profile && (profile as any).social ? (profile as any).social.github : '';
  const twitter = profile && (profile as any).social ? (profile as any).social.twitter : '';

  const connections = profile && 'connections' in profile ? (profile as any).connections : 0;
  const mutualConnections = profile && 'mutualConnections' in profile ? (profile as any).mutualConnections : 0;
  const activity = profile && 'activity' in profile ? (profile as any).activity : [];

  const requiredFields = ['username', 'email', 'title', 'location'];
  const dataToShow = isOffline && cachedProfile ? cachedProfile : {
    ...profile,
    username: profile?.username || user?.username,
    email: profile?.email || user?.email,
  };
  const isProfileIncomplete = requiredFields.some(field => !dataToShow?.[field]);

  if (isOffline) {
    if (!cachedProfile) {
      return (
        <PersistentNav>
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-gray-700 mb-4">You are offline. No cached profile data available.</div>
            </div>
          </div>
        </PersistentNav>
      );
    }
  }

  if (isProfileIncomplete) {
    return (
      <PersistentNav>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-700 mb-4">
              Your profile is incomplete. Please fill in all required fields.
            </div>
            <Link to="/profile/edit" className="px-4 py-2 text-white rounded transition-colors font-semibold" style={{ backgroundColor: '#09D0EF' }}>
              Complete Profile
            </Link>
          </div>
        </div>
      </PersistentNav>
    );
  }

  if (!dataToShow) {
    return (
      <PersistentNav>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-gray-600">No profile data available</div>
                          <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 text-white rounded disabled:opacity-50 transition-colors bg-gray-500 hover:bg-gray-600"
            >
              {loading ? 'Loading...' : 'Load Profile'}
            </button>
            </div>
          </div>
        </div>
      </PersistentNav>
    );
  }

  if (error) {
    return (
      <PersistentNav>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600 text-center mb-4">{error}</div>
            <div className="text-center">
                          <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 text-white rounded disabled:opacity-50 transition-colors bg-gray-500 hover:bg-gray-600"
            >
              {loading ? 'Loading...' : 'Retry'}
            </button>
            </div>
          </div>
        </div>
      </PersistentNav>
    );
  }

  // Normalize fields for display
  const normalizedActivity = Array.isArray(activity)
    ? activity
    : (typeof activity === 'string' && activity)
      ? activity.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-black">View/Edit Profile</h1>
        {isOffline && <div className="mb-2 text-yellow-700 bg-yellow-100 p-2 rounded text-center">You are offline. Showing cached profile data.</div>}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-black overflow-hidden" style={{ backgroundColor: '#09D0EF' }}>
                {typeof avatar === 'string' && avatar ? (
                  <img
                    src={`${window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://prok-backend-66jc.onrender.com' : 'http://localhost:5000'}/uploads/${avatar}?t=${Date.now()}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  (username?.[0]?.toUpperCase() || '?')
                )}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div>
                  <h1 className="text-3xl font-bold text-black">{username || <span className="text-gray-400">Empty</span>}</h1>
                  <div className="text-black font-semibold">{title || <span className="text-gray-400">Empty</span>}</div>
                  <div className="text-gray-600">{location || <span className="text-gray-400">Empty</span>}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 items-center">
                  {(profile && (profile as any).social?.linkedin && <a href={(profile as any).social.linkedin} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">LinkedIn</a>)}
                  {(profile && (profile as any).social?.github && <a href={(profile as any).social.github} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">GitHub</a>)}
                  {(profile && (profile as any).social?.twitter && <a href={(profile as any).social.twitter} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">Twitter</a>)}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">Connections: <span className="font-bold text-black">{connections}</span> | Mutual: <span className="font-bold text-black">{mutualConnections}</span></div>
              <Link to="/profile/edit" className="inline-block mt-2 px-4 py-1 text-black rounded transition-colors font-semibold" style={{ backgroundColor: '#09D0EF' }}>Edit Profile</Link>
            </div>
          </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CollapsibleSection title="Bio & Skills">
              <div className="mb-2">{bio || <span className="text-gray-400">Empty</span>}</div>
              <div className="flex flex-wrap gap-2">
                {/* Skills are not directly available in the profile object, so this will be empty */}
                <span className="text-gray-400">Empty</span>
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Work Experience">
              {/* Experience is not directly available in the profile object, so this will be empty */}
              <span className="text-gray-400">Empty</span>
            </CollapsibleSection>
            <CollapsibleSection title="Education">
              {/* Education is not directly available in the profile object, so this will be empty */}
              <span className="text-gray-400">Empty</span>
            </CollapsibleSection>
            <CollapsibleSection title="Contact Information">
              <div>Email: {email || <span className="text-gray-400">Empty</span>}</div>
              <div>Phone: {phone ? phone : <span className="text-gray-400">Empty</span>}</div>
              <div>LinkedIn: {linkedin ? <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{linkedin}</a> : <span className="text-gray-400">Empty</span>}</div>
              <div>GitHub: {github ? <a href={github} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{github}</a> : <span className="text-gray-400">Empty</span>}</div>
              <div>Twitter: {twitter ? <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{twitter}</a> : <span className="text-gray-400">Empty</span>}</div>
            </CollapsibleSection>
          </div>
          <div>
            <CollapsibleSection title="Activity Timeline">
              {normalizedActivity.length ? normalizedActivity.map((act: string, i: number) => (
                <div key={i} className="mb-2">
                  <div className="text-xs text-gray-500">{/* Date is not available in the profile object, so this will be empty */}</div>
                  <div className="text-gray-800">{act}</div>
                </div>
              )) : <span className="text-gray-400">No recent activity</span>}
            </CollapsibleSection>
          </div>
        </div>
        </div>
      </div>
    </PersistentNav>
  );
};

export default ProfileView; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { profileApi } from './api';

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button className="w-full flex justify-between items-center bg-blue-800 text-white px-4 py-2 rounded-t font-semibold" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && <div className="border border-blue-800 border-t-0 rounded-b bg-white p-4">{children}</div>}
    </div>
  );
};

const ProfileView: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
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

  // Handler for image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    await profileApi.uploadProfileImage(file);
    await refreshProfile();
  };

  const avatar = profile?.avatar;
  const username = profile?.username || user?.username;
  console.log('[DEBUG ProfileView] avatar:', avatar);
  const email = profile?.email || user?.email;
  const title = profile?.title || 'Insert Title';
  const location = profile?.location || 'Insert Location';
  const bio = profile?.bio || 'Insert Bio';
  const skills = profile?.skills || [];
  const experience = profile?.experience || [];
  const education = profile?.education || [];
  const connections = profile?.connections || 0;
  const mutualConnections = profile?.mutualConnections || 0;
  const activity = profile?.activity || [];

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
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-700 mb-4">You are offline. No cached profile data available.</div>
          </div>
        </div>
      );
    }
  }

  if (isProfileIncomplete) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-700 mb-4">
            Your profile is incomplete. Please fill in all required fields.
          </div>
          <Link to="/profile/edit" className="btn btn-primary">
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!dataToShow) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-gray-600">No profile data available</div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Profile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 text-center mb-4">{error}</div>
          <div className="text-center">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normalize fields for display
  const normalizedSkills = Array.isArray(dataToShow.skills)
    ? dataToShow.skills
    : (typeof dataToShow.skills === 'string' && dataToShow.skills)
      ? dataToShow.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
  const normalizedExperience = Array.isArray(dataToShow.experience)
    ? dataToShow.experience
    : (typeof dataToShow.experience === 'string' && dataToShow.experience)
      ? dataToShow.experience.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
  const normalizedEducation = Array.isArray(dataToShow.education)
    ? dataToShow.education
    : (typeof dataToShow.education === 'string' && dataToShow.education)
      ? dataToShow.education.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
  const phone = dataToShow.phone || '';
  const linkedin = dataToShow.linkedin || '';
  const github = dataToShow.github || '';
  const twitter = dataToShow.twitter || '';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isOffline && <div className="mb-2 text-yellow-700 bg-yellow-100 p-2 rounded text-center">You are offline. Showing cached profile data.</div>}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-5xl font-bold text-blue-800 overflow-hidden">
              {typeof avatar === 'string' && avatar ? (
                <img
                  src={`http://localhost:5000/uploads/${avatar}`}
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
                <h1 className="text-3xl font-bold text-blue-900">{username || <span className="text-gray-400">Empty</span>}</h1>
                <div className="text-blue-700 font-semibold">{title || <span className="text-gray-400">Empty</span>}</div>
                <div className="text-gray-600">{location || <span className="text-gray-400">Empty</span>}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0 items-center">
                {profile?.social?.linkedin && <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
                {profile?.social?.github && <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">GitHub</a>}
                {profile?.social?.twitter && <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Connections: <span className="font-bold text-blue-800">{connections}</span> | Mutual: <span className="font-bold text-blue-800">{mutualConnections}</span></div>
            <Link to="/profile/edit" className="inline-block mt-2 px-4 py-1 bg-blue-800 text-white rounded hover:bg-blue-900 font-semibold">Edit Profile</Link>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CollapsibleSection title="Bio & Skills">
              <div className="mb-2">{bio || <span className="text-gray-400">Empty</span>}</div>
              <div className="flex flex-wrap gap-2">
                {normalizedSkills.length ? normalizedSkills.map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{skill}</span>
                )) : <span className="text-gray-400">Empty</span>}
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Work Experience">
              {normalizedExperience.length ? normalizedExperience.map((exp: string, i: number) => (
                <div key={i} className="mb-2">
                  <div className="text-gray-700">{exp}</div>
                </div>
              )) : <span className="text-gray-400">Empty</span>}
            </CollapsibleSection>
            <CollapsibleSection title="Education">
              {normalizedEducation.length ? normalizedEducation.map((edu: string, i: number) => (
                <div key={i} className="mb-2">
                  <div className="text-gray-700">{edu}</div>
                </div>
              )) : <span className="text-gray-400">Empty</span>}
            </CollapsibleSection>
            <CollapsibleSection title="Contact Information">
              <div>Email: {email || <span className="text-gray-400">Empty</span>}</div>
              <div>Phone: {phone ? phone : <span className="text-gray-400">Empty</span>}</div>
              <div>LinkedIn: {linkedin ? <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{linkedin}</a> : <span className="text-gray-400">Empty</span>}</div>
              <div>GitHub: {github ? <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">{github}</a> : <span className="text-gray-400">Empty</span>}</div>
              <div>Twitter: {twitter ? <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{twitter}</a> : <span className="text-gray-400">Empty</span>}</div>
            </CollapsibleSection>
          </div>
          <div>
            <CollapsibleSection title="Activity Timeline">
              {activity.length ? activity.map((act: any, i: number) => (
                <div key={i} className="mb-2">
                  <div className="text-xs text-gray-500">{act.date}</div>
                  <div className="text-gray-800">{act.content}</div>
                </div>
              )) : <span className="text-gray-400">No recent activity</span>}
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 
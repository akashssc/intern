import React, { useState, useEffect } from 'react';
import PersistentNav from '../navigation/PersistentNav';
import { usersApi } from './api';
import type { User } from './api';

const FindPeople: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'location' | 'connections'>('name');
  const [connectionStatuses, setConnectionStatuses] = useState<{ [key: number]: 'none' | 'pending' | 'connected' | 'sent' }>({});
  const [sendingRequests, setSendingRequests] = useState<{ [key: number]: boolean }>({});
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [profilePreview, setProfilePreview] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.getAllUsers();
      if (result.error) {
        setError(result.error);
      } else {
        setUsers(result.users);
        // Fetch connection statuses for all users
        await fetchConnectionStatuses(result.users);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatuses = async (userList: User[]) => {
    const statuses: { [key: number]: 'none' | 'pending' | 'connected' | 'sent' } = {};
    
    for (const user of userList) {
      try {
        const result = await usersApi.getConnectionStatus(user.id);
        statuses[user.id] = result.status;
      } catch (err) {
        statuses[user.id] = 'none';
      }
    }
    
    setConnectionStatuses(statuses);
  };

  const handleSendConnection = async (userId: number) => {
    setSendingRequests(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await usersApi.sendConnectionRequest(userId);
      if (result.success) {
        setConnectionStatuses(prev => ({ ...prev, [userId]: 'sent' }));
      }
      setShowRequestPopup(true); // Always show popup regardless of result
    } catch (err) {
      setShowRequestPopup(true); // Always show popup even on error
    } finally {
      setSendingRequests(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <PersistentNav>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center text-red-600 py-8">{error}</div>
        </div>
      </PersistentNav>
    );
  }

  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4">
        {/* Request Sent Popup */}
        {showRequestPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <div className="text-2xl mb-2 font-bold text-green-600">Request Sent</div>
              <div className="mb-4 text-gray-700">Request sent, but this feature is not fully implemented yet.</div>
              <button onClick={() => setShowRequestPopup(false)} className="px-4 py-2 bg-cyan-500 text-white rounded font-semibold">OK</button>
            </div>
          </div>
        )}
        {/* Profile Preview Modal */}
        {profilePreview && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center relative">
              <button onClick={() => setProfilePreview(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-cyan-200 flex items-center justify-center text-3xl font-bold text-white">
                  {profilePreview.avatar ? (
                    <img src={profilePreview.avatar} alt={profilePreview.username} className="w-full h-full object-cover" />
                  ) : (
                    profilePreview.username[0]?.toUpperCase() || '?' 
                  )}
                </div>
                <div className="font-bold text-lg mb-1">{profilePreview.username}</div>
                <div className="text-gray-600 mb-1">{profilePreview.title || 'No job role specified'}</div>
                <div className="text-gray-500 mb-2">{profilePreview.location || 'No location specified'}</div>
                {profilePreview.bio && (
                  <div className="text-gray-700 mb-2 w-full text-left"><span className="font-semibold">Bio:</span> {profilePreview.bio}</div>
                )}
                {profilePreview.experience && (
                  <div className="text-gray-700 mb-2 w-full text-left"><span className="font-semibold">Experience:</span> {profilePreview.experience}</div>
                )}
                {profilePreview.skills && (
                  <div className="text-gray-700 mb-2 w-full text-left"><span className="font-semibold">Skills:</span> {profilePreview.skills}</div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Search people by name, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold shadow transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0 items-center">
            <label className="flex items-center gap-1">
              <span className="font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'location' | 'connections')}
                className="border px-2 py-1 rounded"
              >
                <option value="name">Name</option>
                <option value="location">Location</option>
                <option value="connections">Connections</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex flex-col h-full animate-pulse">
                <div className="flex items-center mb-2 justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            filteredUsers
              .sort((a, b) => {
                switch (sortBy) {
                  case 'name':
                    return a.username.localeCompare(b.username);
                  case 'location':
                    return (a.location || '').localeCompare(b.location || '');
                  case 'connections':
                    return (b.connections || 0) - (a.connections || 0);
                  default:
                    return 0;
                }
              })
              .map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4 flex flex-col h-full transition hover:shadow-lg">
                  <div className="flex items-center mb-2 justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white overflow-hidden" style={{ backgroundColor: '#09D0EF' }}>
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.username[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-black">{user.username}</h3>
                        <p className="text-sm text-gray-600">{user.title}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user.location && (
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {user.location}
                    </p>
                  )}
                  
                  {user.bio && (
                    <p className="text-sm text-gray-700 mb-3 flex-grow">{user.bio}</p>
                  )}
                  
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors" onClick={() => setProfilePreview(user)}>
                      View Profile
                    </button>
                    {connectionStatuses[user.id] === 'none' && (
                      <button 
                        onClick={() => handleSendConnection(user.id)}
                        disabled={sendingRequests[user.id]}
                        className="px-4 py-2 text-sm text-white rounded font-semibold shadow transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#09D0EF' }}
                      >
                        {sendingRequests[user.id] ? 'Sending...' : 'Send Connection'}
                      </button>
                    )}
                    {connectionStatuses[user.id] === 'sent' && (
                      <button 
                        disabled
                        className="px-4 py-2 text-sm text-white rounded font-semibold shadow transition-colors opacity-50"
                        style={{ backgroundColor: '#6B7280' }}
                      >
                        Request Sent
                      </button>
                    )}
                    {connectionStatuses[user.id] === 'pending' && (
                      <button 
                        disabled
                        className="px-4 py-2 text-sm text-white rounded font-semibold shadow transition-colors opacity-50"
                        style={{ backgroundColor: '#F59E0B' }}
                      >
                        Pending
                      </button>
                    )}
                    {connectionStatuses[user.id] === 'connected' && (
                      <button 
                        disabled
                        className="px-4 py-2 text-sm text-white rounded font-semibold shadow transition-colors opacity-50"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        Connected
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            {searchTerm ? 'No users found matching your search.' : 'No users available.'}
          </div>
        )}
      </div>
    </PersistentNav>
  );
};

export default FindPeople; 
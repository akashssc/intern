import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import { useAuth } from '../context/AuthContext';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import PostPreview from '../components/posts/PostPreview';
import PostView from '../components/posts/PostView';
import MessageList from '../components/messaging/MessageList';



const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 p-4 flex items-center justify-between">
        <span className="text-2xl font-extrabold text-white tracking-tight">prok</span>
        <div className="space-x-4">
          <Link to="/messages" className="text-white hover:underline">Messages</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>
        <p className="text-gray-600">Your professional networking dashboard</p>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">Settings</h2>
      <div className="space-y-4 mt-6">
        <Link to="/profile/edit" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold">Edit Profile</Link>
        <Link to="/dashboard/posts" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold">Manage Posts</Link>
        <button onClick={logout} className="block w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold">Sign Out</button>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => (
  <>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/profile" element={<ProfileView />} />
      <Route path="/profile/edit" element={<ProfileEdit />} />
      <Route path="/dashboard/settings" element={<Settings />} />
      <Route path="/dashboard/create-post" element={<PostCreate />} />
      <Route path="/dashboard/posts" element={<PostList />} />
      <Route path="/dashboard/preview-post" element={<PostPreview />} />
      <Route path="/posts/:id" element={<PostView />} />
      <Route path="/messages" element={<MessageList />} />
    </Routes>
  </>
);

export default AppRoutes; 
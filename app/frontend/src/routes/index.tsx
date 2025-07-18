import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import { useAuth } from '../context/AuthContext';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import PostPreview from '../components/posts/PostPreview';

const HomeButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  // Hide on login/signup page and on the dashboard ("/")
  if (!user || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') return null;
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link to="/" className="bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-900">Home</Link>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
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
        <span className="text-2xl font-extrabold text-white tracking-tight">intern</span>
        <div className="space-x-4">
          <Link to="/dashboard/settings" className="text-white hover:underline">Settings</Link>
          <button onClick={logout} className="ml-4 px-3 py-1 bg-white text-blue-700 rounded font-semibold hover:bg-blue-100">Sign Out</button>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>
        <div className="space-y-4">
          <Link to="/dashboard/profile" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">User Profile</Link>
          <Link to="/dashboard/settings" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">Settings</Link>
          <Link to="/dashboard/create-post" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">Create Post</Link>
          <Link to="/dashboard/posts" className="block px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">My Posts</Link>
          <button className="block w-full px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">More Features Coming Soon</button>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => (
  <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
    <h2 className="text-2xl font-bold mb-2">Settings</h2>
    <div>Settings options coming soon.</div>
  </div>
);

const AppRoutes: React.FC = () => (
  <>
    <HomeButton />
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
    </Routes>
  </>
);

export default AppRoutes; 
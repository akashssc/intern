import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import { useAuth } from '../context/AuthContext';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import MyPosts from '../components/posts/MyPosts';
import PostPreview from '../components/posts/PostPreview';
import PostView from '../components/posts/PostView';
import MessageList from '../components/messaging/MessageList';
import FindPeople from '../components/people/FindPeople';
import PersistentNav from '../components/navigation/PersistentNav';
import Network from '../components/navigation/Network';
import NotificationPage from '../components/navigation/NotificationPage';
import JobList from '../components/job-board/JobList';


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
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4">
        <PostList />
      </div>
    </PersistentNav>
  );
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <PersistentNav>
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-3xl font-bold mb-4 text-gray-700">{title}</div>
      <div className="text-lg text-gray-500">Coming soon, the app is under development.</div>
    </div>
  </PersistentNav>
);

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  return (
    <PersistentNav>
      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow mb-4 border border-gray-300">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-black">Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link to="/dashboard/profile" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">View/Edit Profile</Link>
            <Link to="/settings/language" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Language</Link>
            <Link to="/settings/password-security" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Password & Security</Link>
            <Link to="/settings/privacy" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Privacy</Link>
            <Link to="/settings/accessibility" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Accessibility</Link>
            <Link to="/settings/permissions" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Permissions</Link>
            <Link to="/settings/theme" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Theme</Link>
            <Link to="/settings/help" className="block px-4 py-2 text-black hover:bg-opacity-10 hover:bg-cyan-500 rounded transition-colors font-semibold">Help</Link>
            <button onClick={logout} className="block w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors font-semibold">Sign Out</button>
            <a
              href="mailto:akashssc04@gmail.com?subject=Prok%20App%20Feedback"
              className="block w-full px-4 py-2 mt-2 text-white bg-cyan-500 hover:bg-cyan-600 rounded transition-colors font-semibold text-center"
              style={{ textDecoration: 'none' }}
            >
              Feedback
            </a>
          </div>
        </div>
      </div>
    </PersistentNav>
  );
};

const SearchComingSoon: React.FC = () => (
  <PersistentNav>
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-3xl font-bold mb-4 text-gray-700">Search option coming soon</div>
      <div className="text-lg text-gray-500">It is not yet developed.</div>
    </div>
  </PersistentNav>
);

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
      <Route path="/dashboard/posts" element={<MyPosts />} />
      <Route path="/dashboard/preview-post" element={<PostPreview />} />
      <Route path="/posts/:id" element={<PostView />} />
      <Route path="/messages" element={<MessageList />} />
      <Route path="/find-people" element={<FindPeople />} />
      <Route path="/network" element={<Network />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/search-coming-soon" element={<SearchComingSoon />} />
      <Route path="/settings/language" element={<ComingSoon title="Language Options" />} />
      <Route path="/settings/password-security" element={<ComingSoon title="Password & Security" />} />
      <Route path="/settings/privacy" element={<ComingSoon title="Privacy" />} />
      <Route path="/settings/accessibility" element={<ComingSoon title="Accessibility" />} />
      <Route path="/settings/permissions" element={<ComingSoon title="Permissions" />} />
      <Route path="/settings/theme" element={<ComingSoon title="Theme" />} />
      <Route path="/settings/help" element={<ComingSoon title="Help" />} />
    </Routes>
  </>
);

export default AppRoutes; 
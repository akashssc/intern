import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes';
import './index.css';
import React, { useEffect, useState } from 'react';

const DevPopup: React.FC = () => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [lastUserId, setLastUserId] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.id !== lastUserId) {
      setShowPopup(true);
      setLastUserId(user.id);
      setTimeout(() => setShowPopup(false), 1000);
    }
  }, [user, lastUserId]);

  return showPopup ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <div className="text-xl font-bold mb-2 text-cyan-600">The app is still under development.</div>
      </div>
    </div>
  ) : null;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <DevPopup />
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../components/auth/api';
import { profileApi } from '../components/profile/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Profile {
  id: number;
  username: string;
  email: string;
  title?: string;
  location?: string;
  bio?: string;
  skills?: string;
  experience?: string;
  education?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: Profile | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState<Profile | null>(() => {
    const cachedProfile = localStorage.getItem('cachedProfile');
    return cachedProfile ? JSON.parse(cachedProfile) : null;
  });

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const result = await profileApi.getProfile();
      if (result.profile) {
        // Merge user fields if missing in profile
        const mergedProfile = {
          ...result.profile,
          username: result.profile.username || user?.username,
          email: result.profile.email || user?.email,
        };
        setProfile(mergedProfile);
        localStorage.setItem('cachedProfile', JSON.stringify(mergedProfile));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const result = await profileApi.updateProfile(profileData);
      if (result.profile) {
        setProfile(result.profile);
        localStorage.setItem('cachedProfile', JSON.stringify(result.profile));
        return { success: true };
      } else {
        return { success: false, message: result.error || 'Failed to update profile' };
      }
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  const login = async (identifier: string, password: string) => {
    const { data, status } = await authApi.login({ identifier, password });
    if (status === 200 && data.token) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      // Load profile after login
      await refreshProfile();
      return { success: true };
    } else {
      logout();
      return { success: false, message: data.msg || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cachedProfile');
  };

  return (
    <AuthContext.Provider value={{ user, token, profile, login, logout, updateProfile, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileApi } from './api';

const initialProfile = {
  avatar: '',
  username: '',
  title: '',
  location: '',
  bio: '',
  skills: '',
  experience: '',
  education: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  twitter: '',
};

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const validatePhone = (phone: string) => /^\+?\d{7,15}$/.test(phone);

const ProfileEdit: React.FC = () => {
  const { user, profile, updateProfile, refreshProfile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...initialProfile, ...profile });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
      if (cached) {
        setFormData({ ...initialProfile, ...JSON.parse(cached) });
      }
    }
  }, [isOffline]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile || user) {
      setFormData({
        ...initialProfile,
        ...profile,
        username: profile?.username || user?.username || '',
        email: profile?.email || user?.email || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handler for image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
      setUploading(true);
      setUploadError(null);
      try {
        const result = await profileApi.uploadProfileImage(file);
      if (result.error) {
        setUploadError(result.error);
        } else {
        if (result.profile) {
          setProfile(result.profile);
          localStorage.setItem('cachedProfile', JSON.stringify(result.profile));
        }
        await refreshProfile();
        }
      } catch (err) {
      setUploadError('Image upload failed.');
      } finally {
        setUploading(false);
    }
  };

  const avatar = formData.avatar;
  const username = formData.username || user?.username;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username) newErrors.username = 'Username is required.';
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Valid email is required.';
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number.';
    if (!formData.title) newErrors.title = 'Title is required.';
    if (!formData.location) newErrors.location = 'Location is required.';
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isOffline) return;
    setSuccess('');
    setErrors({});
    setShowPopup(false);
    setPopupMessage('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setShowPopup(true);
        setPopupMessage('Profile updated successfully!');
        await refreshProfile();
        setTimeout(() => {
          setShowPopup(false);
          navigate('/dashboard/profile');
        }, 1500);
      } else {
        setErrors({ general: result.message || 'Failed to update profile' });
        setShowPopup(true);
        setPopupMessage(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
      setShowPopup(true);
      setPopupMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isOffline && (
        <div className="mb-2 text-yellow-700 bg-yellow-100 p-2 rounded text-center">You are offline. Editing is disabled. Showing cached profile data.</div>
      )}
      {showPopup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">
          {popupMessage}
        </div>
      )}
      <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-blue-900">Edit Profile</h1>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-5xl font-bold text-blue-800 overflow-hidden">
              {typeof avatar === 'string' && avatar ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${avatar}`}
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                username?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <label className="mt-2 cursor-pointer text-blue-700 font-semibold hover:underline block text-center">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
            {uploading && <div className="text-blue-600 text-xs mt-1">Uploading...</div>}
            {uploadError && <div className="text-red-500 text-xs mt-1">{uploadError}</div>}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-blue-900">Username</label>
              <input name="username" value={formData.username ?? ''} onChange={handleChange} className="w-full input" readOnly />
              {errors.username && <div className="text-red-500 text-xs">{errors.username}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Title</label>
              <input name="title" value={formData.title ?? ''} onChange={handleChange} className="w-full input" />
              {errors.title && <div className="text-red-500 text-xs">{errors.title}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Location</label>
              <input name="location" value={formData.location ?? ''} onChange={handleChange} className="w-full input" />
              {errors.location && <div className="text-red-500 text-xs">{errors.location}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Email</label>
              <input name="email" value={formData.email ?? ''} onChange={handleChange} className="w-full input" readOnly />
              {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Phone</label>
              <input name="phone" value={formData.phone ?? ''} onChange={handleChange} className="w-full input" />
              {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">LinkedIn</label>
              <input name="linkedin" value={formData.linkedin ?? ''} onChange={handleChange} className="w-full input" />
            </div>
            <div>
              <label className="block font-semibold text-blue-900">GitHub</label>
              <input name="github" value={formData.github ?? ''} onChange={handleChange} className="w-full input" />
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Twitter</label>
              <input name="twitter" value={formData.twitter ?? ''} onChange={handleChange} className="w-full input" />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold text-blue-900">Bio</label>
          <textarea name="bio" value={formData.bio ?? ''} onChange={handleChange} className="w-full input" rows={3} />
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-blue-900">Skills (comma separated)</label>
            <input name="skills" value={formData.skills ?? ''} onChange={handleChange} className="w-full input" />
          </div>
          <div>
            <label className="block font-semibold text-blue-900">Experience</label>
            <input name="experience" value={formData.experience ?? ''} onChange={handleChange} className="w-full input" placeholder="e.g. Frontend Developer at Tech Corp (2022-2024)" />
          </div>
          <div>
            <label className="block font-semibold text-blue-900">Education</label>
            <input name="education" value={formData.education ?? ''} onChange={handleChange} className="w-full input" placeholder="e.g. B.Tech at ABC University (2018-2022)" />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/profile')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        </div>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        {errors.general && <div className="text-red-500 text-sm mt-2">{errors.general}</div>}
      </form>
    </div>
  );
};

export default ProfileEdit; 
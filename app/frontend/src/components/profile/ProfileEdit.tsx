import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...initialProfile, ...user });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar || null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      setProfile(prev => ({ ...prev, avatar: file.name })); // In real app, upload and store URL
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!profile.username) newErrors.username = 'Username is required.';
    if (!profile.email || !validateEmail(profile.email)) newErrors.email = 'Valid email is required.';
    if (profile.phone && !validatePhone(profile.phone)) newErrors.phone = 'Invalid phone number.';
    if (!profile.title) newErrors.title = 'Title is required.';
    if (!profile.location) newErrors.location = 'Location is required.';
    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard/profile'), 1200);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-blue-900">Edit Profile</h1>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-5xl font-bold text-blue-800 overflow-hidden">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : (profile.username?.[0]?.toUpperCase() || '?')}
            </div>
            <label className="mt-2 cursor-pointer text-blue-700 font-semibold hover:underline">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-blue-900">Username</label>
              <input name="username" value={profile.username} onChange={handleChange} className="w-full input" />
              {errors.username && <div className="text-red-500 text-xs">{errors.username}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Title</label>
              <input name="title" value={profile.title} onChange={handleChange} className="w-full input" />
              {errors.title && <div className="text-red-500 text-xs">{errors.title}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Location</label>
              <input name="location" value={profile.location} onChange={handleChange} className="w-full input" />
              {errors.location && <div className="text-red-500 text-xs">{errors.location}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Email</label>
              <input name="email" value={profile.email} onChange={handleChange} className="w-full input" />
              {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Phone</label>
              <input name="phone" value={profile.phone} onChange={handleChange} className="w-full input" />
              {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
            </div>
            <div>
              <label className="block font-semibold text-blue-900">LinkedIn</label>
              <input name="linkedin" value={profile.linkedin} onChange={handleChange} className="w-full input" />
            </div>
            <div>
              <label className="block font-semibold text-blue-900">GitHub</label>
              <input name="github" value={profile.github} onChange={handleChange} className="w-full input" />
            </div>
            <div>
              <label className="block font-semibold text-blue-900">Twitter</label>
              <input name="twitter" value={profile.twitter} onChange={handleChange} className="w-full input" />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold text-blue-900">Bio</label>
          <textarea name="bio" value={profile.bio} onChange={handleChange} className="w-full input" rows={3} />
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-blue-900">Skills (comma separated)</label>
            <input name="skills" value={profile.skills} onChange={handleChange} className="w-full input" />
          </div>
          <div>
            <label className="block font-semibold text-blue-900">Experience</label>
            <input name="experience" value={profile.experience} onChange={handleChange} className="w-full input" placeholder="e.g. Frontend Developer at Tech Corp (2022-2024)" />
          </div>
          <div>
            <label className="block font-semibold text-blue-900">Education</label>
            <input name="education" value={profile.education} onChange={handleChange} className="w-full input" placeholder="e.g. B.Tech at ABC University (2018-2022)" />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/profile')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        </div>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default ProfileEdit; 
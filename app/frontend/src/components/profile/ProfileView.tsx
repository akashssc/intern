import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Mock data for demonstration (replace with API data in production)
const mockProfile = {
  title: 'Software Engineer',
  location: 'Bangalore, India',
  avatar: '',
  social: {
    linkedin: 'https://linkedin.com/in/yourprofile',
    github: 'https://github.com/yourprofile',
    twitter: ''
  },
  bio: 'Passionate developer with experience in web and backend technologies.',
  skills: ['React', 'Node.js', 'Python', 'SQL'],
  experience: [
    { company: 'Tech Corp', role: 'Frontend Developer', years: '2022-2024', description: 'Worked on scalable web apps.' },
    { company: 'StartupX', role: 'Intern', years: '2021-2022', description: 'Built MVP features.' }
  ],
  education: [
    { school: 'ABC University', degree: 'B.Tech Computer Science', years: '2018-2022' }
  ],
  contact: {
    email: '',
    phone: ''
  },
  activity: [
    { type: 'post', content: 'Shared a new project on GitHub.', date: '2024-06-01' },
    { type: 'connection', content: 'Connected with Jane Doe.', date: '2024-05-28' }
  ],
  connections: 42,
  mutualConnections: 5
};

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
  const { user } = useAuth();
  const profile = user ? { ...mockProfile, ...user } : null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-5xl font-bold text-blue-800">
              {profile?.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : (profile?.username?.[0]?.toUpperCase() || '?')}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-900">{profile?.username || <span className="text-gray-400">Insert Name</span>}</h1>
                <div className="text-blue-700 font-semibold">{profile?.title || <span className="text-gray-400">Insert Title</span>}</div>
                <div className="text-gray-600">{profile?.location || <span className="text-gray-400">Insert Location</span>}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                {profile?.social?.linkedin && <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
                {profile?.social?.github && <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">GitHub</a>}
                {profile?.social?.twitter && <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Connections: <span className="font-bold text-blue-800">{profile?.connections}</span> | Mutual: <span className="font-bold text-blue-800">{profile?.mutualConnections}</span></div>
            <Link to="/profile/edit" className="inline-block mt-2 px-4 py-1 bg-blue-800 text-white rounded hover:bg-blue-900 font-semibold">Edit Profile</Link>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CollapsibleSection title="Bio & Skills">
              <div className="mb-2">{profile?.bio || <span className="text-gray-400">Insert Bio</span>}</div>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.length ? profile.skills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{skill}</span>
                )) : <span className="text-gray-400">Insert Skills</span>}
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Work Experience">
              {profile?.experience?.length ? profile.experience.map((exp, i) => (
                <div key={i} className="mb-2">
                  <div className="font-bold text-blue-900">{exp.role} @ {exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.years}</div>
                  <div className="text-gray-700">{exp.description}</div>
                </div>
              )) : <span className="text-gray-400">Insert Experience</span>}
            </CollapsibleSection>
            <CollapsibleSection title="Education">
              {profile?.education?.length ? profile.education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <div className="font-bold text-blue-900">{edu.degree}</div>
                  <div className="text-xs text-gray-500">{edu.school} ({edu.years})</div>
                </div>
              )) : <span className="text-gray-400">Insert Education</span>}
            </CollapsibleSection>
            <CollapsibleSection title="Contact Information">
              <div>Email: {profile?.email || <span className="text-gray-400">Insert Email</span>}</div>
              <div>Phone: {profile?.contact?.phone || <span className="text-gray-400">Insert Phone</span>}</div>
            </CollapsibleSection>
          </div>
          <div>
            <CollapsibleSection title="Activity Timeline">
              {profile?.activity?.length ? profile.activity.map((act, i) => (
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
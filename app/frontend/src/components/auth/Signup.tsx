import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from './api';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const { data, status } = await authApi.signup({ username, email, password });
    if (status === 201) {
      setSuccess('Signup successful! Redirecting to login...');
      alert('Signup successful! Please login now.');
      navigate('/login');
    } else {
      setError(data.msg || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center mb-4">
          <span className="text-4xl font-extrabold text-blue-700 tracking-tight mb-2">prok</span>
          <span className="text-lg text-gray-600 font-semibold">Create your account</span>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-semibold text-lg"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-700 hover:underline font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 
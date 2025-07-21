import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier || !password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    
    console.log('Attempting login with:', { identifier, password });
    
    try {
      const result = await login(identifier, password);
      console.log('Login result:', result);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        navigate('/');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col items-center mb-4">
          <span className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#09D0EF' }}>prok</span>
          <span className="text-lg text-gray-600 font-semibold">Sign in to your account</span>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
              placeholder="Username or Email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          <button
            type="submit"
            className="w-full py-3 px-4 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
            style={{ backgroundColor: '#09D0EF' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="font-semibold hover:underline transition-colors" style={{ color: '#09D0EF' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 
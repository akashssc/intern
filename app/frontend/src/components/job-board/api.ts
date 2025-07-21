import { API_URL } from '../../config';

export const jobsApi = {
  getJobs: async () => {
    const response = await fetch(`${API_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { error: 'Token expired. Please login again.' };
    }
    
    return data;
  },

  getJob: async (jobId: number) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { error: 'Token expired. Please login again.' };
    }
    
    return data;
  },

  applyForJob: async (jobId: number) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { error: 'Token expired. Please login again.' };
    }
    
    return data;
  },
}; 
import { API_URL } from '../../config';

export const profileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
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
      return { profile: null, error: 'Token expired. Please login again.' };
    }
    
    return { profile: data, error: response.ok ? null : data.msg };
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { profile: null, error: 'Token expired. Please login again.' };
    }
    
    return { profile: data, error: response.ok ? null : data.msg };
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${API_URL}/api/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }
      
      // Handle token expiration
      if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profile_cache');
        window.location.href = '/login';
        return { image_url: null, profile: null, error: 'Token expired. Please login again.' };
      }
      
      return {
        image_url: data.url,
        profile: data.profile,
        error: response.ok ? null : (data.msg || 'Image upload failed'),
      };
    } catch (error) {
      return { image_url: null, profile: null, error: 'Network error' };
    }
  },

  deleteProfileImage: async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile/image`, {
        method: 'DELETE',
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
        return { success: false, error: 'Token expired. Please login again.' };
      }
      
      return {
        success: response.ok,
        error: response.ok ? null : (data.msg || 'Failed to delete image'),
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
}; 
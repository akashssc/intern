const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const profileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
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
      return {
        image_url: data.url,
        profile: data.profile,
        error: response.ok ? null : (data.msg || 'Image upload failed'),
      };
    } catch (error) {
      return { image_url: null, profile: null, error: 'Network error' };
    }
  },
}; 
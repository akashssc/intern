import { API_URL } from '../../config';

export const postsApi = {
  createPost: async ({ title, content, media, category }: { title: string; content: string; media?: File | null; category?: string }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (category) formData.append('category', category);
    if (media) formData.append('media', media);

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Do not set Content-Type for FormData; browser will set it
      },
      body: formData,
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

  getPosts: async (excludeUserId?: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { error: 'You are not logged in. Please login to view posts.' };
    }
    let url = `${API_URL}/api/posts`;
    if (excludeUserId) {
      url += `?exclude_user_id=${excludeUserId}`;
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    // Handle token expiration or malformed token
    if (response.status === 401 || response.status === 422 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { error: 'Session expired or invalid. Please login again.' };
    }
    return data;
  },

  getMyPosts: async () => {
    const response = await fetch(`${API_URL}/api/my-posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    // Handle token expiration
    if (response.status === 401 || (data.msg && data.msg.toLowerCase().includes('token'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile_cache');
      window.location.href = '/login';
      return { error: 'Token expired. Please login again.' };
    }
    // The backend returns a list, not an object with 'posts'
    return { posts: data };
  },

  deletePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
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
      return { error: 'Token expired. Please login again.' };
    }
    
    return data;
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
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

  editPost: async (postId: number, { title, content, media, category, tags, removeMedia }: { title?: string; content?: string; media?: File | null; category?: string; tags?: string[]; removeMedia?: boolean }) => {
    let body: FormData | string;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (media) {
      body = new FormData();
      if (title !== undefined) body.append('title', title);
      if (content !== undefined) body.append('content', content);
      if (category !== undefined) body.append('category', category);
      if (tags !== undefined) body.append('tags', tags.join(','));
      if (removeMedia) body.append('remove_media', '1');
      body.append('media', media);
      // Do not set Content-Type for FormData
    } else if (removeMedia) {
      body = JSON.stringify({ title, content, category, tags, remove_media: true });
      headers['Content-Type'] = 'application/json';
    } else {
      body = JSON.stringify({ title, content, category, tags });
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers,
      body,
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
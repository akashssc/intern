const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const postsApi = {
  createPost: async ({ title, content, media, category, visibility }: { title: string; content: string; media?: File | null; category?: string; visibility?: string }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (category) formData.append('category', category);
    if (visibility) formData.append('visibility', visibility);
    if (media) formData.append('media', media);

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Do not set Content-Type for FormData; browser will set it
      },
      body: formData,
    });
    return response.json();
  },

  getPosts: async () => {
    const response = await fetch(`${API_URL}/api/posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getMyPosts: async () => {
    const response = await fetch(`${API_URL}/api/my-posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  deletePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  editPost: async (postId: number, { title, content, media, category, visibility, tags, removeMedia }: { title?: string; content?: string; media?: File | null; category?: string; visibility?: string; tags?: string[]; removeMedia?: boolean }) => {
    let body: FormData | string;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (media) {
      body = new FormData();
      if (title !== undefined) body.append('title', title);
      if (content !== undefined) body.append('content', content);
      if (category !== undefined) body.append('category', category);
      if (visibility !== undefined) body.append('visibility', visibility);
      if (tags !== undefined) body.append('tags', tags.join(','));
      if (removeMedia) body.append('remove_media', '1');
      body.append('media', media);
      // Do not set Content-Type for FormData
    } else if (removeMedia) {
      body = JSON.stringify({ title, content, category, visibility, tags, remove_media: true });
      headers['Content-Type'] = 'application/json';
    } else {
      body = JSON.stringify({ title, content, category, visibility, tags });
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers,
      body,
    });
    return response.json();
  },
}; 
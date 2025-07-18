import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postsApi } from './api';

const PostPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, content, media, previewUrl } = (location.state || {}) as {
    title: string;
    content: string;
    media?: File | null;
    previewUrl?: string | null;
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!title || !content) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 text-gray-700">No post data to preview.</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={() => navigate('/dashboard/create-post')}>Back to Create Post</button>
        </div>
      </div>
    );
  }

  const handlePost = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await postsApi.createPost({ title, content, media });
      if (result && result.id) {
        setSuccess('Post created successfully!');
        setTimeout(() => navigate('/dashboard/posts'), 1200);
      } else {
        setError(result?.msg || 'Failed to create post.');
      }
    } catch (err) {
      setError('An error occurred while creating the post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Preview Post</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="text-gray-700 mb-2">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {previewUrl && media && media.type.startsWith('image') && (
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded" />
          )}
          {previewUrl && media && media.type.startsWith('video') && (
            <video src={previewUrl} controls className="max-h-40 rounded" />
          )}
        </div>
        {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
        {success && <div className="text-green-600 font-medium mb-2">{success}</div>}
        <div className="flex space-x-4">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded font-semibold"
            onClick={() => navigate('/dashboard/create-post')}
            disabled={loading}
          >
            Back
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            onClick={handlePost}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPreview; 
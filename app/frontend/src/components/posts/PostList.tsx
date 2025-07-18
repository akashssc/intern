import React, { useEffect, useState } from 'react';
import { postsApi } from './api';
import { Link, useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  user_id: number;
  username?: string;
  title?: string;
  content: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await postsApi.getMyPosts();
      if (Array.isArray(result)) {
        setPosts(result);
      } else {
        setError(result?.msg || 'Failed to fetch posts.');
      }
    } catch (err) {
      setError('An error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeletingId(postId);
    setDeleteError(null);
    try {
      const response = await postsApi.deletePost(postId);
      if (response && response.msg === 'Post deleted') {
        setPosts(posts => posts.filter(p => p.id !== postId));
      } else {
        setDeleteError(response?.msg || 'Failed to delete post.');
      }
    } catch (err) {
      setDeleteError('An error occurred while deleting the post.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  if (!posts.length) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 text-gray-700">There are no posts to show.</div>
          <Link to="/dashboard/create-post" className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold">Create Post</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between mb-4">
        <button className="bg-gray-400 text-white px-4 py-2 rounded font-semibold" onClick={() => navigate(-1)}>Back</button>
      </div>
      {deleteError && <div className="text-center text-red-600 mb-2">{deleteError}</div>}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2 justify-between">
              <div>
                <span className="font-bold text-blue-700 mr-2">{post.username || 'User'}</span>
                <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <button
                className={`bg-red-600 text-white px-3 py-1 rounded font-semibold ml-2 ${deletingId === post.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
              >
                {deletingId === post.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {post.title && <div className="font-semibold text-lg mb-1">{post.title}</div>}
            <div className="mb-2 text-gray-800">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            {post.media_url && (
              <div className="mt-2">
                {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={post.media_url} alt="Post Media" className="max-h-60 rounded" />
                ) : (
                  <video src={post.media_url} controls className="max-h-60 rounded" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi } from './api';

interface Post {
  id: number;
  user_id: number;
  username?: string;
  title: string;
  content: string;
  media_url?: string;
  category?: string;
  visibility?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const PostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editVisibility, setEditVisibility] = useState(post?.visibility || 'Public');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await postsApi.getPosts();
        const found = result.posts?.find((p: Post) => p.id === Number(id));
        if (!found) {
          setError('Post not found.');
        } else {
          setPost(found);
        }
      } catch {
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post) setEditVisibility(post.visibility || 'Public');
  }, [post]);

  const handleEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditVisibility(post.visibility || 'Public');
    setEditing(true);
  };
  const handleEditCancel = () => {
    setEditing(false);
    setEditTitle('');
    setEditContent('');
  };
  const handleEditSave = async () => {
    if (!post) return;
    setEditLoading(true);
    try {
      const updated = await postsApi.editPost(post.id, { title: editTitle, content: editContent });
      setPost({ ...post, title: updated.title, content: updated.content, visibility: updated.visibility });
      setEditing(false);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-2 justify-between">
          <span className="font-bold text-blue-700 mr-2">{post.username || 'User'}</span>
          <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
        </div>
        {editing ? (
          <>
            <input
              className="font-semibold text-lg mb-1 border rounded px-2 py-1 w-full"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              disabled={editLoading}
            />
            <div className="flex gap-2 text-xs text-gray-500 mb-1">
              <select
                className="border rounded px-2 py-1"
                value={editVisibility}
                onChange={e => setEditVisibility(e.target.value)}
                disabled={editLoading}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="mb-2 text-gray-800">
              <textarea
                className="w-full border rounded px-2 py-1"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={6}
                disabled={editLoading}
              />
            </div>
            {post.media_url && (
              <div className="mt-2">
                {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={post.media_url}
                    alt="Post Media"
                    className="max-h-60 rounded w-full object-cover"
                  />
                ) : (
                  <video
                    src={post.media_url}
                    controls
                    className="max-h-60 rounded w-full"
                    preload="none"
                  />
                )}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded font-semibold"
                onClick={handleEditSave}
                disabled={editLoading}
              >
                Save
              </button>
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded font-semibold"
                onClick={handleEditCancel}
                disabled={editLoading}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="font-semibold text-lg mb-1">{post.title}</div>
            <div className="flex gap-2 text-xs text-gray-500 mb-1">
              {post.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{post.category}</span>}
              {post.visibility && <span className="bg-gray-200 px-2 py-0.5 rounded">{post.visibility}</span>}
            </div>
            <div className="mb-2 text-gray-800">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            {post.media_url && (
              <div className="mt-2">
                {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={post.media_url}
                    alt="Post Media"
                    className="max-h-60 rounded w-full object-cover"
                  />
                ) : (
                  <video
                    src={post.media_url}
                    controls
                    className="max-h-60 rounded w-full"
                    preload="none"
                  />
                )}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded font-semibold"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded font-semibold"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostView; 
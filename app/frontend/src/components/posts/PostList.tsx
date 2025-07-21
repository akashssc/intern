import React, { useEffect, useState } from 'react';
import { postsApi } from './api';
import { useAuth } from '../../context/AuthContext';
import { FaRegHeart, FaHeart, FaRegComment, FaShareAlt } from 'react-icons/fa';

interface Post {
  id: number;
  user_id: number;
  username?: string;
  title: string;
  content: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

interface LocalComment {
  postId: number;
  username: string;
  content: string;
  createdAt: string;
}

const PostList: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [liked, setLiked] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({});
  const [showCommentBox, setShowCommentBox] = useState<{ [postId: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: number]: string }>({});
  const [comments, setComments] = useState<{ [postId: number]: LocalComment[] }>({});
  const [sharePostId, setSharePostId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await postsApi.getPosts(user?.id);
        if (result.error) {
          setError(result.error);
          setPosts([]);
        } else {
          setPosts(Array.isArray(result.posts) ? result.posts : []);
          // Initialize like counts and liked state
          const initialLikes: { [postId: number]: boolean } = {};
          const initialCounts: { [postId: number]: number } = {};
          (result.posts || []).forEach((post: any) => {
            initialLikes[post.id] = false;
            initialCounts[post.id] = post.likes_count || 0;
          });
          setLiked(initialLikes);
          setLikeCounts(initialCounts);
        }
      } catch (err) {
        setError('An error occurred while fetching posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.id) fetchPosts();
  }, [user]);

  const handleLike = (postId: number) => {
    setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: prev[postId] + (liked[postId] ? -1 : 1)
    }));
  };

  const handleCommentInput = (postId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    const newComment: LocalComment = {
      postId,
      username: user?.username || 'You',
      content,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (postId: number) => {
    setSharePostId(postId);
    setCopied(false);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!posts.length) return <div className="text-center text-gray-600 py-8">No posts found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="Preview" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border-4 border-white" onClick={e => e.stopPropagation()} />
          <button onClick={() => setPreviewImg(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
      {/* Share Modal */}
      {sharePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setSharePostId(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSharePostId(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            <div className="mb-2 font-bold text-lg">Share Post</div>
            <div className="mb-4 text-gray-700 break-all">
              {`${window.location.origin}/posts/${sharePostId}`}
            </div>
            <button
              className="px-4 py-2 bg-cyan-500 text-white rounded font-semibold"
              onClick={() => handleCopy(`${window.location.origin}/posts/${sharePostId}`)}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 flex flex-col h-full transition hover:shadow-lg">
            <div className="flex items-center mb-2 justify-between">
              <span className="font-bold text-black mr-2">{post.username || 'User'}</span>
            </div>
            <div className="font-semibold text-lg text-black mb-1">{post.title}</div>
            <div className="text-gray-700 mb-2">{post.content}</div>
            {post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) && (
              <img
                src={post.media_url}
                alt="media"
                className="rounded-lg mb-2 max-h-64 object-cover cursor-pointer border border-gray-200 hover:border-cyan-400"
                onClick={() => setPreviewImg(post.media_url!)}
              />
            )}
            {post.media_url && post.media_url.match(/\.(mp4|mov|avi|webm)$/i) && (
              <video src={post.media_url} controls className="rounded-lg mb-2 max-h-64 w-full" />
            )}
            <div className="flex items-center text-gray-500 text-sm mt-2">
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className={`flex items-center gap-1 transition-colors ${liked[post.id] ? 'text-red-500' : 'text-gray-600 hover:text-cyan-500'}`}
                onClick={() => handleLike(post.id)}
              >
                {liked[post.id] ? <FaHeart /> : <FaRegHeart />} {likeCounts[post.id] || 0} Like
              </button>
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-cyan-500 transition-colors"
                onClick={() => setShowCommentBox(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              >
                <FaRegComment /> Comment
              </button>
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-cyan-500 transition-colors"
                onClick={() => handleShare(post.id)}
              >
                <FaShareAlt /> Share
              </button>
            </div>
            {/* Comment Box */}
            {showCommentBox[post.id] && (
              <div className="mt-4">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={e => handleCommentInput(post.id, e.target.value)}
                  placeholder="Add a comment..."
                  className="border px-3 py-2 rounded w-full mb-2"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                />
                <button
                  className="px-3 py-1 bg-cyan-500 text-white rounded font-semibold"
                  onClick={() => handleAddComment(post.id)}
                >
                  Post
                </button>
                {/* Show comments */}
                <div className="mt-4 space-y-2">
                  {(comments[post.id] || []).map((c, i) => (
                    <div key={i} className="bg-gray-100 rounded p-2 text-sm">
                      <span className="font-semibold text-black mr-2">{c.username}:</span>
                      <span>{c.content}</span>
                      <span className="ml-2 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList; 
import React, { useEffect, useState, useCallback } from 'react';
import { postsApi } from './api';
import { Link } from 'react-router-dom';
import { FaEllipsisV, FaRegHeart, FaHeart, FaShareAlt, FaEdit, FaTrash } from 'react-icons/fa';
import PersistentNav from '../navigation/PersistentNav';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;
const MEDIA_TYPES = ['All', 'Images', 'Videos'];

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
  likes_count?: number;
  comments_count?: number;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
    <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
    <div className="h-32 bg-gray-200 rounded w-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [mediaType, setMediaType] = useState('All');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Fetch only the current user's posts
  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await postsApi.getMyPosts();
      let filtered: Post[] = Array.isArray(result.posts) ? result.posts : [];
      if (user && user.id) {
        filtered = filtered.filter(post => post.user_id === user.id);
      }
      // Filter by search
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          post =>
            (post.title && post.title.toLowerCase().includes(s)) ||
            (post.content && post.content.toLowerCase().includes(s))
        );
      }
      // Filter by media type
      if (mediaType === 'Images') {
        filtered = filtered.filter(post => post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif)$/i));
      } else if (mediaType === 'Videos') {
        filtered = filtered.filter(post => post.media_url && post.media_url.match(/\.(mp4|mov|avi|webm)$/i));
      }
      // Sort
      filtered = filtered.sort((a, b) =>
        sort === 'newest'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const paged = filtered.slice(0, page * PAGE_SIZE);
      setPosts(paged);
      setHasMore(paged.length < filtered.length);
    } catch (err) {
      setError('An error occurred while fetching your posts.');
    } finally {
      setLoading(false);
    }
  }, [user, sort, page, search, mediaType]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setLoading(true);
    try {
      await postsApi.deletePost(postId);
      setPosts(posts => posts.filter(p => p.id !== postId));
    } catch (err) {
      setError('Failed to delete post.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPostId) return;
    setLoading(true);
    try {
      const result = await postsApi.editPost(editingPostId, {
        title: editTitle,
        content: editContent,
      });
      if (result && result.id) {
        setPosts(posts => posts.map(p => p.id === editingPostId ? { ...p, ...result } : p));
        setEditingPostId(null);
      }
    } catch (err) {
      setError('Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleLike = async (postId: number) => {
    setLikeLoading(postId);
    try {
      await postsApi.likePost(postId);
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setPosts(posts => posts.map(p => 
        p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    } finally {
      setLikeLoading(null);
    }
  };

  const handleShare = (postId: number) => {
    setSharePopupId(postId);
    setCopiedId(null);
  };

  const handleCopyLink = (postId: number) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
  };

  const handleCloseShare = () => {
    setSharePopupId(null);
    setCopiedId(null);
  };



  const handleMenuToggle = (postId: number) => {
    // This function is no longer needed as visibility is removed
  };

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <PersistentNav>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">My Posts</h1>
          <Link 
            to="/dashboard/create-post"
            className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            ✨ Create Post
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search your posts..."
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {MEDIA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Start sharing your thoughts and experiences!</p>
            <Link
              to="/dashboard/create-post"
              className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {editingPostId === post.id ? (
                  <div className="p-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Post title"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows={4}
                      placeholder="Post content"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-black mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FaEllipsisV className="text-gray-600" />
                          </button>
                          {menuOpenId === post.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={() => handleEdit(post)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FaEdit className="text-blue-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                      
                      {post.media_url && (
                        <div className="mb-4">
                          {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={post.media_url}
                              alt="Post media"
                              className="w-full h-48 object-cover rounded-lg cursor-pointer"
                              onClick={() => window.open(post.media_url, '_blank')}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : post.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                            <video
                              src={post.media_url}
                              controls
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : null}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            disabled={likeLoading === post.id}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                          >
                            {likedPosts[post.id] ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart />
                            )}
                            {post.likes_count || 0}
                          </button>
                          <button
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                          >
                            <FaShareAlt />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {/* Share Popup */}
        {sharePopupId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Share Post</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleCopyLink(sharePopupId)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {copiedId === sharePopupId ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleCloseShare}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PersistentNav>
  );
};

export default MyPosts; 
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { postsApi } from './api';
import { Link, useNavigate } from 'react-router-dom';
import { FaEllipsisV, FaRegHeart, FaHeart, FaRegCommentDots, FaShareAlt } from 'react-icons/fa';

const CATEGORIES = ['All', 'Tech', 'News', 'Art', 'Science'];
const VISIBILITY = ['All', 'Public', 'Private'];
const TAGS = ['All', 'React', 'Python', 'AI', 'Startup'];
const PAGE_SIZE = 10;
const MEDIA_TYPES = ['All', 'Images', 'Videos'];
const VISIBILITY_OPTIONS = ['All', 'Public', 'Private'];

// Add a Post type for clarity
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

// Error Boundary
class PostListErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="text-center text-red-600 py-8">Something went wrong loading posts.</div>;
    return this.props.children;
  }
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

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [category, setCategory] = useState('All');
  const [visibility, setVisibility] = useState('All');
  const [tag, setTag] = useState('All');
  const [mediaType, setMediaType] = useState('All');
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedCategory, setDebouncedCategory] = useState(category);
  const [debouncedVisibility, setDebouncedVisibility] = useState(visibility);
  const [debouncedTag, setDebouncedTag] = useState(tag);
  const [visibilityFilter, setVisibilityFilter] = useState('All');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editVisibility, setEditVisibility] = useState('Public');
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: string[] }>({});
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Debounce search and filter inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCategory(category);
      setDebouncedVisibility(visibility);
      setDebouncedTag(tag);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, category, visibility, tag]);

  // Fetch posts with pagination, search, and sort (mocked for now)
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await postsApi.getPosts();
      let filtered: Post[] = Array.isArray(result.posts) ? result.posts : [];
      if (debouncedSearch) {
        filtered = filtered.filter(post =>
          post.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          post.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      if (visibilityFilter !== 'All') filtered = filtered.filter(post => post.visibility === visibilityFilter);
      if (debouncedCategory !== 'All') filtered = filtered.filter(post => post.category === debouncedCategory);
      if (debouncedVisibility !== 'All') filtered = filtered.filter(post => post.visibility === debouncedVisibility);
      if (debouncedTag !== 'All') filtered = filtered.filter(post => post.tags?.includes(debouncedTag));
      if (mediaType === 'Images') filtered = filtered.filter(post => post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif)$/i));
      if (mediaType === 'Videos') filtered = filtered.filter(post => post.media_url && post.media_url.match(/\.(mp4|mov|avi|webm)$/i));
      filtered = filtered.sort((a: Post, b: Post) =>
        sort === 'newest'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const paged = filtered.slice(0, page * PAGE_SIZE);
      setPosts(paged);
      setHasMore(paged.length < filtered.length);
    } catch (err) {
      setError('An error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, page, debouncedCategory, debouncedVisibility, debouncedTag, mediaType, visibilityFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Infinite scroll: observe last post
  useEffect(() => {
    if (loading) return;
    if (!hasMore) return;
    if (!lastPostRef.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });
    observer.current.observe(lastPostRef.current);
  }, [loading, hasMore, posts]);

  // Sorting UI
  const handleSort = (type: 'newest' | 'oldest') => setSort(type);

  // Filtering UI (search only for now)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Lazy load images using Intersection Observer
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  useEffect(() => {
    if (!imageRefs.current.length) return;
    const imgObserver = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    });
    imageRefs.current.forEach(img => {
      if (img && img.dataset.src) {
        imgObserver.observe(img);
      }
    });
    return () => imgObserver.disconnect();
  }, [posts]);

  // Memoize posts to avoid unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts]);

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setLoading(true);
    try {
      await postsApi.deletePost(postId);
      setPosts(posts => posts.filter(p => p.id !== postId));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditVisibility(post.visibility || 'Public');
  };
  const handleEditCancel = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };
  const handleEditSave = async (postId: number) => {
    setEditLoading(true);
    try {
      const updated = await postsApi.editPost(postId, { title: editTitle, content: editContent, visibility: editVisibility });
      setPosts(posts => posts.map(p => p.id === postId ? { ...p, title: updated.title, content: updated.content, visibility: updated.visibility } : p));
      setEditingPostId(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    setLikeLoading(postId);
    try {
      await postsApi.likePost(postId);
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setPosts(posts => posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
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
  const handleCommentInput = (postId: number, value: string) => {
    setCommentInputs(inputs => ({ ...inputs, [postId]: value }));
  };
  const handleAddComment = (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setComments(c => ({ ...c, [postId]: [...(c[postId] || []), text] }));
    setCommentInputs(inputs => ({ ...inputs, [postId]: '' }));
  };
  const handleMenuToggle = (postId: number) => {
    setMenuOpenId(menuOpenId === postId ? null : postId);
  };

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <PostListErrorBoundary>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={handleSearch}
            className="border px-3 py-2 rounded w-full md:w-64"
          />
          <div className="flex gap-2 mt-2 md:mt-0 items-center">
            <Link
              to="/dashboard/create-post"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-800"
            >
              + Create Post
            </Link>
            <label className="flex items-center gap-1">
              <span className="font-semibold">Time:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
                className="border px-2 py-1 rounded"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              <span className="font-semibold">Type:</span>
              <select
                value={mediaType}
                onChange={e => { setMediaType(e.target.value); setPage(1); }}
                className="border px-2 py-1 rounded"
              >
                {MEDIA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1">
              <span className="font-semibold">Visibility:</span>
              <select
                value={visibilityFilter}
                onChange={e => { setVisibilityFilter(e.target.value); setPage(1); }}
                className="border px-2 py-1 rounded"
              >
                {VISIBILITY_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </div>
        {/* Removed category, visibility, and tag select buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : memoizedPosts.map((post: Post, idx: number) => (
                <div
                  key={post.id}
                  ref={idx === posts.length - 1 ? lastPostRef : undefined}
                  className="bg-white rounded-lg shadow p-4 flex flex-col h-full transition hover:shadow-lg"
                >
                  <div className="flex items-center mb-2 justify-between">
                    <span className="font-bold text-blue-700 mr-2">{post.username || 'User'}</span>
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={() => handleMenuToggle(post.id)}
                      >
                        <FaEllipsisV />
                      </button>
                      {menuOpenId === post.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => handleEdit(post)}
                            disabled={editingPostId === post.id}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                            onClick={() => handleDelete(post.id)}
                            disabled={editingPostId === post.id}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {post.title && (
                    editingPostId === post.id ? (
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
                      </>
                    ) : (
                      <Link to={`/posts/${post.id}`} className="font-semibold text-lg mb-1 text-blue-700 hover:underline">
                        {post.title}
                      </Link>
                    )
                  )}
                  {/* Category & Visibility */}
                  <div className="flex gap-2 text-xs text-gray-500 mb-1">
                    {post.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{post.category}</span>}
                    {post.visibility && <span className="bg-gray-200 px-2 py-0.5 rounded">{post.visibility}</span>}
                  </div>
                  <div className="mb-2 text-gray-800">
                    {editingPostId === post.id ? (
                      <textarea
                        className="w-full border rounded px-2 py-1"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={4}
                        disabled={editLoading}
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    )}
                  </div>
                  {post.media_url && (
                    <div className="mt-2">
                      {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          ref={el => imageRefs.current[idx] = el}
                          data-src={post.media_url}
                          alt="Post Media"
                          className="max-h-60 rounded w-full object-cover"
                          loading="lazy"
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
                  <div className="flex gap-4 mt-4 items-center">
                    <button
                      className={`flex items-center gap-1 ${likedPosts[post.id] ? 'text-red-600' : 'text-gray-600'} font-semibold`}
                      onClick={() => handleLike(post.id)}
                      disabled={likeLoading === post.id}
                    >
                      {likedPosts[post.id] ? <FaHeart /> : <FaRegHeart />} {post.likes_count || 0}
                    </button>
                  </div>
                  {/* Comments UI */}
                  <div className="mt-2 relative">
                    <input
                      id={`comment-input-${post.id}`}
                      className="w-full border rounded px-2 py-1 mb-1"
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => handleCommentInput(post.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                    />
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      onClick={() => handleAddComment(post.id)}
                    >
                      Add
                    </button>
                    <div className="mt-1 space-y-1">
                      {(comments[post.id] || []).map((c, i) => (
                        <div key={i} className="text-sm text-gray-700 bg-gray-100 rounded px-2 py-1">{c}</div>
                      ))}
                    </div>
                    {/* Share button at bottom right */}
                    <button
                      className="absolute bottom-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1 shadow"
                      onClick={() => handleShare(post.id)}
                    >
                      <FaShareAlt /> Share
                    </button>
                    {/* Share popup */}
                    {sharePopupId === post.id && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                            onClick={handleCloseShare}
                          >
                            ×
                          </button>
                          <div className="mb-4 font-semibold text-lg">Share this post</div>
                          <div className="mb-2 text-sm text-gray-700 break-all border rounded px-2 py-1 bg-gray-100">
                            {`${window.location.origin}/posts/${post.id}`}
                          </div>
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full"
                            onClick={() => handleCopyLink(post.id)}
                          >
                            {copiedId === post.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>
        {loading && <div className="text-center py-4">Loading...</div>}
        {!loading && !posts.length && (
          <div className="text-center text-gray-600 py-8">No posts found.</div>
        )}
        {!loading && hasMore && (
          <div className="text-center py-4 text-gray-400">Scroll to load more...</div>
        )}
      </div>
    </PostListErrorBoundary>
  );
};

export default PostList; 
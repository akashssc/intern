import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import PersistentNav from '../navigation/PersistentNav';

const DRAFT_KEY = 'post_draft';

const PostCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState('Public');
  const navigate = useNavigate();

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { title, content, previewUrl } = JSON.parse(draft);
        setTitle(title || '');
        setContent(content || '');
        setPreviewUrl(previewUrl || null);
      } catch {}
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, previewUrl }));
  }, [title, content, previewUrl]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(url);
      // Save previewUrl in draft
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, previewUrl: url }));
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    // Clear draft on successful preview
    localStorage.removeItem(DRAFT_KEY);
    navigate('/dashboard/preview-post', {
      state: { title, content, media, previewUrl, visibility }
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <PersistentNav>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Create Post</h2>
        <form className="space-y-6" onSubmit={handlePreview}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter post title"
            />
          </div>
          {/* Visibility */}
          {/* Removed visibility select */}
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write your post..."
              className="bg-white"
            />
          </div>
          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Media (Image or Video, optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
            />
            {previewUrl && (
              <div className="mt-2">
                {media && media.type.startsWith('image') ? (
                  <img src={previewUrl} alt="Preview" className="max-h-40 rounded" />
                ) : (
                  <video src={previewUrl} controls className="max-h-40 rounded" />
                )}
              </div>
            )}
          </div>
          {error && <div className="text-red-600 font-medium">{error}</div>}
          <div className="flex space-x-4">
            <button
              type="button"
              className="w-1/2 text-white py-2 rounded font-semibold transition-colors bg-gray-500 hover:bg-gray-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 text-black py-2 rounded font-semibold transition-colors"
              style={{ backgroundColor: '#09D0EF' }}
            >
              Preview
            </button>
          </div>
        </form>
      </div>
    </div>
    </PersistentNav>
  );
};

export default PostCreate; 
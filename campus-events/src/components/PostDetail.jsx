import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../components/context/AuthContext';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import PostCard from '../components/PostCard.jsx';

export default function PostDetail() {
  const { id: postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/posts/${postId}`);
      setPost(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const response = await api.post(`/api/posts/${postId}/comment`, {
        comment: newComment,
      });

      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data.comment],
        comments_count: (prevPost.comments_count || 0) + 1,
      }));
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) return <ErrorMessage message="Post not found." />;

  const userAvatarPlaceholder = `https://placehold.co/50x50/e0e7ff/4338ca?text=${encodeURIComponent(user.name.charAt(0))}&font=inter`;

  return (
    <div className="max-w-2xl mx-auto px-6 mt-8 font-inter">
      {/* Post */}
      <PostCard post={post} onPostUpdate={handlePostUpdate} />

      {/* Comment Form */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow mt-6"
      >
        <img
          src={user.profile_photo || userAvatarPlaceholder}
          alt="Your avatar"
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => (e.target.src = userAvatarPlaceholder)}
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2.5 bg-gray-100 rounded-lg border border-gray-300 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={isCommenting}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            isCommenting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isCommenting ? '...' : 'Post'}
        </button>
      </form>

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {post.comments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">No comments yet.</p>
        ) : (
          post.comments.map(comment => <Comment key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  );
}

// --- Reusable Comment Component ---
const Comment = ({ comment }) => {
  const avatarPlaceholder = `https://placehold.co/40x40/e0e7ff/4338ca?text=${encodeURIComponent(comment.user.name.charAt(0))}&font=inter`;

  return (
    <div className="flex gap-3">
      <img
        src={comment.user.profile_photo || avatarPlaceholder}
        alt={comment.user.name}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => (e.target.src = avatarPlaceholder)}
      />
      <div className="bg-gray-100 p-3 rounded-xl flex-1">
        <p className="text-sm text-gray-900">
          <Link
            to={`/profile/${comment.user.id}`}
            className="font-semibold text-gray-900 mr-1"
          >
            {comment.user.name}
          </Link>
          {comment.comment}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

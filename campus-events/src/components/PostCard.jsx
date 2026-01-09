import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const HeartIcon = ({ isLiked, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill={isLiked ? '#ef4444' : 'none'}
    stroke={isLiked ? '#ef4444' : '#4a5568'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CommentIcon = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="#4a5568"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default function PostCard({ post, onPostUpdate }) {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [commentCount] = useState(post.comments_count || 0);

  const handleLikeToggle = async () => {
    const originalLikeState = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(likeCount + (!isLiked ? 1 : -1));

    try {
      await api.post(`/api/posts/${post.id}/like`);

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          isLiked: !isLiked,
          likes_count: likeCount + (!isLiked ? 1 : -1),
          comments_count: commentCount,
        });
      }
    } catch (err) {
      console.error('Failed to like post', err);
      setIsLiked(originalLikeState);
      setLikeCount(originalLikeCount);
    }
  };

  const handleCommentClick = () => {
    navigate(`/post/${post.id}`);
  };

  const placeholderName = post.user?.name || 'U';
  const userAvatarPlaceholder = `https://placehold.co/50x50/e0e7ff/4338ca?text=${encodeURIComponent(
    placeholderName.charAt(0)
  )}&font=inter`;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden font-inter">
      {/* Header */}
      <div className="flex items-center p-3">
        <img
          src={post.user?.profile_photo || userAvatarPlaceholder}
          alt={post.user?.name || 'Unknown User'}
          className="w-10 h-10 rounded-full object-cover mr-3"
          onError={(e) => (e.target.src = userAvatarPlaceholder)}
        />
        <div>
          {post.user && post.user.id ? (
            <Link
              to={`/profile/${post.user.id}`}
              className="text-gray-900 font-semibold text-sm"
            >
              {post.user.name}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold text-sm">
              {post.user?.name || 'Unknown User'}
            </span>
          )}
          <p className="text-gray-400 text-xs">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Post Image */}
      <img
        src={post.image_url}
        alt={post.caption || 'Post image'}
        className="w-full max-h-[700px] object-cover border-t border-b border-gray-100"
      />

      {/* Post Content */}
      <div className="p-3">
        {/* Actions */}
        <div className="flex gap-3 mb-2">
          <button onClick={handleLikeToggle} className="p-1">
            <HeartIcon isLiked={isLiked} />
          </button>
          <button onClick={handleCommentClick} className="p-1">
            <CommentIcon />
          </button>
        </div>

        {/* Like Count */}
        <p className="text-gray-900 font-semibold text-sm mb-1">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        <p className="text-gray-900 text-sm leading-5 mb-1">
          {post.user && post.user.id ? (
            <Link
              to={`/profile/${post.user.id}`}
              className="font-semibold text-gray-900 mr-1"
            >
              {post.user.name}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900 mr-1">
              {post.user?.name || 'Unknown User'}
            </span>
          )}
          {post.caption}
        </p>

        {/* Comment Count */}
        <Link
          to={`/post/${post.id}`}
          className="text-gray-400 text-sm block mt-1"
        >
          View all {commentCount} comments
        </Link>
      </div>
    </div>
  );
}

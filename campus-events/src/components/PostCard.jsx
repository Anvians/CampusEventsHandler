import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const HeartIcon = ({ isLiked, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill={isLiked ? '#38bdf8' : 'none'}
    stroke={isLiked ? '#38bdf8' : '#94a3b8'}
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
    stroke="#94a3b8"
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
    <div className="futuristic-card overflow-hidden font-inter shadow-[0_30px_90px_rgba(56,189,248,0.12)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60">
        <img
          src={post.user?.profile_photo || userAvatarPlaceholder}
          alt={post.user?.name || 'Unknown User'}
          className="h-12 w-12 rounded-full object-cover border-2 border-cyan-400/20"
          onError={(e) => (e.target.src = userAvatarPlaceholder)}
        />
        <div>
          {post.user && post.user.id ? (
            <Link
              to={`/profile/${post.user.id}`}
              className="text-slate-100 font-semibold hover:text-cyan-300"
            >
              {post.user.name}
            </Link>
          ) : (
            <span className="text-slate-100 font-semibold">
              {post.user?.name || 'Unknown User'}
            </span>
          )}
          <p className="text-slate-500 text-xs mt-1">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-950">
        <img
          src={post.image_url}
          alt={post.caption || 'Post image'}
          className="w-full max-h-[620px] object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 to-transparent" />
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-300">
            <button onClick={handleLikeToggle} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/90 text-cyan-300 transition hover:bg-slate-900">
              <HeartIcon isLiked={isLiked} />
            </button>
            <button onClick={handleCommentClick} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/90 text-slate-300 transition hover:bg-slate-900">
              <CommentIcon />
            </button>
          </div>
          <span className="rounded-full bg-slate-900/90 px-3 py-2 text-sm font-semibold text-slate-300">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </span>
        </div>

        <div className="text-slate-100 text-base leading-7">
          <span className="font-semibold text-slate-100">
            {post.user && post.user.id ? (
              <Link to={`/profile/${post.user.id}`} className="hover:text-cyan-300">
                {post.user.name}
              </Link>
            ) : (
              <span>{post.user?.name || 'Unknown User'}</span>
            )}
          </span>{' '}
          {post.caption}
        </div>

        <Link
          to={`/post/${post.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
        >
          View all {commentCount} comments
        </Link>
      </div>
    </div>
  );
}

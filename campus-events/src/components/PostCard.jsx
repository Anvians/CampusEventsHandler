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
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);

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
  const userAvatarPlaceholder = `https://placehold.co/50x50/e0e7ff/4338ca?text=${encodeURIComponent(placeholderName.charAt(0))}&font=inter`;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <img
          src={post.user?.profile_photo || userAvatarPlaceholder}
          alt={post.user?.name || 'Unknown User'}
          style={styles.avatar}
          onError={(e) => { e.target.src = userAvatarPlaceholder; }}
        />
        <div>
          
          {post.user && post.user.id ? (
            <Link to={`/profile/${post.user.id}`} style={styles.userName}>
              {post.user.name}
            </Link>
          ) : (
            <span style={styles.userName}>{post.user?.name || 'Unknown User'}</span>
          )}
          
          <p style={styles.postDate}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Post Image */}
      <img
        src={post.image_url}
        alt={post.caption || 'Post image'}
        style={styles.postImage}
      />

      {/* Post Content */}
      <div style={styles.content}>
        {/* Like & Comment Buttons */}
        <div style={styles.actions}>
          <button onClick={handleLikeToggle} style={styles.iconButton}>
            <HeartIcon isLiked={isLiked} />
          </button>
          <button onClick={handleCommentClick} style={styles.iconButton}>
            <CommentIcon />
          </button>
        </div>

        {/* Like Count */}
        <p style={styles.likeCount}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        <p style={styles.caption}>
          
          {post.user && post.user.id ? (
            <Link to={`/profile/${post.user.id}`} style={styles.captionUser}>
              {post.user.name}
            </Link>
          ) : (
            <span style={styles.captionUser}>{post.user?.name || 'Unknown User'}</span>
          )}
          
          {' '}
          {post.caption}
        </p>
        
        {/* Comment Count */}
        <Link to={`/post/${post.id}`} style={styles.commentLink}>
          View all {post.comments_count} comments
        </Link>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '12px',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a202c',
    textDecoration: 'none',
  },
  postDate: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  },
  postImage: {
    width: '100%',
    maxHeight: '700px',
    objectFit: 'cover',
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
  },
  content: {
    padding: '12px 16px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
  },
  likeCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '8px 0',
  },
  caption: {
    fontSize: '14px',
    color: '#1a202c',
    margin: 0,
    lineHeight: 1.5,
  },
  captionUser: {
    fontWeight: '600',
    color: 'inherit',
    textDecoration: 'none',
  },
  commentLink: {
    fontSize: '14px',
    color: '#718096',
    textDecoration: 'none',
    display: 'block',
    marginTop: '6px',
  },
};
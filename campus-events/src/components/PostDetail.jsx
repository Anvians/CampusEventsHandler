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

  // Function to fetch the post and its comments
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

  // Fetch data on component mount
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
      console.log('Ankit Sharma');
      console.log('Comment posted:', response.data);
      
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
    <div style={styles.container}>
      {/*  The Post */}
      <PostCard post={post} onPostUpdate={handlePostUpdate} />

      <form style={styles.commentForm} onSubmit={handleCommentSubmit}>
        <img
          src={user.profile_photo || userAvatarPlaceholder}
          alt="Your avatar"
          style={styles.commentAvatar}
          onError={(e) => { e.target.src = userAvatarPlaceholder; }}
        />
        <input
          type="text"
          style={styles.commentInput}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit" style={styles.commentButton} disabled={isCommenting}>
          {isCommenting ? '...' : 'Post'}
        </button>
      </form>

      {/*  Comments List */}
      <div style={styles.commentList}>
        {post.comments.length === 0 ? (
          <p style={styles.noComments}>No comments yet.</p>
        ) : (
          post.comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}

// --- Reusable Comment Component ---
const Comment = ({ comment }) => {
  const avatarPlaceholder = `https://placehold.co/40x40/e0e7ff/4338ca?text=${encodeURIComponent(comment.user.name.charAt(0))}&font=inter`;
  return (
    <div style={styles.comment}>
      <img
        src={comment.user.profile_photo || avatarPlaceholder}
        alt={comment.user.name}
        style={styles.commentAvatar}
        onError={(e) => { e.target.src = avatarPlaceholder; }}
      />
      <div style={styles.commentBody}>
        <p style={styles.commentText}>
          <Link to={`/profile/${comment.user.id}`} style={styles.commentUser}>
            {comment.user.name}
          </Link>
          {' '}
          {comment.comment}
        </p>
        <p style={styles.commentDate}>
          {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    maxWidth: '700px',
    margin: '32px auto',
    padding: '0 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  commentForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    marginTop: '24px',
  },
  commentInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    fontSize: '15px',
    outline: 'none',
  },
  commentButton: {
    padding: '10px 16px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  commentList: {
    marginTop: '24px',
  },
  comment: {
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
  },
  commentAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentBody: {
    backgroundColor: '#f3f4f6',
    padding: '10px 14px',
    borderRadius: '12px',
    flex: 1,
  },
  commentText: {
    margin: 0,
    fontSize: '15px',
    color: '#1a202c',
    lineHeight: 1.5,
  },
  commentUser: {
    fontWeight: '600',
    color: 'inherit',
    textDecoration: 'none',
  },
  commentDate: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#718096',
  },
  noComments: {
    textAlign: 'center',
    fontSize: '15px',
    color: '#718096',
    padding: '20px',
  },
};

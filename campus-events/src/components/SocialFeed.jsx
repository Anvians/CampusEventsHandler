import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import PostCard from '../components/PostCard.jsx'; 

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      setLoading(true);
      console.log('Fetching feed from API...');
      const response = await api.get('/api/posts/feed');
      console.log('Feed data received:', response.data);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostUpdate = (updatedPost) => {
    setPosts(currentPosts =>
      currentPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  let content;
  if (loading) {
    content = <Spinner />;
  } else if (error) {
    content = <ErrorMessage message={error} />;
  } else if (posts.length === 0) {
    content = (
      <div style={styles.emptyFeed}>
        <h3 style={styles.emptyTitle}>Your feed is empty</h3>
        <p style={styles.emptyText}>
          Follow other users or create your first post to see content here.
        </p>
      </div>
    );
  } else {
    content = (
      <div style={styles.feedList}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdate={handlePostUpdate} 
          />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {content}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px', 
    margin: '32px auto',
    padding: '0 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  emptyFeed: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  emptyText: {
    fontSize: '15px',
    color: '#718096',
    marginTop: '8px',
  },
};


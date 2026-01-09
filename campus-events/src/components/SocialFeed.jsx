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
      const response = await api.get('/api/posts/feed');
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
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === updatedPost.id ? updatedPost : p
      )
    );
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="mx-auto max-w-2xl md:px-4 py-8">
      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800">
            Your feed is empty
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Follow other users or create your first post to see content here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

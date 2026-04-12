import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-10">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
          <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
          Campus Feed
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Stay connected to campus life.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-base sm:text-lg">
          Discover posts, event highlights, and updates from students across clubs and departments.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="futuristic-card border border-slate-700/60 p-10 text-center shadow-[0_30px_80px_rgba(56,189,248,0.12)]">
          <h3 className="text-3xl font-semibold text-slate-100">Your feed is empty</h3>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Follow classmates or create your first post to bring the feed to life.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/create-post"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
            >
              Create your first post
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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

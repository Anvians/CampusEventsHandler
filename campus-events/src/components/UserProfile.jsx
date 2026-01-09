import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.jsx';
import api from '../utils/api.js';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function UserProfile() {
  const { id: profileId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${profileId}`);
      setProfileData(response.data);
      setIsFollowing(response.data.isFollowing);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentId = Number(currentUser?.id);
    const viewedId = Number(profileId);

    if (!currentId || !viewedId) return;

    if (currentId === viewedId) {
      navigate('/profile', { replace: true });
      return;
    }

    fetchProfile();
  }, [profileId, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (isProcessingFollow) return;
    setIsProcessingFollow(true);

    const apiCall = isFollowing
      ? api.delete(`/api/users/${profileId}/unfollow`)
      : api.post(`/api/users/${profileId}/follow`);

    try {
      await apiCall;
      setIsFollowing(!isFollowing);
      setProfileData((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (isFollowing ? -1 : 1),
        },
      }));
    } finally {
      setIsProcessingFollow(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profileData) return <ErrorMessage message="Could not load profile." />;

  const placeholderAvatar = `https://placehold.co/150x150/e0e7ff/4338ca?text=${encodeURIComponent(
    profileData.name.charAt(0)
  )}&font=inter`;

  const isOwnProfile = Number(currentUser.id) === Number(profileData.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center rounded-2xl bg-white p-8 shadow-sm">
        <img
          src={profileData.profile_photo || placeholderAvatar}
          onError={(e) => (e.target.src = placeholderAvatar)}
          alt="Profile"
          className="h-36 w-36 rounded-full border-4 border-indigo-100 object-cover"
        />

        <div className="ml-8 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {profileData.name}
          </h1>
          <p className="text-sm text-gray-500">{profileData.email}</p>
          <p className="mt-2 text-sm text-gray-600">
            {profileData.bio || 'No bio provided.'}
          </p>

          {/* Stats */}
          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <span>
              <strong>{profileData._count.posts}</strong> Posts
            </span>
            <span>
              <strong>{profileData._count.followers}</strong> Followers
            </span>
            <span>
              <strong>{profileData._count.following}</strong> Following
            </span>
          </div>

          {!isOwnProfile && (
            <div className="mt-4">
              <button
                onClick={handleFollowToggle}
                disabled={isProcessingFollow}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  isFollowing
                    ? 'border border-gray-300 bg-gray-100 text-gray-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isProcessingFollow
                  ? 'Processing...'
                  : isFollowing
                  ? 'Unfollow'
                  : 'Follow'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-gray-200">
        {['posts', 'clubs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="py-6">
        {activeTab === 'posts' && (
          <ProfilePosts posts={profileData.posts} />
        )}
        {activeTab === 'clubs' && (
          <ProfileClubs clubs={profileData.club_memberships} />
        )}
      </div>
    </div>
  );
}

/* ---------- Sub Components ---------- */

const ProfilePosts = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500">No posts yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
        >
          <img
            src={post.image_url}
            alt={post.caption}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const ProfileClubs = ({ clubs }) => {
  if (clubs.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500">
        Not a member of any clubs.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {clubs.map(({ club }) => (
        <Link
          to={`/club/${club.id}`}
          key={club.id}
          className="flex items-center rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50"
        >
          <img
            src={
              club.club_logo_url ||
              `https://placehold.co/50x50?text=${club.name.charAt(0)}`
            }
            alt={club.name}
            className="mr-4 h-12 w-12 rounded-full object-cover"
          />
          <span className="font-semibold text-gray-800">
            {club.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

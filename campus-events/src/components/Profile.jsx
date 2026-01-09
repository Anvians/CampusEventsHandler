import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from '../utils/api';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users/me');
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, []);

  const renderTabContent = () => {
    if (!profileData) return null;

    switch (activeTab) {
      case 'posts':
        return <ProfilePosts posts={profileData.posts} />;
      case 'clubs':
        return <ProfileClubs clubs={profileData.club_memberships} />;
      case 'events':
        return <ProfileEvents events={profileData.registrations} />;
      default:
        return null;
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profileData) return <ErrorMessage message="Could not load profile." />;

  const placeholderAvatar = `https://placehold.co/150x150/e0e7ff/4338ca?text=${encodeURIComponent(profileData.name.charAt(0))}&font=inter`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start bg-white p-8 rounded-2xl shadow-md">
        <img
          src={profileData.profile_photo || placeholderAvatar}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100 mb-4 md:mb-0 md:mr-8"
          onError={(e) => { e.target.src = placeholderAvatar; }}
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
          <p className="text-gray-500 mt-1">{profileData.email}</p>
          <p className="text-gray-600 mt-2">{profileData.bio || 'No bio provided.'}</p>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 mt-4">
            <div className="text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{profileData._count.posts}</span> Posts
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg">Edit Profile</button>
            <button onClick={logout} className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg">Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-200 mt-8">
        {['posts', 'clubs', 'events'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold -mb-2 border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'posts' ? 'Posts' : tab === 'clubs' ? 'My Clubs' : 'My Events'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

// --- Profile Tab Components ---
const ProfilePosts = ({ posts }) => {
  if (posts.length === 0) return <p className="text-center text-gray-500 py-10">No posts yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map(post => (
        <div key={post.id} className="relative pb-full bg-gray-100 rounded-lg overflow-hidden">
          <img src={post.image_url} alt={post.caption} className="absolute top-0 left-0 w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

const ProfileClubs = ({ clubs }) => {
  if (clubs.length === 0) return <p className="text-center text-gray-500 py-10">You haven't joined any clubs yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {clubs.map(m => (
        <Link to={`/club/${m.club.id}`} key={m.club.id} className="block">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition">
            <img
              src={m.club.club_logo_url || `https://placehold.co/60x60?text=${m.club.name.charAt(0)}`}
              alt={m.club.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-900">{m.club.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

const ProfileEvents = ({ events }) => {
  if (events.length === 0) return <p className="text-center text-gray-500 py-10">You are not registered for any events.</p>;

  return (
    <div className="flex flex-col gap-4">
      {events.map(reg => (
        <Link to={`/event/${reg.event.id}`} key={reg.event.id} className="block">
          <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition">
            <span className="font-semibold text-gray-900">{reg.event.title}</span>
            <span className="text-gray-500 text-sm mt-1">
              {reg.event.club.name} &bull; {new Date(reg.event.event_datetime).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import api from '../utils/api';
import Spinner from './common/Spinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';

export default function Profile() {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Fixed: Initialize state with empty strings, not undefined variables
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    year: '',
    profile_photo: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  
  useEffect(() => { 
     console.log('Ankit Sharma');

    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/me');
      console.log('Profile response', response.data)
      setProfileData(response.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  // Open Modal and populate data
  const handleOpenEdit = () => {
    setFormData({
      name: profileData.name || '',
      bio: profileData.bio || '',
      department: profileData.department || '',
      year: profileData.year || '',
      profile_photo: null,
    });
    setPreviewImage(profileData.profile_photo);
    setIsModalOpen(true);
  };

  // Handle Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_photo: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit Updated Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name);
      dataPayload.append('bio', formData.bio);
      dataPayload.append('department', formData.department);
      dataPayload.append('year', formData.year);
      
      if (formData.profile_photo) {
        dataPayload.append('profile_photo', formData.profile_photo);
      }

      const response = await api.put('/api/users/me', dataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfileData(response.data);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };
  console.log('profileData', profileData);
  
  const renderTabContent = () => {
    if (!profileData) return null;
    switch (activeTab) {
      case 'posts': return <ProfilePosts posts={profileData.posts} />;
      case 'clubs': return <ProfileClubs clubs={profileData.club_memberships} />;
      case 'events': return <ProfileEvents events={profileData.registrations} />;
      default: return null;
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profileData) return <ErrorMessage message="Could not load profile." />;

  const placeholderAvatar = `https://placehold.co/150x150/e0e7ff/4338ca?text=${encodeURIComponent(profileData.name.charAt(0))}&font=inter`;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      
      {/* Framer Motion Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal title="Edit Profile" onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Image Upload UI */}
              <div className="flex flex-col items-center gap-3">
                <img 
                  src={previewImage || placeholderAvatar} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100"
                />
                <label className="cursor-pointer bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition">
                  Change Photo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Grid for Department & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. CS"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- Main Profile Content --- */}
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
          
          {/* Added Department and Year Display */}
          {(profileData.department || profileData.year) && (
             <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-sm text-indigo-600 font-medium">
                {profileData.department && <span>{profileData.department}</span>}
                {profileData.department && profileData.year && <span>•</span>}
                {profileData.year && <span>Year {profileData.year}</span>}
             </div>
          )}

          <p className="text-gray-600 mt-3">{profileData.bio || 'No bio provided.'}</p>

          <div className="flex justify-center md:justify-start gap-8 mt-4">
            <div className="text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{profileData._count?.posts || 0}</span> Posts
            </div>
            {/* Added Followers/Following placeholders if you expand the schema later */}
             <div className="text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{profileData._count?.followers || 0}</span> Followers
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-4 mt-6">
            <button 
              onClick={handleOpenEdit} 
              className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition"
            >
              Edit Profile
            </button>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b-2 border-gray-200 mt-8">
        {['posts', 'clubs', 'events'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold -mb-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'posts' ? 'Posts' : tab === 'clubs' ? 'My Clubs' : 'My Events'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

// --- Sub Components ---

const ProfilePosts = ({ posts = [] }) => {
  console.log('This is post', posts)
  if (posts.length === 0) return <p className="text-center text-gray-500 py-10">No posts yet.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map(post => (
        <div key={post.id} className="relative pb-full bg-gray-100 rounded-lg overflow-hidden aspect-square">
          <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

const ProfileClubs = ({ clubs = [] }) => {
  if (clubs.length === 0) return <p className="text-center text-gray-500 py-10">No clubs joined.</p>;
  return (
    <div className="flex flex-col gap-4">
      {clubs.map(m => (
        <Link to={`/club/${m.club.id}`} key={m.club.id} className="block group">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm group-hover:shadow-md transition">
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

const ProfileEvents = ({ events = [] }) => {
  if (events.length === 0) return <p className="text-center text-gray-500 py-10">No events registered.</p>;
  return (
    <div className="flex flex-col gap-4">
      {events.map(reg => (
        <Link to={`/event/${reg.event.id}`} key={reg.event.id} className="block group">
          <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm group-hover:shadow-md transition">
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
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    year: '',
    profile_photo: null,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profile_photo: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

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
        headers: { 'Content-Type': 'multipart/form-data' },
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

  const placeholderAvatar = `https://placehold.co/150x150/e0e7ff/4338ca?text=${encodeURIComponent(
    profileData.name.charAt(0)
  )}&font=inter`;

  const mainStats = [
    { label: 'Posts', value: profileData._count?.posts || 0 },
    { label: 'Clubs', value: profileData.club_memberships?.length || 0 },
    { label: 'Events', value: profileData.registrations?.length || 0 },
  ];

  const engagementLevel = profileData._count?.posts + profileData.club_memberships?.length + profileData.registrations?.length;

  return (
    <div className="max-w-full px-4 py-10 sm:px-2">
      <AnimatePresence>
        {isModalOpen && (
          <Modal title="Edit Profile" onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-700/60 bg-slate-950/90 p-6">
                <img
                  src={previewImage || placeholderAvatar}
                  alt="Preview"
                  className="h-28 w-28 rounded-full object-cover border-4 border-cyan-400/20"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Change Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="futuristic-input"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. CS"
                    className="futuristic-input"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                    className="futuristic-input"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="futuristic-input resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="futuristic-button border border-slate-700/60 bg-slate-950/90 text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="futuristic-button-primary"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <div className="grid gap-4 w-full xl:grid-cols-[minmax(0,1.9fr)_minmax(0,0.85fr)]">
        <section className="futuristic-card overflow-hidden border border-slate-700/60 shadow-[0_35px_90px_rgba(14,165,233,0.12)] p-4 min-w-0">
          <div className="grid gap-4 lg:grid-cols-[360px_1fr] min-w-0">
            <div className="rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-2 text-center min-w-0">
              <img
                src={profileData.profile_photo || placeholderAvatar}
                alt="Profile"
                className="mx-auto h-36 w-36 rounded-full object-cover border-4 border-cyan-400/20"
                onError={(e) => {
                  e.target.src = placeholderAvatar;
                }}
              />
              <p className="mt-5 text-sm uppercase tracking-[0.35em] text-cyan-300">Campus Profile</p>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-100">{profileData.name}</h1>
              <p className="mt-3 text-slate-400">{profileData.bio || 'No bio set yet. Write something memorable.'}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {mainStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4">
                    <p className="text-3xl font-extrabold text-slate-100">{stat.value}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Account details</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">Good to see you, {profileData.name.split(' ')[0]}.</h2>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
                    <button
                      onClick={handleOpenEdit}
                      className="futuristic-button-primary min-w-[130px]"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={logout}
                      className="futuristic-button border border-slate-700/60 bg-slate-950/90 text-slate-200 min-w-[130px]"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-2 grid-cols-1 md:grid-cols-3">
                  <ProfileDetail label="Email" value={profileData.email} />
                  <ProfileDetail label="Department" value={profileData.department || 'Unspecified'} />
                  <ProfileDetail label="Year" value={profileData.year ? `Year ${profileData.year}` : 'Unspecified'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Activity pulse</p>
                <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <StatCard label="Engage.." value={engagementLevel} />
                  <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Campus rank</p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-100">{engagementLevel > 8 ? 'Rising Star' : 'Active Member'}</h3>
                    <p className="mt-2 text-sm text-slate-400">Keep engaging with clubs and events to unlock the next level.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 mr-[-200px]  max-w-[200px]">
          <div className="futuristic-panel p-6 min-w-0 mr-[-240px]">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Quick actions</p>
            <div className="mt-6 space-y-4 min-w-0">
              <div className="rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5">
                <p className="text-sm text-slate-400">Department</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{profileData.department || 'Undeclared'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5">
                <p className="text-sm text-slate-400">Year Level</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{profileData.year ? `Year ${profileData.year}` : 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5">
                <p className="text-sm text-slate-400">Campus progress</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                    style={{ width: `${Math.min(100, (engagementLevel || 1) * 12)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Campus summary</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5">
                <p className="text-sm text-slate-400">Joined clubs</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{profileData.club_memberships?.length || 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5">
                <p className="text-sm text-slate-400">Registered events</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{profileData.registrations?.length || 0}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-[2rem] border border-slate-700/60 bg-slate-950/90 p-4 shadow-[0_35px_90px_rgba(14,165,233,0.08)]">
        <div className="flex flex-wrap gap-3 px-2">
          {['posts', 'clubs', 'events'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900'
              }`}
            >
              {tab === 'posts' ? 'Posts' : tab === 'clubs' ? 'My Clubs' : 'My Events'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div className="min-w-0 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4">
    <p className="text-3xl font-extrabold text-slate-100">{value}</p>
    <p className="mt-2 text-sm uppercase tracking-[0.35em] text-slate-400">{label}</p>
  </div>
);

const ProfileDetail = ({ label, value }) => (
  <div className="min-w-0 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4">
    <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{label}</p>
    <p className="mt-2 break-words text-slate-200">{value}</p>
  </div>
);

const Badge = ({ label, value }) => (
  <div className="rounded-full border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100">
    {label}: {value}
  </div>
);

const ProfilePosts = ({ posts = [] }) => {
<<<<<<< HEAD
  if (posts.length === 0)
    return <p className="text-center text-slate-400 py-10">No posts yet. Share your first moment with campus.</p>;

=======
  console.log('This is post', posts)
  if (posts.length === 0) return <p className="text-center text-gray-500 py-10">No posts yet.</p>;
>>>>>>> 6b3dfcea78627c01a1b1516f7e3c83e8f3dec867
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <Link
          to={`/post/${post.id}`}
          key={post.id}
          className="group overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/90 shadow-[0_20px_60px_rgba(15,23,42,0.2)] transition hover:-translate-y-1"
        >
          <div className="relative h-72 overflow-hidden">
            <img
              src={post.image_url}
              alt={post.caption}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent px-4 py-4">
              <p className="text-sm text-slate-100">{post.caption || 'No caption provided.'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const ProfileClubs = ({ clubs = [] }) => {
  if (clubs.length === 0)
    return <p className="text-center text-slate-400 py-10">No clubs joined yet. Explore clubs and get involved.</p>;

  return (
    <div className="grid gap-4">
      {clubs.map((membership) => (
        <Link
          to={`/club/${membership.club.id}`}
          key={membership.club.id}
          className="block rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <img
              src={membership.club.club_logo_url || `https://placehold.co/60x60/0f172a/38bdf8?text=${membership.club.name.charAt(0)}`}
              alt={membership.club.name}
              className="h-14 w-14 rounded-2xl object-cover border border-slate-700/80"
            />
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{membership.club.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{membership.club.description || 'A campus club you are part of.'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const ProfileEvents = ({ events = [] }) => {
  if (events.length === 0)
    return <p className="text-center text-slate-400 py-10">No registered events yet. Register for something exciting.</p>;

  return (
    <div className="grid gap-4">
      {events.map((registration) => (
        <Link
          to={`/event/${registration.event.id}`}
          key={registration.event.id}
          className="block rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition hover:-translate-y-1"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{registration.event.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{registration.event.club.name}</p>
            </div>
            <span className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-cyan-300">
              {new Date(registration.event.event_datetime).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

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
    <div style={styles.container}>
      {/* --- Profile Header --- */}
      <div style={styles.header}>
        <img
          src={profileData.profile_photo || placeholderAvatar}
          alt="Profile"
          style={styles.avatar}
          onError={(e) => { e.target.src = placeholderAvatar; }}
        />
        <div style={styles.headerInfo}>
          <h1 style={styles.name}>{profileData.name}</h1>
          <p style={styles.email}>{profileData.email}</p>
          <p style={styles.bio}>{profileData.bio || 'No bio provided.'}</p>
          
          {/* --- Stats Bar --- */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong>{profileData._count.posts}</strong> Posts
            </div>

            {/* Removed the following and followers for now */}
            {/* <div style={styles.statItem}>
              <strong>{profileData._count.followers}</strong> Followers
            </div>
            <div style={styles.statItem}>
              <strong>{profileData._count.following}</strong> Following
            </div> */}
          </div>
          
          {/* --- Edit/Logout Buttons --- */}
          <div style={styles.buttonGroup}>
            <button style={styles.editButton}>Edit Profile</button>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* --- Tab Navigation --- */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'posts' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          style={activeTab === 'clubs' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('clubs')}
        >
          My Clubs
        </button>
        <button
          style={activeTab === 'events' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
      </div>

      {/* --- Tab Content --- */}
      <div style={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
}


const ProfilePosts = ({ posts }) => {
  if (posts.length === 0) {
    return <p style={styles.emptyText}>No posts yet.</p>;
  }
  return (
    <div style={styles.grid}>
      {posts.map(post => (
        <div key={post.id} style={styles.gridItem}>
          <img src={post.image_url} alt={post.caption} style={styles.postImage} />
        </div>
      ))}
    </div>
  );
};

const ProfileClubs = ({ clubs }) => {
  if (clubs.length === 0) {
    return <p style={styles.emptyText}>You haven't joined any clubs yet.</p>;
  }
  return (
    <div style={styles.list}>
      {clubs.map(membership => (
        <Link to={`/club/${membership.club.id}`} key={membership.club.id} style={styles.listItemLink}>
          <div style={styles.listItem}>
            <img 
              src={membership.club.club_logo_url || `https://placehold.co/60x60?text=${membership.club.name.charAt(0)}`} 
              alt={membership.club.name} 
              style={styles.listImage}
            />
            <span style={styles.listTitle}>{membership.club.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

const ProfileEvents = ({ events }) => {
  if (events.length === 0) {
    return <p style={styles.emptyText}>You are not registered for any events.</p>;
  }
  return (
    <div style={styles.list}>
      {events.map(reg => (
        <Link to={`/event/${reg.event.id}`} key={reg.event.id} style={styles.listItemLink}>
          <div style={styles.listItem}>
            <div style={styles.listContent}>
              <span style={styles.listTitle}>{reg.event.title}</span>
              <span style={styles.listSubtitle}>
                {reg.event.club.name} &bull; {new Date(reg.event.event_datetime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};


// --- STYLES ---
const styles = {
  container: {
    maxWidth: '900px',
    margin: '32px auto',
    padding: '0 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07)',
  },
  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '32px',
    border: '4px solid #eef2ff',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  email: {
    fontSize: '16px',
    color: '#718096',
    margin: '4px 0 12px',
  },
  bio: {
    fontSize: '15px',
    color: '#4a5568',
    marginBottom: '16px',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  statItem: {
    fontSize: '15px',
    color: '#4a5568',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#eef2ff',
    color: '#4c51bf',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#fff0f0',
    color: '#e53e3e',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #e2e8f0',
    marginTop: '32px',
  },
  tab: {
    padding: '12px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#718096',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px', 
  },
  tabActive: {
    padding: '12px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#4c51bf',
    borderBottom: '2px solid #4c51bf',
    marginBottom: '-2px',
  },
  tabContent: {
    padding: '24px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  gridItem: {
    position: 'relative',
    paddingTop: '100%', 
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
  },
  postImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItemLink: {
    textDecoration: 'none',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  listImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginRight: '16px',
    objectFit: 'cover',
  },
  listContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  listTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
  },
  listSubtitle: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '2px',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#718096',
    padding: '40px 0',
  },
};


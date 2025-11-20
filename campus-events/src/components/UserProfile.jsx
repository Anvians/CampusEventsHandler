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
    if(isProcessingFollow) return;
    setIsProcessingFollow(true);

    const apiCall = isFollowing
      ? api.delete(`/api/users/${profileId}/unfollow`)
      : api.post(`/api/users/${profileId}/follow`);

    try {
      await apiCall;
      
      setIsFollowing(!isFollowing);
      
      setProfileData(prev => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (!isFollowing ? 1 : -1),
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingFollow(false);
    }
  };

  const renderTabContent = () => {
    if (!profileData) return null;
    switch (activeTab) {
      case 'posts': return <ProfilePosts posts={profileData.posts} />;
      case 'clubs': return <ProfileClubs clubs={profileData.club_memberships} />;
      default: return null;
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profileData) return <ErrorMessage message="Could not load profile." />;

  const placeholderAvatar = `https://placehold.co/150x150/e0e7ff/4338ca?text=${encodeURIComponent(profileData.name.charAt(0))}&font=inter`;
  const isOwnProfile = Number(currentUser.id) === Number(profileData.id);

  return (
    <div style={styles.container}>
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
          
          {/* Updated Stats Section */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong>{profileData._count.posts}</strong> Posts
            </div>
            <div style={styles.statItem}>
              <strong>{profileData._count.followers}</strong> Followers
            </div>
            <div style={styles.statItem}>
              <strong>{profileData._count.following}</strong> Following
            </div>
          </div>
          
          {!isOwnProfile && (
            <div style={styles.buttonGroup}>
              <button 
                onClick={handleFollowToggle} 
                disabled={isProcessingFollow}
                style={isFollowing ? styles.unfollowButton : styles.followButton}
              >
                {isProcessingFollow ? 'Processing...' : (isFollowing ? 'Unfollow' : 'Follow')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={activeTab === 'posts' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('posts')}>Posts</button>
        <button style={activeTab === 'clubs' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('clubs')}>Clubs</button>
      </div>

      <div style={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
}



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
  followButton: {
    padding: '10px 20px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '15px',
  },
  unfollowButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#1a202c',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '15px',
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
  listTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#718096',
    padding: '40px 0',
  },
};


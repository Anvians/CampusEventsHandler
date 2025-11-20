import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js'; 
import Spinner from './common/Spinner.jsx'; 
import ErrorMessage from './common/ErrorMessage.jsx'; 
import { useAuth } from './context/AuthContext.jsx'; 

const ClubCard = ({ club }) => {
  const placeholderImage = `https://placehold.co/100x100/e0e7ff/4338ca?text=${encodeURIComponent(club.name.charAt(0))}&font=inter`;

  return (
    <div style={styles.card}>
      <img
        src={club.club_logo_url || placeholderImage}
        alt={`${club.name} logo`}
        style={styles.logo}
        onError={(e) => { e.target.src = placeholderImage; }}
      />
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>
          <Link to={`/club/${club.id}`} style={styles.cardLink}>
            {club.name}
          </Link>
        </h3>
        <p style={styles.cardOrganizer}>
          Organized by: {club.organizer.name}
        </p>
        <div style={styles.cardStats}>
          <span>{club._count.members} Members</span>
          <span style={{ margin: '0 4px' }}>&bull;</span>
          <span>{club._count.events} Events</span>
        </div>
        <Link to={`/club/${club.id}`} style={styles.cardButton}>
          View Club
        </Link>
      </div>
    </div>
  );
};

// Main ClubList component
export default function ClubList() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/clubs');
        setClubs(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch clubs');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleCreateClubClick = () => {
    navigate('/admin/create-club'); 
  };

  let content;
  if (loading) {
    content = <Spinner />;
  } else if (error) {
    content = <ErrorMessage message={error} />;
  } else if (clubs.length === 0) {
    content = <p>No clubs found.</p>;
  } else {
    content = (
      <div style={styles.grid}>
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Clubs</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={handleCreateClubClick} style={styles.createButton}>
            + Create Club
          </button>
        )}
      </div>
      {content}
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '32px auto',
    padding: '0 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0, 
  },
  createButton: {
    padding: '10px 16px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    transition: 'box-shadow 0.3s ease',
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '20px',
    border: '3px solid #eef2ff',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    minWidth: 0, // Prevents text overflow issues in flex
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  cardOrganizer: {
    fontSize: '14px',
    color: '#718096',
    margin: '4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardStats: {
    fontSize: '14px',
    color: '#4a5568',
    display: 'flex',
    gap: '8px',
    margin: '12px 0',
  },
  cardButton: {
    display: 'inline-block',
    padding: '8px 14px',
    backgroundColor: '#eef2ff',
    color: '#4c51bf',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
};


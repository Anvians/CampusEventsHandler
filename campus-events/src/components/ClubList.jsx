import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js'; 
import Spinner from './common/Spinner.jsx'; 
import ErrorMessage from './common/ErrorMessage.jsx'; 
import { useAuth } from './context/AuthContext.jsx'; 

const ClubCard = ({ club }) => {
  console.log('Club', club)
  const placeholderImage = `https://placehold.co/100x100/e0e7ff/4338ca?text=${encodeURIComponent(
    club.name.charAt(0)
  )}&font=inter`;

  return (
    <div className="futuristic-card flex flex-col gap-4 p-5 hover:shadow-[0_30px_70px_rgba(56,189,248,0.12)] transition-shadow">
      <img
        src={club.club_logo_url || placeholderImage}
        alt={`${club.name} logo`}
        className="w-24 h-24 rounded-3xl object-cover self-center border border-cyan-400/20"
        onError={(e) => { e.target.src = placeholderImage; }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-slate-100 truncate">
          <Link to={`/club/${club.id}`} className="hover:text-cyan-300">
            {club.name}
          </Link>
        </h3>
        <p className="text-sm text-slate-400 truncate mt-1">
          Organized by: {club.organizer.name}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 mt-4">
          <span className="futuristic-badge">{club._count.members} Members</span>
          <span className="text-slate-500">•</span>
          <span className="futuristic-badge">{club._count.events} Events</span>
        </div>
        <Link
          to={`/club/${club.id}`}
          className="inline-flex mt-4 items-center justify-center futuristic-button-secondary text-slate-100"
        >
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
    content = <p className="text-center text-gray-500">No clubs found.</p>;
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 font-inter text-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Explore Clubs</h1>
          <p className="text-slate-400 max-w-2xl mt-2">
            Browse all campus groups, meet organizers, and jump into activities with a bold neon-inspired experience.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleCreateClubClick}
            className="futuristic-button-primary"
          >
            + Create Club
          </button>
        )}
      </div>
      {content}
    </div>
  );
}

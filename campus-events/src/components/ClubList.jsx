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
    <div className="bg-white rounded-xl shadow-md flex items-center p-5 hover:shadow-lg transition-shadow">
      <img
        src={club.club_logo_url || placeholderImage}
        alt={`${club.name} logo`}
        className="w-20 h-20 rounded-full object-cover mr-5 border-3 border-indigo-100 flex-shrink-0"
        onError={(e) => { e.target.src = placeholderImage; }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          <Link to={`/club/${club.id}`} className="hover:underline">
            {club.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-500 truncate mt-1">
          Organized by: {club.organizer.name}
        </p>
        <div className="flex text-sm text-gray-600 gap-2 mt-3">
          <span>{club._count.members} Members</span>
          <span>&bull;</span>
          <span>{club._count.events} Events</span>
        </div>
        <Link
          to={`/club/${club.id}`}
          className="inline-block mt-3 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md font-semibold text-sm hover:bg-indigo-200 transition-colors"
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
    <div className="max-w-7xl mx-auto mt-8 px-6 font-inter">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore Clubs</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleCreateClubClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            + Create Club
          </button>
        )}
      </div>
      {content}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import EventList from './EventList.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/events');
        setEvents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCreateEventClick = () => {
    navigate('/create-event');
  };

  let content;
  if (loading) {
    content = <Spinner />;
  } else if (error) {
    content = <ErrorMessage message={error} />;
  } else if (events.length === 0) {
    content = (
      <p className="text-center text-gray-500">No events found.</p>
    );
  } else {
    content = <EventList events={events} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-inter">
      <div className="flex justify-between md:m-5 ml-10 items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name}!
        </h1>

        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none"
            onClick={handleCreateEventClick}
          >
            Create Event
          </button>
        )}
      </div>

      <h2 className="text-xl md:ml-5 ml-10 font-semibold text-gray-700 mb-6">
        Upcoming Events
      </h2>

      {content}
    </div>
  );
}

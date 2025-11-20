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
      <p style={{ textAlign: 'center', color: '#6B7280' }}>
        No events found.
      </p>
    );
  } else {
    content = <EventList events={events} />;
  }

  return (
    <div
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'Inter, system-ui, sans-serif', 
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1F2937',
          }}
        >
          Hello, {user?.name}!
        </h1>

        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && ( 
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              borderRadius: '0.5rem',
              fontWeight: '600',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
              border: 'none', 
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#4338CA')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4F46E5')}
            onClick={handleCreateEventClick} 
          >
            Create Event
          </button>
        )}
      </div>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1.5rem',
        }}
      >
        Upcoming Events
      </h2>

      {content}
    </div>
  );
}



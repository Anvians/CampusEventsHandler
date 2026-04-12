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
    <div className="max-w-7xl mx-auto px-4 py-8 font-inter text-slate-100">
      <div className="grid gap-6 rounded-[2rem] border border-slate-700/50 bg-slate-950/80 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl md:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Campus Pulse
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hey, {user?.name}!
          </h1>
          <p className="max-w-2xl text-slate-400">
            Discover data-driven events, club stories, and social updates with a futuristic campus dashboard built for the next generation.
          </p>
        </div>

        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <div className="flex items-center justify-end">
            <button
              className="rounded-full border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(56,189,248,0.16)] transition hover:bg-cyan-400/25 hover:shadow-[0_0_40px_rgba(56,189,248,0.3)]"
              onClick={handleCreateEventClick}
            >
              Create Event
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Upcoming Events</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Live updates
          </div>
        </div>

        {content}
      </div>
    </div>
  );
}

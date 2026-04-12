import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from './context/AuthContext.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club_id: '',
    category: '',
    date: '',
    time: '',
    venue: '',
    banner_url: '',
    price: 0,
    registration_limit: 50,
    is_team_event: false,
    min_team_size: 2,
    max_team_size: 4,
  });

  const [myClubs, setMyClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyClubs = async () => {
      try {
        setLoadingClubs(true);
        const endpoint = user.role === 'ADMIN' ? '/api/clubs' : '/api/clubs/my-clubs';
        const response = await api.get(endpoint);
        setMyClubs(response.data);

        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, club_id: response.data[0].id }));
        } else if (user.role === 'ORGANIZER') {
          setSubmitError('You are not assigned to any clubs. Please contact an Admin.');
        } else if (user.role === 'ADMIN' && response.data.length === 0) {
          setSubmitError('There are no clubs in the system. Please create a club first.');
        }
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Failed to load clubs.');
      } finally {
        setLoadingClubs(false);
      }
    };

    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      fetchMyClubs();
    }
  }, [user.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const event_datetime = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      const dataToSubmit = {
        title: formData.title,
        description: formData.description,
        club_id: parseInt(formData.club_id, 10),
        category: formData.category,
        event_datetime,
        venue: formData.venue,
        banner_url: formData.banner_url || null,
        registration_limit: parseInt(formData.registration_limit, 10),
        price: parseFloat(formData.price),
        is_team_event: formData.is_team_event,
        min_team_size: parseInt(formData.min_team_size, 10),
        max_team_size: parseInt(formData.max_team_size, 10),
      };

      const response = await api.post('/api/events', dataToSubmit);
      navigate(`/event/${response.data.event.id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create event. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClubs) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="futuristic-card border border-slate-700/60 shadow-[0_35px_90px_rgba(14,165,233,0.12)] p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Event Builder</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-100">Create your next campus experience</h1>
          <p className="mt-3 text-slate-400">Set up a new event with location, pricing, categories, and team options.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {myClubs.length === 0 ? (
            <ErrorMessage message={submitError || 'No clubs available to create an event.'} />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-300">Event Title</label>
                  <input
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="club_id" className="block text-sm font-semibold text-slate-300">Hosting Club</label>
                  <select
                    id="club_id"
                    name="club_id"
                    required
                    value={formData.club_id}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {myClubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-300">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-slate-300">Event Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="time" className="block text-sm font-semibold text-slate-300">Event Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <label htmlFor="venue" className="block text-sm font-semibold text-slate-300">Venue</label>
                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    placeholder="Main Auditorium or Online"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-300">Category</label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    placeholder="Tech, Music, Wellness..."
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="banner_url" className="block text-sm font-semibold text-slate-300">Banner Image URL</label>
                <input
                  id="banner_url"
                  name="banner_url"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.banner_url}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <label htmlFor="price" className="block text-sm font-semibold text-slate-300">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="registration_limit" className="block text-sm font-semibold text-slate-300">Registration Limit</label>
                  <input
                    id="registration_limit"
                    name="registration_limit"
                    type="number"
                    min="1"
                    required
                    value={formData.registration_limit}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
                <div className="flex items-center gap-3">
                  <input
                    id="is_team_event"
                    name="is_team_event"
                    type="checkbox"
                    checked={formData.is_team_event}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
                  />
                  <label htmlFor="is_team_event" className="text-sm font-semibold text-slate-200">This is a team event</label>
                </div>

                {formData.is_team_event && (
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <label htmlFor="min_team_size" className="block text-sm font-semibold text-slate-300">Min. Team Size</label>
                      <input
                        id="min_team_size"
                        name="min_team_size"
                        type="number"
                        min="1"
                        value={formData.min_team_size}
                        onChange={handleChange}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="max_team_size" className="block text-sm font-semibold text-slate-300">Max. Team Size</label>
                      <input
                        id="max_team_size"
                        name="max_team_size"
                        type="number"
                        min={formData.min_team_size}
                        value={formData.max_team_size}
                        onChange={handleChange}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {submitError && <ErrorMessage message={submitError} />}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Once created, your event will appear in the campus events list.</p>
                <button
                  type="submit"
                  disabled={isSubmitting || myClubs.length === 0}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

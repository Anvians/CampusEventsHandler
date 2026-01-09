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

  if (loadingClubs) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-10 bg-white rounded-2xl shadow-lg font-inter">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Create a New Event</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {myClubs.length === 0 ? (
          <ErrorMessage message={submitError || "No clubs available to create an event."} />
        ) : (
          <>
            {/* Title & Club */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-600 mb-2">Event Title</label>
                <input type="text" name="title" id="title" required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="club_id" className="block text-sm font-semibold text-gray-600 mb-2">Hosting Club</label>
                <select name="club_id" id="club_id" required
                  value={formData.club_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {myClubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
              <textarea name="description" id="description" rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-400"></textarea>
            </div>

            {/* Date & Time */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="date" className="block text-sm font-semibold text-gray-600 mb-2">Event Date</label>
                <input type="date" name="date" id="date" required
                  value={formData.date} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="time" className="block text-sm font-semibold text-gray-600 mb-2">Event Time</label>
                <input type="time" name="time" id="time" required
                  value={formData.time} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Venue & Category */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="venue" className="block text-sm font-semibold text-gray-600 mb-2">Venue</label>
                <input type="text" name="venue" id="venue" placeholder="e.g., 'Main Auditorium' or 'Online'" required
                  value={formData.venue} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-600 mb-2">Category</label>
                <input type="text" name="category" id="category" placeholder="e.g., 'Tech' or 'Music'"
                  value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Banner URL */}
            <div>
              <label htmlFor="banner_url" className="block text-sm font-semibold text-gray-600 mb-2">Banner Image URL (Optional)</label>
              <input type="text" name="banner_url" id="banner_url" placeholder="https://example.com/image.png"
                value={formData.banner_url} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            {/* Price & Registration Limit */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-600 mb-2">Price (0 for free)</label>
                <input type="number" name="price" id="price" min="0" step="0.01" required
                  value={formData.price} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <label htmlFor="registration_limit" className="block text-sm font-semibold text-gray-600 mb-2">Registration Limit</label>
                <input type="number" name="registration_limit" id="registration_limit" min="1" required
                  value={formData.registration_limit} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Team Event */}
            <div className="flex items-center gap-3">
              <input type="checkbox" name="is_team_event" id="is_team_event"
                checked={formData.is_team_event} onChange={handleChange}
                className="w-5 h-5" />
              <label htmlFor="is_team_event" className="text-sm font-semibold text-gray-600">This is a team event</label>
            </div>

            {formData.is_team_event && (
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[250px]">
                  <label htmlFor="min_team_size" className="block text-sm font-semibold text-gray-600 mb-2">Min. Team Size</label>
                  <input type="number" name="min_team_size" id="min_team_size" min="1"
                    value={formData.min_team_size} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex-1 min-w-[250px]">
                  <label htmlFor="max_team_size" className="block text-sm font-semibold text-gray-600 mb-2">Max. Team Size</label>
                  <input type="number" name="max_team_size" id="max_team_size" min={formData.min_team_size}
                    value={formData.max_team_size} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
            )}

            {submitError && !loadingClubs && <ErrorMessage message={submitError} />}
            <button type="submit" disabled={isSubmitting || myClubs.length === 0}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-base hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

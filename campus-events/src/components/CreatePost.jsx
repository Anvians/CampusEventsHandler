import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [event_id, setEventId] = useState('');

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await api.get('/api/events');
        setEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('An image is required to create a post.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);
    formData.append('visibility', visibility);
    if (event_id) formData.append('event_id', event_id);

    try {
      await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="futuristic-card border border-slate-700/60 shadow-[0_35px_90px_rgba(14,165,233,0.12)] p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Post Spotlight</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-100">Create a new campus post</h1>
          <p className="mt-3 text-slate-400">Share a photo and message with your classmates, clubs, and event attendees.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-300">Upload Image</label>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:text-slate-950"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 w-full rounded-3xl border border-slate-700 object-cover shadow-[0_20px_50px_rgba(6,182,212,0.15)]"
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="caption" className="block text-sm font-semibold text-slate-300">Caption</label>
            <textarea
              id="caption"
              rows="5"
              placeholder="Write something engaging..."
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <label htmlFor="visibility" className="block text-sm font-semibold text-slate-300">Visibility</label>
              <select
                id="visibility"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="PUBLIC">Public</option>
                <option value="DEPARTMENT">My Department Only</option>
                <option value="EVENT">Linked Event Only</option>
              </select>
            </div>

            <div className="space-y-4">
              <label htmlFor="event_id" className="block text-sm font-semibold text-slate-300">Link to Event</label>
              <select
                id="event_id"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                value={event_id}
                onChange={(e) => setEventId(e.target.value)}
                disabled={loadingEvents}
              >
                <option value="">None</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Your post will appear in the campus feed once approved.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

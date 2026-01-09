import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg font-inter">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Create New Post</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        
        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-gray-600 mb-2">
            Upload Image (Required)
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-96 object-cover rounded-lg mt-4 border border-gray-200"
            />
          )}
        </div>

        {/* Caption */}
        <div>
          <label htmlFor="caption" className="block text-sm font-semibold text-gray-600 mb-2">
            Caption
          </label>
          <textarea
            rows="4"
            placeholder="Write something about your post..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-vertical"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Visibility & Event Link */}
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="visibility" className="block text-sm font-semibold text-gray-600 mb-2">
              Visibility
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">Public</option>
              <option value="DEPARTMENT">My Department Only</option>
              <option value="EVENT">Linked Event Only</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="event_id" className="block text-sm font-semibold text-gray-600 mb-2">
              Link to Event (Optional)
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={event_id}
              onChange={(e) => setEventId(e.target.value)}
              disabled={loadingEvents}
            >
              <option value="">None</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

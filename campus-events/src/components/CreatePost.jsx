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

  // Fetch all events to link to the post
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

  // Handle image selection and create preview
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
    if (event_id) {
      formData.append('event_id', event_id);
    }

    try {
      await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Success! Navigate to the feed
      navigate('/feed');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Create New Post</h1>
        
        {/* Image Upload & Preview */}
        <div style={styles.field}>
          <label htmlFor="image" style={styles.label}>Upload Image (Required)</label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/png, image/jpeg, image/gif"
            required
            style={styles.input}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
          )}
        </div>

        <div style={styles.field}>
          <label htmlFor="caption" style={styles.label}>Caption</label>
          <textarea
            name="caption"
            id="caption"
            rows="4"
            style={styles.textarea}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something about your post..."
          />
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.flexField}>
            <label htmlFor="visibility" style={styles.label}>Visibility</label>
            <select
              name="visibility"
              id="visibility"
              style={styles.input}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">Public</option>
              <option value="DEPARTMENT">My Department Only</option>
              <option value="EVENT">Linked Event Only</option>
            </select>
          </div>
          
          <div style={styles.flexField}>
            <label htmlFor="event_id" style={styles.label}>Link to Event (Optional)</label>
            <select
              name="event_id"
              id="event_id"
              style={styles.input}
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
        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    maxWidth: '700px',
    margin: '32px auto',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '24px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    width: '100%',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    fontSize: '16px',
    color: '#2d3748',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    fontSize: '16px',
    color: '#2d3748',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginTop: '16px',
    border: '1px solid #e2e8f0',
  },
  inputGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  flexField: {
    flex: 1,
    minWidth: '250px',
  },
  button: {
    padding: '14px 20px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  },
};


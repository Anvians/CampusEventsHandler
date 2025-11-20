import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from './context/AuthContext.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for the form
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
      // Combine date and time into a single ISO string
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
      
      // Success: Navigate to the new event's detail page
      navigate(`/event/${response.data.event.id}`);

    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create event. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show spinner while fetching clubs
  if (loadingClubs) {
    return <Spinner />;
  }
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create a New Event</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        
        {myClubs.length === 0 ? (
          <ErrorMessage message={submitError || "No clubs available to create an event."} />
        ) : (
          <>
            <div style={styles.inputGroup}>
              <div style={styles.flexField}>
                <label htmlFor="title" style={styles.label}>Event Title</label>
                <input type="text" name="title" id="title" required style={styles.input} value={formData.title} onChange={handleChange} />
              </div>
              <div style={styles.flexField}>
                <label htmlFor="club_id" style={styles.label}>Hosting Club</label>
                <select name="club_id" id="club_id" required style={styles.input} value={formData.club_id} onChange={handleChange}>
                  {myClubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" style={styles.label}>Description</label>
              <textarea name="description" id="description" rows="4" style={styles.textarea} value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.flexField}>
                <label htmlFor="date" style={styles.label}>Event Date</label>
                <input type="date" name="date" id="date" required style={styles.input} value={formData.date} onChange={handleChange} />
              </div>
              <div style={styles.flexField}>
                <label htmlFor="time" style={styles.label}>Event Time</label>
                <input type="time" name="time" id="time" required style={styles.input} value={formData.time} onChange={handleChange} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.flexField}>
                <label htmlFor="venue" style={styles.label}>Venue</label>
                <input type="text" name="venue" id="venue" placeholder="e.g., 'Main Auditorium' or 'Online'" required style={styles.input} value={formData.venue} onChange={handleChange} />
              </div>
              <div style={styles.flexField}>
                <label htmlFor="category" style={styles.label}>Category</label>
                <input type="text" name="category" id="category" placeholder="e.g., 'Tech' or 'Music'" style={styles.input} value={formData.category} onChange={handleChange} />
              </div>
            </div>
            
            <div>
              <label htmlFor="banner_url" style={styles.label}>Banner Image URL (Optional)</label>
              <input type="text" name="banner_url" id="banner_url" placeholder="https://example.com/image.png" style={styles.input} value={formData.banner_url} onChange={handleChange} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.flexField}>
                <label htmlFor="price" style={styles.label}>Price (0 for free)</label>
                <input type="number" name="price" id="price" min="0" step="0.01" required style={styles.input} value={formData.price} onChange={handleChange} />
              </div>
              <div style={styles.flexField}>
                <label htmlFor="registration_limit" style={styles.label}>Registration Limit</label>
                <input type="number" name="registration_limit" id="registration_limit" min="1" required style={styles.input} value={formData.registration_limit} onChange={handleChange} />
              </div>
            </div>

            <div style={styles.checkboxContainer}>
              <input type="checkbox" name="is_team_event" id="is_team_event" style={styles.checkbox} checked={formData.is_team_event} onChange={handleChange} />
              <label htmlFor="is_team_event" style={styles.checkboxLabel}>This is a team event</label>
            </div>

            {formData.is_team_event && (
              <div style={styles.inputGroup}>
                <div style={styles.flexField}>
                  <label htmlFor="min_team_size" style={styles.label}>Min. Team Size</label>
                  <input type="number" name="min_team_size" id="min_team_size" min="1" style={styles.input} value={formData.min_team_size} onChange={handleChange} />
                </div>
                <div style={styles.flexField}>
                  <label htmlFor="max_team_size" style={styles.label}>Max. Team Size</label>
                  <input type="number" name="max_team_size" id="max_team_size" min={formData.min_team_size} style={styles.input} value={formData.max_team_size} onChange={handleChange} />
                </div>
              </div>
            )}

            {submitError && !loadingClubs && <ErrorMessage message={submitError} />}
            <button type="submit" style={styles.button} disabled={isSubmitting || myClubs.length === 0}>
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    maxWidth: '900px',
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
  inputGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  flexField: {
    flex: 1,
    minWidth: '250px',
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
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


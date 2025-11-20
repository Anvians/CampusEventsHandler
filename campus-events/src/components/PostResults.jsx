import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api'; 
import Spinner from '../components/common/Spinner.jsx'; 
import ErrorMessage from '../components/common/ErrorMessage.jsx'; 

export default function PostResults() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [registrants, setRegistrants] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [winner_id, setWinnerId] = useState('');
  const [runner_up_id, setRunnerUpId] = useState('');
  const [certification_url, setCertificationUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRegistrants = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/events/${eventId}/registrants`);
        
        setRegistrants(response.data);
        
        if (response.data.length === 0) {
          setError("There are no registered participants for this event yet.");
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch registrants');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrants();
  }, [eventId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/api/events/${eventId}/results`, {
        winner_id: parseInt(winner_id, 10),
        runner_up_id: runner_up_id ? parseInt(runner_up_id, 10) : null,
        certification_url: certification_url || null,
      });
      navigate(`/event/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post results');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) return <Spinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Post Event Results</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        
        {error && <ErrorMessage message={error} />}

        <div style={styles.field}>
          <label htmlFor="winner_id" style={styles.label}>Winner</label>
          <select
            name="winner_id"
            id="winner_id"
            required
            style={styles.input}
            value={winner_id}
            onChange={(e) => setWinnerId(e.target.value)}
            disabled={registrants.length === 0}
          >
            <option value="">Select a winner</option>
            {registrants.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        
        <div style={styles.field}>
          <label htmlFor="runner_up_id" style={styles.label}>Runner-up (Optional)</label>
          <select
            name="runner_up_id"
            id="runner_up_id"
            style={styles.input}
            value={runner_up_id}
            onChange={(e) => setRunnerUpId(e.target.value)}
            disabled={registrants.length === 0 || !winner_id}
          >
            <option value="">Select a runner-up</option>
            {registrants.map(user => (
              (user.id.toString() !== winner_id) && 
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="certification_url" style={styles.label}>Certification URL (Optional)</label>
          <input
            type="text"
            name="certification_url"
            id="certification_url"
            style={styles.input}
            value={certification_url}
            onChange={(e) => setCertificationUrl(e.target.value)}
            placeholder="https://example.com/certificate.pdf"
          />
        </div>
        
        <button type="submit" style={styles.button} disabled={isSubmitting || registrants.length === 0 || !winner_id}>
          {isSubmitting ? 'Posting...' : 'Post Results'}
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


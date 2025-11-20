import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic frontend validation for year
    const yearInt = formData.year ? parseInt(formData.year) : null;
    if (yearInt && (yearInt < 1 || yearInt > 5)) { // Allow 5th year for integrated courses
      setError('Year must be between 1 and 5.');
      setLoading(false);
      return;
    }
    
    // Basic password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/signup', {
        ...formData,
        year: yearInt,
      });

      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = loading 
    ? { ...styles.button, ...styles.buttonDisabled } 
    : styles.button;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Create Your New Account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              style={styles.input}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={styles.label}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={styles.input}
              placeholder="you@college.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={styles.input}
              placeholder="•••••••• (Min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Department and Year */}
          <div style={styles.inputGroup}>
            <div style={styles.flexField}>
              <label htmlFor="department" style={styles.label}>Department</label>
              <input
                id="department"
                name="department"
                type="text"
                required
                style={styles.input}
                placeholder="e.g., CSE"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div style={styles.flexField}>
              <label htmlFor="year" style={styles.label}>Year (1-5)</label>
              <input
                id="year"
                name="year"
                type="number"
                min="1"
                max="5"
                style={styles.input}
                placeholder="e.g., 2"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw', 
    background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)',
    padding: '20px',
    boxSizing: 'border-box', 
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },

  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '32px 40px', 
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.05)',
  },

  header: {
    fontSize: '26px', 
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '24px',
    color: '#1a202c',
    letterSpacing: '-0.5px',
  },

  error: {
    padding: '12px',
    marginBottom: '18px', 
    backgroundColor: '#fff0f0',
    color: '#d90429',
    borderRadius: '8px',
    border: '1px solid #ffccd5',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px', 
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
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
    fontSize: '16px',
    color: '#2d3748',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    
  },

  inputGroup: {
    display: 'flex',
    flexWrap: 'wrap', 
    gap: '16px',
  },

  flexField: {
    flex: 1, 
    minWidth: '160px', 
  },

  button: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    fontSize: '16px', 
    fontWeight: '700',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 15px rgba(76, 81, 191, 0.25)',
    transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s',
   
  },

  buttonDisabled: {
    backgroundColor: '#a0aec0',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
  },

  linkText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#718096',
    marginTop: '24px',
  },

  link: {
    color: '#4c51bf',
    fontWeight: '600',
    textDecoration: 'none',
   
  },
};


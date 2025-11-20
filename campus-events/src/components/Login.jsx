import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await api.post('/api/auth/login', formData);
      const { token, user } = response.data;

      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
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
        <h2 style={styles.header}>Log in to Your Account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <div style={styles.forgotPassword}>
              <Link to="/forgot-password" style={styles.linkSmall}>
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={styles.linkText}>
          Don’t have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Sign up
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
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },

  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '36px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow:
      '0 20px 40px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.05)',
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

  forgotPassword: {
    textAlign: 'right',
    marginTop: '4px',
  },

  linkSmall: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#4c51bf',
    textDecoration: 'none',
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

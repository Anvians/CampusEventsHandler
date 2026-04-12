import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'If your email is registered, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8 md:p-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Forgot Password</h1>
        <p className="text-slate-500 mb-8">Enter your email and we’ll send a secure password reset link.</p>

        {message && <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

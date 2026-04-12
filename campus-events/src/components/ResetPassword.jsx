import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage(response.data.message || 'Your password has been reset successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8 md:p-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Reset Password</h1>
        <p className="text-slate-500 mb-8">
          Enter your new password below to restore access to your account.
        </p>

        {!token ? (
          <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-700">
            No reset token found. Please use the link sent to your email or request a new password reset.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700">{message}</div>}
            {error && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">New password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

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

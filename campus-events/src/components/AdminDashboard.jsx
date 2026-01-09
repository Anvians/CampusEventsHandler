import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from './context/AuthContext.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoteError, setPromoteError] = useState('');
  const { user: adminUser } = useAuth(); 

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/users');
      setUsers(response.data.filter(u => u.id !== adminUser.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminUser.id]);

  const handlePromote = async (userIdToPromote) => {
    setPromoteError('');
    try {
      const response = await api.put('/api/admin/promote', { userIdToPromote });
      const updatedUser = response.data.user;
      setUsers(currentUsers =>
        currentUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (err) {
      setPromoteError(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (users.length === 0) {
      return (
        <p className="text-center text-gray-500 text-base py-5">
          No other users found. Sign up with a new 'Student' account to promote them.
        </p>
      );
    }

    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-none">
                <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{user.department}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    user.role === 'STUDENT'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {user.role === 'STUDENT' && (
                    <button
                      onClick={() => handlePromote(user.id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                      Promote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-inter">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">User Management</h2>
      {promoteError && <ErrorMessage message={promoteError} />}
      {renderContent()}
    </div>
  );
}

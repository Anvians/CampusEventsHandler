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

  // Function to fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/users');
      // Filter out the admin themselves from the list
      setUsers(response.data.filter(u => u.id !== adminUser.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [adminUser.id]); // Re-run if adminUser changes 

  // Function to handle promoting a user
  const handlePromote = async (userIdToPromote) => {
    setPromoteError('');
    try {
      const response = await api.put('/api/admin/promote', {
        userIdToPromote: userIdToPromote,
      });
      
      const updatedUser = response.data.user;

      // Update the user in our state instantly
      setUsers(currentUsers =>
        currentUsers.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        )
      );

    } catch (err) {
      setPromoteError(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (users.length === 0) {
      return <p style={styles.infoText}>No other users found. Sign up with a new 'Student' account to promote them.</p>;
    }

    return (
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.department}</td>
                <td style={styles.td}>
                  <span style={user.role === 'STUDENT' ? styles.roleStudent : styles.roleOrganizer}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {user.role === 'STUDENT' && (
                    <button 
                      onClick={() => handlePromote(user.id)}
                      style={styles.button}
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
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <h2 style={styles.subtitle}>User Management</h2>
      {promoteError && <ErrorMessage message={promoteError} />}
      {renderContent()}
    </div>
  );
}

// --- STYLES ---

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '24px',
  },
  infoText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: '16px',
    padding: '20px',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    borderBottom: '2px solid #f3f4f6',
    backgroundColor: '#f9fafb',
  },
  tr: {
    borderBottom: '1Spx solid #f3f4f6',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#2d3748',
  },
  roleStudent: {
    padding: '4px 8px',
    backgroundColor: '#ebf4ff',
    color: '#2b6cb0',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '12px',
  },
  roleOrganizer: {
    padding: '4px 8px',
    backgroundColor: '#e6fffa',
    color: '#2c7a7b',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '12px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#4c51bf',
    color: '#ffffff',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};


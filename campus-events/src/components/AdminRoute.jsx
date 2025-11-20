import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

const FullPageSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{
      animation: 'spin 1s linear infinite',
      borderRadius: '50%',
      height: '64px',
      width: '64px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderBottomColor: '#4c51bf',
    }}></div>
  </div>
);



export default AdminRoute;
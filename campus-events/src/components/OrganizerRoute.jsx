import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import FullPageSpinner from './common/FullPageSpinner.jsx';

const OrganizerRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role
  if (user.role !== 'ADMIN' && user.role !== 'ORGANIZER') {
    // Redirect to home page if not authorized
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default OrganizerRoute
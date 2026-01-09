import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const OrganizerRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Tailwind spinner while loading
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-gray-200"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for roles: ADMIN or ORGANIZER
  if (user.role !== 'ADMIN' && user.role !== 'ORGANIZER') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default OrganizerRoute;

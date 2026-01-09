import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function RouteGuard({
  children,
  authRequired = true,
  roles = [],
  redirectPath
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Full-page Tailwind spinner while auth is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Guest-only routes (login / signup)
  if (!authRequired && user) {
    return <Navigate to={redirectPath || '/'} replace />;
  }

  // Auth-required routes
  if (authRequired && !user) {
    return (
      <Navigate
        to={redirectPath || '/login'}
        replace
        state={{ from: location }}
      />
    );
  }

  // Role-based protection (only after auth)
  if (authRequired && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={redirectPath || '/'} replace />;
  }

  return children;
}

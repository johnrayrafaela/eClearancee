import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';

/**
 * ProtectedRoute: Restricts access to specific user roles.
 * Redirects to login if not authenticated or role doesn't match.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userType } = useContext(AuthContext);

  // Not logged in: redirect to login
  if (!user || !userType) {
    return <Navigate to="/login" replace />;
  }

  // Check if userType is in allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page. Your role: {userType}</p>
        <a href="/" style={{ color: '#0277bd', textDecoration: 'underline' }}>
          Go to home
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

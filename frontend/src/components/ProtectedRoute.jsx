import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';

/**
 * ProtectedRoute: Restricts access to specific user roles.
 * Redirects to login if not authenticated or role doesn't match.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userType } = useContext(AuthContext);

  useEffect(() => {
    console.log('[ProtectedRoute] Checking access:', { userType, allowedRoles, allowed: allowedRoles.includes(userType) });
  }, [userType, allowedRoles]);

  // Not logged in: redirect to login
  if (!user || !userType) {
    console.log('[ProtectedRoute] Not logged in, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check if userType is in allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    console.warn('[ProtectedRoute] Access denied for user type:', userType, 'allowed:', allowedRoles);
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e11d48' }}>
        <h2>❌ Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <p><strong>Your role:</strong> {userType}</p>
        <p><strong>Required role:</strong> {allowedRoles.join(' or ')}</p>
        <a href="/" style={{ color: '#0277bd', textDecoration: 'underline', fontSize: '16px', marginTop: '1rem', display: 'inline-block' }}>
          ← Go to home
        </a>
      </div>
    );
  }

  console.log('[ProtectedRoute] Access granted for:', userType);
  return children;
};

export default ProtectedRoute;

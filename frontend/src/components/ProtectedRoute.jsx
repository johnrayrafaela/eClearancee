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

  // Determine authentication: prefer context, fallback to token presence
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = !!token || !!user;

  // If no token and no user in context, redirect to login
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] No auth token or user context; redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check if userType is in allowed roles. If userType is missing but authenticated, treat as 'signed-in but unauthorized'.
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    console.warn('[ProtectedRoute] Access denied for user type:', userType, 'allowed:', allowedRoles);
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#fee2e2,#fecaca)', borderRadius: '12px', margin: '2rem' }}>
        <div style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
          <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem', color: '#dc2626' }}>🔒 Admin Access Only</h1>
          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#374151', fontWeight: '600' }}>Only administrators can access this page.</p>
          <p style={{ margin: '1rem 0 0.5rem', fontSize: '0.95rem', color: '#6b7280' }}>Your current role: <strong style={{ color: '#1f2937' }}>{userType || 'Signed‑in (unknown role)'}</strong></p>
          <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: '#6b7280' }}>Required role: <strong style={{ color: '#1f2937' }}>{allowedRoles.join(' or ')}</strong></p>
          <a href="/" style={{ display: 'inline-block', padding: '12px 28px', background: '#0277bd', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.3s' }} onMouseEnter={(e) => e.target.style.background = '#01579b'} onMouseLeave={(e) => e.target.style.background = '#0277bd'}>
            ← Return to Home
          </a>
        </div>
      </div>
    );
  }

  console.log('[ProtectedRoute] Access granted for:', userType);
  return children;
};

export default ProtectedRoute;

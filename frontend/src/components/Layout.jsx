import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const NAVBAR_WIDTH = 220;

const layoutStyles = {
  minHeight: '100vh',
  background: '#f7fafc',
};

const Layout = ({ children }) => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  const isLandingPage = location.pathname === '/';

  const layoutStyles = {
    minHeight: '100vh',
    background: isLandingPage ? 'transparent' : '#f7fafc',
  };

  const contentStyles = {
    marginLeft: showNavbar ? NAVBAR_WIDTH : 0,
    padding: isLandingPage ? 0 : '2rem',
    minHeight: '100vh',
    background: isLandingPage ? 'transparent' : '#f7fafc',
    transition: 'margin-left .3s ease'
  };

  return (
    <div style={layoutStyles}>
      {showNavbar && <Navbar />}
      <main style={contentStyles}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
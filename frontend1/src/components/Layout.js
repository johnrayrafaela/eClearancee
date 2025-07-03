import React from 'react';
import Navbar from './Navbar';

const layoutStyles = {
  display: 'flex',
  minHeight: '100vh',
  marginLeft: '220px', // Adjusted to account for the fixed navbar width
};

const contentStyles = {
  flex: 1,
  background: '#f7fafc',
  padding: '0 0 2rem 0',
};

const Layout = ({ children }) => (
  <div style={layoutStyles}>
    <Navbar />
    <div style={contentStyles}>
      {children}
    </div>
  </div>
);

export default Layout;
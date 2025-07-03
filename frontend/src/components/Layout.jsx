import React from 'react';
import Navbar from './Navbar';

const NAVBAR_WIDTH = 220;

const layoutStyles = {
  minHeight: '100vh',
  background: '#f7fafc',
};

const contentStyles = {
  marginLeft: NAVBAR_WIDTH, // Push content to the right of the navbar
  padding: '2rem',
  minHeight: '100vh',
  background: '#f7fafc',
};

const Layout = ({ children }) => (
  <div style={layoutStyles}>
    <Navbar />
    <main style={contentStyles}>
      {children}
    </main>
  </div>
);

export default Layout;
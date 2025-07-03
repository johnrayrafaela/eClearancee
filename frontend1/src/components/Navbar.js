import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, userType, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAvatarClick = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>ECLEARANCE</h2>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        {user && userType === 'user' && (
          <>
            <Link to="/profile" style={styles.link}>Profile</Link>
            <Link to="/studentdashboard" style={styles.link}>Student Dashboard</Link>
            <Link to="/clearancestatus" style={styles.link}>Clearance Status</Link>
          </>
        )}
        {user ? (
          <div style={styles.avatarContainer}>
            <img
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?fit=facearea&w=64&h=64"
              alt="User Avatar"
              style={styles.avatar}
              onClick={handleAvatarClick}
            />
            {dropdownOpen && (
              <div style={styles.dropdown}>
                <button style={styles.dropdownBtn} onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '220px',
    backgroundColor: '#e0f7fa',
    borderRight: '2px solid #b2ebf2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    zIndex: 100,
  },
  logo: {
    margin: 0,
    color: '#006064',
    marginBottom: '2rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'flex-start',
    width: '100%',
  },
  link: {
    textDecoration: 'none',
    color: '#006064',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    width: '100%',
    transition: 'background 0.2s',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: '2rem',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid #006064',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    background: '#fff',
    border: '1px solid #b2ebf2',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10,
    minWidth: '120px',
  },
  dropdownBtn: {
    background: 'none',
    border: 'none',
    color: '#006064',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'left',
  },
};

export default Navbar;

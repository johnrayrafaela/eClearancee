import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/image/logo/eClearance.png'; // Ensure this path is correct

const Navbar = () => {
  const { user, userType, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAvatarClick = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    window.location.href = '/'; // Redirects and refreshes to homepage
  };

  return (
    <nav style={styles.nav}>
      <img
        src={logo}
        style={{ width: 150, height: 150, marginBottom: '1.5rem', borderRadius: '50%' }}
        alt="Logo"
      />
      {/* Make links scrollable */}
      <div style={styles.linksWrapper}>
        <div style={styles.links}>
          {user && userType === 'user' && (
            <>

              <Link to="/profile" style={styles.link}>Profile</Link>
              <Link to="/student/dashboard" style={styles.link}>Student Dashboard</Link>
              <Link to="/student/clearance" style={styles.link}>Clearance Request</Link>
              <Link to="/student/clearancestatus" style={styles.link}>Clearance Status</Link>
              <Link to="/student/analytics" style={styles.link}>Analytics</Link>
            </>
          )}
          {user && userType === 'admin' && (
            <>
            <Link to="/admin/clearancerequest" style={styles.link}> Pending Clearance Request</Link>
            <Link to="/admin/dashboard" style={styles.link}>Admin Dashboard</Link>
             <Link to="/studentmanagement" style={styles.link}>Student Management</Link>
              <Link to="/staffmanagement" style={styles.link}>Staff Management</Link>
              <Link to="/admin/teachermanagement" style={styles.link}> Teacher Management</Link>
              <Link to="/admin/subjectmanagement" style={styles.link}>Subject Management</Link>
              <Link to="/admin/departmentmanagement" style={styles.link}>Department Management</Link>
              <Link to="/admin/analytics" style={styles.link}>Analytics</Link>
             
            </>
          )}

          {user && userType === 'teacher' && (
            <>
              <Link to="/teacher/dashboard" style={styles.link}>Teacher Dashboard</Link>
              <Link to="/teacher/subject-requests" style={styles.link}>Subject Approval Requests</Link>
              <Link to="/teacher/profile" style={styles.link}>Profile</Link>
              <Link to="/teacher/subject-requirements" style={styles.link}>My Subjects</Link>
              <Link to="/teacher/analytics" style={styles.link}>Analytics</Link>
            </>
          )}
          {user ? (
            <div style={styles.avatarContainer}>
              <img
                src={user.avatar ? `http://localhost:5000/${user.avatar}` : 'https://ui-avatars.com/api/?name=' + user.firstname + '+' + user.lastname}
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
    width: '210px',
    background: 'linear-gradient(180deg, #e0f7fa 60%, #b2ebf2 100%)',
    borderRight: '2px solid #b2ebf2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.5rem 1rem 1rem 1rem',
    zIndex: 100,
    boxShadow: '2px 0 12px rgba(2,119,189,0.07)',
    transition: 'width 0.2s',
  },
  logo: {
    margin: 0,
    color: '#0277bd',
    marginBottom: '2.5rem',
    fontSize: '1.7rem',
    fontWeight: 900,
    letterSpacing: '2px',
    textShadow: '0 2px 8px #b2ebf2',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  // Add a wrapper for scrollable links
  linksWrapper: {
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    alignItems: 'flex-start',
    width: '100%',
  },
  link: {
    textDecoration: 'none',
    color: '#0277bd',
    fontWeight: 600,
    fontSize: '1.08rem',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    width: '100%',
    transition: 'background 0.18s, color 0.18s',
    background: 'none',
  },
  avatarContainer: {
    position: 'relative',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2.5px solid #0288d1',
    boxShadow: '0 2px 8px rgba(2,119,189,0.09)',
    transition: 'border 0.2s',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    background: '#fff',
    border: '1.5px solid #b2ebf2',
    borderRadius: 6,
    boxShadow: '0 4px 16px rgba(2,119,189,0.09)',
    zIndex: 10,
    minWidth: '130px',
    marginTop: 4,
  },
  dropdownBtn: {
    background: 'none',
    border: 'none',
    color: '#0277bd',
    padding: '0.7rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 700,
    width: '100%',
    textAlign: 'left',
    fontSize: '1rem',
    borderRadius: 6,
    transition: 'background 0.15s',
  },
};

export default Navbar;

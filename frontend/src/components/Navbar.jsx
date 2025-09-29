import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/image/logo/eClearance.png';
import { typeScale } from '../style/CommonStyles';

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
      <div style={styles.brandBox}>
        <img
          src={logo}
          style={{ width: 70, height: 70, borderRadius: '50%', boxShadow:'0 4px 12px rgba(0,0,0,0.12)' }}
          alt="Logo"
        />
        <h1 style={styles.brandTitle}>eClearance</h1>
      </div>
      {/* Make links scrollable */}
      <div style={styles.linksWrapper}>
        <div style={styles.links}>
          {user && userType === 'user' && (
            <>

              <Link to="/profile" style={styles.link}>Profile</Link>
              <Link to="/student/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/student/clearance" style={styles.link}>Request</Link>
              <Link to="/student/clearancestatus" style={styles.link}>Status</Link>
              <Link to="/student/analytics" style={styles.link}>Analytics</Link>
            </>
          )}
          {user && userType === 'admin' && (
            <>
           
              <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/admin/clearancerequest" style={styles.link}>Pending Requests</Link>
              <Link to="/studentmanagement" style={styles.link}>Students</Link>
              <Link to="/staffmanagement" style={styles.link}>Staff</Link>
              <Link to="/admin/teachermanagement" style={styles.link}>Teachers</Link>
              <Link to="/admin/subjectmanagement" style={styles.link}>Subjects</Link>
              <Link to="/admin/departmentmanagement" style={styles.link}>Departments</Link>
              <Link to="/admin/analytics" style={styles.link}>Analytics</Link>
             
            </>
          )}

          {user && userType === 'teacher' && (
            <>
              <Link to="/teacher/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/teacher/subject-requests" style={styles.link}>Subject Request Approvals</Link>
              <Link to="/teacher/profile" style={styles.link}>Profile</Link>
              <Link to="/teacher/subject-requirements" style={styles.link}>Subjects Add Requirements</Link>
              <Link to="/teacher/add-subject" style={styles.link}>Add Subject</Link>
              <Link to="/teacher/analytics" style={styles.link}>Analytics</Link>
            </>
          )}
          {user && userType === 'staff' && (
            <>
              <Link to="/staff/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/staff/department-requests" style={styles.link}>Requests</Link>
              <Link to="/staff/department-requirements" style={styles.link}>Requirements</Link>
              <Link to="/staff/profile" style={styles.link}>Profile</Link>
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
    position: 'fixed', top: 0, left: 0, height: '100vh', width: 180,
    background: 'linear-gradient(180deg,#f8fafc 0%,#e0f7fa 100%)',
    borderRight: '1px solid #d0edf2', display: 'flex', flexDirection: 'column',
    alignItems: 'stretch', padding: '14px 12px 10px', zIndex: 100,
    boxShadow: '0 0 0 1px rgba(2,119,189,0.04), 4px 0 18px -6px rgba(2,119,189,0.15)'
  },
  brandBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:6, marginBottom:12 },
  brandTitle: { margin:0, fontSize: typeScale.xl, fontWeight:700, color:'#0277bd', letterSpacing:'.5px' },
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
  linksWrapper: { flex:1, width:'100%', overflowY:'auto', marginTop:4, paddingRight:2 },
  links: { display:'flex', flexDirection:'column', gap:6, alignItems:'stretch', width:'100%' },
  link: { textDecoration:'none', color:'#0369a1', fontWeight:600, fontSize: typeScale.lg, padding:'6px 10px', borderRadius:8, width:'100%', lineHeight:1.2, background:'transparent', transition:'background .18s,color .18s' },
  avatarContainer: {
    position: 'relative',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  avatar: { width:34, height:34, borderRadius:'50%', border:'2px solid #0288d1', boxShadow:'0 2px 6px rgba(2,119,189,0.15)', transition:'transform .2s' },
  dropdown: { position:'absolute', top:'108%', left:0, background:'#ffffff', border:'1px solid #d0edf2', borderRadius:8, boxShadow:'0 6px 22px -6px rgba(2,119,189,0.25)', zIndex:20, minWidth:120, padding:4 },
  dropdownBtn: { background:'none', border:'none', color:'#0369a1', padding:'6px 10px', cursor:'pointer', fontWeight:600, width:'100%', textAlign:'left', fontSize: typeScale.lg, borderRadius:6, transition:'background .15s' },
};

export default Navbar;

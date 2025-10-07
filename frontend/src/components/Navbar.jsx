import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/image/logo/eClearance.png';
import { typeScale, colors, gradients } from '../style/CommonStyles';

const Navbar = () => {
  const { user, userType, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const handleAvatarClick = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    window.location.href = '/'; // Redirects and refreshes to homepage
  };

  const buildLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        key={`nav-${to}`}
        to={to}
        style={{
          ...styles.link,
          ...(active ? styles.linkActive : {}),
        }}
      >
        {label}
        {active && <span style={styles.activeBar} />}
      </Link>
    );
  };

  const studentLinks = [
    ['/profile','Profile'],
    ['/student/dashboard','Dashboard'],
    ['/student/clearance','Request'],
    ['/student/clearancestatus','Status'],
    ['/student/analytics','Analytics']
  ];
  const adminLinks = [
    ['/admin/dashboard','Dashboard'],
    ['/admin/clearancerequest','Pending Requests'],
    ['/studentmanagement','Students'],
    ['/staffmanagement','Staff'],
    ['/admin/teachermanagement','Teachers'],
    ['/admin/subjectmanagement','Subjects'],
    ['/admin/departmentmanagement','Departments'],
    ['/admin/analytics','Analytics']
  ];
  const teacherLinks = [
    ['/teacher/dashboard','Dashboard'],
    ['/teacher/subject-requests','Subject Request Approvals'],
    ['/teacher/profile','Profile'],
    ['/teacher/subject-requirements','Subjects Add Requirements'],
    ['/teacher/add-subject','Add Subject'],
    ['/teacher/analytics','Analytics']
  ];
  const staffLinks = [
    ['/staff/dashboard','Dashboard'],
    ['/staff/department-requests','Requests'],
    ['/staff/department-requirements','Requirements'],
    ['/staff/profile','Profile']
  ];

  const roleLinks = userType === 'user' ? studentLinks : userType === 'admin' ? adminLinks : userType === 'teacher' ? teacherLinks : userType === 'staff' ? staffLinks : [];

  return (
    <nav style={styles.nav}>
      <div style={styles.brandBox}>
        <div style={styles.logoWrap}>
          <img
            src={logo}
            style={styles.logoImg}
            alt="Logo"
          />
        </div>
        <h1 style={styles.brandTitle}>eClearance</h1>
      </div>
      <div style={styles.linksWrapper}>
        <div style={styles.links}>
          {user && roleLinks.map(([to,label]) => buildLink(to,label))}
          {user && (
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
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, height: '100vh', width: 220,
    background: gradients.hero,
    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
    padding: '18px 16px 14px', zIndex: 120,
    boxShadow: '4px 0 28px -8px rgba(0,0,0,0.28)',
    borderRight: '2px solid rgba(255,255,255,0.08)'
  },
  brandBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:18 },
  brandTitle: { margin:0, fontSize: typeScale.xxl, fontWeight:800, color:'#ffffff', letterSpacing:'1.25px', textShadow:'0 3px 8px rgba(0,0,0,0.25)' },
  logoWrap: { width:82, height:82, borderRadius:'50%', padding:4, background:'linear-gradient(135deg,rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)', boxShadow:'0 8px 26px -4px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' },
  logoImg: { width:'92%', height:'92%', objectFit:'contain', borderRadius:'50%' },
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
  linksWrapper: { flex:1, width:'100%', overflowY:'auto', marginTop:8, paddingRight:4, scrollbarWidth:'thin' },
  links: { display:'flex', flexDirection:'column', gap:4, alignItems:'stretch', width:'100%' },
  link: { position:'relative', textDecoration:'none', color:'rgba(255,255,255,0.80)', fontWeight:600, fontSize: typeScale.lg, padding:'10px 14px', borderRadius:14, width:'100%', lineHeight:1.25, background:'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter:'blur(3px)', boxShadow:'0 2px 4px rgba(0,0,0,0.12)', transition:'background .22s, color .22s, transform .22s, box-shadow .22s' },
  linkActive: { background:'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)', color: colors.primary, boxShadow:'0 6px 18px -4px rgba(0,0,0,0.35)', fontWeight:700, transform:'translateY(-2px)' },
  activeBar: { position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:8, height:8, borderRadius:'50%', background: colors.primary, boxShadow:'0 0 0 4px rgba(2,119,189,0.25)' },
  avatarContainer: {
    position: 'relative',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  avatar: { width:42, height:42, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.55)', boxShadow:'0 4px 14px -2px rgba(0,0,0,0.35)', transition:'transform .25s, box-shadow .25s' },
  dropdown: { position:'absolute', top:'115%', left:0, background:'#ffffff', border:'1px solid #d0edf2', borderRadius:14, boxShadow:'0 16px 38px -10px rgba(0,0,0,0.25)', zIndex:30, minWidth:140, padding:6, display:'flex', flexDirection:'column', gap:4 },
  dropdownBtn: { background:'linear-gradient(135deg,#f8fafc 0%, #e3f2fd 100%)', border:'1px solid #d0edf2', color:colors.primary, padding:'8px 12px', cursor:'pointer', fontWeight:700, width:'100%', textAlign:'left', fontSize: typeScale.lg, borderRadius:10, transition:'background .18s, transform .18s, box-shadow .18s' },
};

// Minor interactive inline styles applied via events (kept out of style object for clarity)
// Could optionally be migrated to CSS module or styled-components.

// Add simple hover/active effects via JS (optional improvement)
// We rely on inline styles for now; if using a global stylesheet, we could append a <style> block.

// Enhance link hover using event delegation if desired (future enhancement)

export default Navbar;

import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';

const styles = {
  container: {
    maxWidth: 500,
    margin: '40px auto',
    padding: '2rem',
    background: '#f9fafd',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '2rem',
    marginBottom: 24,
    letterSpacing: '1px',
    textAlign: 'center',
  },
  label: {
    fontWeight: 700,
    color: '#0277bd',
    marginBottom: 4,
    display: 'block',
  },
  value: {
    fontWeight: 400,
    color: '#333',
    marginBottom: 16,
    fontSize: 17,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    margin: '0 auto 24px auto',
    display: 'block',
    background: '#e1f5fe',
  }
};

const TeacherProfilePage = () => {
  const { user, userType } = useContext(AuthContext);

  if (!user || userType !== 'teacher') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only teachers can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👤 My Profile</h2>
      {/* If you have an avatar/photo, show it here. Example: <img src={user.avatarUrl} ... /> */}
      {/* <img src={user.avatarUrl} alt="Profile" style={styles.avatar} /> */}
      <div>
        <span style={styles.label}>Name:</span>
        <span style={styles.value}>{user.firstname} {user.lastname}</span>
      </div>
      <div>
        <span style={styles.label}>Email:</span>
        <span style={styles.value}>{user.email}</span>
      </div>
      <div>
        <span style={styles.label}>Teacher ID:</span>
        <span style={styles.value}>{user.teacher_id}</span>
      </div>
      {/* Add more fields as needed */}
    </div>
  );
};

export default TeacherProfilePage;

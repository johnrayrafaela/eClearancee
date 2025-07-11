import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import ClearanceStatusPage from './ClearanceStatusPage'; // Import the status page
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Student Dashboard</h1>
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Welcome, {user?.firstname}!</h2>
          <p style={styles.cardText}>
            Here you can track your clearance progress, view pending requirements, and communicate with departments.
          </p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Links</h3>
          <ul style={styles.linkList}>
            <li><a href="/student/clearancestatus" style={styles.link}>Clearance Status</a></li>
            <li><a href="/profile" style={styles.link}>My Profile</a></li>
            <li><a href="/student/clearance" style={styles.link}>Request Clearance</a></li>
          </ul>
        </div>
      </div>

      

      {/* Clearance Status Section */}
      <div>
        <ClearanceStatusPage />
      </div>

    </div>
  );
};


  
const styles = {
  container: {
    padding: '2.5rem 2rem',
    background: '#f7fafc',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: '2.2rem',
    color: '#0277bd',
    marginBottom: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '2.5rem',
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '2rem 2.5rem',
    minWidth: 260,
    maxWidth: 350,
    flex: '1 1 300px',
    textAlign: 'center',
  },
  cardTitle: {
    color: '#0288d1',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  cardText: {
    color: '#444',
    fontSize: '1.05rem',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    color: '#0277bd',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'block',
    margin: '0.5rem 0',
    fontSize: '1.08rem',
    transition: 'color 0.2s',
  },
  section: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '2rem 2.5rem',
    margin: '2rem auto',
    maxWidth: 600,
  },
  sectionTitle: {
    color: '#0288d1',
    fontWeight: 'bold',
    marginBottom: '1.2rem',
    fontSize: '1.15rem',
  },
  progressBarContainer: {
    width: '100%',
    height: 18,
    background: '#e1f5fe',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #4fc3f7 0%, #0288d1 100%)',
    borderRadius: 9,
    transition: 'width 0.5s',
  },
  progressText: {
    color: '#0277bd',
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'right',
  },
  notifications: {
    listStyle: 'disc',
    paddingLeft: '1.5rem',
    color: '#444',
    fontSize: '1.05rem',
  },
};

export default StudentDashboard;
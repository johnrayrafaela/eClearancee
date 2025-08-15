
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import ClearanceStatusPage from './ClearanceStatusPage';



const StudentDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [subjectAnalytics, setSubjectAnalytics] = useState({});

  useEffect(() => {
    if (!user || userType !== 'user') return;
    // setLoading(true); (removed unused loading)
    // Subject analytics
    axios.get(`http://localhost:5000/api/student-subject-status/analytics/student?student_id=${user.student_id}`)
      .then(res => setSubjectAnalytics(res.data || {}))
      .catch(() => setSubjectAnalytics({}))
      .finally(() => {}); // removed unused loading
    // Clearance analytics
    
  }, [user, userType]);

  // Calculate subject totals
  let totalSubjects = 0, totalApproved = 0, totalRejected = 0;
  Object.values(subjectAnalytics).forEach(sem => {
    totalSubjects += sem.total || 0;
    totalApproved += sem.Approved || 0;
    totalRejected += sem.Rejected || 0;
  });
  // Pending = totalSubjects - (Approved + Rejected)
  let totalPending = totalSubjects - (totalApproved + totalRejected);

  return (
    <div style={styles.container}>
      <h1 style={{fontWeight: 900, color: '#0277bd', marginBottom: 16}}>Student Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: 24, color: '#0277bd'}}>
        Welcome, {user?.firstname}! Here you can track your clearance and subject progress.
      </p>


      {/* Subject Status Cards */}
      <div style={styles.cardRow}>
        <div style={{ ...styles.card, background: '#26c6da', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Total Subjects</div>
          <div style={{ fontWeight: 900, fontSize: 28 }}>{totalSubjects}</div>
        </div>
        <div style={{ ...styles.card, background: '#b9bb66ff', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Pending Subjects</div>
          <div style={{ fontWeight: 900, fontSize: 28 }}>{totalPending}</div>
        </div>
        <div style={{ ...styles.card, background: '#66bb6a', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Approved Subjects</div>
          <div style={{ fontWeight: 900, fontSize: 28 }}>{totalApproved}</div>
        </div>
        <div style={{ ...styles.card, background: '#ef5350', color: '#fff', alignItems: 'center',}}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Rejected Subjects</div>
          <div style={{ fontWeight: 900, fontSize: 28 }}>{totalRejected}</div>
        </div>
      </div>

      {/* Clearance Status Section */}
      <div >
      <ClearanceStatusPage/>
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
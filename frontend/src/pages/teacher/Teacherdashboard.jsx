import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const styles = {
  container: {
    padding: '2rem',
    margin: '0 auto',
    background: '#f9fafd',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '2rem',
    marginBottom: 0,
    letterSpacing: '1px',
    textAlign: 'center'
  },
  analyticsTitle: {
    color: '#2563eb',
    fontWeight: 700,
    fontSize: '1.2rem',
    margin: '2rem 0 1rem 0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
    marginTop: 12,
  },
  th: {
    background: '#e1f5fe',
    border: '1px solid #d1d5db',
    padding: 8,
    fontWeight: 700,
    color: '#0277bd',
    textAlign: 'left'
  },
  td: {
    border: '1px solid #e0e0e0',
    padding: 8,
    color: '#333',
    textAlign: 'center'
  }
};

const semesters = ['1st', '2nd'];
const statusLabels = ['Requested', 'Approved', 'Rejected'];

const TeacherDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/student-subject-status/analytics/teacher', {
      params: { teacher_id: user.teacher_id }
    })
      .then(res => setAnalytics(res.data))
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, [user, userType]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Teacher Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: 24 }}>
        Welcome, Teacher! Here you can manage your classes, view student progress, and handle academic tasks.
      </p>

      <div style={styles.analyticsTitle}>📊 Subject Status Analytics by Semester</div>
      {loading ? (
        <div>Loading analytics...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Semester</th>
              {statusLabels.map(status => (
                <th key={status} style={styles.th}>{status}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semesters.map(sem => (
              <tr key={sem}>
                <td style={styles.td}>{sem} Semester</td>
                {statusLabels.map(status => (
                  <td key={status} style={styles.td}>
                    {analytics[sem]?.[status] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <h2 style={styles.analyticsTitle}>📥 Subject Approval Requests</h2>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>
          Manage student subject requests and approvals.
        </p>
        <a href="/teacher/subject-requests" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          View Subject Requests
        </a>
      </div>
    </div>
  );
};

export default TeacherDashboard;
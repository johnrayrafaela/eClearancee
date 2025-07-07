import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: 900,
    margin: '0 auto',
    background: '#f9fafd',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
    fontFamily: 'Segoe UI, Arial, sans-serif'
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '2rem',
    marginBottom: 0,
    letterSpacing: '1px',
    textAlign: 'center'
  },
  statusBox: {
    marginBottom: 24,
    background: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
    fontSize: 18,
    color: '#2563eb'
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
    color: '#333'
  },
  error: {
    color: '#e11d48',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: 10,
    borderRadius: 6,
    marginTop: 16,
    textAlign: 'center'
  }
};

const ClearanceStatusPage = () => {
  const { user, userType } = useContext(AuthContext);
  const [clearance, setClearance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || userType !== 'user') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/clearance/status?student_id=${user.student_id}`)
      .then(res => {
        setClearance(res.data.clearance);
        setSubjects(res.data.subjects);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load clearance status.');
      })
      .finally(() => setLoading(false));
  }, [user, userType]);

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can view clearance status.</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 My Clearance Status</h2>
      {clearance && (
        <div style={styles.statusBox}>
          <strong>Status:</strong> {clearance.status}
        </div>
      )}
      <h3 style={{ color: '#2563eb' }}>📘 Subjects</h3>
      {subjects.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Subject Name</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.subject_id}>
                <td style={styles.td}>{subject.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No subjects found.</p>
      )}
    </div>
  );
};

export default ClearanceStatusPage;
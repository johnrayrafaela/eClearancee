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
  },
  button: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    marginRight: 8,
    background: '#0277bd',
    color: '#fff',
    transition: 'background 0.2s'
  }
};

const ClearanceStatusPage = () => {
  const { user, userType } = useContext(AuthContext);
  const [clearance, setClearance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectStatuses, setSubjectStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState({}); // { [subject_id]: boolean }

  // Fetch clearance, subjects, and subject statuses
  useEffect(() => {
    if (!user || userType !== 'user') return;
    setLoading(true);
    Promise.all([
      axios.get(`http://localhost:5000/api/clearance/status?student_id=${user.student_id}`),
      axios.get(`http://localhost:5000/api/student-subject-status/requested-statuses?student_id=${user.student_id}`)
    ])
      .then(([clearanceRes, statusRes]) => {
        setClearance(clearanceRes.data.clearance);
        setSubjects(clearanceRes.data.subjects);
        setSubjectStatuses(statusRes.data.statuses || []);
      })
      .catch(err => {
        console.error('Error fetching clearance or subject statuses:', err);
        setError('Failed to load clearance or subject statuses.');
      })
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Request approval for a subject
  const requestApproval = async (subjectId) => {
    setRequesting(prev => ({ ...prev, [subjectId]: true }));
    try {
      await axios.post('http://localhost:5000/api/student-subject-status/request', {
        student_id: user.student_id,
        subject_id: subjectId
      });
      // Update status locally
      setSubjectStatuses(prev =>
        prev.map(s =>
          s.subject_id === subjectId
            ? { ...s, status: 'Requested' }
            : s
        ).concat(
          prev.some(s => s.subject_id === subjectId)
            ? []
            : [{ subject_id: subjectId, status: 'Requested' }]
        )
      );
    } catch (err) {
      console.error('Error requesting approval:', err);
      setError('Failed to request approval.');
    }
    setRequesting(prev => ({ ...prev, [subjectId]: false }));
  };

  // Helper to get status for a subject
  const getStatus = (subjectId) => {
    const found = subjectStatuses.find(s => s.subject_id === subjectId);
    return found ? found.status : 'Pending';
  };

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
              <th style={styles.th}>Teacher</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => {
              const status = getStatus(subject.subject_id);
              return (
                <tr key={subject.subject_id}>
                  <td style={styles.td}>{subject.name}</td>
                  <td style={styles.td}>
                    {subject.teacher
                      ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                      : 'N/A'}
                  </td>
                  <td style={styles.td}>{status}</td>
                  <td style={styles.td}>
                    {(status === 'Pending' || status === 'Rejected') && (
                      <button
                        style={styles.button}
                        disabled={requesting[subject.subject_id]}
                        onClick={() => requestApproval(subject.subject_id)}
                      >
                        {requesting[subject.subject_id] ? 'Requesting...' : 'Request Approval'}
                      </button>
                    )}
                    {status === 'Requested' && (
                      <span style={{ color: '#0277bd', fontWeight: 600 }}>Waiting for Teacher</span>
                    )}
                    {status === 'Approved' && (
                      <span style={{ color: '#43a047', fontWeight: 600 }}>Approved</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No subjects found.</p>
      )}
    </div>
  );
};

export default ClearanceStatusPage;
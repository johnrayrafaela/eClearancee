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
  },
  approve: {
    background: '#43a047',
    color: '#fff'
  },
  reject: {
    background: '#e53935',
    color: '#fff'
  }
};

const TeacherSubjectRequests = () => {
  const { user, userType } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch requests for this teacher
  useEffect(() => {
    console.log('user:', user); // Add this line
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/student-subject-status/teacher?teacher_id=${user.teacher_id}`)
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleRespond = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/student-subject-status/${id}/respond`, { status });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  if (!user || userType !== 'teacher') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only teachers can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📥 Subject Approval Requests</h2>
      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div>No pending requests.</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td style={styles.td}>
                  {req.student?.firstname} {req.student?.lastname}
                </td>
                <td style={styles.td}>
                  {req.subject?.name}
                </td>
                <td style={styles.td}>
                  {req.status}
                </td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.button, ...styles.approve }}
                    onClick={() => handleRespond(req.id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.reject }}
                    onClick={() => handleRespond(req.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherSubjectRequests;
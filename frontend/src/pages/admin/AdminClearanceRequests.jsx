import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    marginBottom: 24,
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
    marginRight: 8
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

const AdminClearanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/api/clearance/all');
    setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatus = async (clearance_id, status) => {
    await axios.patch(`http://localhost:5000/api/clearance/${clearance_id}/status`, { status });
    fetchRequests();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Clearance Requests</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Course</th>
              <th style={styles.th}>Year</th>
              <th style={styles.th}>Block</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.clearance_id}>
                <td style={styles.td}>{req.student?.firstname} {req.student?.lastname}</td>
                <td style={styles.td}>{req.student?.course}</td>
                <td style={styles.td}>{req.student?.year_level}</td>
                <td style={styles.td}>{req.student?.block}</td>
                <td style={styles.td}>{req.student?.email}</td>
                <td style={styles.td}>{req.status}</td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.button, ...styles.approve }}
                    disabled={req.status === 'Approved'}
                    onClick={() => handleStatus(req.clearance_id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.reject }}
                    disabled={req.status === 'Rejected' || req.status === 'Approved'}
                    onClick={() => handleStatus(req.clearance_id, 'Rejected')}
                  >
                    Reject
                  </button>
                  <button
                    style={{ ...styles.button, background: '#b0bec5', color: '#263238' }}
                    onClick={async () => {
                      await axios.delete('http://localhost:5000/api/clearance/admin/delete', {
                        data: { student_id: req.student?.student_id }
                      });
                      fetchRequests();
                    }}
                  >
                    Delete
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

export default AdminClearanceRequests;
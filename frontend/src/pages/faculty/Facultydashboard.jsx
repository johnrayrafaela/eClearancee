import React, { useContext, useEffect, useState } from 'react';
import api from '../../api/client';
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

const statusLabels = ['Requested', 'Approved', 'Rejected'];

function Facultydashboard() {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userType !== 'faculty') return;
    setLoading(true);
  api.get('/clearance/analytics/faculty', {
      params: { staff_id: user.staff_id }
    })
      .then(res => setAnalytics(res.data))
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Card style for faculty dashboard
  const cardShadow = {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
    padding: '1.5rem',
    margin: '1rem 0',
    minWidth: 220,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Faculty Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: 24 }}>
        Welcome, Faculty! Here you view department requests and handle clearance tasks.
      </p>

      {/* Analytics Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Total Requests Card */}
        <div style={{ ...cardShadow, background: '#26c6da', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>📋</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Total Requests</div>
              <div style={{ fontSize: 14 }}>All Departments</div>
            </div>
          </div>
          <div style={{ marginTop: 10, width: '100%', fontWeight: 900, fontSize: 28, textAlign: 'right' }}>
            {statusLabels.reduce((sum, st) => sum + (analytics[st] || 0), 0)}
          </div>
        </div>
        {/* Pending Card */}
        <div style={{ ...cardShadow, background: '#ffd54f', color: '#333', alignItems: 'center', minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Pending</div>
              <div style={{ fontSize: 14 }}>All Departments</div>
            </div>
          </div>
          <div style={{ marginTop: 10, width: '100%', fontWeight: 900, fontSize: 28, textAlign: 'right' }}>
            {analytics['Requested'] || 0}
          </div>
        </div>
        {/* Approved Card */}
        <div style={{ ...cardShadow, background: '#66bb6a', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Approved</div>
              <div style={{ fontSize: 14 }}>All Departments</div>
            </div>
          </div>
          <div style={{ marginTop: 10, width: '100%', fontWeight: 900, fontSize: 28, textAlign: 'right' }}>
            {analytics['Approved'] || 0}
          </div>
        </div>
        {/* Rejected Card */}
        <div style={{ ...cardShadow, background: '#ef5350', color: '#fff', alignItems: 'center', minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>❌</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Rejected</div>
              <div style={{ fontSize: 14 }}>All Departments</div>
            </div>
          </div>
          <div style={{ marginTop: 10, width: '100%', fontWeight: 900, fontSize: 28, textAlign: 'right' }}>
            {analytics['Rejected'] || 0}
          </div>
        </div>
      </div>

      {/* Table Analytics by Department */}
      <div style={{ ...cardShadow, background: '#e1f5fe', color: '#0277bd', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>📊 Department Status</div>
        {loading ? (
          <div>Loading analytics...</div>
        ) : (
          <table style={{ ...styles.table, background: 'transparent', boxShadow: 'none', marginTop: 0 }}>
            <thead>
              <tr>
                <th style={styles.th}>Department</th>
                {statusLabels.map(status => (
                  <th key={status} style={styles.th}>{status}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(analytics.departments || []).map(dep => (
                <tr key={dep.name}>
                  <td style={styles.td}>{dep.name}</td>
                  {statusLabels.map(status => (
                    <td key={status} style={styles.td}>{dep[status] || 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Department Approval Requests Link */}
      <div style={{ ...cardShadow, background: '#e3f2fd', color: '#0277bd', marginBottom: 24 }}>
        <h2 style={{ ...styles.analyticsTitle, margin: 0 }}>📥 Department Approval Requests</h2>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>
          Manage student department requests and approvals.
        </p>
        <a href="/faculty/department-requests" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 700 }}>
          View Department Requests
        </a>
      </div>
    </div>
  );
};

export default Facultydashboard;

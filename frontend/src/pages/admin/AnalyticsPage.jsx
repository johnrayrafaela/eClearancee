import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import api from '../../api/client';
import '../../style/AnalyticsPage.css';
import {
  fadeInUp,
  slideInLeft,
  slideInRight,
  keyframes,
  gradients,
  pageStyles,
  headerStyles,
  injectKeyframes,
  typeScale,
} from '../../style/CommonStyles';

const statusColors = {
  Pending: '#ffd54f',
  Requested: '#42a5f5',
  Approved: '#43a047',
  Rejected: '#e53935'
};

const AnalyticsPage = () => {
  const [clearanceData, setClearanceData] = useState({ Pending: 0, Approved: 0, Rejected: 0 });
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [subjectStatusCounts, setSubjectStatusCounts] = useState({
    Pending: 0,
    Requested: 0,
    Approved: 0,
    Rejected: 0,
  });
  const [departmentStatusCounts, setDepartmentStatusCounts] = useState({
    Pending: 0,
    Requested: 0,
    Approved: 0,
    Rejected: 0,
  });
  const [tab, setTab] = useState('Clearance');
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Clearance distribution
        const clearanceRes = await api.get('/clearance/analytics/status');
        const clearanceData = clearanceRes.data || {};
        setClearanceData({
          Pending: clearanceData.Pending || 0,
          Approved: clearanceData.Approved || 0,
          Rejected: clearanceData.Rejected || 0,
        });

        // Student count
        const studentsRes = await api.get('/users/getAll/students');
        setStudentCount((studentsRes.data && studentsRes.data.length) || 0);

        // Staff count
        const staffRes = await api.get('/staff');
        setStaffCount((staffRes.data && staffRes.data.length) || 0);

        // Teacher count
        const teachersRes = await api.get('/teachers');
        setTeacherCount((teachersRes.data && teachersRes.data.length) || 0);

        // Subject status counts
        const subjectRes = await api.get('/student-subject-status/all-statuses');
        setSubjectStatusCounts({
          Pending: subjectRes.data.Pending || 0,
          Requested: subjectRes.data.Requested || 0,
          Approved: subjectRes.data.Approved || 0,
          Rejected: subjectRes.data.Rejected || 0,
        });

        // Department status counts
        const deptRes = await api.get('/department-status/all-statuses');
        setDepartmentStatusCounts({
          Pending: deptRes.data.Pending || 0,
          Requested: deptRes.data.Requested || 0,
          Approved: deptRes.data.Approved || 0,
          Rejected: deptRes.data.Rejected || 0,
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  const chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 }
      }
    },
    animation: { duration: 600 },
    maintainAspectRatio: false
  };

  const MetricCard = ({ label, value, icon, color, delay }) => (
    <div style={{
      background: gradients.light,
      padding: '14px 16px',
      borderRadius: 14,
      border: '1px solid #e1f5fe',
      boxShadow: '0 4px 10px rgba(2,119,189,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      animation: 'fadeInUp .55s ease',
      animationDelay: delay,
      animationFillMode: 'backwards',
      minWidth: 160
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: typeScale.base, fontWeight: 600, color: '#0277bd', letterSpacing: '.25px' }}>{label}</span>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: color || '#01579b', textShadow: '0 1px 2px rgba(2,119,189,0.18)' }}>{value}</div>
      <div style={{ height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#0288d1,#81d4fa)' }} />
    </div>
  );

  const clearancePie = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [clearanceData.Pending, clearanceData.Approved, clearanceData.Rejected],
        backgroundColor: ['#ffd54f', '#66bb6a', '#ef5350'],
        borderWidth: 1,
      },
    ],
  };

  // User analytics (students + staff + teachers)
  const usersPie = {
    labels: ['Students', 'Staff', 'Teachers'],
    datasets: [
      {
        data: [studentCount, staffCount, teacherCount],
        backgroundColor: [
          '#26c6da', // Students
          '#ab47bc', // Staff
          '#ffa726', // Teachers
        ],
        borderWidth: 1,
      },
    ],
  };

  const subjectStatusPie = {
    labels: ['Requested', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          subjectStatusCounts.Requested,
          subjectStatusCounts.Approved,
          subjectStatusCounts.Rejected,
        ],
        backgroundColor: [
          statusColors.Requested,
          statusColors.Approved,
          statusColors.Rejected
        ],
        borderWidth: 1,
      },
    ],
  };

  const departmentStatusPie = {
    labels: ['Pending', 'Requested', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          departmentStatusCounts.Pending,
          departmentStatusCounts.Requested,
          departmentStatusCounts.Approved,
          departmentStatusCounts.Rejected,
        ],
        backgroundColor: [
          statusColors.Pending,
          statusColors.Requested,
          statusColors.Approved,
          statusColors.Rejected
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding: 24 }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>📊</div>
          <h1 style={{
            ...headerStyles.pageTitle,
            color: '#0277bd',
            fontSize: typeScale.xxl,
            marginBottom: 4
          }}>Data Analytics Dashboard</h1>
          <p style={{ fontSize: typeScale.md, opacity: 0.85, margin: 0, lineHeight: 1.3, color: '#546e7a' }}>
            Comprehensive system analytics: clearance status, user distribution, and departmental insights.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="analytics-tabs" style={{ marginBottom: 24 }}>
          <button
            className={`analytics-tab-btn${tab === 'Clearance' ? ' active' : ''}`}
            onClick={() => setTab('Clearance')}
          >
            Clearance Status
          </button>
          <button
            className={`analytics-tab-btn${tab === 'Users' ? ' active' : ''}`}
            onClick={() => setTab('Users')}
          >
            User Analytics
          </button>
          <button
            className={`analytics-tab-btn${tab === 'Subjects' ? ' active' : ''}`}
            onClick={() => setTab('Subjects')}
          >
            Subject Status
          </button>
          <button
            className={`analytics-tab-btn${tab === 'Departments' ? ' active' : ''}`}
            onClick={() => setTab('Departments')}
          >
            Department Status
          </button>
        </div>

        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#eceff1', borderRadius: 14, height: 100, animation: 'shimmer 1.4s infinite' }} />
            ))
          ) : (
            <>
              <MetricCard label="Total Users" value={studentCount + staffCount + teacherCount} icon="👥" color="#0277bd" delay="0s" />
              <MetricCard label="Students" value={studentCount} icon="🎓" color="#0288d1" delay=".05s" />
              <MetricCard label="Staff" value={staffCount} icon="🧩" color="#ab47bc" delay=".1s" />
              <MetricCard label="Teachers" value={teacherCount} icon="👨‍🏫" color="#ffa726" delay=".15s" />
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20, marginBottom: 24 }}>
          {/* Clearance Status */}
          {tab === 'Clearance' && (
            <div className="analytics-card" style={{ ...slideInLeft }}>
              <h3>📄 Clearance Status Distribution</h3>
              {loading ? (
                <div style={{ background: '#eceff1', height: 200, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : (
                <>
                  <Pie data={clearancePie} options={chartOptions} />
                  <div className="analytics-stats">
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#ffd54f' }}></span>
                      Pending: <span className="analytics-stat-value">{clearanceData.Pending}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#43a047' }}></span>
                      Approved: <span className="analytics-stat-value">{clearanceData.Approved}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#e53935' }}></span>
                      Rejected: <span className="analytics-stat-value">{clearanceData.Rejected}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Analytics */}
          {tab === 'Users' && (
            <div className="analytics-card" style={{ ...slideInRight }}>
              <h3>👥 User Analytics</h3>
              {loading ? (
                <div style={{ background: '#eceff1', height: 200, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : (
                <>
                  <Pie data={usersPie} options={chartOptions} />
                  <div className="analytics-stats">
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#26c6da' }}></span>
                      Students: <span className="analytics-stat-value">{studentCount}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#ab47bc' }}></span>
                      Staff: <span className="analytics-stat-value">{staffCount}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: '#ffa726' }}></span>
                      Teachers: <span className="analytics-stat-value">{teacherCount}</span>
                    </div>
                    <div className="analytics-stat-label" style={{ fontWeight: 700, marginTop: 8, background: '#e3f2fd' }}>
                      <span className="analytics-stat-color" style={{ background: '#0277bd' }}></span>
                      Total Users: <span className="analytics-stat-value">{studentCount + staffCount + teacherCount}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subject Status */}
          {tab === 'Subjects' && (
            <div className="analytics-card" style={{ ...slideInLeft }}>
              <h3>📚 Subject Status Distribution</h3>
              {loading ? (
                <div style={{ background: '#eceff1', height: 200, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : (
                <>
                  <Pie data={subjectStatusPie} options={chartOptions} />
                  <div className="analytics-stats">
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Requested }}></span>
                      Requested: <span className="analytics-stat-value">{subjectStatusCounts.Requested}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Approved }}></span>
                      Approved: <span className="analytics-stat-value">{subjectStatusCounts.Approved}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Rejected }}></span>
                      Rejected: <span className="analytics-stat-value">{subjectStatusCounts.Rejected}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Department Status */}
          {tab === 'Departments' && (
            <div className="analytics-card" style={{ ...slideInRight }}>
              <h3>🏢 Department Status Distribution</h3>
              {loading ? (
                <div style={{ background: '#eceff1', height: 200, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : (
                <>
                  <Pie data={departmentStatusPie} options={chartOptions} />
                  <div className="analytics-stats">
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Pending }}></span>
                      Pending: <span className="analytics-stat-value">{departmentStatusCounts.Pending}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Requested }}></span>
                      Requested: <span className="analytics-stat-value">{departmentStatusCounts.Requested}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Approved }}></span>
                      Approved: <span className="analytics-stat-value">{departmentStatusCounts.Approved}</span>
                    </div>
                    <div className="analytics-stat-label">
                      <span className="analytics-stat-color" style={{ background: statusColors.Rejected }}></span>
                      Rejected: <span className="analytics-stat-value">{departmentStatusCounts.Rejected}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
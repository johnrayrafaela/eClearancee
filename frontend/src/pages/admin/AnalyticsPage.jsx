import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import api from '../../api/client';
import {
  fadeInUp,
  keyframes,
  gradients,
  pageStyles,
  cardStyles,
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
  const [selectedView, setSelectedView] = useState('Clearance');
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
  const buildBar = (counts) => {
    const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const seg = (v) => (v / sum) * 100;
    return (
      <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 6, overflow: 'hidden', background: '#eceff1', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
        <div style={{ width: seg(clearanceData.Approved) + '%', background: 'linear-gradient(90deg,#4caf50,#2e7d32)', transition: 'width .4s', display: clearanceData.Approved ? 'block' : 'none' }} />
        <div style={{ width: seg(clearanceData.Pending) + '%', background: 'linear-gradient(90deg,#ffb300,#ff9800)', transition: 'width .4s', display: clearanceData.Pending ? 'block' : 'none' }} />
        <div style={{ width: seg(clearanceData.Rejected) + '%', background: 'linear-gradient(90deg,#e53935,#c62828)', transition: 'width .4s', display: clearanceData.Rejected ? 'block' : 'none' }} />
      </div>
    );
  };

  const StatLine = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typeScale.base, color: '#455a64', lineHeight: 1.2 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }} />
        {label}
      </span>
      <strong style={{ fontWeight: 600 }}>{value}</strong>
    </div>
  );

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 14, padding: 12, font: { size: 12 } }
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

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        {/* Hero Header */}
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding: 24 }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>📊</div>
          <h1 style={{ ...headerStyles.pageTitle, color: '#fff', fontSize: typeScale.xxl, textShadow: '1px 1px 2px rgba(0,0,0,0.25)', marginBottom: 4 }}>System Analytics Dashboard</h1>
          <p style={{ fontSize: typeScale.md, opacity: .9, margin: 0, lineHeight: 1.3 }}>
            Comprehensive platform analytics: clearance status, user distribution, subject & department insights.
          </p>
        </div>

        {/* Overall Summary Card */}
        <div style={{ ...cardStyles.default, animation: 'fadeInUp .6s ease', marginBottom: 24 }}>
          <div style={{ background: gradients.primary, padding: '14px 16px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '1.4rem' }}>📈</div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: typeScale.xl, letterSpacing: '.25px' }}>Clearance Performance</h3>
              <p style={{ margin: '2px 0 0 0', opacity: .9, fontSize: typeScale.md }}>System-wide clearance request status overview.</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#e1f5fe' }}>View:</label>
              <select value={selectedView} onChange={e => setSelectedView(e.target.value)} style={{
                padding: '6px 10px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: typeScale.sm,
                backdropFilter: 'blur(4px)',
                outline: 'none'
              }}>
                <option value="Clearance">Clearance</option>
                <option value="Users">Users</option>
                <option value="Subjects">Subjects</option>
                <option value="Departments">Departments</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {loading ? (
              <div style={{ background: '#eceff1', height: 180, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
            ) : (
              <>
                {selectedView === 'Clearance' && (
                  <>
                    {buildBar(clearanceData)}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                      <div style={{ background: '#e8f5e9', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#2e7d32' }}>Approved</span>
                        <strong style={{ fontSize: typeScale.xl }}>{clearanceData.Approved}</strong>
                        <span style={{ fontSize: typeScale.xxs, color: '#2e7d32' }}>completed</span>
                      </div>
                      <div style={{ background: '#fff8e1', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#ef6c00' }}>Pending</span>
                        <strong style={{ fontSize: typeScale.xl }}>{clearanceData.Pending}</strong>
                        <span style={{ fontSize: typeScale.xxs, color: '#ef6c00' }}>in progress</span>
                      </div>
                      <div style={{ background: '#ffebee', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#c62828' }}>Rejected</span>
                        <strong style={{ fontSize: typeScale.xl }}>{clearanceData.Rejected}</strong>
                        <span style={{ fontSize: typeScale.xxs, color: '#c62828' }}>declined</span>
                      </div>
                    </div>
                  </>
                )}
                {selectedView === 'Users' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                    <div style={{ background: '#e3f2fd', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#01579b' }}>Students</span>
                      <strong style={{ fontSize: typeScale.xl }}>{studentCount}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#01579b' }}>total</span>
                    </div>
                    <div style={{ background: '#f3e5f5', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#512da8' }}>Staff</span>
                      <strong style={{ fontSize: typeScale.xl }}>{staffCount}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#512da8' }}>members</span>
                    </div>
                    <div style={{ background: '#ffe0b2', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#e65100' }}>Teachers</span>
                      <strong style={{ fontSize: typeScale.xl }}>{teacherCount}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#e65100' }}>faculty</span>
                    </div>
                  </div>
                )}
                {selectedView === 'Subjects' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                    <div style={{ background: '#c8e6c9', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#1b5e20' }}>Approved</span>
                      <strong style={{ fontSize: typeScale.xl }}>{subjectStatusCounts.Approved}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#1b5e20' }}>subjects</span>
                    </div>
                    <div style={{ background: '#ffe082', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#f57f17' }}>Requested</span>
                      <strong style={{ fontSize: typeScale.xl }}>{subjectStatusCounts.Requested}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#f57f17' }}>pending</span>
                    </div>
                    <div style={{ background: '#ef9a9a', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#b71c1c' }}>Rejected</span>
                      <strong style={{ fontSize: typeScale.xl }}>{subjectStatusCounts.Rejected}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#b71c1c' }}>declined</span>
                    </div>
                  </div>
                )}
                {selectedView === 'Departments' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                    <div style={{ background: '#fff9c4', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#f57f17' }}>Pending</span>
                      <strong style={{ fontSize: typeScale.xl }}>{departmentStatusCounts.Pending}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#f57f17' }}>depts</span>
                    </div>
                    <div style={{ background: '#bbdefb', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#0d47a1' }}>Requested</span>
                      <strong style={{ fontSize: typeScale.xl }}>{departmentStatusCounts.Requested}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#0d47a1' }}>active</span>
                    </div>
                    <div style={{ background: '#c8e6c9', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#1b5e20' }}>Approved</span>
                      <strong style={{ fontSize: typeScale.xl }}>{departmentStatusCounts.Approved}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#1b5e20' }}>completed</span>
                    </div>
                    <div style={{ background: '#ffccbc', padding: '10px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: typeScale.sm, fontWeight: 600, color: '#bf360c' }}>Rejected</span>
                      <strong style={{ fontSize: typeScale.xl }}>{departmentStatusCounts.Rejected}</strong>
                      <span style={{ fontSize: typeScale.xxs, color: '#bf360c' }}>declined</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'stretch' }}>
          {selectedView === 'Clearance' && (
            <div style={{ flex: '1 1 280px', minWidth: 260, background: '#fafafa', border: '1px solid #e0f2f1', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: typeScale.lg, fontWeight: 600, color: '#01579b', letterSpacing: '.25px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🧮</span> Distribution
              </h4>
              {loading ? (
                <div style={{ background: '#eceff1', height: 260, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : clearanceData.Pending + clearanceData.Approved + clearanceData.Rejected === 0 ? (
                <div style={{ fontSize: typeScale.base, color: '#546e7a', padding: '40px 4px', textAlign: 'center' }}>No data to visualize.</div>
              ) : (
                <div style={{ height: 260, position: 'relative' }}>
                  <Pie data={clearancePie} options={chartOptions} />
                </div>
              )}
            </div>
          )}
          {selectedView === 'Users' && (
            <div style={{ flex: '1 1 280px', minWidth: 260, background: '#fafafa', border: '1px solid #e0f2f1', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: typeScale.lg, fontWeight: 600, color: '#01579b', letterSpacing: '.25px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👥</span> Distribution
              </h4>
              {loading ? (
                <div style={{ background: '#eceff1', height: 260, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : studentCount + staffCount + teacherCount === 0 ? (
                <div style={{ fontSize: typeScale.base, color: '#546e7a', padding: '40px 4px', textAlign: 'center' }}>No data to visualize.</div>
              ) : (
                <div style={{ height: 260, position: 'relative' }}>
                  <Pie data={usersPie} options={chartOptions} />
                </div>
              )}
            </div>
          )}
          {selectedView === 'Subjects' && (
            <div style={{ flex: '1 1 280px', minWidth: 260, background: '#fafafa', border: '1px solid #e0f2f1', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: typeScale.lg, fontWeight: 600, color: '#01579b', letterSpacing: '.25px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📚</span> Distribution
              </h4>
              {loading ? (
                <div style={{ background: '#eceff1', height: 260, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : subjectStatusCounts.Requested + subjectStatusCounts.Approved + subjectStatusCounts.Rejected === 0 ? (
                <div style={{ fontSize: typeScale.base, color: '#546e7a', padding: '40px 4px', textAlign: 'center' }}>No data to visualize.</div>
              ) : (
                <div style={{ height: 260, position: 'relative' }}>
                  <Pie data={subjectStatusPie} options={chartOptions} />
                </div>
              )}
            </div>
          )}
          {selectedView === 'Departments' && (
            <div style={{ flex: '1 1 280px', minWidth: 260, background: '#fafafa', border: '1px solid #e0f2f1', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: typeScale.lg, fontWeight: 600, color: '#01579b', letterSpacing: '.25px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏢</span> Distribution
              </h4>
              {loading ? (
                <div style={{ background: '#eceff1', height: 260, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
              ) : departmentStatusCounts.Pending + departmentStatusCounts.Requested + departmentStatusCounts.Approved + departmentStatusCounts.Rejected === 0 ? (
                <div style={{ fontSize: typeScale.base, color: '#546e7a', padding: '40px 4px', textAlign: 'center' }}>No data to visualize.</div>
              ) : (
                <div style={{ height: 260, position: 'relative' }}>
                  <Pie data={departmentStatusPie} options={chartOptions} />
                </div>
              )}
            </div>
          )}

          {/* Highlights Section */}
          <div style={{ flex: '1 1 320px', minWidth: 280, background: '#f5fafd', border: '1px solid #e1f5fe', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: typeScale.lg, fontWeight: 600, color: '#01579b', letterSpacing: '.25px' }}>📌 Key Metrics</h4>
            {loading ? (
              <div style={{ background: '#eceff1', height: 180, borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: typeScale.base, color: '#455a64' }}>
                {selectedView === 'Clearance' && (
                  <>
                    <li><strong style={{ color: '#2e7d32' }}>{((clearanceData.Approved / (clearanceData.Pending + clearanceData.Approved + clearanceData.Rejected || 1)) * 100).toFixed(1)}%</strong> approval rate.</li>
                    <li><strong style={{ color: '#ef6c00' }}>{clearanceData.Pending}</strong> requests pending review.</li>
                    <li><strong style={{ color: '#01579b' }}>{clearanceData.Pending + clearanceData.Approved + clearanceData.Rejected}</strong> total requests processed.</li>
                  </>
                )}
                {selectedView === 'Users' && (
                  <>
                    <li><strong style={{ color: '#01579b' }}>{studentCount + staffCount + teacherCount}</strong> total users in system.</li>
                    <li><strong style={{ color: '#0277bd' }}>{studentCount}</strong> students registered.</li>
                    <li><strong style={{ color: '#512da8' }}>{staffCount}</strong> staff members active.</li>
                    <li><strong style={{ color: '#e65100' }}>{teacherCount}</strong> faculty members on file.</li>
                  </>
                )}
                {selectedView === 'Subjects' && (
                  <>
                    <li><strong style={{ color: '#1b5e20' }}>{subjectStatusCounts.Approved}</strong> subjects approved.</li>
                    <li><strong style={{ color: '#f57f17' }}>{subjectStatusCounts.Requested}</strong> awaiting approval.</li>
                    <li><strong style={{ color: '#b71c1c' }}>{subjectStatusCounts.Rejected}</strong> rejected subjects.</li>
                  </>
                )}
                {selectedView === 'Departments' && (
                  <>
                    <li><strong style={{ color: '#0d47a1' }}>{departmentStatusCounts.Requested}</strong> departments with active requests.</li>
                    <li><strong style={{ color: '#1b5e20' }}>{departmentStatusCounts.Approved}</strong> fully processed.</li>
                    <li><strong style={{ color: '#f57f17' }}>{departmentStatusCounts.Pending}</strong> pending action.</li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
      </div>
    </div>
  );
};

export default AnalyticsPage;
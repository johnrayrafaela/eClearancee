import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import api from '../../api/client';
import '../../style/AnalyticsPage.css';

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

  useEffect(() => {
    // Clearance distribution
    api.get('/clearance/analytics/status')
      .then(res => {
        const data = res.data || {};
        setClearanceData({
          Pending: data.Pending || 0,
          Approved: data.Approved || 0,
          Rejected: data.Rejected || 0,
        });
      })
      .catch(err => console.warn('Failed to fetch clearance analytics', err));

    // Student count
    api.get('/users/getAll/students')
      .then(res => setStudentCount((res.data && res.data.length) || 0))
      .catch(err => console.warn('Failed to fetch students', err));

    // Staff count
    api.get('/staff')
      .then(res => setStaffCount((res.data && res.data.length) || 0))
      .catch(err => console.warn('Failed to fetch staff', err));

    // Teacher count
    api.get('/teachers')
      .then(res => setTeacherCount((res.data && res.data.length) || 0))
      .catch(err => console.warn('Failed to fetch teachers', err));

  api.get('/student-subject-status/all-statuses')
      .then(res => {
        setSubjectStatusCounts({
          Pending: res.data.Pending || 0,
          Requested: res.data.Requested || 0,
          Approved: res.data.Approved || 0,
          Rejected: res.data.Rejected || 0,
        });
      });

    // Fetch department status counts
  api.get('/department-status/all-statuses')
      .then(res => {
        setDepartmentStatusCounts({
          Pending: res.data.Pending || 0,
          Requested: res.data.Requested || 0,
          Approved: res.data.Approved || 0,
          Rejected: res.data.Rejected || 0,
        });
      });
  }, []);
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
  const totalUsers = studentCount + staffCount + teacherCount;
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

  return (
    <div className="analytics-root">
      <h2 className="analytics-title">📊 Data Analytics Dashboard</h2>
      <div className="analytics-tabs">
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
      <div className="analytics-cards-row" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tab === 'Clearance' && (
          <div className="analytics-card">
            <h3>Students Clearance Status Distribution</h3>
            <Pie data={clearancePie} />
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
                <span className="analytics-stat-color" style={{ background: '#ef5350' }}></span>
                Rejected: <span className="analytics-stat-value">{clearanceData.Rejected}</span>
              </div>
            </div>
          </div>
        )}
        {tab === 'Users' && (
          <div className="analytics-card">
            <h3>User Analytics</h3>
            <Pie data={usersPie} />
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
              <div className="analytics-stat-label" style={{ fontWeight: 700, marginTop: 8 }}>
                <span className="analytics-stat-color" style={{ background: '#0277bd' }}></span>
                Total Users: <span className="analytics-stat-value">{totalUsers}</span>
              </div>
            </div>
          </div>
        )}
        
        {tab === 'Subjects' && (
          <div className="analytics-card">
            <h3>Students Subject Status Distribution</h3>
            <Pie data={subjectStatusPie} />
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
          </div>
        )}
        {tab === 'Departments' && (
          <div className="analytics-card">
            <h3>Department Status Distribution</h3>
            <Pie data={departmentStatusPie} />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
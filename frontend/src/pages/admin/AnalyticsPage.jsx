import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
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
  const [tab, setTab] = useState('Clearance');

  useEffect(() => {
    fetch('http://localhost:5000/api/clearance/analytics/status')
      .then(res => res.json())
      .then(data => setClearanceData({
        Pending: data.Pending || 0,
        Approved: data.Approved || 0,
        Rejected: data.Rejected || 0,
      }));

    fetch('http://localhost:5000/api/users/getAll/students')
      .then(res => res.json())
      .then(data => setStudentCount(data.length || 0));

    fetch('http://localhost:5000/api/staff')
      .then(res => res.json())
      .then(data => setStaffCount(data.length || 0));

    fetch('http://localhost:5000/api/teachers')
      .then(res => res.json())
      .then(data => setTeacherCount(data.length || 0));

    axios.get('http://localhost:5000/api/student-subject-status/all-statuses')
      .then(res => {
        const counts = { Pending: 0, Requested: 0, Approved: 0, Rejected: 0 };
        (res.data || []).forEach(s => {
          const status = s.status || 'Pending';
          if (counts[status] !== undefined) counts[status]++;
        });
        setSubjectStatusCounts(counts);
      });
  }, []);

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
    labels: ['Pending', 'Requested', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          subjectStatusCounts.Pending,
          subjectStatusCounts.Requested,
          subjectStatusCounts.Approved,
          subjectStatusCounts.Rejected,
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
    <div className="analytics-root">
      <h2 className="analytics-title">📊 Data Analytics</h2>
      <div className="analytics-tabs">
        <button
          className={`analytics-tab-btn${tab === 'Clearance' ? ' active' : ''}`}
          onClick={() => setTab('Clearance')}
        >
          Students Clearance Status
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
          Students Subject Status
        </button>
      </div>
      <div className="analytics-cards-row" style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                <span className="analytics-stat-color" style={{ background: statusColors.Pending }}></span>
                Pending: <span className="analytics-stat-value">{subjectStatusCounts.Pending}</span>
              </div>
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
      </div>
    </div>
  );
};

export default AnalyticsPage;
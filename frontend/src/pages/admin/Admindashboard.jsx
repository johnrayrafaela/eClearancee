import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

// Helper function to fetch data from your backend
const fetchData = async (endpoint) => {
  const res = await fetch(endpoint);
  return res.json();
};

const cardShadow = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
  padding: '1.5rem',
  margin: '1rem 0',
};

const quickLinks = [
  { to: "/staffmanagement", label: "Staff Management" },
  { to: "/admin/teachermanagement", label: "Teacher Management" },
  { to: "/admin/departmentmanagement", label: "Department Management" },
  { to: "/admin/clearancerequest", label: "Pending Clearance Requests" },
  { to: "/admin/analytics", label: "Analytics" },
];

const Admindashboard = () => {
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New: Analytics state for clearance status
  const [clearanceAnalytics, setClearanceAnalytics] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });

  useEffect(() => {
    Promise.all([
      fetchData('http://localhost:5000/api/users/getAll/students'),
      fetchData('http://localhost:5000/api/staff'), // GET all staff
      fetchData('http://localhost:5000/api/teachers'), // GET all teachers
    ]).then(([studentsData, staffsData, teachersData]) => {
      setStudents(studentsData);
      setStaffs(staffsData);
      setTeachers(teachersData);
      setLoading(false);
    });

    // Fetch clearance analytics from backend
    fetch('http://localhost:5000/api/clearance/analytics/status')
      .then(res => res.json())
      .then(data => setClearanceAnalytics({
        Pending: data.Pending || 0,
        Approved: data.Approved || 0,
        Rejected: data.Rejected || 0,
      }))
      .catch(() => setClearanceAnalytics({ Pending: 0, Approved: 0, Rejected: 0 }));
  }, []);

  // Student analytics
  const totalUsers = students.length;
  // Use analytics from backend for clearance counts
  const clearancePending = clearanceAnalytics.Pending;
  const clearanceApproved = clearanceAnalytics.Approved;
  const clearanceRejected = clearanceAnalytics.Rejected;
  const totalClearances = clearancePending + clearanceApproved + clearanceRejected;
  const clearedPercent = totalClearances
    ? Math.round((clearanceApproved / totalClearances) * 100)
    : 0;

  // Staff and teacher analytics
  const totalStaff = staffs.length;
  const totalTeachers = teachers.length;

  // Pie data for users
  const usersPieData = {
    labels: ['Students', 'Staff', 'Teachers'],
    datasets: [
      {
        data: [totalUsers, totalStaff, totalTeachers],
        backgroundColor: [
          '#26c6da', // Students
          '#ab47bc', // Staff
          '#ffa726', // Teachers
        ],
        borderWidth: 1,
      },
    ],
  };

  

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#f5fafd', minHeight: '100vh', padding: '2rem' }}>
      <h2 style={{ fontWeight: 900, color: '#0277bd', marginBottom: 16 }}>eClearance Admin Dashboard</h2>

      {/* Top Info Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24,  }}>
        <div style={{ ...cardShadow, minWidth: 220, flex: 1, background: '#26c6da', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Total Users</div>
            </div>
          </div>
          {/* Add total users info below */}
          <div style={{ marginTop: 10, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span style={{ color: '#e0f7fa' }}>Total Users</span>
              <span style={{ color: '#fff', fontWeight: 900 }}>{totalUsers}</span>
            </div>
          </div>
        </div>
        <div style={{ ...cardShadow, minWidth: 220, flex: 1, background: '#ffd54f', color: '#333', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 36 }}>📄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Pending Clearances</div>
            <div style={{ fontSize: 14 }}>{clearancePending}</div>
          </div>
        </div>
        <div style={{ ...cardShadow, minWidth: 220, flex: 1, background: '#66bb6a', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 36 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Approved Clearances</div>
            <div style={{ fontSize: 14 }}>{clearanceApproved}</div>
          </div>
        </div>
        <div style={{ ...cardShadow, minWidth: 220, flex: 1, background: '#ef5350', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 36 }}>❌</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Rejected Clearances</div>
            <div style={{ fontSize: 14 }}>{clearanceRejected}</div>
          </div>
        </div>
      </div>

      {/* Overall Cleared Clearances Progress */}
      <div style={{ ...cardShadow, marginBottom: 24, width: '100%', maxWidth: '100vw', padding: '1.5rem' }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#0277bd' }}>
          <span role="img" aria-label="progress" style={{ marginRight: 8 }}>📈</span>
          Overall Cleared Clearances
        </div>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {clearedPercent}% Cleared ({clearanceApproved} of {totalClearances})
        </div>
        <div style={{
          background: '#e0e0e0',
          borderRadius: 10,
          height: 18,
          width: '100%',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${clearedPercent}%`,
            background: '#66bb6a',
            height: '100%',
            borderRadius: 10,
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Profile & Analytics */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Admin Profile */}
        <div style={{ ...cardShadow, flex: 2, minWidth: 320 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            <span role="img" aria-label="profile" style={{ marginRight: 8 }}>👤</span>
            Admin Profile
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Welcome Admin!</div>
          <div style={{ marginBottom: 16 }}>eClearance:Automated School Clearance Proccessing System</div>
          <button style={{
            background: '#00bcd4',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '0.5rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}>UPDATE PROFILE</button>
        </div>
        {/* Data Analytics - Users */}
        <div style={{ ...cardShadow, flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            <span role="img" aria-label="analytics" style={{ marginRight: 8 }}>📊</span>
            Users Analytics
          </div>
          <Pie data={usersPieData} />
          <div style={{ marginTop: 18, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#26c6da', border: '1px solid #e0e0e0' }}></span>
              Students: <b style={{ color: '#0277bd' }}>{totalUsers}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#ab47bc', border: '1px solid #e0e0e0' }}></span>
              Staff: <b style={{ color: '#0277bd' }}>{totalStaff}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#ffa726', border: '1px solid #e0e0e0' }}></span>
              Teachers: <b style={{ color: '#0277bd' }}>{totalTeachers}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ ...cardShadow, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>
          <span role="img" aria-label="links" style={{ marginRight: 8 }}>🔗</span>
          Quick Links
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {quickLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              background: '#f1f8fb',
              color: '#0277bd',
              fontWeight: 700,
              padding: '0.7rem 1.5rem',
              borderRadius: 8,
              textDecoration: 'none',
              boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
              transition: 'background 0.2s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
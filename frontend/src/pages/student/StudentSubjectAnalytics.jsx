import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../style/StudentSubjectAnalytics.css'; // Ensure this path is correct

const StudentSubjectAnalytics = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState('All');

  useEffect(() => {
    if (!user || userType !== 'user') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/student-subject-status/analytics/student?student_id=${user.student_id}`)
      .then(res => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Get all semesters present in analytics
  const semesterOrder = ['1st', '2nd'];
  const semesters = analytics ? semesterOrder.filter(sem => analytics[sem]) : [];

  // Filter analytics for active semester
  const analyticsToShow = activeSemester === 'All' ? analytics : (analytics && analytics[activeSemester] ? { [activeSemester]: analytics[activeSemester] } : {});

  // Calculate overall cleared percentage
  let overallApproved = 0;
  let overallTotal = 0;
  if (analytics) {
    Object.values(analytics).forEach(data => {
      overallApproved += data.Approved || 0;
      overallTotal += data.total || 0;
    });
  }
  const overallPercent = overallTotal ? Math.round((overallApproved / overallTotal) * 100) : 0;

  // Pie chart data for the selected semester or all
  const statusLabels = ['Approved', 'Requested', 'Rejected'];
  const statusColors = {
    Approved: '#43a047',
    Requested: '#0277bd',
    Rejected: '#e53935',
  };
  const getPieData = () => {
    let data = { Approved: 0, Requested: 0, Pending: 0, Rejected: 0 };
    if (activeSemester === 'All') {
      if (analytics) {
        Object.values(analytics).forEach(semData => {
          statusLabels.forEach(status => {
            data[status] += semData[status] || 0;
          });
        });
      }
    } else if (analytics && analytics[activeSemester]) {
      statusLabels.forEach(status => {
        data[status] = analytics[activeSemester][status] || 0;
      });
    }
    return data;
  };
  const pieData = getPieData();
  const total = Object.values(pieData).reduce((a, b) => a + b, 0);
  const chartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusLabels.map(status => pieData[status]),
        backgroundColor: statusLabels.map(status => statusColors[status]),
        borderWidth: 2,
      },
    ],
  };

  if (!user || userType !== 'user') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only students can view analytics.</div>;
  }

  return (
    <div className="student-analytics-root">
      <h2 className="student-analytics-heading">📊 Subject Progress Analytics</h2>
      {/* Semester Tabs */}
      {analytics && semesters.length > 0 && (
        <div className="student-analytics-tabs">
          <button
            key="All"
            className={`student-analytics-tab-btn${activeSemester === 'All' ? ' active' : ''}`}
            onClick={() => setActiveSemester('All')}
          >
            All
          </button>
          {semesters.map(sem => (
            <button
              key={sem}
              className={`student-analytics-tab-btn${activeSemester === sem ? ' active' : ''}`}
              onClick={() => setActiveSemester(sem)}
            >
              {sem} Semester
            </button>
          ))}
        </div>
      )}
      <div className="student-analytics-pie-container">
        {loading ? (
          <div>Loading...</div>
        ) : total === 0 ? (
          <div className="student-analytics-nodata">No data to display.</div>
        ) : (
          <Pie data={chartData} options={{
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#0277bd', font: { size: 16 } }
              }
            }
          }} />
        )}
      </div>
      {analytics && overallTotal > 0 && activeSemester === 'All' && (
        <div style={{
          margin: '0 auto 24px auto',
          background: '#e1f5fe',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
          fontWeight: 700,
          color: overallPercent === 100 ? '#43a047' : '#0277bd',
          fontSize: 18
        }}>
          Overall Cleared: {overallApproved} / {overallTotal} subjects &mdash; <span style={{ fontWeight: 900 }}>{overallPercent}% {overallPercent === 100 ? 'Cleared 🎉' : 'Cleared'}</span>
        </div>
      )}
      {analyticsToShow && typeof analyticsToShow === 'object' && Object.keys(analyticsToShow).length > 0 ? (
        Object.entries(analyticsToShow).map(([semester, data]) => {
          if (!data) return null;
          const percent = data.total ? Math.round((data.Approved || 0) / data.total * 100) : 0;
          return (
            <div key={semester} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{semester} Semester</div>
              <div style={{ fontWeight: 400, color: '#333', marginBottom: 8, fontSize: 17 }}>Total Subjects: {data.total}</div>
              <div style={{ fontWeight: 700, color: percent === 100 ? '#43a047' : '#0277bd', marginBottom: 8 }}>
                Cleared: {data.Approved || 0} / {data.total} ({percent}%)
              </div>
            </div>
          );
        })
      ) : (
        !loading && <div className="student-analytics-nodata">No semester data available.</div>
      )}
    </div>
  );
};

export default StudentSubjectAnalytics;

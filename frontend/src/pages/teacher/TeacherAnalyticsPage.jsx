import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import '../../style/TeacherAnalyticsPage.css'; // Ensure this path is correct

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColors = {
  Requested: '#ffd54f',
  Approved: '#66bb6a',
  Rejected: '#ef5350',
};

const statusLabels = ['Requested', 'Approved', 'Rejected'];
const semesters = ['1st', '2nd'];

const TeacherAnalyticsPage = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/student-subject-status/analytics/teacher', {
      params: { teacher_id: user.teacher_id }
    })
      .then(res => setAnalytics(res.data))
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Aggregate data for all semesters
  const getPieData = () => {
    let data = { Requested: 0, Approved: 0, Rejected: 0 };
    if (selectedSemester === 'all') {
      semesters.forEach(sem => {
        statusLabels.forEach(status => {
          data[status] += analytics[sem]?.[status] || 0;
        });
      });
    } else {
      statusLabels.forEach(status => {
        data[status] = analytics[selectedSemester]?.[status] || 0;
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

  return (
    <div className="teacher-analytics-root">
      <h2 className="teacher-analytics-heading">📊 Teacher Approval Progress Analytics</h2>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <label htmlFor="semester-select" style={{ fontWeight: 600, color: '#0277bd', marginRight: 8 }}>Semester:</label>
        <select
          id="semester-select"
          className="teacher-analytics-semester-select"
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}
        >
          <option value="all">All Semesters</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>
      <div className="teacher-analytics-pie-container">
        {loading ? (
          <div>Loading analytics...</div>
        ) : total === 0 ? (
          <div className="teacher-analytics-nodata">No data to display.</div>
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
    </div>
  );
};

export default TeacherAnalyticsPage;

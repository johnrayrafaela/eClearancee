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
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  label: {
    fontWeight: 600,
    color: '#0277bd',
    marginRight: 8,
  },
  select: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1.5px solid #b3e5fc',
    background: '#fff',
    color: '#0277bd',
    fontSize: '1rem',
    minWidth: 120,
    outline: 'none'
  },
  search: {
    width: '100%',
    padding: '0.6rem 1rem',
    marginBottom: 18,
    borderRadius: 8,
    border: '1.5px solid #b3e5fc',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
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


const semesters = ['1st', '2nd'];
const courses = [
  'BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'
];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const blocks = ['A', 'B', 'C', 'D'];

const FacultyDepartmentRequests = () => {
  const { user, userType } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');

  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || userType !== 'staff') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/department-status/staff-requests', { params: { staff_id: user.staff_id } })
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Filter requests by course, year, block, semester, and search
  const filteredRequests = requests.filter(req => {
    const matchCourse = selectedCourse ? req.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? req.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? req.student?.block === selectedBlock : true;
    const matchSemester = selectedSemester ? req.semester === selectedSemester : true;
    const matchSearch = search.trim() ? (
      (req.student?.firstname + ' ' + req.student?.lastname).toLowerCase().includes(search.trim().toLowerCase())
    ) : true;
    return matchCourse && matchYear && matchBlock && matchSemester && matchSearch;
  });

  // Separate requests by status
  const pending = filteredRequests.filter(r => r.status === 'Requested');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');

  let currentData = [];
  if (tab === 'Pending') currentData = pending;
  else if (tab === 'Approved') currentData = approved;
  else if (tab === 'Rejected') currentData = rejected;

  const handleRespond = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/department-status/${id}/respond`, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Student Name</th>
          <th style={styles.th}>Department</th>
          <th style={styles.th}>Semester</th>
          <th style={styles.th}>Course</th>
          <th style={styles.th}>Year</th>
          <th style={styles.th}>Block</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>File</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map(req => (
          <tr key={req.id}>
            <td style={styles.td}>{req.student?.firstname} {req.student?.lastname}</td>
            <td style={styles.td}>{req.department?.name}</td>
            <td style={styles.td}>{req.semester}</td>
            <td style={styles.td}>{req.student?.course || '-'}</td>
            <td style={styles.td}>{req.student?.year_level || '-'}</td>
            <td style={styles.td}>{req.student?.block || '-'}</td>
            <td style={styles.td}>{req.status}</td>
            <td style={styles.td}>
              {req.file_path ? (
                <a
                  href={`http://localhost:5000/api/department-status/file/${req.department_id}?file=${encodeURIComponent(req.file_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0277bd', textDecoration: 'underline' }}
                >
                  View File
                </a>
              ) : <span>-</span>}
            </td>
            <td style={styles.td}>
              {req.status === 'Requested' ? (
                <>
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
                </>
              ) : (
                <span style={{ color: req.status === 'Approved' ? '#43a047' : '#e53935', fontWeight: 600 }}>
                  {req.status}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!user || userType !== 'staff') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only staff can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📥 Department Approval Requests</h2>
      <div style={{ ...styles.filterRow, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <label style={styles.label}>Semester:</label>
          <select
            style={styles.select}
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Course:</label>
          <select
            style={styles.select}
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Year:</label>
          <select
            style={styles.select}
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {yearLevels.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Block:</label>
          <select
            style={styles.select}
            value={selectedBlock}
            onChange={e => setSelectedBlock(e.target.value)}
          >
            <option value="">All Blocks</option>
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label style={styles.label}>Search:</label>
        <input
          type="text"
          style={styles.search}
          placeholder="Search student name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, gap: 12 }}>
        <button style={{
          padding: '8px 24px',
          borderRadius: 6,
          border: 'none',
          fontWeight: 700,
          fontSize: 16,
          background: tab === 'Pending' ? '#0277bd' : '#e1f5fe',
          color: tab === 'Pending' ? '#fff' : '#0277bd',
          cursor: 'pointer',
          boxShadow: tab === 'Pending' ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
          transition: 'background 0.2s'
        }} onClick={() => setTab('Pending')}>Pending</button>
        <button style={{
          padding: '8px 24px',
          borderRadius: 6,
          border: 'none',
          fontWeight: 700,
          fontSize: 16,
          background: tab === 'Approved' ? '#0277bd' : '#e1f5fe',
          color: tab === 'Approved' ? '#fff' : '#0277bd',
          cursor: 'pointer',
          boxShadow: tab === 'Approved' ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
          transition: 'background 0.2s'
        }} onClick={() => setTab('Approved')}>Approved</button>
        <button style={{
          padding: '8px 24px',
          borderRadius: 6,
          border: 'none',
          fontWeight: 700,
          fontSize: 16,
          background: tab === 'Rejected' ? '#0277bd' : '#e1f5fe',
          color: tab === 'Rejected' ? '#fff' : '#0277bd',
          cursor: 'pointer',
          boxShadow: tab === 'Rejected' ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
          transition: 'background 0.2s'
        }} onClick={() => setTab('Rejected')}>Rejected</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.2rem', margin: '24px 0 12px 0' }}>{tab} Requests</div>
          {currentData.length > 0 ? renderTable(currentData) : <div>No {tab.toLowerCase()} requests.</div>}
        </>
      )}
    </div>
  );
};

export default FacultyDepartmentRequests;

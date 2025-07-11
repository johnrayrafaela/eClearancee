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
  nav: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  navBtn: isActive => ({
    padding: '8px 24px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 700,
    fontSize: 16,
    background: isActive ? '#0277bd' : '#e1f5fe',
    color: isActive ? '#fff' : '#0277bd',
    cursor: 'pointer',
    boxShadow: isActive ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
    transition: 'background 0.2s'
  }),
  sectionTitle: {
    color: '#2563eb',
    fontWeight: 700,
    fontSize: '1.2rem',
    margin: '24px 0 12px 0'
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


const AdminClearanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');

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

  // Filter by semester, course, year, block, and search if selected
  const filteredRequests = requests.filter(r => {
    const matchSemester = selectedSemester ? r.semester === selectedSemester : true;
    const matchCourse = selectedCourse ? r.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? r.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? r.student?.block === selectedBlock : true;
    const matchSearch = search.trim() ? (
      (r.student?.firstname + ' ' + r.student?.lastname).toLowerCase().includes(search.trim().toLowerCase())
    ) : true;
    return matchSemester && matchCourse && matchYear && matchBlock && matchSearch;
  });

  // Separate requests by status
  const pending = filteredRequests.filter(r => r.status === 'Pending');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');

  let currentData = [];
  if (tab === 'Pending') currentData = pending;
  else if (tab === 'Approved') currentData = approved;
  else if (tab === 'Rejected') currentData = rejected;

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Student Name</th>
          <th style={styles.th}>Course</th>
          <th style={styles.th}>Year</th>
          <th style={styles.th}>Block</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Semester</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map(req => (
          <tr key={req.clearance_id}>
            <td style={styles.td}>{req.student?.firstname} {req.student?.lastname}</td>
            <td style={styles.td}>{req.student?.course}</td>
            <td style={styles.td}>{req.student?.year_level}</td>
            <td style={styles.td}>{req.student?.block}</td>
            <td style={styles.td}>{req.student?.email}</td>
            <td style={styles.td}>{req.semester ? `${req.semester} Semester` : '-'}</td>
            <td style={styles.td}>{req.status}</td>
            <td style={styles.td}>
              {req.status === 'Pending' ? (
                <>
                  <button
                    style={{ ...styles.button, ...styles.approve }}
                    onClick={() => handleStatus(req.clearance_id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.reject }}
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
                </>
              ) : (
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
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Clearance Requests</h2>
      {/* Filter Row */}
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
              <option key={sem} value={sem}>{sem} Semester</option>
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
            style={{ ...styles.search }}
            placeholder="Search student name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

      <div style={styles.nav}>
        <button style={styles.navBtn(tab === 'Pending')} onClick={() => setTab('Pending')}>Pending</button>
        <button style={styles.navBtn(tab === 'Approved')} onClick={() => setTab('Approved')}>Approved</button>
        <button style={styles.navBtn(tab === 'Rejected')} onClick={() => setTab('Rejected')}>Rejected</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={styles.sectionTitle}>{tab} Requests</div>
          {currentData.length > 0 ? renderTable(currentData) : <div>No {tab.toLowerCase()} requests.</div>}
        </>
      )}
    </div>
  );
};

export default AdminClearanceRequests;
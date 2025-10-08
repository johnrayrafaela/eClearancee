import React, { useEffect, useState } from 'react';
import api from '../../api/client';

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
  const res = await api.get('/clearance/all');
    setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatus = async (clearance_id, status) => {
  await api.patch(`/clearance/${clearance_id}/status`, { status });
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

  // Modal state for viewing subjects and departments
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubjects, setModalSubjects] = useState([]);
  const [modalDepartments, setModalDepartments] = useState([]);
  const [modalStudent, setModalStudent] = useState(null);
  const [modalSemester, setModalSemester] = useState('');
  const [modalAllApproved, setModalAllApproved] = useState(false);

  const openSubjectsModal = async (req) => {
    try {
  const res = await api.get(`/clearance/status?student_id=${req.student?.student_id}&semester=${req.semester}`);
      const subjects = res.data.subjects || [];
      // Fetch department statuses for this student and semester
  const deptRes = await api.get(`/department-status/statuses?student_id=${req.student?.student_id}&semester=${req.semester}`);
      const statusList = deptRes.data.statuses || [];
      // Fetch all departments
  const allDeptRes = await api.get('/departments');
      const allDepartments = allDeptRes.data || [];
      // Merge: for each department, find status for this student/semester
      const departments = allDepartments.map(dept => {
        const foundStatus = statusList.find(s => s.department_id === dept.department_id);
        return {
          department_id: dept.department_id,
          department: dept,
          requirements: dept.requirements,
          status: foundStatus ? foundStatus.status : 'Pending',
        };
      });
      setModalSubjects(subjects);
      setModalStudent(req.student);
      setModalSemester(req.semester);
      // Check if all subjects and departments are approved
      let allApproved = subjects.length > 0;
      subjects.forEach(sub => {
        if (!sub.StudentSubjectStatus || sub.StudentSubjectStatus.status !== 'Approved') {
          allApproved = false;
        }
      });
      // If there are departments, check their status
      if (departments.length > 0) {
        departments.forEach(dept => {
          if (dept.status !== 'Approved') {
            allApproved = false;
          }
        });
      }
      setModalDepartments(departments);
      setModalAllApproved(allApproved);
      setModalOpen(true);
    } catch {
      setModalSubjects([]);
      setModalStudent(req.student);
      setModalSemester(req.semester);
      setModalDepartments([]);
      setModalAllApproved(false);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSubjects([]);
    setModalStudent(null);
    setModalSemester('');
    setModalAllApproved(false);
  };

  const renderTable = (data) => (
    <>
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
                <button
                  style={{ ...styles.button, background: '#90caf9', color: '#0277bd', marginBottom: 6 }}
                  onClick={() => openSubjectsModal(req)}
                >
                  View Subjects & Dept
                </button>
                {/* Remove Approve/Reject if auto-approved (all subjects approved) even if status is Pending */}
                {req.status === 'Pending' && (!modalAllApproved || modalStudent?.student_id !== req.student?.student_id || modalSemester !== req.semester) ? (
                  <>
                    <button
                      style={{ ...styles.button, ...styles.approve }}
                      onClick={() => {
                        if (!modalAllApproved || modalStudent?.student_id !== req.student?.student_id || modalSemester !== req.semester) {
                          window.alert('Cannot approve: Not all subjects are cleared/approved for this student.');
                          return;
                        }
                        handleStatus(req.clearance_id, 'Approved');
                      }}
                      // Approve button is always enabled now
                      title={!modalAllApproved && modalStudent?.student_id === req.student?.student_id && modalSemester === req.semester ? 'All subjects must be approved' : ''}
                    >
                      Approve
                    </button>
                    <button
                      style={{ ...styles.button, background: '#b0bec5', color: '#263238' }}
                      onClick={async () => {
                        await api.delete('/clearance/admin/delete', {
                          data: { student_id: req.student?.student_id }
                        });
                        fetchRequests();
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : req.status === 'Approved' || (req.status === 'Pending' && modalAllApproved && modalStudent?.student_id === req.student?.student_id && modalSemester === req.semester) ? (
                  <span style={{ color: '#43a047', fontWeight: 600 }}>Auto-approved</span>
                ) : (
                  <button
                    style={{ ...styles.button, background: '#b0bec5', color: '#263238' }}
                    onClick={async () => {
                      await api.delete('/clearance/admin/delete', {
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

      {/* Modal for viewing subjects and departments */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 700, boxShadow: '0 4px 24px rgba(2,119,189,0.15)' }}>
            <h3 style={{ color: '#0277bd', marginBottom: 16 }}>Status for {modalStudent?.firstname} {modalStudent?.lastname} ({modalSemester} Semester)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Teacher</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {modalSubjects.map(sub => (
                  <tr key={sub.subject_id}>
                    <td style={styles.td}>{sub.name}</td>
                    <td style={styles.td}>{sub.teacher ? `${sub.teacher.firstname} ${sub.teacher.lastname}` : 'N/A'}</td>
                    <td style={styles.td}>{sub.StudentSubjectStatus ? sub.StudentSubjectStatus.status : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Departments Table */}
            <h4 style={{ color: '#2563eb', marginBottom: 8 }}>Departments</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={styles.th}>Department Name</th>
                  <th style={styles.th}>Assigned Staff</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {modalDepartments.map(dept => (
                  <tr key={dept.department_id}>
                    <td style={styles.td}>{dept.department ? dept.department.name : '-'}</td>
                    <td style={styles.td}>{dept.department && dept.department.staff ? `${dept.department.staff.firstname} ${dept.department.staff.lastname}` : '-'}</td>
                    <td style={styles.td}>{dept.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={{ ...styles.button, background: '#b0bec5', color: '#263238' }} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}> Admin Pending Clearance Requests</h2>
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
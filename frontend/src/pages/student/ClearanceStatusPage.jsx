
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
    fontFamily: 'Segoe UI, Arial, sans-serif'
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '2rem',
    marginBottom: 0,
    letterSpacing: '1px',
    textAlign: 'center'
  },
  statusBox: {
    marginBottom: 24,
    background: '#f7fafc',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
    fontSize: 18,
    color: '#2563eb'
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
  error: {
    color: '#e11d48',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: 10,
    borderRadius: 6,
    marginTop: 16,
    textAlign: 'center'
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
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#333'
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    width: '100%',
    maxWidth: 300,
    fontSize: 16,
    color: '#333'
  }
};

const semesters = ['1st', '2nd'];


const ClearanceStatusPage = () => {
  const { user, userType } = useContext(AuthContext);
  const [clearance, setClearance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectStatuses, setSubjectStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState({}); // { [subject_id]: boolean }
  // Removed requirements state
  const [files, setFiles] = useState({}); // { [subject_id]: File[] | [] }
  const [selectedSemester, setSelectedSemester] = useState('');
  const [departments, setDepartments] = useState([]);

  // Department file upload state and request (moved inside component)
  const [deptFiles, setDeptFiles] = useState({}); // { [department_id]: File[] }
  const [deptRequesting, setDeptRequesting] = useState({}); // { [department_id]: boolean }
  const [departmentStatuses, setDepartmentStatuses] = useState([]); // [{ department_id, status, file_path }]

  // Fetch department statuses
  useEffect(() => {
    if (!user || userType !== 'user' || !selectedSemester) return;
    axios.get(`http://localhost:5000/api/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`)
      .then(res => {
        setDepartmentStatuses(res.data.statuses || []);
      })
      .catch(() => setDepartmentStatuses([]));
  }, [user, userType, selectedSemester]);

  // Helper to get department status
  const getDeptStatus = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found ? found.status : 'Pending';
  };
  const getDeptFile = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found && found.file_path ? found.file_path : null;
  };

  // Request approval for a department
  const requestDeptApproval = async (departmentId) => {
    if (!window.confirm('Are you sure you want to request approval for this department? This will submit your uploaded file.')) {
      return;
    }
    setDeptRequesting(prev => ({ ...prev, [departmentId]: true }));
    try {
      const formData = new FormData();
      formData.append('student_id', user.student_id);
      formData.append('department_id', departmentId);
      formData.append('semester', selectedSemester);
      // Get requirements from department object
      const deptObj = departments.find(d => d.department_id === departmentId);
      const requirements = deptObj && deptObj.requirements ? deptObj.requirements : '';
      formData.append('requirements', requirements);
      if (deptFiles[departmentId] && deptFiles[departmentId].length > 0) {
        formData.append('file', deptFiles[departmentId][0]);
      }
      await axios.post('http://localhost:5000/api/department-status/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Refetch department statuses
      const res = await axios.get(`http://localhost:5000/api/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`);
      setDepartmentStatuses(res.data.statuses || []);
      setDeptFiles(prev => ({ ...prev, [departmentId]: null }));
    } catch {
      setError('Failed to request department approval.');
    }
    setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
  };

  // Fetch clearance, subjects, and subject statuses
  useEffect(() => {
    if (!user || userType !== 'user' || !selectedSemester) return;
    setLoading(true);
    Promise.all([
      axios.get(`http://localhost:5000/api/clearance/status?student_id=${user.student_id}&semester=${selectedSemester}`),
      axios.get(`http://localhost:5000/api/student-subject-status/requested-statuses?student_id=${user.student_id}&semester=${selectedSemester}`),
      axios.get('http://localhost:5000/api/departments')
    ])
      .then(([clearanceRes, statusRes, deptRes]) => {
        setClearance(clearanceRes.data.clearance);
        setSubjects(clearanceRes.data.subjects);
        setSubjectStatuses(statusRes.data.statuses || []);
        setDepartments(deptRes.data || []);
        setError('');
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setClearance(null);
          setSubjects([]);
          setSubjectStatuses([]);
          setDepartments([]);
          setError('No clearance found. Please request clearance first.');
        } else {
          setError('Failed to load clearance, subject statuses, or departments.');
        }
      })
      .finally(() => setLoading(false));
  }, [user, userType, selectedSemester]);

  // Request approval for a subject
  const requestApproval = async (subjectId) => {
    if (!window.confirm('Are you sure you want to request approval for this subject? This will submit your uploaded file and requirements.')) {
      return;
    }
    setRequesting(prev => ({ ...prev, [subjectId]: true }));
    try {
      const formData = new FormData();
      formData.append('student_id', user.student_id);
      formData.append('subject_id', subjectId);
      formData.append('semester', selectedSemester);
      // No requirements field
      if (files[subjectId] && files[subjectId].length > 0) {
        files[subjectId].forEach((file) => {
          formData.append('files', file); // backend should accept array under 'files'
        });
      }
      await axios.post('http://localhost:5000/api/student-subject-status/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update status locally
      setSubjectStatuses(prev =>
        prev.map(s =>
          s.subject_id === subjectId
            ? { ...s, status: 'Requested' }
            : s
        ).concat(
          prev.some(s => s.subject_id === subjectId)
            ? []
            : [{ subject_id: subjectId, status: 'Requested' }]
        )
      );
      // No requirements reset
      setFiles(prev => ({ ...prev, [subjectId]: null }));
    } catch (err) {
      console.error('Error requesting approval:', err);
      setError('Failed to request approval.');
    }
    setRequesting(prev => ({ ...prev, [subjectId]: false }));
  };

  // Helper to get status for a subject
  const getStatus = (subjectId) => {
    const found = subjectStatuses.find(s => s.subject_id === subjectId);
    return found ? found.status : 'Pending';
  };

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can view clearance status.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 My Clearance Status</h2>
      <div style={{ marginBottom: 18 }}>
        <label style={styles.label}>Semester:</label>
        <select
          style={styles.input}
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}
        >
          <option value="">Select Semester</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>
      {loading && selectedSemester && <div>Loading...</div>}
      {error && !clearance && selectedSemester && <div style={styles.error}>{error}</div>}
      {clearance && selectedSemester && (
        <div style={styles.statusBox}>
          <strong>Status:</strong> <span style={{
            color: clearance.status === 'Approved' ? '#43a047' : clearance.status === 'Rejected' ? '#e11d48' : clearance.status === 'Requested' ? '#0277bd' : '#f59e42',
            fontWeight: 700
          }}>{clearance.status}</span>
        </div>
      )}
      {selectedSemester && (
        <>
          

          {/* Subjects Table */}
          <h3 style={{ color: '#2563eb' }}>📘 Subjects</h3>
          {subjects.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Teacher</th>
                  <th style={styles.th}>Requirements</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>File Upload</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => {
                  const status = getStatus(subject.subject_id);
                  return (
                    <tr key={subject.subject_id}>
                      <td style={styles.td}>{subject.name}</td>
                      <td style={styles.td}>
                        {subject.teacher
                          ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                          : 'N/A'}
                      </td>
                      <td style={styles.td}>{subject.requirements}</td>
                      <td style={styles.td}>
                        {status === 'Requested' && <span style={{ color: '#0277bd', fontWeight: 600 }}>Requested</span>}
                        {status === 'Approved' && <span style={{ color: '#43a047', fontWeight: 600 }}>Approved</span>}
                        {status === 'Rejected' && <span style={{ color: '#e11d48', fontWeight: 600 }}>Rejected</span>}
                        {status === 'Pending' && <span style={{ color: '#f59e42', fontWeight: 600 }}>Pending</span>}
                      </td>
                      <td style={styles.td}>
                        {(status === 'Pending' || status === 'Rejected') && subject.requirements && subject.requirements.trim() !== '' ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              multiple
                              onChange={e => {
                                const fileArr = Array.from(e.target.files);
                                setFiles(prev => ({ ...prev, [subject.subject_id]: fileArr }));
                              }}
                            />
                            {files[subject.subject_id] && files[subject.subject_id].length > 0 && (
                              <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none', fontSize: 13 }}>
                                {files[subject.subject_id].map((file, idx) => (
                                  <li key={idx}>{file.name}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (status !== 'Pending' && status !== 'Rejected') ? <span>-</span> : null}
                        {(status === 'Requested' || status === 'Approved') && (() => {
                          // Find file_path from subjectStatuses for this subject
                          const statusObj = subjectStatuses.find(s => s.subject_id === subject.subject_id);
                          if (statusObj && statusObj.file_path) {
                            return (
                              <a
                                href={`http://localhost:5000/api/student-subject-status/file/${subject.subject_id}?file=${encodeURIComponent(statusObj.file_path)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Uploaded File
                              </a>
                            );
                          }
                          return <span>-</span>;
                        })()}
                      </td>
                      <td style={styles.td}>
                        {(status === 'Pending' || status === 'Rejected') && (
                          <button
                            style={styles.button}
                            disabled={
                              requesting[subject.subject_id] ||
                              (subject.requirements && subject.requirements.trim() !== '' && !files[subject.subject_id])
                            }
                            onClick={() => requestApproval(subject.subject_id)}
                          >
                            {requesting[subject.subject_id] ? 'Requesting...' : 'Request Approval'}
                          </button>
                        )}
                        {status === 'Requested' && (
                          <span style={{ color: '#0277bd', fontWeight: 600 }}>Waiting for Teacher</span>
                        )}
                        {status === 'Approved' && (
                          <span style={{ color: '#43a047', fontWeight: 600 }}>Approved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            selectedSemester && <p>No subjects found.</p>
          )}




          {/* Departments Table */}
          <h3 style={{ color: '#2563eb', marginTop: 32 }}>🏢 Departments</h3>
          {departments.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Department Name</th>
                  <th style={styles.th}>Assigned Staff</th>
                  <th style={styles.th}>Requirements</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>File Upload</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => {
                  const deptStatus = getDeptStatus(dept.department_id);
                  const uploadedFile = getDeptFile(dept.department_id);
                  let staffName = '-';
                  if (dept.staff && (dept.staff.firstname || dept.staff.lastname)) {
                    staffName = `${dept.staff.firstname || ''} ${dept.staff.lastname || ''}`.trim();
                  }
                  // Get requirements from department object (persisted in Department model)
                  const requirements = dept.requirements && dept.requirements.trim() !== '' ? dept.requirements : '-';
                  return (
                    <tr key={dept.department_id || idx}>
                      <td style={styles.td}>{dept.name}</td>
                      <td style={styles.td}>{staffName}</td>
                      <td style={styles.td}>{requirements}</td>
                      <td style={styles.td}>
                        {deptStatus === 'Requested' && <span style={{ color: '#0277bd', fontWeight: 600 }}>Requested</span>}
                        {deptStatus === 'Approved' && <span style={{ color: '#43a047', fontWeight: 600 }}>Approved</span>}
                        {deptStatus === 'Rejected' && <span style={{ color: '#e11d48', fontWeight: 600 }}>Rejected</span>}
                        {deptStatus === 'Pending' && <span style={{ color: '#f59e42', fontWeight: 600 }}>Pending</span>}
                      </td>
                      <td style={styles.td}>
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && requirements !== '-' ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              onChange={e => {
                                const fileArr = Array.from(e.target.files);
                                setDeptFiles(prev => ({ ...prev, [dept.department_id]: fileArr }));
                              }}
                            />
                            {deptFiles[dept.department_id] && deptFiles[dept.department_id].length > 0 && (
                              <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none', fontSize: 13 }}>
                                {deptFiles[dept.department_id].map((file, idx) => (
                                  <li key={idx}>{file.name}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : <span>-</span>}
                        {(deptStatus === 'Requested' || deptStatus === 'Approved') && uploadedFile && (
                          <a
                            href={`http://localhost:5000/api/department-status/file/${dept.department_id}?file=${uploadedFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Uploaded File
                          </a>
                        )}
                        {((deptStatus === 'Requested' || deptStatus === 'Approved') && !uploadedFile) && <span>-</span>}
                      </td>
                      <td style={styles.td}>
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && (
                          <button
                            style={styles.button}
                            disabled={
                              deptRequesting[dept.department_id] ||
                              (requirements !== '-' && (!deptFiles[dept.department_id] || deptFiles[dept.department_id].length === 0))
                            }
                            onClick={() => requestDeptApproval(dept.department_id)}
                          >
                            {deptRequesting[dept.department_id] ? 'Requesting...' : 'Request Approval'}
                          </button>
                        )}
                        {deptStatus === 'Requested' && <span style={{ color: '#0277bd', fontWeight: 600 }}>Waiting for Department</span>}
                        {deptStatus === 'Approved' && <span style={{ color: '#43a047', fontWeight: 600 }}>Approved</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No departments found.</p>
          )}
          
        </>
      )}
    </div>
  );
};

export default ClearanceStatusPage;
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { 
  gradients, 
  buttonStyles, 
  fadeInUp, 
  keyframes 
} from '../../style/CommonStyles';

// Inject keyframes
if (typeof document !== 'undefined' && !document.querySelector('#common-keyframes')) {
  const style = document.createElement('style');
  style.id = 'common-keyframes';
  style.textContent = keyframes;
  document.head.appendChild(style);
}



const styles = {
  container: {
    padding: '2rem',
    margin: '0 auto',
    background: gradients.light,
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(2,119,189,0.1)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    maxWidth: '1400px',
    ...fadeInUp
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '1.8rem',
    marginBottom: 15,
    letterSpacing: '0.5px',
    textAlign: 'center',
    background: gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  statusBox: {
    marginBottom: 20,
    background: gradients.card,
    borderRadius: 12,
    padding: 15,
    boxShadow: '0 4px 15px rgba(2,119,189,0.08)',
    fontSize: 16,
    color: '#2563eb',
    border: '1px solid #e1f5fe'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(2,119,189,0.08)',
    marginTop: 20,
    border: '1px solid #e1f5fe'
  },
  th: {
    background: gradients.primary,
    color: '#fff',
    border: 'none',
    padding: 10,
    fontWeight: 600,
    textAlign: 'left',
    fontSize: '0.8rem',
    letterSpacing: '0.3px'
  },
  td: {
    border: '1px solid #f0f0f0',
    padding: 10,
    color: '#333',
    verticalAlign: 'top',
    fontSize: '0.85rem'
  },
  error: {
    color: '#d32f2f',
    background: gradients.light,
    border: '2px solid #ffcdd2',
    padding: 15,
    borderRadius: 10,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600
  },
  button: {
    ...buttonStyles.primary,
    padding: '6px 12px',
    fontSize: '0.75rem',
    borderRadius: 6,
    marginRight: 6,
    boxShadow: '0 3px 10px rgba(2,119,189,0.2)'
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontWeight: 600,
    color: '#0277bd',
    fontSize: '0.9rem'
  },
  input: {
    padding: 8,
    borderRadius: 8,
    border: '2px solid #e1f5fe',
    width: '100%',
    maxWidth: 250,
    fontSize: 14,
    color: '#333',
    background: '#f8fafc',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
    padding: 6,
    borderRadius: 6,
    background: '#f8fafc',
    border: '1px solid #e1f5fe'
  },
  instructionBox: {
    fontSize: 12,
    marginTop: 6,
    padding: 8,
    background: '#e3f2fd',
    borderRadius: 6,
    color: '#1976d2',
    border: '1px solid #bbdefb'
  }
};

const semesters = ['1st', '2nd'];


const ClearanceStatusPage = () => {
  // Track checklist submissions per subject
  const [submittedChecklists, setSubmittedChecklists] = useState({});
  // Track submitted link per subject (for Link requirements)
  const [submittedLinks, setSubmittedLinks] = useState({});
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
  const [instructionModal, setInstructionModal] = useState(null); // { subjectId, name, type, instructions }

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
          onChange={e => {
            e.stopPropagation();
            setSelectedSemester(e.target.value);
          }}
          onFocus={e => e.stopPropagation()}
          onBlur={e => e.stopPropagation()}
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
          <h3 style={{ 
            color: '#0277bd', 
            fontSize: '1.2rem',
            fontWeight: 700,
            marginTop: 25,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            📘 Subjects
          </h3>
          {subjects.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Teacher</th>
                  <th style={styles.th}>Requirement Type</th>
                  <th style={styles.th}>Instructions</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>File Upload</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Only show subjects that are in the student's clearance (already filtered by backend) */}
                {subjects.map(subject => {
                  const status = getStatus(subject.subject_id);
                  // Parse requirements as JSON if possible
                  let reqObj = { type: 'Text', instructions: '', checklist: [] };
                  if (subject.requirements) {
                    try {
                      reqObj = JSON.parse(subject.requirements);
                      // Ensure instructions field exists (backward compatibility)
                      if (!reqObj.instructions) {
                        reqObj.instructions = reqObj.value || '';
                      }
                    } catch {
                      reqObj = { type: 'Text', instructions: subject.requirements, checklist: [] };
                    }
                  }
                  // Find student's submitted link if any
                  const statusObj = subjectStatuses.find(s => s.subject_id === subject.subject_id);
                  let studentLink = statusObj && statusObj.link ? statusObj.link : '';
                  // Find student's submitted checklist if any
                  let studentChecklist = statusObj && statusObj.checklist ? statusObj.checklist : [];
                  return (
                    <tr key={subject.subject_id}>
                      <td style={styles.td}>{subject.name}</td>
                      <td style={styles.td}>
                        {subject.teacher
                          ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                          : 'N/A'}
                      </td>
                      {/* Requirement Type */}
                      <td style={styles.td}>
                        {(() => {
                          const type = reqObj.type || 'Text';
                          switch(type){
                            case 'Checklist': return '✅ Checklist';
                            case 'Link': return '🔗 Link/URL';
                            case 'File': return '📁 File Upload';
                            case 'Text': return '📝 Text';
                            case 'Other': return '🔧 Other';
                            default: return type;
                          }
                        })()}
                      </td>
                      {/* Instructions Column */}
                      <td style={styles.td}>
                        {(() => {
                          const raw = (reqObj.instructions || '').trim();
                          if (!raw) {
                            return <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#666' }}>No instructions</span>;
                          }
                          const LONG_THRESHOLD = 70;
                          if (raw.length > LONG_THRESHOLD) {
                            return (
                              <button
                                style={{ ...buttonStyles.secondary, padding: '6px 10px', fontSize: '0.6rem', borderRadius: 6, lineHeight: 1.2 }}
                                onClick={() => setInstructionModal({ subjectId: subject.subject_id, name: subject.name, type: reqObj.type, instructions: raw })}
                              >
                                View Instructions ({raw.length} chars)
                              </button>
                            );
                          }
                          return <span style={{ fontSize: '0.7rem', color: '#1976d2' }}>{raw}</span>;
                        })()}
                      </td>
                      <td style={styles.td}>
                        {status === 'Requested' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.info,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            🔄 Requested
                          </span>
                        )}
                        {status === 'Approved' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.success,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ✅ Approved
                          </span>
                        )}
                        {status === 'Rejected' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.danger,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ❌ Rejected
                          </span>
                        )}
                        {status === 'Pending' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.warning,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {/* If requirement is Checklist, show checklist UI */}
                        {(status === 'Pending' || status === 'Rejected') && reqObj.type === 'Checklist' ? (
                          <div>
                            {reqObj.checklist && reqObj.checklist.length > 0 ? (
                              reqObj.checklist.map((item, idx) => (
                                <label key={idx} style={styles.checklistItem}>
                                  <input
                                    type="checkbox"
                                    checked={submittedChecklists[subject.subject_id]?.[idx] || false}
                                    onChange={e => {
                                      e.stopPropagation();
                                      const newChecklist = [...(submittedChecklists[subject.subject_id] || [])];
                                      newChecklist[idx] = e.target.checked;
                                      setSubmittedChecklists(prev => ({ ...prev, [subject.subject_id]: newChecklist }));
                                    }}
                                    onFocus={e => e.stopPropagation()}
                                    onBlur={e => e.stopPropagation()}
                                    style={{ marginRight: 8 }}
                                  />
                                  <span style={{ fontSize: '0.8rem', color: '#333' }}>{item}</span>
                                </label>
                              ))
                            ) : (
                              <div style={{ 
                                fontStyle: 'italic', 
                                color: '#666',
                                padding: 8,
                                background: '#fff3e0',
                                borderRadius: 6,
                                border: '1px solid #ffcc02',
                                fontSize: '0.8rem'
                              }}>
                                💡 No checklist items available. Please contact your teacher.
                              </div>
                            )}
                          </div>
                        ) : (status === 'Pending' || status === 'Rejected') && reqObj.type === 'Link' ? (
                          <>
                            <input
                              type="url"
                              style={styles.input}
                              value={submittedLinks[subject.subject_id] || ''}
                              placeholder="Paste your link here..."
                              onChange={e => {
                                e.stopPropagation();
                                setSubmittedLinks(prev => ({ ...prev, [subject.subject_id]: e.target.value }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                              onKeyDown={e => e.stopPropagation()}
                              onKeyUp={e => e.stopPropagation()}
                            />
                            {studentLink && (
                              <div style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
                                <b>Submitted:</b> <a href={studentLink} target="_blank" rel="noopener noreferrer">{studentLink}</a>
                              </div>
                            )}
                          </>
                        ) : (status === 'Pending' || status === 'Rejected') && (reqObj.type === 'File' || reqObj.type === 'Text') ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              multiple
                              onChange={e => {
                                e.stopPropagation();
                                const fileArr = Array.from(e.target.files);
                                setFiles(prev => ({ ...prev, [subject.subject_id]: fileArr }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                            />
                            {files[subject.subject_id] && files[subject.subject_id].length > 0 && (
                              <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontSize: 12 }}>
                                {files[subject.subject_id].map((file, idx) => (
                                  <li key={idx}>{file.name}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (status !== 'Pending' && status !== 'Rejected') ? <span>-</span> : null}
                        {/* Show submitted link or checklist for Requested/Approved */}
                        {(status === 'Requested' || status === 'Approved') && (() => {
                          if (reqObj.type === 'Checklist' && studentChecklist.length) {
                            return (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12 }}>
                                {(reqObj.checklist || []).map((item, idx) => (
                                  <li key={idx}>
                                    <span style={{ color: studentChecklist[idx] ? '#43a047' : '#e11d48', fontWeight: 600 }}>
                                      {studentChecklist[idx] ? '✔️' : '❌'}
                                    </span> {item}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          if (reqObj.type === 'Link' && studentLink) {
                            return (
                              <a href={studentLink} target="_blank" rel="noopener noreferrer">View Submitted Link</a>
                            );
                          }
                          if (reqObj.type === 'File' && statusObj && (statusObj.file_paths?.length || statusObj.file_path)) {
                            const fileList = statusObj.file_paths && statusObj.file_paths.length
                              ? statusObj.file_paths
                              : (statusObj.file_path ? [statusObj.file_path] : []);
                            return (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {fileList.map((fp, i) => (
                                  <li key={i}>
                                    <a
                                      href={`http://localhost:5000/api/student-subject-status/file/${subject.subject_id}?file=${encodeURIComponent(fp)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View Uploaded File {fileList.length > 1 ? i + 1 : ''}
                                    </a>
                                  </li>
                                ))}
                              </ul>
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
                              (reqObj.type === 'File' && (!files[subject.subject_id] || files[subject.subject_id].length === 0)) ||
                              (reqObj.type === 'Link' && (!submittedLinks[subject.subject_id] || !/^https?:\/\//.test(submittedLinks[subject.subject_id]))) ||
                              (reqObj.type === 'Checklist' && !(submittedChecklists[subject.subject_id] && submittedChecklists[subject.subject_id].some(Boolean)))
                            }
                            onClick={async () => {
                              if (reqObj.type === 'Link') {
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: true }));
                                try {
                                  const resp = await axios.post('http://localhost:5000/api/student-subject-status/request', {
                                    student_id: user.student_id,
                                    subject_id: subject.subject_id,
                                    semester: selectedSemester,
                                    link: submittedLinks[subject.subject_id]
                                  });
                                  const record = resp?.data?.record;
                                  setSubjectStatuses(prev =>
                                    prev.map(s =>
                                      s.subject_id === subject.subject_id
                                        ? { ...s, status: 'Requested', link: record?.link || submittedLinks[subject.subject_id] || '' }
                                        : s
                                    ).concat(
                                      prev.some(s => s.subject_id === subject.subject_id)
                                        ? []
                                        : [{ subject_id: subject.subject_id, status: 'Requested', link: record?.link || submittedLinks[subject.subject_id] || '' }]
                                    )
                                  );
                                  setSubmittedLinks(prev => ({ ...prev, [subject.subject_id]: '' }));
                                } catch (err) {
                                  console.error('Error requesting approval:', err);
                                  setError('Failed to request approval.');
                                }
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: false }));
                              } else if (reqObj.type === 'Checklist') {
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: true }));
                                try {
                                  await axios.post('http://localhost:5000/api/student-subject-status/request', {
                                    student_id: user.student_id,
                                    subject_id: subject.subject_id,
                                    semester: selectedSemester,
                                    checklist: submittedChecklists[subject.subject_id]
                                  });
                                  setSubjectStatuses(prev =>
                                    prev.map(s =>
                                      s.subject_id === subject.subject_id
                                        ? { ...s, status: 'Requested', checklist: submittedChecklists[subject.subject_id] }
                                        : s
                                    ).concat(
                                      prev.some(s => s.subject_id === subject.subject_id)
                                        ? []
                                        : [{ subject_id: subject.subject_id, status: 'Requested', checklist: submittedChecklists[subject.subject_id] }]
                                    )
                                  );
                                  setSubmittedChecklists(prev => ({ ...prev, [subject.subject_id]: [] }));
                                } catch (err) {
                                  console.error('Error requesting approval:', err);
                                  setError('Failed to request approval.');
                                }
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: false }));
                              } else {
                                requestApproval(subject.subject_id);
                              }
                            }}
                          >
                            {requesting[subject.subject_id] ? 'Requesting...' : 'Request Approval'}
                          </button>
                        )}
                        {status === 'Requested' && (
                          <span style={{ 
                            color: '#0277bd', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ⏳ Waiting for Teacher
                          </span>
                        )}
                        {status === 'Approved' && (
                          <span style={{ 
                            color: '#43a047', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ✅ Approved
                          </span>
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

          {/* Instruction Modal */}
          {instructionModal && (
            <div
              onClick={(e)=>{ if(e.target===e.currentTarget) setInstructionModal(null); }}
              style={{
                position:'fixed', top:0,left:0,width:'100vw',height:'100vh',
                background:'rgba(0,0,0,0.55)', display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:10000, backdropFilter:'blur(4px)'
              }}
            >
              <div style={{ background:'#ffffff', borderRadius:18, padding:0, width:'92%', maxWidth:620, boxShadow:'0 18px 50px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', maxHeight:'80vh' }}>
                {/* Header */}
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #e1f5fe', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,#0277bd 0%, #01579b 100%)' }}>
                  <div style={{ fontSize:'1.6rem' }}>📋</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ margin:0, color:'#fff', fontSize:'1.05rem', fontWeight:700 }}>{instructionModal.name}</h4>
                    <div style={{ fontSize:'0.65rem', color:'#e1f5fe', letterSpacing:'0.5px', textTransform:'uppercase', fontWeight:600 }}>
                      {instructionModal.type} Requirement
                    </div>
                  </div>
                  <button
                    onClick={()=>setInstructionModal(null)}
                    style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'0.7rem', fontWeight:600 }}
                  >Close ✕</button>
                </div>
                {/* Content */}
                <div style={{ padding:'18px 22px', overflowY:'auto', lineHeight:1.55 }}>
                  <div style={{
                    fontSize:'0.8rem', background:'#f8fafc', border:'1px solid #e1f5fe', borderRadius:10,
                    padding:'14px 16px', color:'#0d47a1', whiteSpace:'pre-wrap'
                  }}>
                    {instructionModal.instructions}
                  </div>
                </div>
                {/* Footer */}
                <div style={{ padding:'10px 16px', borderTop:'1px solid #e1f5fe', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                  <span style={{ fontSize:'0.6rem', color:'#607d8b' }}>Scroll vertically to read full instructions</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(instructionModal.instructions); }}
                      style={{ ...buttonStyles.secondary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Copy</button>
                    <button
                      onClick={()=>setInstructionModal(null)}
                      style={{ ...buttonStyles.primary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Done</button>
                  </div>
                </div>
              </div>
            </div>
          )}




          {/* Departments Table */}
          <h3 style={{ 
            color: '#0277bd', 
            fontSize: '1.2rem',
            fontWeight: 700,
            marginTop: 30,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🏢 Departments
          </h3>
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
                        {deptStatus === 'Requested' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.info,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            🔄 Requested
                          </span>
                        )}
                        {deptStatus === 'Approved' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.success,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ✅ Approved
                          </span>
                        )}
                        {deptStatus === 'Rejected' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.danger,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ❌ Rejected
                          </span>
                        )}
                        {deptStatus === 'Pending' && (
                          <span style={{ 
                            color: '#fff', 
                            background: gradients.warning,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && requirements !== '-' ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              onChange={e => {
                                e.stopPropagation();
                                const fileArr = Array.from(e.target.files);
                                setDeptFiles(prev => ({ ...prev, [dept.department_id]: fileArr }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                            />
                            {deptFiles[dept.department_id] && deptFiles[dept.department_id].length > 0 && (
                              <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontSize: 12 }}>
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
                        {deptStatus === 'Requested' && (
                          <span style={{ 
                            color: '#0277bd', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ⏳ Waiting for Department
                          </span>
                        )}
                        {deptStatus === 'Approved' && (
                          <span style={{ 
                            color: '#43a047', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ✅ Approved
                          </span>
                        )}
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
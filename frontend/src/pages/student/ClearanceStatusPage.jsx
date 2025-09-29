import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { 
  gradients, 
  buttonStyles, 
  fadeInUp, 
  keyframes,
  typeScale
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
    padding: '18px 16px',
    margin: '0 auto',
    background: gradients.light,
    borderRadius: 16,
    boxShadow: '0 6px 18px rgba(2,119,189,0.08)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    maxWidth: '1400px',
    ...fadeInUp
  },
  heading: {
    color: '#0277bd',
    fontWeight: 700,
    fontSize: typeScale.xxl,
    marginBottom: 10,
    letterSpacing: '.5px',
    textAlign: 'center'
  },
  statusBox: {
    marginBottom: 14,
    background: gradients.card,
    borderRadius: 10,
    padding: '10px 12px',
    boxShadow: '0 3px 10px rgba(2,119,189,0.06)',
    fontSize: typeScale.xl,
    color: '#2563eb',
    border: '1px solid #e1f5fe'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(2,119,189,0.06)',
    marginTop: 14,
    border: '1px solid #e1f5fe'
  },
  th: {
    background: gradients.primary,
    color: '#fff',
    border: 'none',
    padding: '6px 8px',
    fontWeight: 600,
    textAlign: 'left',
    fontSize: typeScale.lg,
    letterSpacing: '.3px'
  },
  td: {
    border: '1px solid #f0f0f0',
    padding: '6px 8px',
    color: '#333',
    verticalAlign: 'top',
    fontSize: typeScale.base
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
    padding: '4px 10px',
    fontSize: typeScale.base,
    borderRadius: 6,
    marginRight: 4,
    boxShadow: '0 3px 8px rgba(2,119,189,0.18)'
  },
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 600,
    color: '#0277bd',
    fontSize: typeScale.xl
  },
  input: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '2px solid #e1f5fe',
    width: '100%',
    maxWidth: 220,
    fontSize: typeScale.lg,
    color: '#333',
    background: '#f8fafc',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4,
    padding: '4px 6px',
    borderRadius: 6,
    background: '#f8fafc',
    border: '1px solid #e1f5fe'
  },
  instructionBox: {
    fontSize: typeScale.xs,
    marginTop: 4,
    padding: '6px 8px',
    background: '#e3f2fd',
    borderRadius: 6,
    color: '#1976d2',
    border: '1px solid #bbdefb'
  }
};

const semesters = ['1st', '2nd'];


const ClearanceStatusPage = ({ onStatusChange, onStatusesUpdate }) => {
  // Track checklist submissions per subject
  const [submittedChecklists, setSubmittedChecklists] = useState({});
  // Track submitted link per subject (for Link requirements)
  const [submittedLinks, setSubmittedLinks] = useState({});
  const { user, userType } = useContext(AuthContext);
  const [clearance, setClearance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectStatuses, setSubjectStatuses] = useState([]);
  // Loading state removed (no longer showing loader)
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState({}); // { [subject_id]: boolean }
  // Removed requirements state
  const [files, setFiles] = useState({}); // { [subject_id]: File[] | [] }
  // Default semester auto-selected so user can request without manual selection
  const [selectedSemester, setSelectedSemester] = useState('1st');
  const [departments, setDepartments] = useState([]);
  const [instructionModal, setInstructionModal] = useState(null); // { subjectId, name, type, instructions }
  const [remarksModal, setRemarksModal] = useState(null); // { subjectId, name, remarks }

  // Department file upload state and request (moved inside component)
  const [deptFiles, setDeptFiles] = useState({}); // { [department_id]: File[] }
  const [deptRequesting, setDeptRequesting] = useState({}); // { [department_id]: boolean }
  const [departmentStatuses, setDepartmentStatuses] = useState([]); // [{ department_id, status, file_path, remarks }]
  const [deptLinks, setDeptLinks] = useState({}); // { [department_id]: string }
  const [deptChecklists, setDeptChecklists] = useState({}); // { [department_id]: boolean[] }

  // ---- Helpers: Subject Status Upsert & Dedup (prevents duplicate counting) ----
  const upsertSubjectStatus = React.useCallback((prev, newEntry) => {
    const map = new Map();
    // Build map from existing (last one wins) to keep latest data
    prev.forEach(s => {
      map.set(s.subject_id, s);
    });
    const existing = map.get(newEntry.subject_id) || {};
    // Preserve semester explicitly (newEntry.semester preferred)
    map.set(newEntry.subject_id, { ...existing, ...newEntry, semester: newEntry.semester || existing.semester || selectedSemester || '1st' });
    return Array.from(map.values());
  }, [selectedSemester]);

  // One-time dedupe after initial load of subject statuses (in case historical duplicates exist)
  useEffect(() => {
    setSubjectStatuses(prev => {
      const seen = new Set();
      const cleaned = [];
      for (const s of prev) {
        if (!seen.has(s.subject_id)) {
          seen.add(s.subject_id);
          cleaned.push(s);
        }
      }
      return cleaned;
    });
  }, [selectedSemester]);

  // Fetch department statuses
  useEffect(() => {
    if (!user || userType !== 'user' || !selectedSemester) return;
    axios.get(`http://localhost:5000/api/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`)
      .then(res => {
        setDepartmentStatuses(res.data.statuses || []);
      })
      .catch(() => setDepartmentStatuses([]));
  }, [user, userType, selectedSemester, onStatusesUpdate]);

  // Helper to get department status
  const getDeptStatus = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found ? found.status : 'Pending';
  };
  const getDeptRemarks = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found && found.remarks ? found.remarks : null;
  };
  const getDeptFile = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found && found.file_path ? found.file_path : null;
  };

  // Request approval for a department
  const requestDeptApproval = async (departmentId) => {
    if (!window.confirm('Are you sure you want to request approval for this department?')) return;
    setDeptRequesting(prev => ({ ...prev, [departmentId]: true }));
    try {
      const deptObj = departments.find(d => d.department_id === departmentId);
      const reqRaw = deptObj && deptObj.requirements ? deptObj.requirements : '';
  let parsed = null; try { parsed = JSON.parse(reqRaw); } catch { /* ignore parse error */ }
      const type = parsed?.type || 'Text';
      const effectiveSemester = selectedSemester || '1st';
      if (type === 'Link') {
        const linkVal = deptLinks[departmentId];
        if (!linkVal || !/^https?:\/\//.test(linkVal)) {
          alert('Enter a valid link (http/https) for this department requirement.');
          setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
          return;
        }
        await axios.post('http://localhost:5000/api/department-status/request', {
          student_id: user.student_id,
          department_id: departmentId,
            semester: effectiveSemester,
            requirements: reqRaw,
            link: linkVal
        });
        setDeptLinks(prev => ({ ...prev, [departmentId]: '' }));
      } else if (type === 'Checklist') {
        const checklistVals = deptChecklists[departmentId];
        if (!checklistVals || !checklistVals.some(Boolean)) {
          alert('Check at least one checklist item before requesting.');
          setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
          return;
        }
        await axios.post('http://localhost:5000/api/department-status/request', {
          student_id: user.student_id,
          department_id: departmentId,
          semester: effectiveSemester,
          requirements: reqRaw,
          checklist: checklistVals
        });
        setDeptChecklists(prev => ({ ...prev, [departmentId]: [] }));
      } else { // File/Text/Other treat as multipart with file
        const formData = new FormData();
        formData.append('student_id', user.student_id);
        formData.append('department_id', departmentId);
        formData.append('semester', effectiveSemester);
        formData.append('requirements', reqRaw);
        if (deptFiles[departmentId] && deptFiles[departmentId].length > 0) {
          formData.append('file', deptFiles[departmentId][0]);
        }
        await axios.post('http://localhost:5000/api/department-status/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setDeptFiles(prev => ({ ...prev, [departmentId]: null }));
      }
      // Refresh statuses
      const res = await axios.get(`http://localhost:5000/api/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`);
      setDepartmentStatuses(res.data.statuses || []);
      onStatusChange && onStatusChange();
    } catch (e) {
      console.error(e);
      setError('Failed to request department approval.');
    }
    setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
  };

  // Fetch clearance, subjects, and subject statuses
  useEffect(() => {
    if (!user || userType !== 'user') return;
    const effectiveSemester = selectedSemester || '1st';
  // loading removed
    Promise.all([
      axios.get(`http://localhost:5000/api/clearance/status?student_id=${user.student_id}&semester=${effectiveSemester}`),
      axios.get(`http://localhost:5000/api/student-subject-status/requested-statuses?student_id=${user.student_id}&semester=${effectiveSemester}`),
      axios.get('http://localhost:5000/api/departments')
    ])
      .then(([clearanceRes, statusRes, deptRes]) => {
        if (!clearanceRes.data.clearance) {
          // No clearance created for this semester: clear lists and show instruction message
          setClearance(null);
            setSubjects([]);
            setSubjectStatuses([]);
            setDepartments([]);
            setError('You have not created a clearance for this semester yet. Please create a clearance first to manage subjects and department requirements.');
        } else {
          setClearance(clearanceRes.data.clearance);
          setSubjects(clearanceRes.data.subjects);
          setSubjectStatuses(statusRes.data.statuses || []);
          setDepartments(deptRes.data || []);
          setError('');
          onStatusesUpdate && onStatusesUpdate({ subjects: clearanceRes.data.subjects, statuses: statusRes.data.statuses || [] });
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setClearance(null);
          setSubjects([]);
          setSubjectStatuses([]);
          setDepartments([]);
          setError('You have not created a clearance for this semester yet. Please create a clearance first to manage subjects and department requirements.');
        } else {
          setError('Failed to load clearance, subject statuses, or departments.');
        }
      })
  .finally(() => {/* loading removed */});
  }, [user, userType, selectedSemester, onStatusesUpdate]);

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
      // Allow requesting even if user did not manually select a semester.
      // Fallback order: user selection -> subject's own semester -> '1st'
      const subjectObj = subjects.find(s => s.subject_id === subjectId);
      const effectiveSemester = selectedSemester || (subjectObj && subjectObj.semester) || '1st';
      formData.append('semester', effectiveSemester);
      // No requirements field
      if (files[subjectId] && files[subjectId].length > 0) {
        files[subjectId].forEach((file) => {
          formData.append('files', file); // backend should accept array under 'files'
        });
      }
      await axios.post('http://localhost:5000/api/student-subject-status/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Upsert status locally (no duplicates)
      setSubjectStatuses(prev => {
        const updated = upsertSubjectStatus(prev, { subject_id: subjectId, status: 'Requested', semester: effectiveSemester });
        onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
        // Dispatch global event for dashboards/analytics listeners
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subjectId, status: 'Requested', semester: effectiveSemester } }));
        }
        return updated;
      });
  onStatusChange && onStatusChange();
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

  // --- Polling: keep subject statuses fresh after teacher approves/rejects ---
  // Without this, the student would continue to see 'Requested' (or 'Pending' if initial fetch missed)
  // until a manual page refresh. Poll gently (every 15s) when a clearance exists.
  React.useEffect(() => {
    if (!user || userType !== 'user' || !clearance) return; // only when clearance present
    let cancelled = false;
    const interval = setInterval(() => {
      const effectiveSemester = selectedSemester || '1st';
      axios.get(`http://localhost:5000/api/student-subject-status/requested-statuses?student_id=${user.student_id}&semester=${effectiveSemester}`)
        .then(res => {
          if (cancelled) return;
            const incoming = (res.data.statuses || []).map(s => ({ ...s, semester: s.semester || effectiveSemester }));
            // Merge with existing using latest status per subject_id
            const map = new Map();
            subjectStatuses.forEach(s => map.set(s.subject_id, s));
            let changed = false;
            incoming.forEach(s => {
              const prev = map.get(s.subject_id);
              if (!prev || prev.status !== s.status) {
                changed = true;
              }
              map.set(s.subject_id, { ...prev, ...s, semester: s.semester || prev?.semester || effectiveSemester });
            });
            if (changed) {
              const updated = Array.from(map.values());
              setSubjectStatuses(updated);
              onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { refresh: true, semester: effectiveSemester } }));
              }
            }
        })
        .catch(() => { /* silent */ });
    }, 15000); // 15s gentle polling
    return () => { cancelled = true; clearInterval(interval); };
  }, [user, userType, clearance, selectedSemester, subjectStatuses, subjects, onStatusesUpdate]);

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can view clearance status.</div>;
  }

  // Derive helper flags
  // (Removed unused derived flag needToRequest)

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 My Clearance Status</h2>
      <div style={{ marginBottom: 18 }}>
        <label style={styles.label}>Semester (optional)</label>
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
          <option value="">(Auto) Default: 1st</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>
  {/* Loading text removed to prevent persistent display */}
      {error && !clearance && (
        <div style={styles.error}>
          {error}
          { /No clearance for this semester/i.test(error) && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              👉 You have not created a clearance for this semester yet. Go to the Clearance creation page to start.
            </div>
          )}
        </div>
      )}
      {clearance && (
        <div style={styles.statusBox}>
          <strong>Status:</strong> <span style={{
            color: clearance.status === 'Approved' ? '#43a047' : clearance.status === 'Rejected' ? '#e11d48' : clearance.status === 'Requested' ? '#0277bd' : '#f59e42',
            fontWeight: 700
          }}>{clearance.status}</span>
        </div>
      )}
      {/* If no clearance for selected semester, show instruction and hide subjects/departments */}
      {!clearance && (
        <div style={{
          background: '#fff3e0',
          border: '1px solid #ffcc80',
          padding: '18px 20px',
          borderRadius: 14,
          marginTop: 10,
          color: '#bf6516',
          fontWeight: 600,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '1rem', marginBottom: 6 }}>⚠️ Clearance Not Created</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5 }}>
            You haven't created a clearance for the {selectedSemester || '1st'} semester yet.<br/>
            Go to the clearance creation page and create one first. Once created, your subjects and department requirements will be shown here.
          </div>
        </div>
      )}
      {clearance && (
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
                  <th style={styles.th}>Remarks</th>
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
                        {(() => {
                          const statusObjLocal = subjectStatuses.find(s => s.subject_id === subject.subject_id);
                          if (status === 'Rejected' && statusObjLocal?.remarks) {
                            return (
                              <button
                                style={{ ...buttonStyles.danger, padding:'6px 10px', fontSize:'0.6rem', borderRadius:6 }}
                                onClick={() => setRemarksModal({ subjectId: subject.subject_id, name: subject.name, remarks: statusObjLocal.remarks })}
                              >
                                View Remarks
                              </button>
                            );
                          }
                          if (status === 'Approved') {
                            return <span style={{ fontSize:'0.6rem', color:'#2e7d32', fontStyle:'italic' }}>No remarks</span>;
                          }
                          return <span style={{ fontSize:'0.6rem', color:'#9ca3af' }}>-</span>;
                        })()}
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
                                  setSubjectStatuses(prev => {
                                    const updated = upsertSubjectStatus(prev, {
                                      subject_id: subject.subject_id,
                                      status: 'Requested',
                                      link: record?.link || submittedLinks[subject.subject_id] || ''
                                    });
                                    onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
                                    if (typeof window !== 'undefined') {
                                      window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subject.subject_id, status: 'Requested' } }));
                                    }
                                    return updated;
                                  });
                                  setSubmittedLinks(prev => ({ ...prev, [subject.subject_id]: '' }));
                                  onStatusChange && onStatusChange();
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
                                  setSubjectStatuses(prev => {
                                    const updated = upsertSubjectStatus(prev, {
                                      subject_id: subject.subject_id,
                                      status: 'Requested',
                                      checklist: submittedChecklists[subject.subject_id]
                                    });
                                    onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
                                    if (typeof window !== 'undefined') {
                                      window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subject.subject_id, status: 'Requested' } }));
                                    }
                                    return updated;
                                  });
                                  setSubmittedChecklists(prev => ({ ...prev, [subject.subject_id]: [] }));
                                  onStatusChange && onStatusChange();
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

          {/* Remarks Modal (Teacher or Department) */}
          {remarksModal && (
            <div
              onClick={(e)=>{ if(e.target===e.currentTarget) setRemarksModal(null); }}
              style={{
                position:'fixed', top:0,left:0,width:'100vw',height:'100vh',
                background:'rgba(0,0,0,0.55)', display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:10001, backdropFilter:'blur(4px)'
              }}
            >
              <div style={{ background:'#ffffff', borderRadius:18, padding:0, width:'92%', maxWidth:520, boxShadow:'0 18px 50px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', maxHeight:'75vh' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #e1f5fe', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,#b71c1c 0%, #880e4f 100%)' }}>
                  <div style={{ fontSize:'1.4rem' }}>📝</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ margin:0, color:'#fff', fontSize:'1rem', fontWeight:700 }}>
                      {remarksModal.type === 'department' ? 'Department Remarks' : 'Teacher Remarks'}
                    </h4>
                    <div style={{ fontSize:'0.6rem', color:'#ffebee', letterSpacing:'0.5px', textTransform:'uppercase', fontWeight:600 }}>
                      {remarksModal.name}
                    </div>
                  </div>
                  <button
                    onClick={()=>setRemarksModal(null)}
                    style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'0.65rem', fontWeight:600 }}
                  >Close ✕</button>
                </div>
                <div style={{ padding:'18px 22px', overflowY:'auto' }}>
                  <div style={{
                    fontSize:'0.75rem', background:'#fff8f8', border:'1px solid #ffcdd2', borderRadius:10,
                    padding:'14px 16px', color:'#b71c1c', whiteSpace:'pre-wrap', lineHeight:1.5
                  }}>
                    {remarksModal.remarks}
                  </div>
                </div>
                <div style={{ padding:'10px 16px', borderTop:'1px solid #e1f5fe', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                  <span style={{ fontSize:'0.6rem', color:'#607d8b' }}>
                    {remarksModal.type === 'department' ? 'These remarks were written by department staff.' : 'These remarks were written by your teacher.'}
                  </span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(remarksModal.remarks || ''); }}
                      style={{ ...buttonStyles.secondary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Copy</button>
                    <button
                      onClick={()=>setRemarksModal(null)}
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
                  <th style={styles.th}>Requirement Type</th>
                  <th style={styles.th}>Instructions</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Submission</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => {
                  const deptStatus = getDeptStatus(dept.department_id);
                  const uploadedFile = getDeptFile(dept.department_id);
                  const deptRemarks = getDeptRemarks(dept.department_id);
                  let staffName = '-';
                  if (dept.staff && (dept.staff.firstname || dept.staff.lastname)) {
                    staffName = `${dept.staff.firstname || ''} ${dept.staff.lastname || ''}`.trim();
                  }
                  // Parse structured requirements similar to subjects
                  let deptReqObj = { type: 'Text', instructions: '', checklist: [] };
                  if (dept.requirements && dept.requirements.trim() !== '') {
                    try {
                      deptReqObj = JSON.parse(dept.requirements);
                      if (!deptReqObj.instructions) {
                        deptReqObj.instructions = deptReqObj.value || '';
                      }
                      if (!deptReqObj.type) deptReqObj.type = 'Text';
                    } catch {
                      // legacy plain text stored
                      deptReqObj = { type: 'Text', instructions: dept.requirements, checklist: [] };
                    }
                  }
                  return (
                    <tr key={dept.department_id || idx}>
                      <td style={styles.td}>{dept.name}</td>
                      <td style={styles.td}>{staffName}</td>
                      {/* Requirement Type */}
                      <td style={styles.td}>
                        {(() => {
                          const type = deptReqObj.type || 'Text';
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
                      {/* Instructions (with modal trigger if long) */}
                      <td style={styles.td}>
                        {(() => {
                          const raw = (deptReqObj.instructions || '').trim();
                          if (!raw) {
                            return <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#666' }}>No instructions</span>;
                          }
                          const LONG_THRESHOLD = 70;
                          if (raw.length > LONG_THRESHOLD) {
                            return (
                              <button
                                style={{ ...buttonStyles.secondary, padding: '6px 10px', fontSize: '0.6rem', borderRadius: 6, lineHeight: 1.2 }}
                                onClick={() => setInstructionModal({ departmentId: dept.department_id, name: dept.name, type: deptReqObj.type, instructions: raw })}
                              >
                                View Instructions ({raw.length} chars)
                              </button>
                            );
                          }
                          return <span style={{ fontSize: '0.7rem', color: '#1976d2' }}>{raw}</span>;
                        })()}
                      </td>
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
                        {deptStatus === 'Rejected' && deptRemarks ? (
                          <button
                            style={{ ...styles.button, padding: '4px 8px', fontSize: '0.65rem' }}
                            onClick={() => setRemarksModal({
                              type: 'department',
                              name: dept.name,
                              remarks: deptRemarks
                            })}
                          >View</button>
                        ) : <span>-</span>}
                      </td>
                      <td style={styles.td}>
                        {/* Submission cell adapts based on requirement type (display only for now) */}
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && (deptReqObj.type === 'File' || deptReqObj.type === 'Text' || deptReqObj.type === 'Other') ? (
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
                        ) : (deptStatus === 'Pending' || deptStatus === 'Rejected') && deptReqObj.type === 'Link' ? (
                          <div>
                            <input
                              type="url"
                              placeholder="Paste link (http/https)..."
                              value={deptLinks[dept.department_id] || ''}
                              onChange={e => setDeptLinks(prev => ({ ...prev, [dept.department_id]: e.target.value }))}
                              style={styles.input}
                            />
                            {departmentStatuses.find(s => s.department_id === dept.department_id)?.link && (
                              <div style={{ fontSize:'0.6rem', marginTop:4 }}>
                                <strong>Submitted:</strong> <a href={departmentStatuses.find(s => s.department_id === dept.department_id)?.link} target="_blank" rel="noopener noreferrer">View Link</a>
                              </div>
                            )}
                          </div>
                        ) : (deptStatus === 'Pending' || deptStatus === 'Rejected') && deptReqObj.type === 'Checklist' ? (
                          <div>
                            {(deptReqObj.checklist && deptReqObj.checklist.length > 0) ? (
                              (deptReqObj.checklist).map((item, cIdx) => (
                                <label key={cIdx} style={styles.checklistItem}>
                                  <input
                                    type="checkbox"
                                    checked={deptChecklists[dept.department_id]?.[cIdx] || false}
                                    onChange={e => {
                                      const list = [...(deptChecklists[dept.department_id] || [])];
                                      list[cIdx] = e.target.checked;
                                      setDeptChecklists(prev => ({ ...prev, [dept.department_id]: list }));
                                    }}
                                    style={{ marginRight:6 }}
                                  />
                                  <span style={{ fontSize:'0.65rem' }}>{item}</span>
                                </label>
                              ))
                            ) : (
                              <div style={{ fontSize:'0.6rem', fontStyle:'italic', color:'#666' }}>No checklist items defined.</div>
                            )}
                          </div>
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
                              ((deptReqObj.type === 'File' || deptReqObj.type === 'Text' || deptReqObj.type === 'Other') && (!deptFiles[dept.department_id] || deptFiles[dept.department_id].length === 0)) ||
                              (deptReqObj.type === 'Link' && (!deptLinks[dept.department_id] || !/^https?:\/\//.test(deptLinks[dept.department_id]))) ||
                              (deptReqObj.type === 'Checklist' && !(deptChecklists[dept.department_id] && deptChecklists[dept.department_id].some(Boolean)))
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
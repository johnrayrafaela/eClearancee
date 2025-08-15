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
   label: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '1.5rem',
    marginBottom: 0,
    letterSpacing: '1px',
    textAlign: 'center'
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
  input: {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    width: '100%',
    fontSize: 15,
    color: '#333',
    minHeight: 40,
    resize: 'vertical'
  },
  button: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    background: '#0277bd',
    color: '#fff',
    transition: 'background 0.2s',
    marginLeft: 8
  },
  success: {
    color: '#43a047',
    fontWeight: 600,
    marginLeft: 8
  }
};

const TeacherSubjectRequirements = () => {
  const { user, userType } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  // requirements: { [subject_id]: { type, value, checklist: [] } }
  const [requirements, setRequirements] = useState({});
  // For file upload per subject
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('All');
  const [activeSemester, setActiveSemester] = useState('All');
  // Define year levels in order
  const yearLevelOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const yearLevels = ['All', ...yearLevelOrder];
  const semesterOrder = ['1st', '2nd'];
  const semesters = ['All', ...semesterOrder];

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/subject/teacher/${user.teacher_id}`)
      .then(res => {
        setSubjects(res.data);
        // Initialize requirements state
        const reqs = {};
        res.data.forEach(sub => {
          // Try to parse requirements as JSON, fallback to text
          let reqObj = { type: 'Text', value: '' };
          if (sub.requirements) {
            try {
              reqObj = JSON.parse(sub.requirements);
            } catch {
              reqObj = { type: 'Text', value: sub.requirements };
            }
          }
          reqs[sub.subject_id] = reqObj;
        });
        setRequirements(reqs);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleSave = async (subject_id) => {
    setSaving(prev => ({ ...prev, [subject_id]: true }));
    setSuccess(prev => ({ ...prev, [subject_id]: false }));
    try {
      // If file upload, upload file first and get URL
      let reqObj = requirements[subject_id];
      if (reqObj.type === 'File' && files[subject_id] && files[subject_id][0]) {
        const formData = new FormData();
        formData.append('file', files[subject_id][0]);
        // You may need to adjust endpoint for file upload
        const res = await axios.post(`http://localhost:5000/api/subject/${subject_id}/upload-requirement`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        reqObj = { ...reqObj, value: res.data.fileUrl || res.data.filePath };
      }
      await axios.patch(`http://localhost:5000/api/subject/${subject_id}/requirements`, {
        requirements: JSON.stringify(reqObj)
      });
      setSuccess(prev => ({ ...prev, [subject_id]: true }));
      // Update the requirements in the subjects array so UI reflects the change
      setSubjects(prev =>
        prev.map(sub =>
          sub.subject_id === subject_id
            ? { ...sub, requirements: JSON.stringify(reqObj) }
            : sub
        )
      );
      setFiles(prev => ({ ...prev, [subject_id]: null }));
    } catch (err) {
      console.error('Error saving requirements:', err);
      alert('Failed to save requirements.');
    }
    setSaving(prev => ({ ...prev, [subject_id]: false }));
  };

  // Filter subjects by active year level and semester
  let filteredSubjects = subjects;
  if (activeYear !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.year_level === activeYear);
  }
  if (activeSemester !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.semester === activeSemester);
  }

  if (!user || userType !== 'teacher') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only teachers can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📚 My Subjects & Requirements</h2>
      {/* Year Level Tabs */}
      <h2 style={styles.label}>Year Level</h2>
      <div style={{ display: 'flex', gap: 12, margin: '18px 0', justifyContent: 'center' }}>
        {yearLevels.map(year => {
          const hasSubjects = year === 'All' ? true : subjects.some(s => s.year_level === year);
          return (
            <button
              key={year}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                background: activeYear === year ? '#0277bd' : '#e1f5fe',
                color: activeYear === year ? '#fff' : '#0277bd',
                cursor: hasSubjects ? 'pointer' : 'not-allowed',
                opacity: hasSubjects ? 1 : 0.5,
                boxShadow: activeYear === year ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
                transition: 'background 0.2s'
              }}
              onClick={() => hasSubjects && setActiveYear(year)}
              disabled={!hasSubjects}
            >
              {year}
            </button>
          );
        })}
      </div>
      {/* Semester Tabs */}

      <h2 style={styles.label}>Semester</h2>
      <div style={{ display: 'flex', gap: 12, margin: '0 0 18px 0', justifyContent: 'center' }}>
        {semesters.map(sem => {
          const hasSubjects = sem === 'All' ? true : subjects.some(s => (activeYear === 'All' || s.year_level === activeYear) && s.semester === sem);
          return (
            <button
              key={sem}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                background: activeSemester === sem ? '#0277bd' : '#e1f5fe',
                color: activeSemester === sem ? '#fff' : '#0277bd',
                cursor: hasSubjects ? 'pointer' : 'not-allowed',
                opacity: hasSubjects ? 1 : 0.5,
                boxShadow: activeSemester === sem ? '0 2px 8px rgba(2,119,189,0.10)' : 'none',
                transition: 'background 0.2s'
              }}
              onClick={() => hasSubjects && setActiveSemester(sem)}
              disabled={!hasSubjects}
            >
              {sem}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Subject Name</th>
              <th style={styles.th}>Course</th>
              <th style={styles.th}>Year</th>
              <th style={styles.th}>Semester</th>
              <th style={styles.th}>Requirement Type</th>
              <th style={styles.th}>Requirement Value</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map(sub => {
              const reqObj = requirements[sub.subject_id] || { type: 'Text', value: '' };
              return (
                <tr key={sub.subject_id}>
                  <td style={styles.td}>{sub.name}</td>
                  <td style={styles.td}>{sub.course}</td>
                  <td style={styles.td}>{sub.year_level}</td>
                  <td style={styles.td}>{sub.semester}</td>
                  <td style={styles.td}>
                    <select
                      style={{ ...styles.input, maxWidth: 140 }}
                      value={reqObj.type}
                      onChange={e => {
                        const type = e.target.value;
                        setRequirements(prev => ({
                          ...prev,
                          [sub.subject_id]: {
                            type,
                            value: '',
                            checklist: type === 'Checklist' ? [''] : undefined
                          }
                        }));
                        setFiles(prev => ({ ...prev, [sub.subject_id]: null }));
                      }}
                    >
                      <option value="Text">Text</option>
                      <option value="Link">Link</option>
                      <option value="File">File Upload</option>
                      <option value="Checklist">Checklist</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    {/* Show input based on type */}
                    {reqObj.type === 'Text' && (
                      <textarea
                        style={styles.input}
                        value={reqObj.value}
                        placeholder="Enter instructions..."
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          [sub.subject_id]: { ...reqObj, value: e.target.value }
                        }))}
                      />
                    )}
                    {reqObj.type === 'Link' && (
                      <input
                        type="url"
                        style={styles.input}
                        value={reqObj.value}
                        placeholder="Paste link (e.g. Google Form)"
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          [sub.subject_id]: { ...reqObj, value: e.target.value }
                        }))}
                      />
                    )}
                    {reqObj.type === 'File' && (
                      <div>
                        <input
                          type="file"
                          style={styles.input}
                          onChange={e => {
                            const fileArr = Array.from(e.target.files);
                            setFiles(prev => ({ ...prev, [sub.subject_id]: fileArr }));
                            // Save file name as value for display
                            setRequirements(prev => ({
                              ...prev,
                              [sub.subject_id]: { ...reqObj, value: fileArr[0]?.name || '' }
                            }));
                          }}
                        />
                        {files[sub.subject_id] && files[sub.subject_id][0] && (
                          <div style={{ fontSize: 13, marginTop: 6 }}>
                            Selected: {files[sub.subject_id][0].name}
                          </div>
                        )}
                      </div>
                    )}
                    {reqObj.type === 'Checklist' && (
                      <div>
                        {(reqObj.checklist || ['']).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <input
                              type="text"
                              style={{ ...styles.input, maxWidth: 180 }}
                              value={item}
                              placeholder={`Checklist item ${idx + 1}`}
                              onChange={e => {
                                const newList = [...(reqObj.checklist || [])];
                                newList[idx] = e.target.value;
                                setRequirements(prev => ({
                                  ...prev,
                                  [sub.subject_id]: { ...reqObj, checklist: newList }
                                }));
                              }}
                            />
                            <button
                              style={{ ...styles.button, background: '#e11d48', marginLeft: 4 }}
                              onClick={() => {
                                const newList = (reqObj.checklist || []).filter((_, i) => i !== idx);
                                setRequirements(prev => ({
                                  ...prev,
                                  [sub.subject_id]: { ...reqObj, checklist: newList.length ? newList : [''] }
                                }));
                              }}
                              disabled={(reqObj.checklist || []).length === 1}
                            >Remove</button>
                          </div>
                        ))}
                        <button
                          style={{ ...styles.button, marginTop: 4, background: '#43a047' }}
                          onClick={() => {
                            setRequirements(prev => ({
                              ...prev,
                              [sub.subject_id]: {
                                ...reqObj,
                                checklist: [...(reqObj.checklist || []), '']
                              }
                            }));
                          }}
                        >Add Item</button>
                      </div>
                    )}
                    {reqObj.type === 'Other' && (
                      <textarea
                        style={styles.input}
                        value={reqObj.value}
                        placeholder="Describe other requirements..."
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          [sub.subject_id]: { ...reqObj, value: e.target.value }
                        }))}
                      />
                    )}
                    {/* Show current value if exists */}
                    {sub.requirements && (
                      <div style={{ fontSize: 13, marginTop: 6, color: '#666' }}>
                        <b>Current:</b> {(() => {
                          try {
                            const parsed = JSON.parse(sub.requirements);
                            if (parsed.type === 'Checklist') {
                              return parsed.checklist?.filter(Boolean).join(', ');
                            }
                            if (parsed.type === 'File') {
                              return parsed.value ? `File: ${parsed.value}` : '';
                            }
                            if (parsed.type === 'Link') {
                              return parsed.value ? `Link: ${parsed.value}` : '';
                            }
                            return parsed.value;
                          } catch {
                            return sub.requirements;
                          }
                        })()}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.button}
                      disabled={saving[sub.subject_id] ||
                        (reqObj.type === 'File' ? !files[sub.subject_id] || !files[sub.subject_id][0] :
                          reqObj.type === 'Checklist' ? !(reqObj.checklist && reqObj.checklist.some(i => i.trim())) :
                          reqObj.type === 'Link' ? !reqObj.value || !/^https?:\/\//.test(reqObj.value) :
                          !reqObj.value || reqObj.value.trim() === '')
                      }
                      onClick={() => handleSave(sub.subject_id)}
                    >
                      {saving[sub.subject_id] ? 'Saving...' : 'Save'}
                    </button>
                    {success[sub.subject_id] && <span style={styles.success}>Saved!</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherSubjectRequirements;

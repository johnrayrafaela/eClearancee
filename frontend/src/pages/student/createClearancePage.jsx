import React, { useContext, useState, useEffect } from 'react';
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
    // Don't add animation here, use className below
  },
  heading: {
    color: '#0277bd',
    fontWeight: 900,
    fontSize: '2rem',
    marginBottom: 0,
    letterSpacing: '1px',
    textAlign: 'center'
  },
  form: {
    marginBottom: 30,
    background: '#f7fafc',
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
  },
  label: {
    display: 'inline-block',
    width: 100,
    fontWeight: 500,
    color: '#0277bd',
    marginBottom: 6,
  },
  input: {
    border: '1.5px solid #b3e5fc',
    borderRadius: 6,
    padding: '6px 10px',
    marginLeft: 8,
    marginBottom: 10,
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
    padding: '8px 18px',
    borderRadius: 6,
    border: 'none',
    background: '#0277bd',
    color: '#fff',
    fontWeight: 700,
    marginRight: 10,
    cursor: 'pointer',
    fontSize: 16,
    transition: 'background 0.2s'
  },
  buttonDelete: {
    background: '#e57373',
    color: '#fff',
    border: 'none'
  },
  buttonCancel: {
    background: '#b0bec5',
    color: '#263238',
    border: 'none'
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
  status: {
    marginTop: 16,
    padding: 12,
    background: '#e1f5fe',
    borderRadius: 8,
    border: '1px solid #b3e5fc'
  }
};

const semesters = ['1st', '2nd'];

const CreateClearancePage = () => {
  const { user, userType } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [clearance, setClearance] = useState(null);
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editStudent, setEditStudent] = useState({});
  const [clearanceSemesters, setClearanceSemesters] = useState([]);

  // Fetch clearance for selected semester and all clearances
  useEffect(() => {
    if (userType && !user) {
      setLoading(false);
      return;
    }
    if (!user || userType !== 'user') {
      setClearance(null);
      setStudent(null);
      setSubjects([]);
      setCreated(false);
      setShowConfirm(false);
      setLoading(false);
      setClearanceSemesters([]);
      return;
    }
    setLoading(true);
    // Fetch all clearances for the student
    axios.get(`http://localhost:5000/api/clearance/all?student_id=${user.student_id}`)
      .then(res => {
        // res.data should be an array of clearances with semester info
        const semesters = res.data.map(c => c.semester);
        setClearanceSemesters(semesters);
      })
      .catch(() => setClearanceSemesters([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Fetch clearance for selected semester
  useEffect(() => {
    if (userType && !user) {
      setLoading(false);
      return;
    }
    if (!user || userType !== 'user' || !selectedSemester) {
      setClearance(null);
      setStudent(null);
      setSubjects([]);
      setCreated(false);
      setShowConfirm(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`http://localhost:5000/api/clearance/status?student_id=${user.student_id}&semester=${selectedSemester}`)
      .then(res => {
        if (res.data.clearance) {
          setClearance(res.data.clearance);
          setStudent(res.data.student);
          setSubjects(res.data.subjects);
          setCreated(true);
        } else {
          setClearance(null);
          setCreated(false);
        }
      })
      .catch(() => {
        setClearance(null);
        setCreated(false);
      })
      .finally(() => setLoading(false));
  }, [user, userType, selectedSemester]);

  // Step 1: Precheck - fetch subjects for selected semester before confirmation
  const handlePrecheck = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/clearance/precheck?student_id=${user.student_id}&semester=${selectedSemester}`
      );
      setStudent(response.data.student);
      setSubjects(response.data.subjects);
      setShowConfirm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student info.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create clearance for selected semester
  const handleCreateClearance = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/clearance/create', {
        student_id: user.student_id,
        semester: selectedSemester
      });
      setClearance(response.data.clearance);
      setStudent(response.data.student);
      setSubjects(response.data.subjects);
      setCreated(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Delete clearance for selected semester
  const handleDeleteClearance = async () => {
    setLoading(true);
    setDeleteError('');
    try {
      await axios.delete('http://localhost:5000/api/clearance/delete', {
        data: { student_id: user.student_id, password: deletePassword, semester: selectedSemester }
      });
      setCreated(false);
      setClearance(null);
      setStudent(null);
      setSubjects([]);
      setShowConfirm(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete clearance.');
    } finally {
      setLoading(false);
    }
  };

  // When student info loads, sync editStudent
  useEffect(() => {
    if (student) setEditStudent(student);
  }, [student]);

  const handleEditChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/${user.student_id}`, editStudent);
      setStudent(editStudent);
      setEditMode(false);
      setError('');
      // Fetch new subjects based on updated info
      const res = await axios.get(
        `http://localhost:5000/api/clearance/precheck?student_id=${user.student_id}&semester=${selectedSemester}`
      );
      setSubjects(res.data.subjects);
    } catch (err) {
      console.error('Error updating student info:', err);
      setError('Failed to update student info.');
    }
  };

  // Check if both clearances exist
  const hasAllClearances = clearanceSemesters.includes('1st') && clearanceSemesters.includes('2nd');

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can create clearance.</div>;
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .clearance-fadein {
            animation: fadeIn 0.7s ease;
          }
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.95);}
            100% { opacity: 1; transform: scale(1);}
          }
          .success-anim {
            animation: fadeInScale 0.4s;
          }
        `}
      </style>
      <div style={styles.container} className="clearance-fadein">
        <h2 style={styles.heading}>📄 Clearance Request</h2>

        {/* Semester Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Semester:</label>
          <select
            style={styles.input}
            value={selectedSemester}
            onChange={async e => {
              const sem = e.target.value;
              setSelectedSemester(sem);
              setShowConfirm(false);
              setError('');
              setSubjects([]);
              setStudent(null);
              if (sem) {
                setLoading(true);
                try {
                  const response = await axios.get(
                    `http://localhost:5000/api/clearance/precheck?student_id=${user.student_id}&semester=${sem}`
                  );
                  setStudent(response.data.student);
                  setSubjects(response.data.subjects);
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to load student info.');
                } finally {
                  setLoading(false);
                }
              }
            }}
            required
          >
            <option value="">Select Semester</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem} Semester</option>
            ))}
          </select>
        </div>

        {/* Show subjects if semester is selected */}
        {selectedSemester && (
          <div style={styles.form}>
            <h4 style={{ color: '#2563eb' }}>📘 Subjects for {selectedSemester} Semester</h4>
            {loading ? (
              <div>Loading subjects...</div>
            ) : subjects.length > 0 ? (
              <ul>
                {subjects.map(subject => (
                  <li key={subject.subject_id}>{subject.name}</li>
                ))}
              </ul>
            ) : (
              <p>No subjects found.</p>
            )}
          </div>
        )}

        {/* Step 1: Initial Create button */}
        {!clearance && !showConfirm && !created && !hasAllClearances && (
          <div>
            <button
              style={styles.button}
              onClick={handlePrecheck}
              disabled={!selectedSemester || loading}
            >
              {loading ? 'Loading...' : 'Create Clearance'}
            </button>
          </div>
        )}

        {/* If both clearances exist, show info (but hide if a semester is selected) */}
        {hasAllClearances && !selectedSemester && (
          <div style={{ color: '#0288d1', textAlign: 'center', margin: '1.5rem 0', fontWeight: 600 }}>
            ✅ You already have clearances for both 1st and 2nd semesters.<br />
            You can still view your subjects by selecting a semester above.
          </div>
        )}

        {/* Step 2: Show form and table for confirmation */}
        {showConfirm && !created && student && (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Student Info Container */}
            <div style={{
              ...styles.form,
              flex: '1 1 220px',
              minWidth: 220,
              maxWidth: 320,
              marginRight: 0
            }}>
              <h3 style={{ marginBottom: 12, color: '#2563eb' }}>👤 Student Information</h3>
              {editMode ? (
                <>
                  <input
                    style={styles.input}
                    name="firstname"
                    value={editStudent.firstname || ''}
                    onChange={handleEditChange}
                    placeholder="First Name"
                  />
                  <input
                    style={styles.input}
                    name="lastname"
                    value={editStudent.lastname || ''}
                    onChange={handleEditChange}
                    placeholder="Last Name"
                  />
                  <input
                    style={styles.input}
                    name="email"
                    value={editStudent.email || ''}
                    onChange={handleEditChange}
                    placeholder="Email"
                  />
                  <input
                   style={styles.input}
                    name="phone"
                    value={editStudent.phone || ''}
                    onChange={handleEditChange}
                    placeholder="Phone"
                  />
                  <select
                    style={styles.input}
                    name="course"
                    value={editStudent.course || ''}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Course</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BEED">BEED</option>
                    <option value="BSED">BSED</option>
                    <option value="BSHM">BSHM</option>
                    <option value="ENTREP">ENTREP</option>
                  </select>
                  <select
                    style={styles.input}
                    name="year_level"
                    value={editStudent.year_level || ''}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Year Level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  <select
                    style={styles.input}
                    name="block"
                    value={editStudent.block || ''}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Block</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                  <button style={styles.button} onClick={handleSaveStudent}>Save</button>
                  <button style={{ ...styles.button, ...styles.buttonCancel }} onClick={() => setEditMode(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <div>Name: {student.firstname} {student.lastname}</div>
                  <div>Email: {student.email}</div>
                  <div>Phone: {student.phone}</div>
                  <div>Course: {student.course}</div>
                  <div>Year Level: {student.year_level}</div>
                  <div>Block: {student.block}</div>
                  <button style={styles.button} onClick={() => setEditMode(true)}>Edit Info</button>
                </>
              )}
            </div>

            {/* Subjects Table Container */}
            <div style={{
              ...styles.form,
              flex: '2 1 320px',
              minWidth: 260
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, color: '#2563eb' }}>📘 Subjects</h3>
              {subjects.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Subject Name</th>
                      <th style={styles.th}>Subject Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.subject_id}>
                       
                        <td style={styles.td}>{subject.name}</td>
                         <td style={styles.td}>{subject.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No subjects found.</p>
              )}
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCreateClearance}
                  disabled={loading}
                  style={styles.button}
                >
                  {loading ? 'Submitting...' : 'Confirm & Submit'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  style={{ ...styles.button, ...styles.buttonCancel }}
                >
                  Cancel
                </button>
                {/* Show delete button if clearance exists for this semester */}
                {clearance && (
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.buttonDelete, marginLeft: 10, display: 'flex', alignItems: 'center' }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    title="Delete this clearance"
                  >
                    <span style={{ marginRight: 6, fontSize: 18 }}>🗑️</span> Delete Clearance
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 4px 24px #0003',
              minWidth: 320,
              maxWidth: '90vw'
            }}>
              <h4 style={{ marginBottom: 12 }}>Confirm Deletion</h4>
              <p style={{ marginBottom: 12 }}>Please enter your password to confirm clearance deletion.</p>
              <input
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                style={styles.input}
              />
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button
                  style={styles.button}
                  onClick={handleDeleteClearance}
                  disabled={loading || !deletePassword}
                >
                  Confirm Delete
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonCancel }}
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
              {deleteError && <div style={styles.error}>{deleteError}</div>}
            </div>
          </div>
        )}

        {error && <div style={styles.error}>❌ {error}</div>}
      </div>
    </>
  );
};

export default CreateClearancePage;

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
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setClearance(null);
          setCreated(false);
        } else {
          setError('Failed to fetch clearance.');
        }
      })
      .finally(() => setLoading(false));
  }, [user, userType, selectedSemester]);

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

  const handleDeleteClearance = async () => {
    setLoading(true);
    setDeleteError('');
    try {
      await axios.delete('http://localhost:5000/api/clearance/delete', {
        data: {
          student_id: user.student_id,
          password: deletePassword,
          semester: selectedSemester // 🔥 Added to match backend requirement
        }
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

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can create clearance.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📄 Clearance Request</h2>

      {/* Semester Selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Semester:</label>
        <select
          style={styles.input}
          value={selectedSemester}
          onChange={e => {
            setSelectedSemester(e.target.value);
            setShowConfirm(false);
            setError('');
          }}
          required
        >
          <option value="">Select Semester</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>

      {/* Clearance Table */}
      {clearance && student && (
        <div style={styles.form}>
          <h3 style={{ color: '#2563eb' }}>📝 My Clearance</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Year Level</th>
                <th style={styles.th}>Block</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>{student.firstname} {student.lastname}</td>
                <td style={styles.td}>{student.course}</td>
                <td style={styles.td}>{student.year_level}</td>
                <td style={styles.td}>{student.block}</td>
                <td style={styles.td}>{clearance.status}</td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.button, ...styles.buttonDelete }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <h4 style={{ marginTop: 20, color: '#2563eb' }}>📘 Subjects</h4>
          {subjects.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.subject_id}>
                    <td style={styles.td}>{subject.name}</td>
                    <td style={styles.td}>
                      {subject.teacher
                        ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No subjects found.</p>
          )}
        </div>
      )}

      {/* Step 1: Initial Create button */}
      {!clearance && !showConfirm && !created && (
        <div>
          <button
            style={styles.button}
            onClick={handlePrecheck}
            disabled={loading || !selectedSemester}
          >
            {loading ? 'Loading...' : 'Request Clearance'}
          </button>
        </div>
      )}

      {/* Step 2: Show form and table for confirmation */}
      {showConfirm && !created && student && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ ...styles.form, flex: '1 1 220px', minWidth: 220, maxWidth: 320 }}>
            <h3 style={{ marginBottom: 12, color: '#2563eb' }}>👤 Student Information</h3>
            <form>
              <div><label style={styles.label}>Name:</label><input value={`${student.firstname} ${student.lastname}`} readOnly style={styles.input} /></div>
              <div><label style={styles.label}>Course:</label><input value={student.course} readOnly style={styles.input} /></div>
              <div><label style={styles.label}>Year Level:</label><input value={student.year_level} readOnly style={styles.input} /></div>
              <div><label style={styles.label}>Block:</label><input value={student.block} readOnly style={styles.input} /></div>
            </form>
          </div>

          <div style={{ ...styles.form, flex: '2 1 320px', minWidth: 260 }}>
            <h3 style={{ marginBottom: 12, color: '#2563eb' }}>📘 Subjects</h3>
            {subjects.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Subject Name</th>
                    <th style={styles.th}>Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject.subject_id}>
                      <td style={styles.td}>{subject.name}</td>
                      <td style={styles.td}>
                        {subject.teacher
                          ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No subjects found.</p>}
            <div style={{ marginTop: 20 }}>
              <button onClick={handleCreateClearance} disabled={loading} style={styles.button}>
                {loading ? 'Submitting...' : 'Confirm & Submit'}
              </button>
              <button onClick={() => setShowConfirm(false)} disabled={loading} style={{ ...styles.button, ...styles.buttonCancel }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: 32, borderRadius: 12,
            boxShadow: '0 4px 24px #0003', minWidth: 320, maxWidth: '90vw'
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
  );
};

export default CreateClearancePage;

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const TeacherAddSubject = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user, userType } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', semester: '1st', requirements: '', course: '', year_level: '' });
  const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userType === 'teacher' && user) {
      fetchSubjects();
    }
    // eslint-disable-next-line
  }, [user, userType]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/subjects?teacher_id=${user.teacher_id}`);
      setSubjects(res.data || []);
    } catch {
      setSubjects([]);
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await axios.patch(`http://localhost:5000/api/subjects/${editing.subject_id}/teacher-update`, {
          ...form,
          teacher_id: user.teacher_id
        });
        setSuccess('Subject updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/subjects/teacher-add', {
          ...form,
          teacher_id: user.teacher_id
        });
        setSuccess('Subject added successfully!');
      }
      setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' });
      setEditing(null);
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject.');
    }
    setLoading(false);
  };

  if (!user || userType !== 'teacher') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only teachers can add subjects.</div>;
  }

  return (
    <div style={{ margin: '32px auto', padding: 32, background: '#f9fafd', borderRadius: 16, boxShadow: '0 2px 16px rgba(2,119,189,0.10)' }}>
      <h2 style={{ color: '#0277bd', fontWeight: 900, textAlign: 'center', marginBottom: 28, letterSpacing: 1 }}>Add Subject</h2>
      <button style={{ background: '#0277bd', color: '#fff', padding: '10px 32px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 18, marginBottom: 18, boxShadow: '0 1px 4px #0277bd22', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} onClick={() => { setShowModal(true); setEditing(null); setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' }); setError(''); setSuccess(''); }}>
        Add Subject
      </button>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(33,150,243,0.12)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(2,119,189,0.10)', padding: 24, minWidth: 400, maxWidth: 520 }}>
            <h3 style={{ color: '#0277bd', fontWeight: 900, textAlign: 'center', marginBottom: 28, letterSpacing: 1 }}>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
            <form onSubmit={handleSubmit} style={{ marginBottom: 20, background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 8px rgba(2,119,189,0.07)' }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Subject Name:</label>
                <input name="name" value={form.name} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Course:</label>
                <select name="course" value={form.course} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Year Level:</label>
                <select name="year_level" value={form.year_level} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Select Year Level</option>
                  {yearLevels.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Semester:</label>
                <select name="semester" value={form.semester} onChange={handleChange} style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
              <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="submit" style={{ background: '#0277bd', color: '#fff', padding: '10px 28px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8, boxShadow: '0 1px 4px #0277bd22' }} disabled={loading}>
                  {editing ? (loading ? 'Updating...' : 'Update Subject') : (loading ? 'Adding...' : 'Add Subject')}
                </button>
                <button type="button" style={{ marginLeft: 10, background: '#b0bec5', color: '#263238', border: 'none', padding: '10px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16 }} onClick={() => { setShowModal(false); setEditing(null); setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' }); setError(''); setSuccess(''); }}>
                  Cancel
                </button>
              </div>
              {error && <div style={{ color: '#e11d48', marginTop: 14, fontWeight: 600 }}>{error}</div>}
              {success && <div style={{ color: '#43a047', marginTop: 14, fontWeight: 600 }}>{success}</div>}
            </form>
          </div>
        </div>
      )}
      <h3 style={{ color: '#2563eb', marginBottom: 18, fontWeight: 800, textAlign: 'center' }}>My Subjects</h3>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(2,119,189,0.07)' }}>
          <thead>
            <tr>
              <th style={{ background: '#e1f5fe', padding: 10, color: '#0277bd', fontWeight: 800, fontSize: 16 }}>Name</th>
              <th style={{ background: '#e1f5fe', padding: 10, color: '#0277bd', fontWeight: 800, fontSize: 16 }}>Course</th>
              <th style={{ background: '#e1f5fe', padding: 10, color: '#0277bd', fontWeight: 800, fontSize: 16 }}>Year Level</th>
              <th style={{ background: '#e1f5fe', padding: 10, color: '#0277bd', fontWeight: 800, fontSize: 16 }}>Semester</th>
              <th style={{ background: '#e1f5fe', padding: 10, color: '#0277bd', fontWeight: 800, fontSize: 16 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.filter(subj => subj.teacher_id === user.teacher_id).length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No subjects found.</td></tr>
            ) : subjects.filter(subj => subj.teacher_id === user.teacher_id).map(subj => (
              <tr key={subj.subject_id}>
                <td style={{ padding: 10 }}>{subj.name}</td>
                <td style={{ padding: 10 }}>{subj.course}</td>
                <td style={{ padding: 10 }}>{subj.year_level}</td>
                <td style={{ padding: 10 }}>{subj.semester}</td>
                <td style={{ padding: 10 }}>
                  <button style={{ background: '#0288d1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                    onClick={() => {
                      setEditing(subj);
                      setForm({
                        name: subj.name,
                        semester: subj.semester,
                        requirements: subj.requirements || '',
                        course: subj.course,
                        year_level: subj.year_level
                      });
                      setShowModal(true);
                      setError('');
                      setSuccess('');
                    }}>
                    Edit
                  </button>
                  <button style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this subject?')) {
                        setLoading(true);
                        setError('');
                        setSuccess('');
                        try {
                          await axios.delete(`http://localhost:5000/api/subjects/${subj.subject_id}/teacher-delete`, {
                            data: { teacher_id: user.teacher_id }
                          });
                          setSuccess('Subject deleted successfully!');
                          fetchSubjects();
                        } catch (err) {
                          setError(err.response?.data?.message || 'Failed to delete subject.');
                        }
                        setLoading(false);
                      }
                    }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherAddSubject;

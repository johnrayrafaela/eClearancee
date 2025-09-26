import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Animation
const fadeInAnim = {
  animation: 'fadeIn 0.7s',
};
const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
`;

const API_URL = 'http://localhost:5000/api/subjects';

const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const semesters = ['1st', '2nd'];

const SubjectManagement = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    course: '',
    year_level: '',
    semester: '',
    teacher_id: ''
  });
  const [search, setSearch] = useState('');
  const [activeCourse, setActiveCourse] = useState('');
  const [activeYear, setActiveYear] = useState('');
  const [activeSemester, setActiveSemester] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(API_URL);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    // Fetch teachers for dropdown
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(res.data);
      } catch (err) {
        console.error('Failed to fetch teachers', err);
      }
    };
    fetchTeachers();
  }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update subject
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing.subject_id}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({
        name: '',
        description: '',
        course: '',
        year_level: '',
        semester: '',
        teacher_id: ''
      });
      setEditing(null);
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error saving subject');
    }
  };

  // Edit subject
  // Removed unused handleEdit function

  // Delete subject
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel edit
  // Removed unused handleCancel function

  // Show all subjects by default, filter only by search and selected filters
  const displayedSubjects = subjects.filter(subject => {
    const searchMatch = `${subject.name} ${subject.description || ''} ${subject.course || ''} ${subject.year_level || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    let courseMatch = true, yearMatch = true, semesterMatch = true;
    if (activeCourse) courseMatch = subject.course === activeCourse;
    if (activeYear) yearMatch = subject.year_level === activeYear;
    if (activeSemester) semesterMatch = subject.semester === activeSemester;
    return searchMatch && courseMatch && yearMatch && semesterMatch;
  });

  const styles = {
    container: {
      padding: '2rem',
      margin: '0 auto',
      background: '#f9fafd',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(2,119,189,0.07)',
      ...fadeInAnim,
    },
    title: {
      color: '#0277bd',
      fontWeight: 900,
      fontSize: '2rem',
      marginBottom: 0,
      letterSpacing: '1px',
    },
    subtitle: {
      color: '#0288d1',
      fontWeight: 500,
      marginBottom: 18,
    },
    message: {
      color: '#0277bd',
      marginBottom: 10,
      fontWeight: 600,
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
    form: {
      marginBottom: 30,
      background: '#f7fafc',
      padding: 16,
      borderRadius: 8,
      boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
      ...fadeInAnim,
    },
    formRow: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    formInput: {
      borderRadius: 6,
      border: '1.5px solid #b3e5fc',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      outline: 'none',
      minWidth: 120,
      background: '#fff',
      color: '#0277bd',
    },
    formBtn: {
      background: '#0277bd',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 1.5rem',
      borderRadius: 6,
      fontWeight: 700,
      cursor: 'pointer',
    },
    cancelBtn: {
      marginLeft: 10,
      background: '#b0bec5',
      color: '#263238',
      border: 'none',
      padding: '0.5rem 1.5rem',
      borderRadius: 6,
      fontWeight: 600,
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(2,119,189,0.05)',
      ...fadeInAnim,
    },
    th: {
      padding: '0.5rem',
      textAlign: 'left',
      fontWeight: 700,
      color: '#0277bd',
      background: '#e1f5fe',
    },
    td: {
      padding: '0.5rem',
      borderBottom: '1px solid #e0e0e0',
    },
    actionBtn: {
      background: '#0288d1',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      padding: '0.3rem 1rem',
      cursor: 'pointer',
      fontWeight: 600,
    },
    deleteBtn: {
      background: '#e57373',
      color: '#fff',
      marginLeft: 6,
      border: 'none',
      borderRadius: 4,
      padding: '0.3rem 1rem',
      cursor: 'pointer',
      fontWeight: 600,
    },
    successAnim: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 18,
      animation: 'fadeIn 0.7s',
    }
  };

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <h2 style={styles.title}>Subject Management</h2>
      <p style={styles.subtitle}>Manage all subjects here. Assign a course and year level to each subject.</p>

      {/* Search Bar below title */}
      <input
        type="text"
        placeholder="Search subjects by name, course, or year level..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...styles.search, marginBottom: 24, marginTop: 8, border: '2px solid #90caf9', fontSize: '1.1rem', borderRadius: 12 }}
      />

      {/* Filters with improved dropdown styling */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <select
          value={activeCourse}
          onChange={e => setActiveCourse(e.target.value)}
          style={{ ...styles.formInput, minWidth: 160, fontSize: '1.1rem', borderRadius: 12, border: '2px solid #90caf9', background: '#e3f2fd' }}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <select
          value={activeYear}
          onChange={e => setActiveYear(e.target.value)}
          style={{ ...styles.formInput, minWidth: 140, fontSize: '1.1rem', borderRadius: 12, border: '2px solid #90caf9', background: '#e3f2fd' }}
        >
          <option value="">All Years</option>
          {yearLevels.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={activeSemester}
          onChange={e => setActiveSemester(e.target.value)}
          style={{ ...styles.formInput, minWidth: 140, fontSize: '1.1rem', borderRadius: 12, border: '2px solid #90caf9', background: '#e3f2fd' }}
        >
          <option value="">All Semesters</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>

      {/* Add Subject Button triggers modal */}
      <button style={{ ...styles.formBtn, fontSize: '1.1rem', borderRadius: 12, padding: '10px 32px', marginBottom: 18, background: '#1976d2' }} onClick={() => setShowModal(true)}>
        Add Subject
      </button>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(33,150,243,0.12)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(2,119,189,0.10)', padding: 24, minWidth: 400, maxWidth: 520 }}>
            <h3 style={{ color: '#0277bd', fontWeight: 900, textAlign: 'center', marginBottom: 28, letterSpacing: 1 }}>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
            {errorMsg && (
              <div style={{ color: '#e57373', fontWeight: 700, marginBottom: 12, fontSize: '1.05rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ marginBottom: 20, background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 8px rgba(2,119,189,0.07)' }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Subject Name:</label>
                <input name="name" value={form.name} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Description:</label>
                <input name="description" value={form.description} onChange={handleChange} style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Course:</label>
                <select name="course" value={form.course} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Year Level:</label>
                <select name="year_level" value={form.year_level} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Select Year Level</option>
                  {yearLevels.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Semester:</label>
                <select name="semester" value={form.semester} onChange={handleChange} required style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0277bd', minWidth: 120, display: 'inline-block' }}>Assign Teacher:</label>
                <select name="teacher_id" value={form.teacher_id} onChange={handleChange} style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: '1.5px solid #b3e5fc', fontSize: 16, width: 220 }}>
                  <option value="">Assign Teacher (optional)</option>
                  {teachers.map(teacher => (
                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                      {teacher.firstname} {teacher.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="submit" style={{ background: '#0277bd', color: '#fff', padding: '10px 28px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8, boxShadow: '0 1px 4px #0277bd22' }}>
                  {editing ? 'Update' : 'Add'}
                </button>
                <button type="button" style={{ marginLeft: 10, background: '#b0bec5', color: '#263238', border: 'none', padding: '10px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16 }} onClick={() => { setShowModal(false); setEditing(null); setForm({ name: '', description: '', course: '', year_level: '', semester: '', teacher_id: '' }); setErrorMsg(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Course</th>
            <th style={styles.th}>Year Level</th>
            <th style={styles.th}>Teacher</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedSubjects.map(subject => (
            <tr key={subject.subject_id}>
              <td style={styles.td}>{subject.name}</td>
              <td style={styles.td}>{subject.description}</td>
              <td style={styles.td}>{subject.course}</td>
              <td style={styles.td}>{subject.year_level}</td>
              <td style={styles.td}>
                {subject.teacher ? `${subject.teacher.firstname} ${subject.teacher.lastname}` : 'N/A'}
              </td>
              <td style={styles.td}>
                <button onClick={() => { 
                  setEditing(subject); 
                  setForm({
                    name: subject.name,
                    description: subject.description || '',
                    course: subject.course,
                    year_level: subject.year_level,
                    semester: subject.semester,
                    teacher_id: subject.teacher_id || ''
                  });
                  setShowModal(true); 
                  setErrorMsg('');
                }} style={styles.actionBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(subject.subject_id)} style={styles.deleteBtn}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectManagement;
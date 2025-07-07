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

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    course: '',
    year_level: '',
  });
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(API_URL);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update subject
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing.subject_id}`, form);
        setMessage('Subject updated!');
      } else {
        await axios.post(API_URL, form);
        setMessage('Subject added!');
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      setForm({
        name: '',
        description: '',
        course: '',
        year_level: '',
      });
      setEditing(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error saving subject');
    }
  };

  // Edit subject
  const handleEdit = subject => {
    setEditing(subject);
    setForm({
      name: subject.name,
      description: subject.description || '',
      course: subject.course || '',
      year_level: subject.year_level || '',
    });
  };

  // Delete subject
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Subject deleted!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete subject');
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      course: '',
      year_level: '',
    });
    setMessage('');
  };

  // Filtered subjects
  const displayedSubjects = subjects.filter(subject => {
    const searchMatch = `${subject.name} ${subject.description || ''} ${subject.course || ''} ${subject.year_level || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return searchMatch;
  });

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 900,
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
      {/* Animation keyframes */}
      <style>{keyframes}</style>
      <h2 style={styles.title}>Subject Management</h2>
      <p style={styles.subtitle}>Manage all subjects here. Assign a course and year level to each subject.</p>
      {showSuccess && (
        <div style={styles.successAnim}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#b2f5ea"/>
            <path d="M15 25L22 32L34 18" stroke="#0277bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ color: '#0277bd', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 12 }}>
            Success!
          </div>
        </div>
      )}
      {message && !showSuccess && <div style={styles.message}>{message}</div>}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search subjects by name, course, or year level..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h4 style={{ color: '#0277bd', marginBottom: 10 }}>{editing ? 'Edit Subject' : 'Add Subject'}</h4>
        <div style={styles.formRow}>
          <input name="name" placeholder="Subject Name" value={form.name} onChange={handleChange} required style={styles.formInput} />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={styles.formInput} />
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
            style={styles.formInput}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <select
            name="year_level"
            value={form.year_level}
            onChange={handleChange}
            required
            style={styles.formInput}
          >
            <option value="">Select Year Level</option>
            {yearLevels.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit" style={styles.formBtn}>
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Subject List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Course</th>
            <th style={styles.th}>Year Level</th>
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
                <button onClick={() => handleEdit(subject)} style={styles.actionBtn}>Edit</button>
                <button onClick={() => handleDelete(subject.subject_id)} style={styles.deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectManagement;
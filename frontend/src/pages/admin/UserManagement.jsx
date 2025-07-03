import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Add this for animation
const fadeInAnim = {
  animation: 'fadeIn 0.7s',
};
const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
`;

const API_URL = 'http://localhost:5000/api/users';

const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
const blocks = ['A', 'B', 'C', 'D'];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    course: '',
    year_level: '',
    block: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/getAll/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update student
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing.student_id}`, form);
        setMessage('Student updated!');
      } else {
        await axios.post(`${API_URL}/register`, form);
        setMessage('Student added!');
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      setForm({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        course: '',
        year_level: '',
        block: '',
        password: '',
      });
      setEditing(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error saving student');
    }
  };

  // Edit student
  const handleEdit = student => {
    setEditing(student);
    setForm({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      phone: student.phone,
      course: student.course,
      year_level: student.year_level,
      block: student.block,
      password: '',
    });
  };

  // Delete student
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setMessage('Student deleted!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete student');
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditing(null);
    setForm({
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      course: '',
      year_level: '',
      block: '',
      password: '',
    });
    setMessage('');
  };

  // Combined filter: search, course, and block
  const displayedStudents = students.filter(student => {
    // Search by name or email
    const searchMatch = `${student.firstname} ${student.lastname} ${student.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    // Filter by course
    const courseMatch = selectedCourse ? student.course === selectedCourse : true;
    // Filter by year level
    const yearMatch = selectedYear ? student.year_level === selectedYear : true;
    // Filter by block
    const blockMatch = selectedBlock ? student.block === selectedBlock : true;
    return searchMatch && courseMatch && yearMatch && blockMatch;
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
    filterRow: {
      marginBottom: 18,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    filterLabel: {
      fontWeight: 600,
      marginRight: 8,
      color: '#0277bd',
    },
    filterSelect: {
      minWidth: 120,
      borderRadius: 6,
      border: '1.5px solid #b3e5fc',
      padding: '0.3rem 0.7rem',
      fontSize: '1rem',
      background: '#fff',
      color: '#0277bd',
    },
    clearBtn: {
      marginLeft: 10,
      background: '#b0bec5',
      color: '#263238',
      border: 'none',
      padding: '0.3rem 1rem',
      borderRadius: 6,
      cursor: 'pointer',
      fontWeight: 600,
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
      <h2 style={styles.title}>User Management</h2>
      <p style={styles.subtitle}>Manage all students here.</p>
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
        placeholder="Search students by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* Course List Feature */}
      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>View by Course:</label>
        <select
          value={selectedCourse}
          onChange={e => {
            setSelectedCourse(e.target.value);
            setSelectedBlock('');
            setSelectedYear('');
          }}
          style={styles.filterSelect}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        {selectedCourse && (
          <>
            <label style={styles.filterLabel}>Year Level:</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Years</option>
              {yearLevels.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </>
        )}
        {selectedCourse && (
          <>
            <label style={styles.filterLabel}>Block:</label>
            <select
              value={selectedBlock}
              onChange={e => setSelectedBlock(e.target.value)}
              style={{ ...styles.filterSelect, minWidth: 80 }}
            >
              <option value="">All Blocks</option>
              {blocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </>
        )}
        {(selectedCourse || selectedBlock || selectedYear) && (
          <button
            style={styles.clearBtn}
            onClick={() => { setSelectedCourse(''); setSelectedBlock(''); setSelectedYear(''); }}
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h4 style={{ color: '#0277bd', marginBottom: 10 }}>{editing ? 'Edit Student' : 'Add Student'}</h4>
        <div style={styles.formRow}>
          <input name="firstname" placeholder="First Name" value={form.firstname} onChange={handleChange} required style={styles.formInput} />
          <input name="lastname" placeholder="Last Name" value={form.lastname} onChange={handleChange} required style={styles.formInput} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.formInput} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={styles.formInput} />

          {/* Course dropdown */}
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

          {/* Year Level dropdown */}
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

          {/* Block dropdown */}
          <select
            name="block"
            value={form.block}
            onChange={handleChange}
            required
            style={{ ...styles.formInput, minWidth: 80 }}
          >
            <option value="">Select Block</option>
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>

          {!editing && (
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={styles.formInput} />
          )}
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

      {/* Student List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Course</th>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>Block</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedStudents.map(student => (
            <tr key={student.student_id}>
              <td style={styles.td}>{student.firstname} {student.lastname}</td>
              <td style={styles.td}>{student.email}</td>
              <td style={styles.td}>{student.phone}</td>
              <td style={styles.td}>{student.course}</td>
              <td style={styles.td}>{student.year_level}</td>
              <td style={styles.td}>{student.block}</td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(student)} style={styles.actionBtn}>Edit</button>
                <button onClick={() => handleDelete(student.student_id)} style={styles.deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
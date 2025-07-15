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

const API_URL = 'http://localhost:5000/api/departments';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    staff_id: ''
  });
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(API_URL);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch departments');
    }
  };

  // Fetch all staffs
  const fetchStaffs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffs(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch staff');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchStaffs();
  }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update department
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_URL}/${editing.department_id}`, form);
        setMessage('Department updated!');
      } else {
        await axios.post(API_URL, form);
        setMessage('Department added!');
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      setForm({
        name: '',
        description: '',
        staff_id: ''
      });
      setEditing(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error saving department');
    }
  };

  // Edit department
  const handleEdit = department => {
    setEditing(department);
    setForm({
      name: department.name,
      description: department.description || '',
      staff_id: department.staff_id || ''
    });
  };

  // Delete department
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Department deleted!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete department');
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      staff_id: ''
    });
    setMessage('');
  };

  // Filtered departments by search
  const displayedDepartments = departments.filter(dept => {
    const searchMatch = `${dept.name} ${dept.description || ''}`
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
      <h2 style={styles.title}>Department Management</h2>
      <p style={styles.subtitle}>Manage all departments here. Assign a staff to each department.</p>

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
        placeholder="Search departments by name or description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h4 style={{ color: '#0277bd', marginBottom: 10 }}>
          {editing ? 'Edit Department' : 'Add Department'}
        </h4>
        <div style={styles.formRow}>
          <input
            name="name"
            placeholder="Department Name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.formInput}
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            style={styles.formInput}
          />
          <select
            name="staff_id"
            value={form.staff_id}
            onChange={handleChange}
            required
            style={styles.formInput}
          >
            <option value="">Select Staff</option>
            {staffs.map(staff => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.firstname} {staff.lastname}
              </option>
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

      {/* Department List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Staff</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedDepartments.map(dept => (
            <tr key={dept.department_id}>
              <td style={styles.td}>{dept.name}</td>
              <td style={styles.td}>{dept.description}</td>
              <td style={styles.td}>
                {dept.staff ? `${dept.staff.firstname} ${dept.staff.lastname}` : 'N/A'}
              </td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(dept)} style={styles.actionBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(dept.department_id)} style={styles.deleteBtn}>
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

export default DepartmentManagement;

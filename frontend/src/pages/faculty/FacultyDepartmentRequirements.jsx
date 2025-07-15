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

const FacultyDepartmentRequirements = () => {
  const { user, userType } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userType !== 'Staff') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/departments/staff/${user.staff_id}`)
      .then(res => {
        setDepartments(res.data);
        // Initialize requirements state
        const reqs = {};
        res.data.forEach(dep => { reqs[dep.department_id] = dep.requirements || ''; });
        setRequirements(reqs);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleSave = async (department_id) => {
    setSaving(prev => ({ ...prev, [department_id]: true }));
    setSuccess(prev => ({ ...prev, [department_id]: false }));
    try {
      await axios.patch(`http://localhost:5000/api/departments/${department_id}/requirements`, {
        requirements: requirements[department_id]
      });
      setSuccess(prev => ({ ...prev, [department_id]: true }));
      // Update the requirements in the departments array so UI reflects the change
      setDepartments(prev =>
        prev.map(dep =>
          dep.department_id === department_id
            ? { ...dep, requirements: requirements[department_id] }
            : dep
        )
      );
    } catch (err) {
      console.error('Error saving requirements:', err);
      alert('Failed to save requirements.');
    }
    setSaving(prev => ({ ...prev, [department_id]: false }));
  };

  if (!user || userType !== 'staff') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only faculty can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏢 My Departments & Requirements</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Department Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Requirements</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dep => (
              <tr key={dep.department_id}>
                <td style={styles.td}>{dep.name}</td>
                <td style={styles.td}>{dep.description}</td>
                <td style={styles.td}>
                  {dep.requirements && dep.requirements.trim() !== '' ? (
                    <div>
                      <div style={{ marginBottom: 8, whiteSpace: 'pre-line' }}><b>Current:</b> {dep.requirements}</div>
                      <textarea
                        style={styles.input}
                        value={requirements[dep.department_id] || ''}
                        placeholder="Update requirements..."
                        onChange={e => setRequirements(prev => ({ ...prev, [dep.department_id]: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <textarea
                      style={styles.input}
                      value={requirements[dep.department_id] || ''}
                      placeholder="Add requirements..."
                      onChange={e => setRequirements(prev => ({ ...prev, [dep.department_id]: e.target.value }))}
                    />
                  )}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.button}
                    disabled={saving[dep.department_id] || !requirements[dep.department_id] || requirements[dep.department_id].trim() === dep.requirements}
                    onClick={() => handleSave(dep.department_id)}
                  >
                    {dep.requirements && dep.requirements.trim() !== '' ? (saving[dep.department_id] ? 'Updating...' : 'Update') : (saving[dep.department_id] ? 'Adding...' : 'Add')}
                  </button>
                  {success[dep.department_id] && <span style={styles.success}>Saved!</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FacultyDepartmentRequirements;

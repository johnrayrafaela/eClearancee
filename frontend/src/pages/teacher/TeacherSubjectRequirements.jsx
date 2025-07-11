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
  const [requirements, setRequirements] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('All');
  // Define year levels in order
  const yearLevelOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const yearLevels = ['All', ...yearLevelOrder];

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/subject/teacher/${user.teacher_id}`)
      .then(res => {
        setSubjects(res.data);
        // Initialize requirements state
        const reqs = {};
        res.data.forEach(sub => { reqs[sub.subject_id] = sub.requirements || ''; });
        setRequirements(reqs);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleSave = async (subject_id) => {
    setSaving(prev => ({ ...prev, [subject_id]: true }));
    setSuccess(prev => ({ ...prev, [subject_id]: false }));
    try {
      await axios.patch(`http://localhost:5000/api/subject/${subject_id}/requirements`, {
        requirements: requirements[subject_id]
      });
      setSuccess(prev => ({ ...prev, [subject_id]: true }));
      // Update the requirements in the subjects array so UI reflects the change
      setSubjects(prev =>
        prev.map(sub =>
          sub.subject_id === subject_id
            ? { ...sub, requirements: requirements[subject_id] }
            : sub
        )
      );
    } catch (err) {
      console.error('Error saving requirements:', err);
      alert('Failed to save requirements.');
    }
    setSaving(prev => ({ ...prev, [subject_id]: false }));
  };

  // Filter subjects by active year level
  const filteredSubjects = activeYear === 'All' ? subjects : subjects.filter(s => s.year_level === activeYear);

  if (!user || userType !== 'teacher') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only teachers can view this page.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📚 My Subjects & Requirements</h2>
      {/* Year Level Tabs */}
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
              <th style={styles.th}>Requirements</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map(sub => (
              <tr key={sub.subject_id}>
                <td style={styles.td}>{sub.name}</td>
                <td style={styles.td}>{sub.course}</td>
                <td style={styles.td}>{sub.year_level}</td>
                <td style={styles.td}>{sub.semester}</td>
                <td style={styles.td}>
                  {sub.requirements && sub.requirements.trim() !== '' ? (
                    <div>
                      <div style={{ marginBottom: 8, whiteSpace: 'pre-line' }}><b>Current:</b> {sub.requirements}</div>
                      <textarea
                        style={styles.input}
                        value={requirements[sub.subject_id] || ''}
                        placeholder="Update requirements..."
                        onChange={e => setRequirements(prev => ({ ...prev, [sub.subject_id]: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <textarea
                      style={styles.input}
                      value={requirements[sub.subject_id] || ''}
                      placeholder="Add requirements..."
                      onChange={e => setRequirements(prev => ({ ...prev, [sub.subject_id]: e.target.value }))}
                    />
                  )}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.button}
                    disabled={saving[sub.subject_id] || !requirements[sub.subject_id] || requirements[sub.subject_id].trim() === sub.requirements}
                    onClick={() => handleSave(sub.subject_id)}
                  >
                    {sub.requirements && sub.requirements.trim() !== '' ? (saving[sub.subject_id] ? 'Updating...' : 'Update') : (saving[sub.subject_id] ? 'Adding...' : 'Add')}
                  </button>
                  {success[sub.subject_id] && <span style={styles.success}>Saved!</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherSubjectRequirements;

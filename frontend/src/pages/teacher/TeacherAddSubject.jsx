import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

// Animation keyframes
const fadeInUp = {
  animation: 'fadeInUp 0.6s ease-out'
};

const slideIn = {
  animation: 'slideIn 0.5s ease-out'
};

const slideInLeft = {
  animation: 'slideInLeft 0.8s ease-out'
};

const bounceIn = {
  animation: 'bounceIn 0.7s ease-out'
};

const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .btn-hover {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .btn-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(2,119,189,0.3);
  }
  
  .btn-hover:active {
    transform: translateY(0);
  }
  
  .card-hover {
    transition: all 0.3s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(2,119,189,0.2);
  }
  
  .search-focus {
    transition: all 0.3s ease;
  }
  
  .search-focus:focus {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(2,119,189,0.3);
  }
  
  .table-row {
    transition: all 0.2s ease;
  }
  
  .table-row:hover {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    transform: scale(1.01);
  }
  
  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

const TeacherAddSubject = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user, userType } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [unclaimedSubjects, setUnclaimedSubjects] = useState([]);
  const [filteredUnclaimedSubjects, setFilteredUnclaimedSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', semester: '1st', requirements: '', course: '', year_level: '' });
  const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userType === 'teacher' && user) {
      fetchSubjects();
      fetchUnclaimedSubjects();
    }
    // eslint-disable-next-line
  }, [user, userType]);

  // Filter unclaimed subjects based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = unclaimedSubjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.year_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUnclaimedSubjects(filtered);
    } else {
      setFilteredUnclaimedSubjects(unclaimedSubjects);
    }
  }, [searchTerm, unclaimedSubjects]);

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

  const fetchUnclaimedSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects/unclaimed');
      setUnclaimedSubjects(res.data || []);
      setFilteredUnclaimedSubjects(res.data || []);
    } catch (err) {
      console.error('Failed to fetch unclaimed subjects:', err);
      setUnclaimedSubjects([]);
      setFilteredUnclaimedSubjects([]);
    }
  };

  const claimSubject = async (subjectId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(`http://localhost:5000/api/subjects/${subjectId}/claim`, {
        teacher_id: user.teacher_id
      });
      setSuccess('Subject claimed successfully! A copy has been added to your subjects.');
      fetchSubjects();
      fetchUnclaimedSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim subject.');
    }
    setLoading(false);
  };

  const unclaimSubject = async (subjectId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${subjectId}/unclaim`, {
        data: { teacher_id: user.teacher_id }
      });
      setSuccess('Subject unclaimed successfully! It is now available for other teachers.');
      fetchSubjects();
      fetchUnclaimedSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unclaim subject.');
    }
    setLoading(false);
  };

  const deleteSubject = async (subjectId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${subjectId}/teacher-delete`, {
        data: { teacher_id: user.teacher_id }
      });
      setSuccess('Subject deleted successfully!');
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject.');
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
    return (
      <div style={{ 
        color: '#e11d48', 
        padding: 40, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fff 0%, #fee 100%)',
        borderRadius: 20,
        margin: 20,
        boxShadow: '0 10px 30px rgba(225, 29, 72, 0.1)',
        ...fadeInUp
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
        <h3 style={{ marginBottom: 10 }}>Access Denied</h3>
        <p>Only teachers can access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <style>{keyframes}</style>
      
      {/* Main Container */}
      <div style={{ 
        margin: '20px auto', 
        padding: '40px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)', 
        borderRadius: 20, 
        boxShadow: '0 20px 60px rgba(2,119,189,0.1)',
        maxWidth: '1400px',
        ...fadeInUp
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 40, ...slideIn }}>
          <h1 style={{ 
            color: '#0277bd', 
            fontWeight: 900, 
            fontSize: '2.5rem', 
            marginBottom: 10, 
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(2,119,189,0.1)'
          }}>
            📚 Subject Management
          </h1>
          <p style={{ 
            color: '#546e7a', 
            fontSize: '1.1rem', 
            maxWidth: 600, 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Create new subjects, claim existing ones, or manage your current teaching assignments
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 20, 
          justifyContent: 'center', 
          marginBottom: 40,
          flexWrap: 'wrap',
          ...bounceIn
        }}>
          <button 
            className="btn-hover"
            style={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #0277bd 100%)', 
              color: '#fff', 
              padding: '15px 40px', 
              borderRadius: 50, 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(25,118,210,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }} 
            onClick={() => { 
              setShowModal(true); 
              setEditing(null); 
              setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' }); 
              setError(''); 
              setSuccess(''); 
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>➕</span>
            Create New Subject
          </button>
          
          <button 
            className="btn-hover"
            style={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', 
              color: '#fff', 
              padding: '15px 40px', 
              borderRadius: 50, 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(76,175,80,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }} 
            onClick={() => {
              setShowAvailableModal(true);
              setError('');
              setSuccess('');
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            Browse Available Subjects ({unclaimedSubjects.length})
          </button>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <div style={{ 
            marginBottom: 30, 
            textAlign: 'center',
            ...bounceIn
          }}>
            {success && (
              <div style={{ 
                background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)', 
                color: '#2e7d32', 
                padding: '15px 30px', 
                borderRadius: 50, 
                fontWeight: 600,
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(46,125,50,0.2)',
                border: '2px solid #4caf50'
              }}>
                ✅ {success}
              </div>
            )}
            {error && (
              <div style={{ 
                background: 'linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)', 
                color: '#c62828', 
                padding: '15px 30px', 
                borderRadius: 50, 
                fontWeight: 600,
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(198,40,40,0.2)',
                border: '2px solid #f44336'
              }}>
                ❌ {error}
              </div>
            )}
          </div>
        )}
        {/* Create/Edit Subject Modal */}
        {showModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.6)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            ...fadeInUp
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
              borderRadius: 20, 
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)', 
              padding: 40, 
              minWidth: 500, 
              maxWidth: 600,
              transform: 'scale(1)',
              ...bounceIn
            }}>
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{ fontSize: '3rem', marginBottom: 15 }}>
                  {editing ? '✏️' : '📝'}
                </div>
                <h3 style={{ 
                  color: '#0277bd', 
                  fontWeight: 900, 
                  fontSize: '1.8rem', 
                  marginBottom: 10,
                  letterSpacing: '1px'
                }}>
                  {editing ? 'Edit Subject' : 'Create New Subject'}
                </h3>
                <p style={{ color: '#546e7a', fontSize: '1rem' }}>
                  {editing ? 'Update subject information' : 'Fill in the details to create a new subject'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div>
                    <label style={{ 
                      fontWeight: 600, 
                      color: '#0277bd', 
                      display: 'block', 
                      marginBottom: 8,
                      fontSize: '1rem'
                    }}>
                      📖 Subject Name
                    </label>
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                      className="search-focus"
                      style={{ 
                        width: '100%',
                        padding: '12px 20px', 
                        borderRadius: 15, 
                        border: '2px solid #e1f5fe', 
                        fontSize: '1rem',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }} 
                      placeholder="Enter subject name..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#0277bd', 
                        display: 'block', 
                        marginBottom: 8,
                        fontSize: '1rem'
                      }}>
                        🎓 Course
                      </label>
                      <select 
                        name="course" 
                        value={form.course} 
                        onChange={handleChange} 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '12px 20px', 
                          borderRadius: 15, 
                          border: '2px solid #e1f5fe', 
                          fontSize: '1rem',
                          outline: 'none',
                          background: '#f8fafc',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#0277bd', 
                        display: 'block', 
                        marginBottom: 8,
                        fontSize: '1rem'
                      }}>
                        📅 Year Level
                      </label>
                      <select 
                        name="year_level" 
                        value={form.year_level} 
                        onChange={handleChange} 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '12px 20px', 
                          borderRadius: 15, 
                          border: '2px solid #e1f5fe', 
                          fontSize: '1rem',
                          outline: 'none',
                          background: '#f8fafc',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Year Level</option>
                        {yearLevels.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontWeight: 600, 
                      color: '#0277bd', 
                      display: 'block', 
                      marginBottom: 8,
                      fontSize: '1rem'
                    }}>
                      📆 Semester
                    </label>
                    <select 
                      name="semester" 
                      value={form.semester} 
                      onChange={handleChange} 
                      style={{ 
                        width: '100%',
                        padding: '12px 20px', 
                        borderRadius: 15, 
                        border: '2px solid #e1f5fe', 
                        fontSize: '1rem',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div style={{ 
                  marginTop: 30, 
                  display: 'flex', 
                  gap: 15, 
                  justifyContent: 'center' 
                }}>
                  <button 
                    type="submit" 
                    className="btn-hover"
                    style={{ 
                      background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', 
                      color: '#fff', 
                      padding: '12px 30px', 
                      borderRadius: 25, 
                      border: 'none', 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(2,119,189,0.3)',
                      minWidth: 150
                    }} 
                    disabled={loading}
                  >
                    {editing ? (loading ? '⏳ Updating...' : '✅ Update Subject') : (loading ? '⏳ Creating...' : '🚀 Create Subject')}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-hover"
                    style={{ 
                      background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '12px 30px', 
                      borderRadius: 25, 
                      fontWeight: 600, 
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(144,164,174,0.3)',
                      minWidth: 150
                    }} 
                    onClick={() => { 
                      setShowModal(false); 
                      setEditing(null); 
                      setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' }); 
                      setError(''); 
                      setSuccess(''); 
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Available Subjects Modal */}
        {showAvailableModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.6)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            ...fadeInUp
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
              borderRadius: 20, 
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)', 
              padding: 30, 
              width: '90%',
              maxWidth: 1000,
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              ...bounceIn
            }}>
              
              {/* Modal Header */}
              <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
                {/* Close button in top-right corner */}
                <button
                  onClick={() => {
                    setShowAvailableModal(false);
                    setSearchTerm('');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 35,
                    height: 35,
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(244,67,54,0.3)',
                    zIndex: 10
                  }}
                  className="btn-hover"
                >
                  ✕
                </button>
                
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎯</div>
                <h3 style={{ 
                  color: '#0277bd', 
                  fontWeight: 700, 
                  fontSize: '1.4rem', 
                  marginBottom: 8,
                  letterSpacing: '0.5px'
                }}>
                  Available Subjects
                </h3>
                <p style={{ color: '#546e7a', fontSize: '0.9rem' }}>
                  Browse and claim subjects created by administrators
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search subjects by name, course, year level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-focus"
                    style={{
                      width: '100%',
                      padding: '15px 50px 15px 20px',
                      borderRadius: 50,
                      border: '2px solid #e1f5fe',
                      fontSize: '1rem',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 15px rgba(2,119,189,0.1)'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#90a4ae',
                    fontSize: '1.2rem'
                  }}>
                    🔍
                  </div>
                </div>
                
                {/* Search Results Count */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: 10, 
                  color: '#546e7a',
                  fontSize: '0.9rem'
                }}>
                  {searchTerm ? 
                    `Found ${filteredUnclaimedSubjects.length} of ${unclaimedSubjects.length} subjects` :
                    `Showing all ${unclaimedSubjects.length} available subjects`
                  }
                </div>
              </div>

              {/* Subjects Grid */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '0 5px',
                maxHeight: 'calc(90vh - 200px)',
                minHeight: '400px'
              }}>
                {loading ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: 20 
                  }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        background: '#f0f0f0',
                        borderRadius: 15,
                        padding: 20,
                        height: 150,
                        ...fadeInUp
                      }} className="loading-shimmer">
                      </div>
                    ))}
                  </div>
                ) : filteredUnclaimedSubjects.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#90a4ae', 
                    padding: 60,
                    ...fadeInUp
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: 15 }}>
                      {searchTerm ? '🔍' : '📚'}
                    </div>
                    <h4 style={{ marginBottom: 8, color: '#546e7a', fontSize: '1.1rem' }}>
                      {searchTerm ? 'No subjects found' : 'No available subjects'}
                    </h4>
                    <p style={{ fontSize: '0.9rem' }}>
                      {searchTerm ? 
                        'Try adjusting your search terms' : 
                        'All subjects have been claimed or none have been created yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: 20 
                  }}>
                    {filteredUnclaimedSubjects.map((subj, index) => (
                      <div 
                        key={subj.subject_id} 
                        className="card-hover"
                        style={{ 
                          background: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)', 
                          borderRadius: 15, 
                          padding: 20, 
                          border: '2px solid #e1f5fe',
                          boxShadow: '0 8px 25px rgba(2,119,189,0.1)',
                          position: 'relative',
                          overflow: 'hidden',
                          ...fadeInUp,
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 30,
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ✨
                        </div>
                        
                        <h4 style={{ 
                          color: '#0277bd', 
                          marginBottom: 12, 
                          fontSize: '1rem',
                          fontWeight: 700
                        }}>
                          📖 {subj.name}
                        </h4>
                        
                        <div style={{ marginBottom: 12, color: '#546e7a' }}>
                          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>🎓</span>
                            <strong>Course:</strong> {subj.course}
                          </div>
                          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📅</span>
                            <strong>Year:</strong> {subj.year_level}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📆</span>
                            <strong>Semester:</strong> {subj.semester}
                          </div>
                        </div>

                        {subj.description && (
                          <div style={{ 
                            marginBottom: 12, 
                            color: '#607d8b',
                            fontSize: '0.85rem',
                            fontStyle: 'italic'
                          }}>
                            "{subj.description}"
                          </div>
                        )}
                        
                        <button 
                          className="btn-hover"
                          style={{ 
                            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 25, 
                            padding: '10px 20px', 
                            fontWeight: 600,
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(76,175,80,0.3)'
                          }}
                          onClick={() => {
                            if (window.confirm(`Claim "${subj.name}" for ${subj.course} - ${subj.year_level}?`)) {
                              claimSubject(subj.subject_id);
                            }
                          }}
                          disabled={loading}
                        >
                          {loading ? '⏳ Claiming...' : '🎯 Claim Subject'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ 
                marginTop: 15, 
                textAlign: 'center',
                borderTop: '1px solid #e1f5fe',
                paddingTop: 15,
                flexShrink: 0
              }}>
                <button 
                  className="btn-hover"
                  style={{ 
                    background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 25px', 
                    borderRadius: 25, 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(144,164,174,0.3)'
                  }} 
                  onClick={() => {
                    setShowAvailableModal(false);
                    setSearchTerm('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  ❌ Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Subjects Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
          borderRadius: 20, 
          boxShadow: '0 10px 30px rgba(2,119,189,0.1)', 
          overflow: 'hidden',
          ...slideInLeft
        }}>
          
          {/* Section Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', 
            padding: 25, 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 15
          }}>
            <div style={{ fontSize: '2rem' }}>📚</div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontWeight: 700, 
                fontSize: '1.5rem',
                letterSpacing: '0.5px'
              }}>
                My Subjects
              </h3>
              <p style={{ 
                margin: '5px 0 0 0', 
                opacity: 0.9,
                fontSize: '0.9rem'
              }}>
                Manage your claimed subjects
              </p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 'bold' }}>
              {subjects.filter(subj => subj.teacher_id === user.teacher_id).length} Subject{subjects.filter(subj => subj.teacher_id === user.teacher_id).length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Subjects Content */}
          <div style={{ padding: 30 }}>
            {loading ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: 25 
              }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    background: '#f0f0f0',
                    borderRadius: 15,
                    padding: 25,
                    height: 200,
                    ...fadeInUp
                  }} className="loading-shimmer">
                  </div>
                ))}
              </div>
            ) : subjects.filter(subj => subj.teacher_id === user.teacher_id).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#90a4ae', 
                padding: 60,
                ...fadeInUp
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🎯</div>
                <h4 style={{ marginBottom: 12, color: '#546e7a', fontSize: '1.1rem' }}>
                  No subjects claimed yet
                </h4>
                <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>
                  Start by claiming available subjects or creating new ones
                </p>
                <button 
                  className="btn-hover"
                  style={{ 
                    background: 'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 25, 
                    padding: '15px 30px', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(33,150,243,0.3)'
                  }}
                  onClick={() => setShowAvailableModal(true)}
                >
                  🔍 Browse Available Subjects
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: 25 
              }}>
                {subjects.filter(subj => subj.teacher_id === user.teacher_id).map((subj, index) => (
                  <div 
                    key={subj.subject_id} 
                    className="card-hover"
                    style={{ 
                      background: 'linear-gradient(135deg, #fff 0%, #e8f5e8 100%)', 
                      borderRadius: 15, 
                      padding: 25, 
                      border: '2px solid #e8f5e8',
                      boxShadow: '0 8px 25px rgba(76,175,80,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      ...fadeInUp,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    
                    {/* Claimed Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                      color: 'white',
                      borderRadius: 20,
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      ✅ Claimed
                    </div>
                    
                    <h4 style={{ 
                      color: '#2e7d32', 
                      marginBottom: 15, 
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      paddingRight: 100
                    }}>
                      📖 {subj.name}
                    </h4>
                    
                    <div style={{ marginBottom: 15, color: '#546e7a' }}>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1rem' }}>🎓</span>
                        <div>
                          <strong>Course:</strong> {subj.course}
                        </div>
                      </div>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1rem' }}>📅</span>
                        <div>
                          <strong>Year Level:</strong> {subj.year_level}
                        </div>
                      </div>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1rem' }}>📆</span>
                        <div>
                          <strong>Semester:</strong> {subj.semester}
                        </div>
                      </div>
                      {subj.requirements && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: '1rem', marginTop: 2 }}>📋</span>
                          <div>
                            <strong>Requirements:</strong>
                            <div style={{ 
                              marginTop: 5, 
                              padding: 8, 
                              background: '#f1f8e9', 
                              borderRadius: 6,
                              fontSize: '0.85rem'
                            }}>
                              {subj.requirements}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: 12,
                      flexWrap: 'wrap'
                    }}>
                      <button 
                        className="btn-hover"
                        style={{ 
                          background: 'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 20, 
                          padding: '10px 18px', 
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          flex: 1,
                          minWidth: 120,
                          boxShadow: '0 4px 15px rgba(33,150,243,0.3)'
                        }}
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
                        }}
                      >
                        ✏️ Edit
                      </button>
                      
                      <button 
                        className="btn-hover"
                        style={{ 
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 20, 
                          padding: '10px 18px', 
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          flex: 1,
                          minWidth: 120,
                          boxShadow: '0 4px 15px rgba(255,152,0,0.3)'
                        }}
                        onClick={() => {
                          if (window.confirm(`Release "${subj.name}"? This will remove it from your subjects and make it available for other teachers.`)) {
                            unclaimSubject(subj.subject_id);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading ? '⏳ Releasing...' : '🔄 Release'}
                      </button>
                      
                      <button 
                        className="btn-hover"
                        style={{ 
                          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 20, 
                          padding: '10px 18px', 
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          flex: 1,
                          minWidth: 120,
                          boxShadow: '0 4px 15px rgba(244,67,54,0.3)'
                        }}
                        onClick={() => {
                          if (window.confirm(`Delete "${subj.name}"? This action cannot be undone.`)) {
                            deleteSubject(subj.subject_id);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAddSubject;

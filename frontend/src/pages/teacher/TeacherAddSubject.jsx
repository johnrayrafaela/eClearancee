import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { typeScale, fadeInUp, slideIn, slideInLeft, bounceIn, keyframes } from '../../style/CommonStyles';

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
        margin: '16px auto', 
        padding: '20px 18px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)', 
        borderRadius: 16, 
        boxShadow: '0 10px 28px rgba(2,119,189,0.08)',
        maxWidth: '1400px',
        ...fadeInUp
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 28, ...slideIn }}>
          <h1 style={{ 
            color: '#0277bd', 
            fontWeight: 700, 
            fontSize: '2rem', 
            marginBottom: 10, 
            letterSpacing: '.5px'
          }}>
            📚 Subject Management
          </h1>
          <p style={{ 
            color: '#546e7a', 
            fontSize: '.95rem', 
            maxWidth: 620, 
            margin: '0 auto',
            lineHeight: 1.4
          }}>
            Create or claim subjects and manage teaching assignments
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: 14, 
          justifyContent: 'center', 
          marginBottom: 26,
          flexWrap: 'wrap',
          ...bounceIn
        }}>
          <button 
            className="btn-hover"
            style={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #0277bd 100%)',
              color: '#fff',
              padding: '12px 26px',
              borderRadius: 28,
              border: 'none',
              fontWeight: 600,
              fontSize: '.85rem',
              cursor: 'pointer',
              boxShadow: '0 3px 9px rgba(25,118,210,0.20)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }} 
            onClick={() => { 
              setShowModal(true); 
              setEditing(null); 
              setForm({ name: '', semester: '1st', requirements: '', course: '', year_level: '' }); 
              setError(''); 
              setSuccess(''); 
            }}
          >
            <span style={{ fontSize: '1rem' }}>➕</span>
            Create Subject
          </button>
          
          <button 
            className="btn-hover"
            style={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: '#fff',
              padding: '12px 26px',
              borderRadius: 28,
              border: 'none',
              fontWeight: 600,
              fontSize: '.85rem',
              cursor: 'pointer',
              boxShadow: '0 3px 9px rgba(76,175,80,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }} 
            onClick={() => {
              setShowAvailableModal(true);
              setError('');
              setSuccess('');
            }}
          >
            <span style={{ fontSize: '1rem' }}>🎯</span>
            Available Subjects ({unclaimedSubjects.length})
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
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: '3rem', marginBottom: 15 }}>
                  {editing ? '✏️' : '📝'}
                </div>
                <h3 style={{ 
                  color: '#0277bd', 
                  fontWeight: 700, 
                  fontSize: typeScale.xxl, 
                  marginBottom: 6,
                  letterSpacing: '.5px'
                }}>
                  {editing ? 'Edit Subject' : 'Create New Subject'}
                </h3>
                <p style={{ color: '#546e7a', fontSize: typeScale.lg }}>
                  {editing ? 'Update subject information' : 'Fill in the details to create a new subject'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={{ 
                      fontWeight: 600, 
                      color: '#0277bd', 
                      display: 'block', 
                      marginBottom: 6,
                      fontSize: typeScale.xl
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
                        padding: '8px 14px', 
                        borderRadius: 12, 
                        border: '2px solid #e1f5fe', 
                        fontSize: typeScale.xl,
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }} 
                      placeholder="Enter subject name..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ 
                        fontWeight: 600, 
                        color: '#0277bd', 
                        display: 'block', 
                        marginBottom: 6,
                        fontSize: typeScale.xl
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
                          padding: '8px 14px', 
                          borderRadius: 12, 
                          border: '2px solid #e1f5fe', 
                          fontSize: typeScale.xl,
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
                        marginBottom: 6,
                        fontSize: typeScale.xl
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
                          padding: '8px 14px', 
                          borderRadius: 12, 
                          border: '2px solid #e1f5fe', 
                          fontSize: typeScale.xl,
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
                      marginBottom: 6,
                      fontSize: typeScale.xl
                    }}>
                      📆 Semester
                    </label>
                    <select 
                      name="semester" 
                      value={form.semester} 
                      onChange={handleChange} 
                      style={{ 
                        width: '100%',
                        padding: '8px 14px', 
                        borderRadius: 12, 
                        border: '2px solid #e1f5fe', 
                        fontSize: typeScale.xl,
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
                  marginTop: 18, 
                  display: 'flex', 
                  gap: 10, 
                  justifyContent: 'center' 
                }}>
                  <button 
                    type="submit" 
                    className="btn-hover"
                    style={{ 
                      background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', 
                      color: '#fff', 
                      padding: '8px 18px', 
                      borderRadius: 18, 
                      border: 'none', 
                      fontWeight: 600, 
                      fontSize: typeScale.xl,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(2,119,189,0.25)',
                      minWidth: 120
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
                      padding: '8px 18px', 
                      borderRadius: 18, 
                      fontWeight: 600, 
                      fontSize: typeScale.xl,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(144,164,174,0.25)',
                      minWidth: 120
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: 14
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 22
                  }}>
                    {filteredUnclaimedSubjects.map((subj, index) => (
                      <div 
                        key={subj.subject_id} 
                        className="card-hover"
                        style={{ 
                          background: 'linear-gradient(135deg,#fff 0%,#e3f2fd 100%)',
                          borderRadius: 16,
                          padding: 18,
                          border: '1px solid #e1f5fe',
                          boxShadow: '0 8px 20px rgba(2,119,189,0.12)',
                          position: 'relative',
                          overflow: 'hidden',
                          ...fadeInUp,
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}>
                          ✨
                        </div>
                        
                        <h4 style={{ color:'#0277bd', marginBottom:10, fontSize:'.95rem', fontWeight:700, letterSpacing:.4 }}>
                          📖 {subj.name}
                        </h4>
                        
                        <div style={{ marginBottom:12, color:'#455a64', fontSize:'.75rem', lineHeight:1.35 }}>
                          <div style={{ marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:'.85rem' }}>🎓</span>
                            <strong style={{ fontSize:'.7rem' }}>Course:</strong> {subj.course}
                          </div>
                          <div style={{ marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:'.85rem' }}>📅</span>
                            <strong style={{ fontSize:'.7rem' }}>Year:</strong> {subj.year_level}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:'.85rem' }}>📆</span>
                            <strong style={{ fontSize:'.7rem' }}>Semester:</strong> {subj.semester}
                          </div>
                        </div>

                        {subj.description && (
                          <div style={{ marginBottom:12, color:'#607d8b', fontSize:'.7rem', fontStyle:'italic' }}>
                            "{subj.description}"
                          </div>
                        )}
                        
                        <button 
                          className="btn-hover"
                          style={{ 
                            background: 'linear-gradient(135deg,#4caf50 0%,#2e7d32 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 22,
                            padding: '10px 16px',
                            fontWeight:600,
                            cursor: 'pointer',
                            width: '100%',
                            fontSize:'.8rem',
                            boxShadow:'0 5px 14px rgba(76,175,80,0.30)'
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
          <div style={{ background:'linear-gradient(135deg,#0277bd 0%,#015079 100%)', padding:24, color:'#fff', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:'1.8rem' }}>📚</div>
            <div>
              <h3 style={{ margin:0, fontWeight:700, fontSize:'1.35rem', letterSpacing:'.4px' }}>My Subjects</h3>
              <p style={{ margin:'6px 0 0', opacity:.9, fontSize:'.8rem', letterSpacing:.4 }}>Manage claimed subjects</p>
            </div>
            <div style={{ marginLeft:'auto', fontSize:'.75rem', fontWeight:700, background:'rgba(255,255,255,0.18)', padding:'6px 14px', borderRadius:24 }}>
              {subjects.filter(subj => subj.teacher_id === user.teacher_id).length} total
            </div>
          </div>

          {/* Subjects Content */}
          <div style={{ padding:18 }}>
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
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:24 }}>
                {subjects.filter(subj => subj.teacher_id === user.teacher_id).map((subj, index) => (
                  <div 
                    key={subj.subject_id} 
                    className="card-hover"
                    style={{ background:'linear-gradient(135deg,#ffffff 0%,#eef9ef 100%)', borderRadius:18, padding:20, border:'1px solid #d9ecd9', boxShadow:'0 8px 22px rgba(76,175,80,0.12)', position:'relative', overflow:'hidden', ...fadeInUp, animationDelay:`${index*0.08}s` }}
                  >
                    
                    {/* Claimed Badge */}
                    <div style={{ position:'absolute', top:12, right:12, background:'linear-gradient(135deg,#4caf50 0%,#2e7d32 100%)', color:'#fff', borderRadius:18, padding:'6px 12px', fontSize:'.65rem', fontWeight:700, letterSpacing:.5, boxShadow:'0 4px 10px rgba(76,175,80,0.25)' }}>CLAIMED</div>
                    
                    <h4 style={{ color:'#2e7d32', marginBottom:12, fontSize:'1.05rem', fontWeight:700, lineHeight:1.2, paddingRight:70 }}>📖 {subj.name}</h4>
                    
                    <div style={{ marginBottom:16, color:'#4b6354', fontSize:'.78rem', lineHeight:1.35 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span><strong style={{ fontSize:'.7rem' }}>Course:</strong> {subj.course}</span>
                        <span><strong style={{ fontSize:'.7rem' }}>Year:</strong> {subj.year_level}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span><strong style={{ fontSize:'.7rem' }}>Semester:</strong> {subj.semester}</span>
                        <span><strong style={{ fontSize:'.7rem' }}>ID:</strong> {subj.subject_id}</span>
                      </div>
                      {subj.requirements && (
                        <div style={{ marginTop:6 }}>
                          <strong style={{ fontSize:'.7rem' }}>Requirements:</strong>
                          <div style={{ marginTop:4, padding:'6px 8px', background:'#f1f8e9', borderRadius:6, fontSize:'.65rem', maxHeight:60, overflow:'auto' }}>
                            {subj.requirements}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      <button 
                        className="btn-hover"
                        style={{ background:'linear-gradient(135deg,#2196f3 0%,#0277bd 100%)', color:'#fff', border:'none', borderRadius:20, padding:'10px 16px', fontWeight:600, cursor:'pointer', fontSize:'.75rem', flex:1, minWidth:100, boxShadow:'0 4px 12px rgba(33,150,243,0.25)' }}
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
                        style={{ background:'linear-gradient(135deg,#ff9800 0%,#f57c00 100%)', color:'#fff', border:'none', borderRadius:20, padding:'10px 16px', fontWeight:600, cursor:'pointer', fontSize:'.75rem', flex:1, minWidth:100, boxShadow:'0 4px 12px rgba(255,152,0,0.30)' }}
                        onClick={() => {
                          if (window.confirm(`Release "${subj.name}"? This will remove it from your subjects and make it available for other teachers.`)) {
                            unclaimSubject(subj.subject_id);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading ? '⏳' : '🔄 Release'}
                      </button>
                      
                      <button 
                        className="btn-hover"
                        style={{ background:'linear-gradient(135deg,#f44336 0%,#d32f2f 100%)', color:'#fff', border:'none', borderRadius:20, padding:'10px 16px', fontWeight:600, cursor:'pointer', fontSize:'.75rem', flex:1, minWidth:100, boxShadow:'0 4px 12px rgba(244,67,54,0.30)' }}
                        onClick={() => {
                          if (window.confirm(`Delete "${subj.name}"? This action cannot be undone.`)) {
                            deleteSubject(subj.subject_id);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading ? '⏳' : '🗑️ Delete'}
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

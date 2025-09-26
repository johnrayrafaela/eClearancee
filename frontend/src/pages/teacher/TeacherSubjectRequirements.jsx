import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

// Animation keyframes
const fadeInUp = {
  animation: 'fadeInUp 0.6s ease-out'
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
  
  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

const TeacherSubjectRequirements = () => {
  const { user, userType } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('All');
  const [activeSemester, setActiveSemester] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  // Removed confirm modal to simplify UX (direct save)
  // Track modal animation so it doesn't "reopen" (re-animate) on each keystroke
  const modalAnimatedRef = useRef(false);
  
  const yearLevelOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const yearLevels = ['All', ...yearLevelOrder];
  const semesterOrder = ['1st', '2nd'];
  const semesters = ['All', ...semesterOrder];

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/subject/teacher/${user.teacher_id}`)
      .then(res => {
        setSubjects(res.data);
        const reqs = {};
        res.data.forEach(sub => {
          let reqObj = { type: 'Text', instructions: '' };
          if (sub.requirements) {
            try {
              reqObj = JSON.parse(sub.requirements);
              // Ensure instructions field exists
              if (!reqObj.instructions) {
                reqObj.instructions = '';
              }
            } catch {
              reqObj = { type: 'Text', instructions: sub.requirements || '' };
            }
          }
          reqs[sub.subject_id] = reqObj;
        });
        setRequirements(reqs);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleSave = async (subject_id, override) => {
    setSaving(prev => ({ ...prev, [subject_id]: true }));
    setSuccess(prev => ({ ...prev, [subject_id]: false }));
    try {
      const reqObj = override || requirements[subject_id] || { type: 'Text', instructions: '' };
      
      // Save requirement type and instructions
      const requirementData = {
        type: reqObj.type,
        instructions: reqObj.instructions || '', // Include teacher instructions
        checklist: reqObj.type === 'Checklist' ? [] : undefined
      };
      
      await axios.patch(`http://localhost:5000/api/subject/${subject_id}/requirements`, {
        requirements: JSON.stringify(requirementData)
      });
      
      setSuccess(prev => ({ ...prev, [subject_id]: true }));
      setSubjects(prev =>
        prev.map(sub =>
          sub.subject_id === subject_id
            ? { ...sub, requirements: JSON.stringify(requirementData) }
            : sub
        )
      );
      
      // Update local requirements state
      setRequirements(prev => ({
        ...prev,
        [subject_id]: requirementData
      }));
      
      setTimeout(() => setSuccess(prev => ({ ...prev, [subject_id]: false })), 3000);
    } catch (err) {
      console.error('Error saving requirement:', err);
      alert('Failed to save requirement.');
    }
    setSaving(prev => ({ ...prev, [subject_id]: false }));
  };

  const openRequirementModal = (subject) => {
    setSelectedSubject(subject);
    modalAnimatedRef.current = false; // allow animation only on fresh open
    setShowModal(true);
  };

  // Confirmation removed; direct save now.

  // Filter subjects by active year level and semester
  let filteredSubjects = subjects;
  if (activeYear !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.year_level === activeYear);
  }
  if (activeSemester !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.semester === activeSemester);
  }

  // RequirementModal Component
  const RequirementModal = () => {
    const visible = showModal && selectedSubject;
    // Derive subject details safely
    const subjectId = selectedSubject?.subject_id;
    const storedReq = (subjectId && requirements[subjectId]) || { type: 'Text', instructions: '' };
    // Maintain stable draft states; reset when subject or showModal changes (effect below)
    const [draftType, setDraftType] = useState(storedReq.type || 'Text');
    const [draftInstructions, setDraftInstructions] = useState(storedReq.instructions || '');

    // Sync drafts when a new subject is opened
    useEffect(() => {
      if (visible && subjectId) {
        const base = requirements[subjectId] || { type: 'Text', instructions: '' };
        setDraftType(base.type || 'Text');
        setDraftInstructions(base.instructions || '');
      }
    }, [visible, subjectId]);

    // Control single animation run per open
    useEffect(() => {
      if (visible) {
        modalAnimatedRef.current = false; // reset for this open
      }
    }, [visible, subjectId]);

    const handleModalClose = () => {
      setShowModal(false);
    };

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        handleModalClose();
      }
    };

    const placeholder = `Enter clear instructions for students about what they need to ${
      draftType === 'Link' ? 'submit as a link' :
      draftType === 'File' ? 'upload as a file' :
      draftType === 'Checklist' ? 'complete in the checklist' :
      'provide for this requirement'
    }...`;

    const bounceStyle = modalAnimatedRef.current ? {} : bounceIn; // apply once

    if (!visible) return null;

    if (!modalAnimatedRef.current) {
      // first paint for this open triggers bounce
      modalAnimatedRef.current = true;
    }

    return (
      <div
        style={{
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
        }}
        onClick={handleOverlayClick}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            borderRadius: 20,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            padding: 40,
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto',
            ...bounceStyle
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: '3rem', marginBottom: 15 }}>⚙️</div>
            <h3 style={{
              color: '#0277bd',
              fontWeight: 900,
              fontSize: '1.8rem',
              marginBottom: 10,
              letterSpacing: '1px'
            }}>
              Set Requirement Type: {selectedSubject.name}
            </h3>
            <p style={{ color: '#546e7a', fontSize: '1rem' }}>
              Choose what type of submission students need to provide
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{
              background: '#f8fafc',
              padding: 15,
              borderRadius: 8,
              border: '1px solid #e0e7ff',
              marginBottom: 20
            }}>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                <strong>Course:</strong> {selectedSubject.course} |
                <strong> Year:</strong> {selectedSubject.year_level} |
                <strong> Semester:</strong> {selectedSubject.semester}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor={`req-type-${subjectId}`} style={{
                fontWeight: 600,
                color: '#0277bd',
                display: 'block',
                marginBottom: 8,
                fontSize: '1rem'
              }}>
                Requirement Type:
              </label>
              <select
                id={`req-type-${subjectId}`}
                value={draftType}
                onChange={e => setDraftType(e.target.value)}
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
                <option value="Text">📝 Text Instructions</option>
                <option value="Link">🔗 Link/URL</option>
                <option value="File">📁 File Upload</option>
                <option value="Checklist">✅ Checklist</option>
                <option value="Other">🔧 Other</option>
              </select>
              <div style={{
                marginTop: 10,
                padding: 12,
                background: '#e3f2fd',
                borderRadius: 8,
                fontSize: '0.9rem',
                color: '#1976d2'
              }}>
                <strong>📋 What students will see:</strong>
                <div style={{ marginTop: 6 }}>
                  {draftType === 'Text' && '• Students can upload files with text instructions'}
                  {draftType === 'Link' && '• Students can submit links/URLs'}
                  {draftType === 'File' && '• Students can upload files only'}
                  {draftType === 'Checklist' && '• Students can check off completed tasks'}
                  {draftType === 'Other' && '• Students can upload files with general requirements'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 30 }}>
              <label htmlFor={`instructions-${subjectId}`} style={{
                fontWeight: 600,
                color: '#0277bd',
                display: 'block',
                marginBottom: 8,
                fontSize: '1rem'
              }}>
                Instructions for Students:
              </label>
              <textarea
                id={`instructions-${subjectId}`}
                value={draftInstructions}
                placeholder={placeholder}
                onChange={e => setDraftInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 15,
                  border: '2px solid #e1f5fe',
                  fontSize: '1rem',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                  minHeight: 100,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{
                marginTop: 8,
                padding: 10,
                background: '#fff3e0',
                borderRadius: 8,
                fontSize: '0.85rem',
                color: '#f57c00',
                border: '1px solid #ffcc02'
              }}>
                <strong>💡 Tip:</strong> Be specific about file formats, content requirements, or any special instructions students should follow.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 15,
              justifyContent: 'center'
            }}>
              <button
                onClick={handleModalClose}
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
                  minWidth: 120
                }}
              >
                Cancel
              </button>
              <button
                disabled={saving[subjectId]}
                onClick={async () => {
                  // Optimistically update requirements state, then save
                  const newReq = {
                    type: draftType,
                    instructions: draftInstructions,
                    checklist: draftType === 'Checklist' ? [] : undefined
                  };
                  setRequirements(prev => ({ ...prev, [subjectId]: newReq }));
                  await handleSave(subjectId, newReq);
                  handleModalClose();
                }}
                className="btn-hover"
                style={{
                  background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: 25,
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  minWidth: 120
                }}
              >
                {saving[subjectId] ? 'Saving...' : 'Save Requirement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div style={{ textAlign: 'center', marginBottom: 40, ...slideInLeft }}>
          <h1 style={{ 
            color: '#0277bd', 
            fontWeight: 900, 
            fontSize: '2.5rem', 
            marginBottom: 10, 
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(2,119,189,0.1)'
          }}>
            📚 Subject Requirements Manager
          </h1>
          <p style={{ 
            color: '#546e7a', 
            fontSize: '1.1rem', 
            maxWidth: 600, 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Set and manage requirements for your subjects efficiently
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
          borderRadius: 20, 
          boxShadow: '0 10px 30px rgba(2,119,189,0.1)', 
          padding: 30,
          marginBottom: 30,
          ...slideInLeft
        }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: 25
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
            <h3 style={{ 
              color: '#0277bd', 
              fontWeight: 700, 
              fontSize: '1.5rem',
              marginBottom: 8,
              letterSpacing: '0.5px'
            }}>
              Filter Subjects
            </h3>
            <p style={{ 
              color: '#546e7a', 
              fontSize: '0.9rem' 
            }}>
              Filter by year level and semester
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              fontWeight: 600, 
              color: '#0277bd', 
              display: 'block', 
              marginBottom: 10,
              fontSize: '1rem'
            }}>
              Year Level:
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {yearLevels.map(year => {
                const hasSubjects = year === 'All' ? true : subjects.some(s => s.year_level === year);
                return (
                  <button
                    key={year}
                    style={{
                      background: activeYear === year ? 
                        'linear-gradient(135deg, #1976d2 0%, #0277bd 100%)' :
                        'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 25,
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: hasSubjects ? 'pointer' : 'not-allowed',
                      opacity: hasSubjects ? 1 : 0.5,
                      boxShadow: activeYear === year ? 
                        '0 6px 20px rgba(25,118,210,0.3)' :
                        '0 4px 15px rgba(144,164,174,0.3)'
                    }}
                    onClick={() => hasSubjects && setActiveYear(year)}
                    disabled={!hasSubjects}
                    className="btn-hover"
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ 
              fontWeight: 600, 
              color: '#0277bd', 
              display: 'block', 
              marginBottom: 10,
              fontSize: '1rem'
            }}>
              Semester:
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {semesters.map(sem => {
                const hasSubjects = sem === 'All' ? true : subjects.some(s => 
                  (activeYear === 'All' || s.year_level === activeYear) && s.semester === sem
                );
                return (
                  <button
                    key={sem}
                    style={{
                      background: activeSemester === sem ? 
                        'linear-gradient(135deg, #1976d2 0%, #0277bd 100%)' :
                        'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 25,
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: hasSubjects ? 'pointer' : 'not-allowed',
                      opacity: hasSubjects ? 1 : 0.5,
                      boxShadow: activeSemester === sem ? 
                        '0 6px 20px rgba(25,118,210,0.3)' :
                        '0 4px 15px rgba(144,164,174,0.3)'
                    }}
                    onClick={() => hasSubjects && setActiveSemester(sem)}
                    disabled={!hasSubjects}
                    className="btn-hover"
                  >
                    {sem}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
                Manage requirements for your subjects
              </p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 'bold' }}>
              {filteredSubjects.length} Subject{filteredSubjects.length !== 1 ? 's' : ''}
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
            ) : filteredSubjects.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#90a4ae', 
                padding: 60,
                ...fadeInUp
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>📭</div>
                <h4 style={{ marginBottom: 12, color: '#546e7a', fontSize: '1.1rem' }}>
                  No subjects found
                </h4>
                <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>
                  No subjects match your current filter selection
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: 25 
              }}>
                {filteredSubjects.map((subj, index) => {
                  const hasRequirements = subj.requirements && subj.requirements.trim();
                  
                  return (
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
                      
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 15,
                        right: 15,
                        background: success[subj.subject_id] ? 
                          'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' :
                          hasRequirements ? 
                            'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)' :
                            'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: 'white',
                        borderRadius: 20,
                        padding: '5px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        {success[subj.subject_id] ? '✅ Saved!' : 
                         hasRequirements ? '📝 Set' : '⚠️ Pending'}
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
                        {hasRequirements && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ fontSize: '1rem', marginTop: 2 }}>📋</span>
                            <div style={{ flex: 1 }}>
                              <strong>Requirement Type:</strong>
                              <div style={{ 
                                marginTop: 5, 
                                padding: 8, 
                                background: '#f1f8e9', 
                                borderRadius: 6,
                                fontSize: '0.85rem'
                              }}>
                                {(() => {
                                  try {
                                    const parsed = JSON.parse(subj.requirements);
                                    if (parsed.type === 'Text') {
                                      return '📝 Text Instructions - Students upload files with instructions';
                                    }
                                    if (parsed.type === 'File') {
                                      return '📁 File Upload - Students upload files only';
                                    }
                                    if (parsed.type === 'Link') {
                                      return '🔗 Link/URL - Students submit links/URLs';
                                    }
                                    if (parsed.type === 'Checklist') {
                                      return '✅ Checklist - Students complete checklist tasks';
                                    }
                                    if (parsed.type === 'Other') {
                                      return '🔧 Other - Students upload files with general requirements';
                                    }
                                    return parsed.type;
                                  } catch {
                                    return 'Not set';
                                  }
                                })()}
                              </div>
                              {(() => {
                                try {
                                  const parsed = JSON.parse(subj.requirements);
                                  if (parsed.instructions && parsed.instructions.trim()) {
                                    return (
                                      <div style={{ marginTop: 10 }}>
                                        <strong>Instructions for Students:</strong>
                                        <div style={{ 
                                          marginTop: 5, 
                                          padding: 8, 
                                          background: '#e3f2fd', 
                                          borderRadius: 6,
                                          fontSize: '0.85rem',
                                          fontStyle: 'italic',
                                          color: '#1976d2'
                                        }}>
                                          "{parsed.instructions}"
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                } catch {
                                  return null;
                                }
                              })()}
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
                            minWidth: 150,
                            boxShadow: '0 4px 15px rgba(33,150,243,0.3)'
                          }}
                          onClick={() => openRequirementModal(subj)}
                        >
                          ⚙️ Set Requirement Type
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <RequirementModal />
        {/* ConfirmModal removed for direct save UX */}
      </div>
    </div>
  );
};

export default TeacherSubjectRequirements;
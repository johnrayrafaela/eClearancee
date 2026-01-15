import React, { useContext, useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { typeScale, fadeInUp, slideInLeft, bounceIn, keyframes } from '../../style/CommonStyles';

const TeacherSubjectRequirements = () => {
  const { user, userType } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('All');
  const [activeSemester, setActiveSemester] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  api.get(`/subject/teacher/${user.teacher_id}`)
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
        checklist: reqObj.type === 'Checklist' ? (Array.isArray(reqObj.checklist) ? reqObj.checklist : []) : undefined
      };
      
  await api.patch(`/subject/${subject_id}/requirements`, {
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

  // Filter subjects by active year level, semester, and search term
  let filteredSubjects = subjects;
  if (activeYear !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.year_level === activeYear);
  }
  if (activeSemester !== 'All') {
    filteredSubjects = filteredSubjects.filter(s => s.semester === activeSemester);
  }
  if (searchTerm) {
    filteredSubjects = filteredSubjects.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
    const [draftChecklistInput, setDraftChecklistInput] = useState('');
    const [draftChecklistItems, setDraftChecklistItems] = useState(
      storedReq.type === 'Checklist' && Array.isArray(storedReq.checklist) ? storedReq.checklist : []
    );

    // Sync drafts when a new subject is opened
    useEffect(() => {
      if (visible && subjectId) {
        const base = requirements[subjectId] || { type: 'Text', instructions: '' };
        setDraftType(base.type || 'Text');
        setDraftInstructions(base.instructions || '');
        setDraftChecklistItems(base.type === 'Checklist' && Array.isArray(base.checklist) ? base.checklist : []);
        setDraftChecklistInput('');
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

            {draftType === 'Checklist' && (
              <div style={{ marginBottom: 30 }}>
                <label style={{ fontWeight:600, color:'#0277bd', display:'block', marginBottom:8, fontSize:'1rem' }}>Checklist Items (All must be completed by student)</label>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <input
                    type="text"
                    value={draftChecklistInput}
                    onChange={e=>setDraftChecklistInput(e.target.value)}
                    placeholder="Add checklist item..."
                    style={{ flex:1, padding:'10px 14px', borderRadius:12, border:'2px solid #e1f5fe', fontSize:'.9rem', background:'#f8fafc', outline:'none' }}
                    onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); if(draftChecklistInput.trim()){ setDraftChecklistItems(prev=>[...prev, draftChecklistInput.trim()]); setDraftChecklistInput(''); } } }}
                  />
                  <button
                    type="button"
                    onClick={()=>{ if(draftChecklistInput.trim()){ setDraftChecklistItems(prev=>[...prev, draftChecklistInput.trim()]); setDraftChecklistInput(''); } }}
                    style={{ background:'linear-gradient(135deg,#0277bd 0%,#01579b 100%)', color:'#fff', border:'none', padding:'10px 16px', borderRadius:12, fontWeight:600, cursor:'pointer', fontSize:'.8rem' }}
                  >Add</button>
                </div>
                {draftChecklistItems.length === 0 && (
                  <div style={{ fontSize:'.65rem', fontStyle:'italic', color:'#666', marginBottom:8 }}>No items added yet.</div>
                )}
                <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:6 }}>
                  {draftChecklistItems.map((item,i)=>(
                    <li key={i} style={{ background:'#f1f5f9', padding:'8px 10px', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:'.7rem', fontWeight:700, color:'#0277bd' }}>{i+1}.</span>
                      <span style={{ flex:1, fontSize:'.7rem' }}>{item}</span>
                      <button
                        onClick={()=> setDraftChecklistItems(prev => prev.filter((_,idx)=> idx!==i))}
                        style={{ background:'rgba(0,0,0,0.1)', border:'none', color:'#333', padding:'4px 8px', borderRadius:8, cursor:'pointer', fontSize:'.55rem', fontWeight:600 }}
                      >✕</button>
                    </li>
                  ))}
                </ul>
                {draftChecklistItems.length > 0 && (
                  <div style={{ marginTop:8, fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#0277bd', fontWeight:700 }}>{draftChecklistItems.length} Item{draftChecklistItems.length>1?'s':''} Added</div>
                )}
              </div>
            )}

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
                    checklist: draftType === 'Checklist' ? draftChecklistItems : undefined
                  };
                  if (draftType === 'Checklist' && (!draftChecklistItems || draftChecklistItems.length === 0)) {
                    alert('Add at least one checklist item before saving.');
                    return;
                  }
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
        margin: '16px auto', 
        padding: '20px 18px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)', 
        borderRadius: 16, 
        boxShadow: '0 10px 28px rgba(2,119,189,0.08)',
        maxWidth: '1400px',
        ...fadeInUp
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 22, ...slideInLeft }}>
          <h1 style={{ 
            color: '#0277bd', 
            fontWeight: 700, 
            fontSize: typeScale.xxl, 
            marginBottom: 6, 
            letterSpacing: '.5px'
          }}>
            📚 Subject Requirements Manager
          </h1>
          <p style={{ 
            color: '#546e7a', 
            fontSize: typeScale.lg, 
            maxWidth: 520, 
            margin: '0 auto',
            lineHeight: 1.35
          }}>
            Set and manage requirements for your subjects efficiently
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
            borderRadius: 16, 
            boxShadow: '0 6px 20px rgba(2,119,189,0.08)', 
            padding: 18,
            marginBottom: 20,
            ...slideInLeft
        }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: 25
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🔍</div>
            <h3 style={{ 
              color: '#0277bd', 
              fontWeight: 600, 
              fontSize: typeScale.xxl,
              marginBottom: 4,
              letterSpacing: '.25px'
            }}>
              Filter Subjects
            </h3>
            <p style={{ 
              color: '#546e7a', 
              fontSize: typeScale.lg 
            }}>
              Filter by year level and semester
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              fontWeight: 600, 
              color: '#0277bd', 
              display: 'block', 
              marginBottom: 6,
              fontSize: typeScale.xl
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
                      borderRadius: 18,
                      padding: '6px 12px',
                      fontSize: typeScale.lg,
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
              marginBottom: 6,
              fontSize: typeScale.xl
            }}>
              Semester:
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                      borderRadius: 18,
                      padding: '6px 12px',
                      fontSize: typeScale.lg,
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

        {/* Search Bar */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
          borderRadius: 16, 
          padding: '18px', 
          marginBottom: 20,
          boxShadow: '0 6px 20px rgba(2,119,189,0.08)',
          ...slideInLeft
        }}>
          <input
            type="text"
            placeholder="🔍 Search subjects by name, course, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-focus"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: '2px solid #e1f5fe',
              fontSize: '.95rem',
              outline: 'none',
              background: '#f8fafc',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
          />
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
            padding: '14px 16px', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{ fontSize: '2rem' }}>📚</div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontWeight: 600, 
                fontSize: typeScale.xxl,
                letterSpacing: '.25px'
              }}>
                My Subjects
              </h3>
              <p style={{ 
                margin: '2px 0 0 0', 
                opacity: 0.9,
                fontSize: typeScale.lg
              }}>
                Manage requirements for your subjects
              </p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 'bold' }}>
              {filteredSubjects.length} Subject{filteredSubjects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Subjects Content */}
            <div style={{ padding: '18px 20px' }}>
            {loading ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: 16 
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
                        borderRadius: 12, 
                        padding: 16, 
                        border: '2px solid #e8f5e8',
                        boxShadow: '0 6px 18px rgba(76,175,80,0.12)',
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
                        marginBottom: 10, 
                        fontSize: typeScale.xxl,
                        fontWeight: 600,
                        paddingRight: 80
                      }}>
                        📖 {subj.name}
                      </h4>
                      
                      <div style={{ marginBottom: 15, color: '#546e7a' }}>
                        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>🎓</span>
                          <div>
                            <strong>Course:</strong> {subj.course}
                          </div>
                        </div>
                        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>📅</span>
                          <div>
                            <strong>Year Level:</strong> {subj.year_level}
                          </div>
                        </div>
                        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                                marginTop: 4, 
                                padding: '6px 8px', 
                                background: '#f1f8e9', 
                                borderRadius: 6,
                                fontSize: typeScale.lg
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
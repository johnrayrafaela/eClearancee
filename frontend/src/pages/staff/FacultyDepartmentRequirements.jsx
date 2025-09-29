import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { typeScale, fadeInUp, slideInLeft, bounceIn, keyframes } from '../../style/CommonStyles';

// Staff Department Requirements Manager (styled & structured like Teacher Subject Requirements)
// NOTE: No feature to add departments (only manage existing assigned ones) per user request.

const FacultyDepartmentRequirements = () => {
  const { user, userType } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]); // raw list from API
  const [requirements, setRequirements] = useState({}); // { deptId: { type, instructions } }
  const [saving, setSaving] = useState({}); // { deptId: bool }
  const [success, setSuccess] = useState({}); // { deptId: bool }
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const modalAnimatedRef = useRef(false);

  // Fetch departments assigned to staff
  useEffect(() => {
    if (!user || userType !== 'staff') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/departments/staff/${user.staff_id}`)
      .then(res => {
        setDepartments(res.data);
        const reqs = {};
        res.data.forEach(dep => {
          let parsed = { type: 'Text', instructions: '' };
            if (dep.requirements) {
              try {
                parsed = JSON.parse(dep.requirements);
                if (!parsed.instructions) parsed.instructions = '';
                if (!parsed.type) parsed.type = 'Text';
              } catch {
                parsed = { type: 'Text', instructions: dep.requirements };
              }
            }
            reqs[dep.department_id] = parsed;
        });
        setRequirements(reqs);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const handleSave = async (department_id, override) => {
    setSaving(prev => ({ ...prev, [department_id]: true }));
    setSuccess(prev => ({ ...prev, [department_id]: false }));
    try {
      const reqObj = override || requirements[department_id] || { type: 'Text', instructions: '' };
      const payload = {
        type: reqObj.type,
        instructions: reqObj.instructions || '',
        checklist: reqObj.type === 'Checklist' ? (Array.isArray(reqObj.checklist) ? reqObj.checklist : []) : undefined
      };

      await axios.patch(`http://localhost:5000/api/departments/${department_id}/requirements`, {
        requirements: JSON.stringify(payload)
      });

      setSuccess(prev => ({ ...prev, [department_id]: true }));
      // update local departments array
      setDepartments(prev => prev.map(d => d.department_id === department_id ? { ...d, requirements: JSON.stringify(payload) } : d));
      // update local requirements state
      setRequirements(prev => ({ ...prev, [department_id]: payload }));
      setTimeout(() => setSuccess(prev => ({ ...prev, [department_id]: false })), 3000);
    } catch (err) {
      console.error('Error saving requirement:', err);
      alert('Failed to save requirement.');
    }
    setSaving(prev => ({ ...prev, [department_id]: false }));
  };

  const openRequirementModal = (department) => {
    setSelectedDepartment(department);
    modalAnimatedRef.current = false; // allow bounce retigger
    setShowModal(true);
  };

  // Requirement Modal (similar pattern to teacher's modal)
  const RequirementModal = () => {
    const visible = showModal && selectedDepartment;
    const deptId = selectedDepartment?.department_id;
    const storedReq = (deptId && requirements[deptId]) || { type: 'Text', instructions: '' };
    const [draftType, setDraftType] = useState(storedReq.type || 'Text');
    const [draftInstructions, setDraftInstructions] = useState(storedReq.instructions || '');
    const [draftChecklistInput, setDraftChecklistInput] = useState('');
    const [draftChecklistItems, setDraftChecklistItems] = useState(
      storedReq.type === 'Checklist' && Array.isArray(storedReq.checklist) ? storedReq.checklist : []
    );

    useEffect(() => {
      if (visible && deptId) {
        const base = requirements[deptId] || { type: 'Text', instructions: '' };
        setDraftType(base.type || 'Text');
        setDraftInstructions(base.instructions || '');
        setDraftChecklistItems(base.type === 'Checklist' && Array.isArray(base.checklist) ? base.checklist : []);
        setDraftChecklistInput('');
      }
    }, [visible, deptId]);

    useEffect(() => {
      if (visible) {
        modalAnimatedRef.current = false;
      }
    }, [visible, deptId]);

    const handleModalClose = () => setShowModal(false);
    const handleOverlayClick = (e) => { if (e.target === e.currentTarget) handleModalClose(); };

    const placeholder = `Enter clear instructions for students about what they need to ${
      draftType === 'Link' ? 'submit as a link' :
      draftType === 'File' ? 'upload as a file' :
      draftType === 'Checklist' ? 'complete in the checklist' :
      'provide for this requirement'
    }...`;

    const bounceStyle = modalAnimatedRef.current ? {} : bounceIn;
    if (!visible) return null;
    if (!modalAnimatedRef.current) modalAnimatedRef.current = true;

    return (
      <div
        style={{
          position: 'fixed', top:0, left:0, width:'100vw', height:'100vh',
          background:'rgba(0,0,0,0.6)', zIndex: 9999,
          display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(5px)', ...fadeInUp
        }}
        onClick={handleOverlayClick}
      >
        <div
          style={{
            background:'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            borderRadius:20, boxShadow:'0 25px 60px rgba(0,0,0,0.3)',
            padding:40, width:'90%', maxWidth:600, maxHeight:'90vh', overflowY:'auto',
            ...bounceStyle
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ textAlign:'center', marginBottom:30 }}>
            <div style={{ fontSize:'3rem', marginBottom:15 }}>🏢</div>
            <h3 style={{ color:'#0277bd', fontWeight:900, fontSize:'1.8rem', marginBottom:10, letterSpacing:'1px' }}>
              Set Requirement Type: {selectedDepartment?.name}
            </h3>
            <p style={{ color:'#546e7a', fontSize:'1rem' }}>Choose what type of submission students need to provide</p>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ background:'#f8fafc', padding:15, borderRadius:8, border:'1px solid #e0e7ff', marginBottom:20 }}>
              <div style={{ fontSize:'0.9rem', color:'#6b7280' }}>
                <strong>Description:</strong> {selectedDepartment?.description || '—'}
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <label htmlFor={`dept-req-type-${deptId}`} style={{ fontWeight:600, color:'#0277bd', display:'block', marginBottom:8, fontSize:'1rem' }}>
                Requirement Type:
              </label>
              <select
                id={`dept-req-type-${deptId}`}
                value={draftType}
                onChange={e => setDraftType(e.target.value)}
                style={{ width:'100%', padding:'12px 20px', borderRadius:15, border:'2px solid #e1f5fe', fontSize:'1rem', outline:'none', background:'#f8fafc', boxSizing:'border-box' }}
              >
                <option value="Text">📝 Text Instructions</option>
                <option value="Link">🔗 Link/URL</option>
                <option value="File">📁 File Upload</option>
                <option value="Checklist">✅ Checklist</option>
                <option value="Other">🔧 Other</option>
              </select>
              <div style={{ marginTop:10, padding:12, background:'#e3f2fd', borderRadius:8, fontSize:'0.9rem', color:'#1976d2' }}>
                <strong>📋 What students will see:</strong>
                <div style={{ marginTop:6 }}>
                  {draftType === 'Text' && '• Students can upload files with text instructions'}
                  {draftType === 'Link' && '• Students can submit links/URLs'}
                  {draftType === 'File' && '• Students can upload files only'}
                  {draftType === 'Checklist' && '• Students can check off completed tasks'}
                  {draftType === 'Other' && '• Students can upload files with general requirements'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom:30 }}>
              <label htmlFor={`dept-instructions-${deptId}`} style={{ fontWeight:600, color:'#0277bd', display:'block', marginBottom:8, fontSize:'1rem' }}>
                Instructions for Students:
              </label>
              <textarea
                id={`dept-instructions-${deptId}`}
                value={draftInstructions}
                placeholder={placeholder}
                onChange={e => setDraftInstructions(e.target.value)}
                style={{ width:'100%', padding:'12px 20px', borderRadius:15, border:'2px solid #e1f5fe', fontSize:'1rem', outline:'none', background:'#f8fafc', boxSizing:'border-box', minHeight:100, resize:'vertical', fontFamily:'inherit' }}
              />
              <div style={{ marginTop:8, padding:10, background:'#fff3e0', borderRadius:8, fontSize:'0.85rem', color:'#f57c00', border:'1px solid #ffcc02' }}>
                <strong>💡 Tip:</strong> Be specific about formats, document names, or steps students must follow.
              </div>
            </div>

            {draftType === 'Checklist' && (
              <div style={{ marginBottom:30 }}>
                <label style={{ fontWeight:600, color:'#0277bd', display:'block', marginBottom:8, fontSize:'1rem' }}>Checklist Items (All must be completed)</label>
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

            <div style={{ display:'flex', gap:15, justifyContent:'center' }}>
              <button
                onClick={handleModalClose}
                style={{ background:'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)', color:'#fff', border:'none', padding:'12px 30px', borderRadius:25, fontWeight:600, fontSize:'1rem', cursor:'pointer', minWidth:120 }}
              >
                Cancel
              </button>
              <button
                disabled={saving[deptId]}
                onClick={async () => {
                  const newReq = { type: draftType, instructions: draftInstructions, checklist: draftType === 'Checklist' ? draftChecklistItems : undefined };
                  if (draftType === 'Checklist' && (!draftChecklistItems || draftChecklistItems.length === 0)) {
                    alert('Add at least one checklist item before saving.');
                    return;
                  }
                  setRequirements(prev => ({ ...prev, [deptId]: newReq }));
                  await handleSave(deptId, newReq);
                  handleModalClose();
                }}
                style={{ background:'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', color:'#fff', border:'none', padding:'12px 30px', borderRadius:25, fontWeight:600, fontSize:'1rem', cursor:'pointer', minWidth:160 }}
              >
                {saving[deptId] ? 'Saving...' : 'Save Requirement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user || userType !== 'staff') {
    return (
      <div style={{ color:'#e11d48', padding:40, textAlign:'center', background:'linear-gradient(135deg, #fff 0%, #fee 100%)', borderRadius:20, margin:20, boxShadow:'0 10px 30px rgba(225,29,72,0.1)', ...fadeInUp }}>
        <div style={{ fontSize:48, marginBottom:20 }}>🚫</div>
        <h3 style={{ marginBottom:10 }}>Access Denied</h3>
        <p>Only staff can access this page.</p>
      </div>
    );
  }

  // Derived list (no filters currently; keep structure open for future)
  const listedDepartments = departments;

  return (
    <div>
      <style>{keyframes}</style>
      <div style={{ margin:'16px auto', padding:'20px 18px', background:'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)', borderRadius:16, boxShadow:'0 10px 28px rgba(2,119,189,0.08)', maxWidth:'1400px', ...fadeInUp }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:22, ...slideInLeft }}>
          <h1 style={{ color:'#0277bd', fontWeight:700, fontSize:typeScale.xxl, marginBottom:6, letterSpacing:'.5px' }}>🏢 Department Requirements Manager</h1>
          <p style={{ color:'#546e7a', fontSize:typeScale.lg, maxWidth:620, margin:'0 auto', lineHeight:1.35 }}>
            Manage requirement types and instructions for your assigned departments
          </p>
          <div style={{ marginTop:10, fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'1px', color:'#0277bd', fontWeight:700 }}>No department creation here — only manage existing ones</div>
        </div>

        {/* Departments Section */}
        <div style={{ background:'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', borderRadius:20, boxShadow:'0 10px 30px rgba(2,119,189,0.1)', overflow:'hidden', ...slideInLeft }}>
          <div style={{ background:'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:'2rem' }}>🏢</div>
            <div>
              <h3 style={{ margin:0, fontWeight:600, fontSize:typeScale.xxl, letterSpacing:'.25px' }}>My Departments</h3>
              <p style={{ margin:'2px 0 0 0', opacity:0.9, fontSize:typeScale.lg }}>Manage requirements for each department</p>
            </div>
            <div style={{ marginLeft:'auto', fontSize:'1rem', fontWeight:'bold' }}>{listedDepartments.length} Department{listedDepartments.length !== 1 ? 's' : ''}</div>
          </div>

          <div style={{ padding:'18px 20px' }}>
            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background:'#f0f0f0', borderRadius:15, padding:25, height:200, ...fadeInUp }} className="loading-shimmer" />
                ))}
              </div>
            ) : listedDepartments.length === 0 ? (
              <div style={{ textAlign:'center', color:'#90a4ae', padding:60, ...fadeInUp }}>
                <div style={{ fontSize:'3.5rem', marginBottom:20 }}>📭</div>
                <h4 style={{ marginBottom:12, color:'#546e7a', fontSize:'1.1rem' }}>No departments found</h4>
                <p style={{ marginBottom:20, fontSize:'0.9rem' }}>You currently have no assigned departments.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:25 }}>
                {listedDepartments.map((dep, index) => {
                  const hasRequirements = dep.requirements && dep.requirements.trim();
                  let parsed = null;
                  if (hasRequirements) {
                    try { parsed = JSON.parse(dep.requirements); } catch { /* ignore */ }
                  }
                  return (
                    <div key={dep.department_id} className="card-hover" style={{ background:'linear-gradient(135deg, #fff 0%, #e8f5e8 100%)', borderRadius:12, padding:16, border:'2px solid #e8f5e8', boxShadow:'0 6px 18px rgba(76,175,80,0.12)', position:'relative', overflow:'hidden', ...fadeInUp, animationDelay:`${index * 0.1}s` }}>
                      <div style={{ position:'absolute', top:15, right:15, background: success[dep.department_id] ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : hasRequirements ? 'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color:'white', borderRadius:20, padding:'5px 12px', fontSize:'0.8rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:5 }}>
                        {success[dep.department_id] ? '✅ Saved!' : hasRequirements ? '📝 Set' : '⚠️ Pending'}
                      </div>
                      <h4 style={{ color:'#2e7d32', marginBottom:10, fontSize:typeScale.xxl, fontWeight:600, paddingRight:80 }}>🏷️ {dep.name}</h4>
                      <div style={{ marginBottom:15, color:'#546e7a' }}>
                        <div style={{ marginBottom:6, display:'flex', alignItems:'flex-start', gap:8 }}>
                          <span style={{ fontSize:'1rem' }}>ℹ️</span>
                          <div><strong>Description:</strong> {dep.description || '—'}</div>
                        </div>
                        {hasRequirements && (
                          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                            <span style={{ fontSize:'1rem', marginTop:2 }}>📋</span>
                            <div style={{ flex:1 }}>
                              <strong>Requirement Type:</strong>
                              <div style={{ marginTop:4, padding:'6px 8px', background:'#f1f8e9', borderRadius:6, fontSize:typeScale.lg }}>
                                {(() => {
                                  if (!parsed) return 'Not set';
                                  if (parsed.type === 'Text') return '📝 Text Instructions - Students upload files with instructions';
                                  if (parsed.type === 'File') return '📁 File Upload - Students upload files only';
                                  if (parsed.type === 'Link') return '🔗 Link/URL - Students submit links/URLs';
                                  if (parsed.type === 'Checklist') return '✅ Checklist - Students complete checklist tasks';
                                  if (parsed.type === 'Other') return '🔧 Other - General requirements';
                                  return parsed.type;
                                })()}
                              </div>
                              {parsed?.instructions && parsed.instructions.trim() && (
                                <div style={{ marginTop:10 }}>
                                  <strong>Instructions for Students:</strong>
                                  <div style={{ marginTop:5, padding:8, background:'#e3f2fd', borderRadius:6, fontSize:'0.85rem', fontStyle:'italic', color:'#1976d2' }}>
                                    "{parsed.instructions}"
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        <button
                          style={{ background:'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)', color:'#fff', border:'none', borderRadius:20, padding:'10px 18px', fontWeight:600, cursor:'pointer', fontSize:'0.9rem', flex:1, minWidth:150, boxShadow:'0 4px 15px rgba(33,150,243,0.3)' }}
                          onClick={() => openRequirementModal(dep)}
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

        <RequirementModal />
      </div>
    </div>
  );
};

export default FacultyDepartmentRequirements;

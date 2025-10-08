import React, { useContext, useEffect, useState } from 'react';
import api, { buildFileUrl } from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import {
  pageStyles,
  cardStyles,
  buttonStyles,
  headerStyles,
  gradients,
  fadeInUp,
  slideInLeft,
  slideInRight,
  keyframes,
  injectKeyframes
} from '../../style/CommonStyles';

// Lightweight local style helpers (table similar to TeacherSubjectRequests)
const tableStyles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', marginTop: 18 },
  th: { background: gradients.primary, color: '#fff', padding: '12px 10px', fontWeight: 700, fontSize: '.75rem', textAlign: 'left', letterSpacing: '.5px' },
  td: { padding: '10px 10px', borderBottom: '1px solid #e5e7eb', fontSize: '.7rem', color: '#374151', verticalAlign: 'top' },
  even: { background: '#f9fafb' }
};


const semesters = ['1st', '2nd'];
const courses = [
  'BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'
];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const blocks = ['A', 'B', 'C', 'D'];

const FacultyDepartmentRequests = () => {
  const { user, userType } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]); // bulk selection
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    if (!user || userType !== 'staff') return;
    setLoading(true);
  api.get('/department-status/staff-requests', { params: { staff_id: user.staff_id } })
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Filter requests by course, year, block, semester, and search
  const filteredRequests = requests.filter(req => {
    const matchCourse = selectedCourse ? req.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? req.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? req.student?.block === selectedBlock : true;
    const matchSemester = selectedSemester ? req.semester === selectedSemester : true;
    const matchSearch = search.trim() ? (
      (req.student?.firstname + ' ' + req.student?.lastname).toLowerCase().includes(search.trim().toLowerCase())
    ) : true;
    return matchCourse && matchYear && matchBlock && matchSemester && matchSearch;
  });

  // Separate requests by status
  const pending = filteredRequests.filter(r => r.status === 'Requested');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');

  let currentData = [];
  if (tab === 'Pending') currentData = pending;
  else if (tab === 'Approved') currentData = approved;
  else if (tab === 'Rejected') currentData = rejected;

  // Reject modal (single or bulk)
  const [rejectModal, setRejectModal] = useState({ open:false, bulk:false, ids:[], id:null, remarks:'', submitting:false, error:'' });
  const [requirementsModal, setRequirementsModal] = useState(null); // { title, content, type }

  const handleRespond = async (id, status, remarksValue) => {
    const payload = { status };
    if (status === 'Rejected' && remarksValue?.trim()) payload.remarks = remarksValue.trim();
  await api.patch(`/department-status/${id}/respond`, payload);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, remarks: payload.remarks || (status === 'Approved' ? null : r.remarks) } : r));
    setSelectedRequestIds(prev => prev.filter(x => x !== id));
  };

  // Modal controls
  const openRejectSingle = (id) => {
    const existing = requests.find(r => r.id === id);
    setRejectModal({ open:true, bulk:false, ids:[], id, remarks: existing?.remarks || '', submitting:false, error:'' });
  };
  const openRejectBulk = () => {
    if (!selectedRequestIds.length) return;
    setRejectModal({ open:true, bulk:true, ids:[...selectedRequestIds], id:null, remarks:'', submitting:false, error:'' });
  };
  const closeReject = () => setRejectModal({ open:false, bulk:false, ids:[], id:null, remarks:'', submitting:false, error:'' });
  const submitReject = async () => {
    if (!rejectModal.remarks.trim()) { setRejectModal(m => ({ ...m, error:'Remarks required.' })); return; }
    setRejectModal(m => ({ ...m, submitting:true, error:'' }));
    try {
      if (rejectModal.bulk) {
        for (const id of rejectModal.ids) {
          await handleRespond(id, 'Rejected', rejectModal.remarks);
        }
      } else if (rejectModal.id) {
        await handleRespond(rejectModal.id, 'Rejected', rejectModal.remarks);
      }
      closeReject();
    } catch {
      setRejectModal(m => ({ ...m, submitting:false, error:'Failed to submit.' }));
    }
  };

  // Bulk selection helpers
  const toggleSelect = (id) => setSelectedRequestIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAllVisible = (ids) => {
    const allSelected = ids.every(id => selectedRequestIds.includes(id));
    setSelectedRequestIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])));
  };

  // Bulk approve selected
  const approveSelected = async () => {
    if (!selectedRequestIds.length) return;
    setBulkLoading(true);
    try { await Promise.all(selectedRequestIds.map(id => handleRespond(id, 'Approved'))); } finally { setBulkLoading(false); }
  };
  const approveAllPending = async (pendingIds) => {
    if (!pendingIds.length) return;
    setBulkLoading(true);
    try { await Promise.all(pendingIds.map(id => handleRespond(id, 'Approved'))); } finally { setBulkLoading(false); }
  };

  // Requirements (department record may carry a simple string)
  const renderRequirements = (req) => {
    if (!req.requirements) return <span style={{ color:'#9ca3af' }}>-</span>;
    let parsed = null;
    try { parsed = JSON.parse(req.requirements); } catch {/* plain string */}
    const type = parsed?.type || (parsed ? 'Structured' : 'Text');
    if (parsed) {
      if (parsed.type === 'Checklist') {
        const items = parsed.checklist || [];
        const preview = items.slice(0,2).map((c,i)=>(<li key={i} style={{ color:'#6b7280' }}>✓ {c}</li>));
        return (
          <div style={{ fontSize:'.5rem', lineHeight:1.2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
              <span style={{ background:'#e0f2fe', color:'#0369a1', padding:'2px 6px', borderRadius:10, fontWeight:600 }}>{items.length} items</span>
              <span style={{ background:'#f1f5f9', color:'#475569', padding:'2px 6px', borderRadius:8 }}>{parsed.type}</span>
            </div>
            <ul style={{ margin:0, paddingLeft:14 }}>{preview}</ul>
            {items.length > 2 && (
              <button onClick={() => setRequirementsModal({ title:`Checklist (${items.length} items)`, type:parsed.type, content: items.map(i=>'• '+i).join('\n') })} style={{ marginTop:4, background:'none', border:'none', color:'#0369a1', cursor:'pointer', fontSize:'.5rem', fontWeight:600 }}>View all</button>
            )}
          </div>
        );
      }
      if (parsed.type === 'Instructions') {
        const text = parsed.instructions || parsed.value || '-';
        const truncated = text.length > 40 ? text.slice(0,40)+'…' : text;
        return (
          <div style={{ fontSize:'.5rem', lineHeight:1.2 }}>
            <div style={{ display:'flex', gap:4, marginBottom:2 }}>
              <span style={{ background:'#f1f5f9', color:'#475569', padding:'2px 6px', borderRadius:8 }}>Instructions</span>
              {parsed.link && <span style={{ background:'#e0f2fe', color:'#0369a1', padding:'2px 6px', borderRadius:8 }}>🔗 Link</span>}
            </div>
            <span>{truncated}</span>
            {(text.length > 40 || parsed.link) && (
              <button onClick={() => setRequirementsModal({ title:'Instructions', type:parsed.type, content: text + (parsed.link ? `\n\nLink: ${parsed.link}` : '') })} style={{ marginLeft:4, background:'none', border:'none', color:'#0369a1', cursor:'pointer', fontSize:'.5rem', fontWeight:600 }}>View</button>
            )}
          </div>
        );
      }
      // Generic structured fallback
      const raw = parsed.instructions || parsed.value || JSON.stringify(parsed,null,2);
      const truncated = raw.length > 40 ? raw.slice(0,40)+'…' : raw;
      return (
        <div style={{ fontSize:'.5rem' }}>
          <span>{truncated}</span>
          {raw.length > 40 && (
            <button onClick={() => setRequirementsModal({ title: type, type, content: raw })} style={{ marginLeft:4, background:'none', border:'none', color:'#0369a1', cursor:'pointer', fontSize:'.5rem', fontWeight:600 }}>View</button>
          )}
        </div>
      );
    }
    // Plain text path
    const text = req.requirements;
    const truncated = text.length > 40 ? text.slice(0,40)+'…' : text;
    return (
      <div style={{ fontSize:'.5rem' }}>
        {truncated}
        {text.length > 40 && (
          <button onClick={() => setRequirementsModal({ title:'Requirements', type:'Text', content:text })} style={{ marginLeft:4, background:'none', border:'none', color:'#0369a1', cursor:'pointer', fontSize:'.5rem', fontWeight:600 }}>View</button>
        )}
      </div>
    );
  };

  const renderTable = (data) => {
    const selectable = data.filter(r => r.status === 'Requested').map(r => r.id);
    const allVisibleSelected = selectable.length && selectable.every(id => selectedRequestIds.includes(id));
    return (
      <div style={{ ...cardStyles.default, padding:0, ...fadeInUp }}>
        {tab === 'Pending' && (
          <div style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #e5e7eb', background:'#f1f5f9', flexWrap:'wrap' }}>
            <strong style={{ fontSize:'.55rem', letterSpacing:'.5px', color:'#0369a1' }}>Bulk:</strong>
            <button disabled={!selectedRequestIds.length || bulkLoading} onClick={approveSelected} style={{ ...buttonStyles.success, fontSize:'.55rem', padding:'6px 10px', opacity: (!selectedRequestIds.length || bulkLoading) ? .6 : 1 }}>Approve ({selectedRequestIds.length})</button>
            <button disabled={!selectedRequestIds.length || bulkLoading} onClick={openRejectBulk} style={{ ...buttonStyles.danger, fontSize:'.55rem', padding:'6px 10px', opacity: (!selectedRequestIds.length || bulkLoading) ? .6 : 1 }}>Reject</button>
            <button disabled={!pending.length || bulkLoading} onClick={() => approveAllPending(pending.map(p => p.id))} style={{ ...buttonStyles.primary, fontSize:'.55rem', padding:'6px 10px', opacity: (!pending.length || bulkLoading) ? .6 : 1 }}>Approve All ({pending.length})</button>
            {bulkLoading && <span style={{ fontSize:'.55rem', color:'#475569' }}>Processing...</span>}
            <div style={{ marginLeft:'auto' }}>
              <input type="checkbox" checked={!!selectable.length && allVisibleSelected} onChange={() => toggleSelectAllVisible(selectable)} />
            </div>
          </div>
        )}
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {tab === 'Pending' && <th style={tableStyles.th}><input type="checkbox" checked={!!selectable.length && allVisibleSelected} onChange={() => toggleSelectAllVisible(selectable)} /></th>}
              <th style={tableStyles.th}>Student</th>
              <th style={tableStyles.th}>Department</th>
              <th style={tableStyles.th}>Sem</th>
              <th style={tableStyles.th}>Course</th>
              <th style={tableStyles.th}>Year</th>
              <th style={tableStyles.th}>Block</th>
              <th style={tableStyles.th}>Status</th>
              <th style={tableStyles.th}>Requirements</th>
              <th style={tableStyles.th}>File</th>
              <th style={tableStyles.th}>Remarks</th>
              <th style={tableStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req,i) => {
              const selected = selectedRequestIds.includes(req.id);
              return (
                <tr key={req.id} style={i % 2 === 0 ? tableStyles.even : {}}>
                  {tab === 'Pending' && <td style={tableStyles.td}>{req.status === 'Requested' && <input type="checkbox" checked={selected} onChange={() => toggleSelect(req.id)} />}</td>}
                  <td style={tableStyles.td}>
                    <div style={{ fontWeight:600, color:'#0369a1' }}>{req.student?.firstname} {req.student?.lastname}</div>
                    <div style={{ fontSize:'.55rem', color:'#64748b' }}>{req.student?.course} {req.student?.year_level} • Block {req.student?.block}</div>
                  </td>
                  <td style={tableStyles.td}>{req.department?.name}</td>
                  <td style={tableStyles.td}><span style={{ background:'#e0f2fe', color:'#0369a1', padding:'2px 8px', borderRadius:12, fontSize:'.55rem', fontWeight:600 }}>{req.semester}</span></td>
                  <td style={tableStyles.td}>{req.student?.course || '-'}</td>
                  <td style={tableStyles.td}>{req.student?.year_level || '-'}</td>
                  <td style={tableStyles.td}>{req.student?.block || '-'}</td>
                  <td style={tableStyles.td}>
                    <span style={{ background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef9c3', color: req.status === 'Approved' ? '#166534' : req.status === 'Rejected' ? '#b91c1c' : '#92400e', padding:'4px 10px', borderRadius:16, fontSize:'.55rem', fontWeight:700 }}>{req.status}</span>
                  </td>
                  <td style={tableStyles.td}>{renderRequirements(req)}</td>
                  <td style={tableStyles.td}>
                    {req.file_path ? (
                      <a
                        href={buildFileUrl(`/department-status/file/${req.department_id}?file=${encodeURIComponent(req.file_path)}`)}
                        target="_blank" rel="noopener noreferrer" style={{ color:'#0369a1', textDecoration:'none', fontSize:'.55rem', fontWeight:600 }}>
                        View File
                      </a>
                    ) : <span style={{ color:'#9ca3af' }}>-</span>}
                  </td>
                  <td style={tableStyles.td}>
                    {req.status === 'Rejected' && req.remarks ? (
                      <div style={{ whiteSpace:'pre-wrap', fontSize:'.5rem', color:'#b91c1c' }}>{req.remarks}</div>
                    ) : req.status === 'Approved' ? (
                      <span style={{ fontSize:'.5rem', color:'#166534', fontStyle:'italic' }}>No remarks</span>
                    ) : (
                      <span style={{ fontSize:'.5rem', color:'#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={tableStyles.td}>
                    {req.status === 'Requested' ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <button style={{ ...buttonStyles.success, fontSize:'.5rem', padding:'6px 8px' }} onClick={() => handleRespond(req.id, 'Approved')}>Approve</button>
                        <button style={{ ...buttonStyles.danger, fontSize:'.5rem', padding:'6px 8px' }} onClick={() => openRejectSingle(req.id)}>Reject</button>
                      </div>
                    ) : (
                      <span style={{ fontSize:'.5rem', fontWeight:600 }}>{req.status}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (!user || userType !== 'staff') {
    return (
      <div style={pageStyles.container}>
        <div style={{ ...cardStyles.danger, padding:40, textAlign:'center', ...fadeInUp }}>
          <h2 style={{ margin:0, color:'#fff' }}>Access Denied</h2>
          <p style={{ marginTop:8, color:'#fff', fontSize:'.75rem' }}>Only staff can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:999 }}>
          <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:500, display:'flex', flexDirection:'column', boxShadow:'0 10px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'14px 18px', background:gradients.primary, color:'#fff', borderTopLeftRadius:14, borderTopRightRadius:14 }}>
              <h3 style={{ margin:0, fontSize:'1rem' }}>{rejectModal.bulk ? `Reject ${rejectModal.ids.length} Requests` : 'Reject Department Request'}</h3>
            </div>
            <div style={{ padding:18 }}>
              <label style={{ display:'block', fontSize:'.55rem', fontWeight:700, marginBottom:6, color:'#334155' }}>Remarks / Feedback (required)</label>
              <textarea value={rejectModal.remarks} onChange={e => setRejectModal(m => ({ ...m, remarks: e.target.value }))} style={{ width:'90%', minHeight:120, resize:'vertical', padding:10, fontSize:'.65rem', border:'2px solid #e2e8f0', borderRadius:8, outline:'none' }} maxLength={800} placeholder="Explain what is missing or incorrect..." />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.5rem', marginTop:4 }}>
                <span>{rejectModal.remarks.length}/800</span>
                {rejectModal.error && <span style={{ color:'#b91c1c' }}>{rejectModal.error}</span>}
              </div>
            </div>
            <div style={{ padding:'12px 18px', display:'flex', justifyContent:'flex-end', gap:8, background:'#f1f5f9', borderBottomLeftRadius:14, borderBottomRightRadius:14 }}>
              <button disabled={rejectModal.submitting} onClick={closeReject} style={{ ...buttonStyles.secondary, fontSize:'.55rem', padding:'8px 14px' }}>Cancel</button>
              <button disabled={rejectModal.submitting} onClick={submitReject} style={{ ...buttonStyles.danger, fontSize:'.55rem', padding:'8px 14px', opacity: rejectModal.submitting ? .6 : 1 }}>{rejectModal.submitting ? 'Submitting...' : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Requirements Modal */}
      {requirementsModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:998 }} onClick={e=>{ if(e.target===e.currentTarget) setRequirementsModal(null); }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:520, display:'flex', flexDirection:'column', boxShadow:'0 18px 50px rgba(0,0,0,0.3)', animation:'fadeInUp .45s ease' }}>
            <div style={{ padding:'14px 18px', background:gradients.primary, color:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:'1.4rem' }}>📄</div>
              <div style={{ flex:1 }}>
                <h4 style={{ margin:0, fontSize:'1rem', fontWeight:700 }}>{requirementsModal.title}</h4>
                <div style={{ fontSize:'.55rem', letterSpacing:'.5px', textTransform:'uppercase', color:'#bbdefb', fontWeight:600 }}>{requirementsModal.type}</div>
              </div>
              <button onClick={()=>setRequirementsModal(null)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'.6rem', fontWeight:600 }}>Close ✕</button>
            </div>
            <div style={{ padding:'16px 20px', maxHeight:'60vh', overflowY:'auto' }}>
              <pre style={{ margin:0, whiteSpace:'pre-wrap', fontSize:'.6rem', lineHeight:1.35, fontFamily:'inherit', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px', color:'#334155' }}>{requirementsModal.content}</pre>
            </div>
            <div style={{ padding:'10px 16px', borderTop:'1px solid #e1f5fe', background:'#fafafa', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={()=>{ navigator.clipboard?.writeText(requirementsModal.content); }} style={{ ...buttonStyles.secondary, fontSize:'.55rem', padding:'6px 12px', marginRight:8 }}>Copy</button>
              <button onClick={()=>setRequirementsModal(null)} style={{ ...buttonStyles.primary, fontSize:'.55rem', padding:'6px 12px' }}>Done</button>
            </div>
          </div>
        </div>
      )}
      <div style={pageStyles.content}>
        {/* Hero */}
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding:'30px 0', minHeight:140 }}>
          <h1 style={{ ...headerStyles.pageTitle, margin:0, fontSize:'1.6rem', color:'#fff' }}>Department Approval Requests</h1>
          <p style={{ margin:'6px 0 0 0', color:'#fff', opacity:.85, fontSize:'.8rem' }}>Review and manage student department clearance submissions</p>
        </div>

        {/* Search */}
        <div style={{ ...cardStyles.default, ...slideInLeft, marginBottom:18, padding:18, background:gradients.primary, color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name..." style={{ flex:1, padding:'10px 14px', borderRadius:30, border:'none', outline:'none', fontSize:'.7rem', background:'rgba(255,255,255,0.18)', color:'#fff' }} />
            {search && <button onClick={() => setSearch('')} style={{ ...buttonStyles.secondary, fontSize:'.55rem', padding:'6px 10px' }}>Clear</button>}
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...cardStyles.default, ...slideInRight, marginBottom:18, padding:18 }}>
          <h4 style={{ margin:'0 0 10px 0', fontSize:'.75rem', color:'#0369a1' }}>Filters</h4>
          <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))' }}>
            <div>
              <label style={{ display:'block', fontSize:'.5rem', fontWeight:700, color:'#0369a1', marginBottom:4, letterSpacing:'.5px', textTransform:'uppercase' }}>Semester</label>
              <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} style={{ width:'100%', border:'2px solid #e2e8f0', borderRadius:10, padding:'7px 8px', fontSize:'.6rem', background:'#fff', outline:'none' }}>
                <option value="">All</option>
                {semesters.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.5rem', fontWeight:700, color:'#0369a1', marginBottom:4, letterSpacing:'.5px', textTransform:'uppercase' }}>Course</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ width:'100%', border:'2px solid #e2e8f0', borderRadius:10, padding:'7px 8px', fontSize:'.6rem', background:'#fff', outline:'none' }}>
                <option value="">All</option>
                {courses.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.5rem', fontWeight:700, color:'#0369a1', marginBottom:4, letterSpacing:'.5px', textTransform:'uppercase' }}>Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width:'100%', border:'2px solid #e2e8f0', borderRadius:10, padding:'7px 8px', fontSize:'.6rem', background:'#fff', outline:'none' }}>
                <option value="">All</option>
                {yearLevels.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.5rem', fontWeight:700, color:'#0369a1', marginBottom:4, letterSpacing:'.5px', textTransform:'uppercase' }}>Block</label>
              <select value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)} style={{ width:'100%', border:'2px solid #e2e8f0', borderRadius:10, padding:'7px 8px', fontSize:'.6rem', background:'#fff', outline:'none' }}>
                <option value="">All</option>
                {blocks.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          {(selectedSemester || selectedCourse || selectedYear || selectedBlock || search) && (
            <div style={{ marginTop:10 }}>
              <button style={{ ...buttonStyles.danger, fontSize:'.55rem', padding:'6px 10px' }} onClick={() => { setSelectedSemester(''); setSelectedCourse(''); setSelectedYear(''); setSelectedBlock(''); setSearch(''); }}>Clear Filters</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ ...cardStyles.default, padding:16, marginBottom:18, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          {[{ key:'Pending', icon:'⏳', count: pending.length }, { key:'Approved', icon:'✅', count: approved.length }, { key:'Rejected', icon:'❌', count: rejected.length }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ ...(tab === t.key ? buttonStyles.primary : buttonStyles.secondary), padding:'8px 14px', fontSize:'.65rem', display:'flex', alignItems:'center', gap:6 }}>
              <span>{t.icon}</span>{t.key}
              <span style={{ background: tab === t.key ? '#fff' : '#0369a1', color: tab === t.key ? '#0369a1' : '#fff', fontSize:'.55rem', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ ...cardStyles.default, textAlign:'center', padding:40 }}><span style={{ fontSize:'2rem' }}>⏳</span><p style={{ margin:0, fontSize:'.7rem', color:'#0369a1', fontWeight:600 }}>Loading requests...</p></div>
        ) : currentData.length ? (
          renderTable(currentData)
        ) : (
          <div style={{ ...cardStyles.default, textAlign:'center', padding:50 }}>
            <div style={{ fontSize:'2.2rem', marginBottom:8 }}>📭</div>
            <p style={{ margin:0, fontSize:'.7rem', color:'#64748b' }}>No {tab.toLowerCase()} requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDepartmentRequests;

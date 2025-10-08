import React, { useContext, useEffect, useMemo, useState } from 'react';
import api, { buildFileUrl } from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { fadeInUp, slideInLeft, slideInRight, bounceIn, keyframes, pageStyles, cardStyles, headerStyles, buttonStyles, injectKeyframes, gradients } from '../../style/CommonStyles';

// Static filter option lists
const semesters = ['1st', '2nd'];
const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const blocks = ['A', 'B', 'C', 'D'];

export default function TeacherSubjectRequests() {
  const { user, userType } = useContext(AuthContext);

  // Data
  const [requests, setRequests] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  // UI / filters
  const [tab, setTab] = useState('Pending');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]); // bulk selection

  // Reject modal state (single or bulk)
  const [rejectModal, setRejectModal] = useState({ open: false, bulk: false, ids: [], id: null, remarks: '', submitting: false, error: '' });

  useEffect(() => { injectKeyframes(); }, []);

  // Fetch teacher requests
  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
  api.get('/student-subject-status/teacher', { params: { teacher_id: user.teacher_id } })
      .then(res => setRequests(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Fetch teacher subjects for subject filter
  useEffect(() => {
    if (!user || userType !== 'teacher') return;
  api.get(`/subject/teacher/${user.teacher_id}`)
      .then(res => setTeacherSubjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTeacherSubjects([]));
  }, [user, userType]);

  // Approve / Reject (single)
  const handleRespond = async (id, status, remarksValue) => {
    const payload = { status };
    if (status === 'Rejected' && remarksValue?.trim()) payload.remarks = remarksValue.trim();
  await api.patch(`/student-subject-status/${id}/respond`, payload);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, remarks: payload.remarks || (status === 'Approved' ? null : r.remarks) } : r));
    setSelectedRequestIds(prev => prev.filter(x => x !== id));
  };

  // Modal control
  const openRejectModalSingle = (id) => {
    const existing = requests.find(r => r.id === id);
    setRejectModal({ open: true, bulk: false, id, ids: [], remarks: existing?.remarks || '', submitting: false, error: '' });
  };
  const openRejectModalBulk = () => {
    if (!selectedRequestIds.length) return;
    setRejectModal({ open: true, bulk: true, ids: [...selectedRequestIds], id: null, remarks: '', submitting: false, error: '' });
  };
  const closeRejectModal = () => setRejectModal({ open: false, bulk: false, ids: [], id: null, remarks: '', submitting: false, error: '' });

  const submitReject = async () => {
    if (!rejectModal.remarks.trim()) { setRejectModal(m => ({ ...m, error: 'Remarks required.' })); return; }
    setRejectModal(m => ({ ...m, submitting: true, error: '' }));
    try {
      if (rejectModal.bulk) {
        for (const id of rejectModal.ids) { // sequential to respect ordering/backpressure
          await handleRespond(id, 'Rejected', rejectModal.remarks);
        }
      } else if (rejectModal.id) {
        await handleRespond(rejectModal.id, 'Rejected', rejectModal.remarks);
      }
      closeRejectModal();
    } catch {
      setRejectModal(m => ({ ...m, submitting: false, error: 'Failed to submit rejection.' }));
    }
  };

  // Bulk selectors
  const toggleSelect = (id) => setSelectedRequestIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAllVisible = (ids) => {
    const allSelected = ids.every(id => selectedRequestIds.includes(id));
    setSelectedRequestIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])));
  };

  // Bulk approve
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

  // Filtering
  const filteredRequests = useMemo(() => requests.filter(req => {
    const matchSubject = selectedSubjectId ? req.subject?.subject_id === parseInt(selectedSubjectId) : true;
    const matchSemester = selectedSemester ? (req.subject?.semester === selectedSemester || req.semester === selectedSemester) : true;
    const matchCourse = selectedCourse ? req.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? req.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? req.student?.block === selectedBlock : true;
    const fullName = `${req.student?.firstname || ''} ${req.student?.lastname || ''}`.trim().toLowerCase();
    const matchSearch = search.trim() ? fullName.includes(search.trim().toLowerCase()) : true;
    return matchSubject && matchSemester && matchCourse && matchYear && matchBlock && matchSearch;
  }), [requests, selectedSubjectId, selectedSemester, selectedCourse, selectedYear, selectedBlock, search]);

  const pending = filteredRequests.filter(r => r.status === 'Requested');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');
  const currentData = tab === 'Pending' ? pending : tab === 'Approved' ? approved : rejected;

  const tableStyles = {
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', marginTop: 18 },
    th: { background: gradients.primary, color: '#fff', padding: '12px 10px', fontWeight: 700, fontSize: '.85rem', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #e5e7eb', fontSize: '.8rem', color: '#374151', verticalAlign: 'top' },
    even: { background: '#f9fafb' }
  };

  const renderRequirements = (req) => {
    if (!req.requirements) return <span style={{ color: '#9ca3af' }}>-</span>;
    try {
      const parsed = JSON.parse(req.requirements);
      if (parsed.type === 'Checklist') {
        return <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>{parsed.checklist?.map((c, i) => <li key={i} style={{ color: '#6b7280' }}>✓ {c}</li>)}</ul>;
      }
      return parsed.instructions || parsed.value || <span style={{ color: '#9ca3af' }}>-</span>;
    } catch { return req.requirements; }
  };

  const extractFiles = (file_paths) => {
    if (Array.isArray(file_paths)) return file_paths.filter(f => f && f.trim() !== '');
    if (typeof file_paths === 'string' && file_paths.trim() !== '') return file_paths.split(',').map(f => f.trim()).filter(Boolean);
    return [];
  };

  const renderTable = () => {
    const selectable = currentData.filter(r => r.status === 'Requested').map(r => r.id);
    const allVisibleSelected = selectable.length && selectable.every(id => selectedRequestIds.includes(id));
    return (
      <div style={{ ...cardStyles.default, padding: 0, ...fadeInUp }}>
        {tab === 'Pending' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f1f5f9' }}>
            <strong style={{ fontSize: '.7rem', letterSpacing: '.5px', color: '#0369a1' }}>Bulk:</strong>
            <button disabled={!selectedRequestIds.length || bulkLoading} onClick={approveSelected} style={{ ...buttonStyles.success, fontSize: '.65rem', padding: '6px 10px', opacity: !selectedRequestIds.length || bulkLoading ? .6 : 1 }}>Approve ({selectedRequestIds.length})</button>
            <button disabled={!selectedRequestIds.length || bulkLoading} onClick={openRejectModalBulk} style={{ ...buttonStyles.danger, fontSize: '.65rem', padding: '6px 10px', opacity: !selectedRequestIds.length || bulkLoading ? .6 : 1 }}>Reject</button>
            <button disabled={!pending.length || bulkLoading} onClick={() => approveAllPending(pending.map(p => p.id))} style={{ ...buttonStyles.primary, fontSize: '.65rem', padding: '6px 10px', opacity: !pending.length || bulkLoading ? .6 : 1 }}>Approve All ({pending.length})</button>
            {bulkLoading && <span style={{ fontSize: '.65rem', color: '#475569' }}>Processing...</span>}
            <div style={{ marginLeft: 'auto' }}>
              <input type="checkbox" checked={!!selectable.length && allVisibleSelected} onChange={() => toggleSelectAllVisible(selectable)} />
            </div>
          </div>
        )}
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {tab === 'Pending' && <th style={tableStyles.th}><input type="checkbox" checked={!!selectable.length && allVisibleSelected} onChange={() => toggleSelectAllVisible(selectable)} /></th>}
              <th style={tableStyles.th}>Student</th>
              <th style={tableStyles.th}>Subject</th>
              <th style={tableStyles.th}>Sem</th>
              <th style={tableStyles.th}>Status</th>
              <th style={tableStyles.th}>Requirements</th>
              <th style={tableStyles.th}>Files</th>
              <th style={tableStyles.th}>Link</th>
              <th style={tableStyles.th}>Remarks</th>
              <th style={tableStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((r, i) => {
              const files = extractFiles(r.file_paths);
              const selected = selectedRequestIds.includes(r.id);
              return (
                <tr key={r.id} style={i % 2 === 0 ? tableStyles.even : {}}>
                  {tab === 'Pending' && <td style={tableStyles.td}>{r.status === 'Requested' && <input type="checkbox" checked={selected} onChange={() => toggleSelect(r.id)} />}</td>}
                  <td style={tableStyles.td}>
                    <div style={{ fontWeight: 600, color: '#0369a1' }}>{r.student?.firstname} {r.student?.lastname}</div>
                    <div style={{ fontSize: '.65rem', color: '#64748b' }}>{r.student?.course} {r.student?.year_level} • Block {r.student?.block}</div>
                  </td>
                  <td style={tableStyles.td}>{r.subject?.name}</td>
                  <td style={tableStyles.td}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontSize: '.65rem', fontWeight: 600 }}>{r.subject?.semester || r.semester}</span></td>
                  <td style={tableStyles.td}><span style={{ background: r.status === 'Approved' ? '#dcfce7' : r.status === 'Rejected' ? '#fee2e2' : '#fef9c3', color: r.status === 'Approved' ? '#166534' : r.status === 'Rejected' ? '#b91c1c' : '#92400e', padding: '4px 10px', borderRadius: 16, fontSize: '.65rem', fontWeight: 700 }}>{r.status}</span></td>
                  <td style={tableStyles.td}>{renderRequirements(r)}</td>
                  <td style={tableStyles.td}>{files.length ? files.map((f, idx) => <div key={idx}><a href={buildFileUrl(`/student-subject-status/file/${r.id}?file=${encodeURIComponent(f)}`)} target="_blank" rel="noreferrer" style={{ color: '#0369a1', textDecoration: 'none', fontSize: '.65rem', fontWeight: 600 }}>File {idx + 1}</a></div>) : <span style={{ color: '#9ca3af' }}>-</span>}</td>
                  <td style={tableStyles.td}>{r.link ? <a href={r.link} target="_blank" rel="noreferrer" style={{ color: '#0369a1', fontSize: '.65rem' }}>Open</a> : <span style={{ color: '#9ca3af' }}>-</span>}</td>
                  <td style={tableStyles.td}>{r.status === 'Rejected' && r.remarks ? <div style={{ whiteSpace: 'pre-wrap', fontSize: '.6rem', color: '#b91c1c' }}>{r.remarks}</div> : r.status === 'Approved' ? <span style={{ fontSize: '.55rem', color: '#166534', fontStyle: 'italic' }}>No remarks</span> : <span style={{ color: '#9ca3af', fontSize: '.55rem' }}>-</span>}</td>
                  <td style={tableStyles.td}>
                    {r.status === 'Requested' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button style={{ ...buttonStyles.success, fontSize: '.6rem', padding: '6px 8px' }} onClick={() => handleRespond(r.id, 'Approved')}>Approve</button>
                        <button style={{ ...buttonStyles.danger, fontSize: '.6rem', padding: '6px 8px' }} onClick={() => openRejectModalSingle(r.id)}>Reject</button>
                      </div>
                    ) : <span style={{ fontSize: '.6rem', fontWeight: 600 }}>{r.status}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const labelStyle = { display: 'block', fontSize: '.55rem', fontWeight: 700, color: '#0369a1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' };
  const selectStyle = { width: '100%', border: '2px solid #e2e8f0', borderRadius: 10, padding: '7px 8px', fontSize: '.65rem', background: '#fff', outline: 'none' };

  if (!user || userType !== 'teacher') {
    return (
      <div style={pageStyles.container}>
        <div style={{ ...cardStyles.danger, padding: 40, textAlign: 'center', ...bounceIn }}>
          <h2 style={{ margin: 0, color: '#fff' }}>Access Denied</h2>
          <p style={{ marginTop: 8, color: '#fff' }}>Only teachers can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '14px 18px', background: gradients.primary, color: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{rejectModal.bulk ? `Reject ${rejectModal.ids.length} Requests` : 'Reject Request'}</h3>
            </div>
            <div style={{ padding: 18 }}>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>Remarks / Feedback (required)</label>
              <textarea value={rejectModal.remarks} onChange={e => setRejectModal(m => ({ ...m, remarks: e.target.value }))} style={{ width: '90%', minHeight: 130, resize: 'vertical', padding: 10, fontSize: '.7rem', border: '2px solid #e2e8f0', borderRadius: 8, outline: 'none' }} maxLength={800} placeholder="Explain what is missing or incorrect..." />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.55rem', marginTop: 4 }}>
                <span>{rejectModal.remarks.length}/800</span>
                {rejectModal.error && <span style={{ color: '#b91c1c' }}>{rejectModal.error}</span>}
              </div>
            </div>
            <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#f1f5f9', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
              <button disabled={rejectModal.submitting} onClick={closeRejectModal} style={{ ...buttonStyles.secondary, fontSize: '.65rem', padding: '8px 14px' }}>Cancel</button>
              <button disabled={rejectModal.submitting} onClick={submitReject} style={{ ...buttonStyles.danger, fontSize: '.65rem', padding: '8px 14px', opacity: rejectModal.submitting ? .6 : 1 }}>{rejectModal.submitting ? 'Submitting...' : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding: '30px 0', minHeight: 140 }}>
          <h1 style={{ ...headerStyles.pageTitle, margin: 0, fontSize: '1.6rem', color: '#fff' }}>Subject Approval Requests</h1>
          <p style={{ margin: '6px 0 0 0', color: '#fff', opacity: .85, fontSize: '.8rem' }}>Review and manage student clearance requests</p>
        </div>

        <div style={{ ...cardStyles.default, ...slideInLeft, marginBottom: 18, padding: 18, background: gradients.primary, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name..." style={{ flex: 1, padding: '10px 14px', borderRadius: 30, border: 'none', outline: 'none', fontSize: '.75rem', background: 'rgba(255,255,255,0.18)', color: '#fff' }} />
            {search && <button onClick={() => setSearch('')} style={{ ...buttonStyles.secondary, fontSize: '.55rem', padding: '6px 10px' }}>Clear</button>}
          </div>
        </div>

        <div style={{ ...cardStyles.default, ...slideInRight, marginBottom: 18, padding: 18 }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '.8rem', color: '#0369a1' }}>Filters</h4>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
            <div><label style={labelStyle}>Subject</label><select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} style={selectStyle}><option value="">All</option>{teacherSubjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}</select></div>
            <div><label style={labelStyle}>Semester</label><select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} style={selectStyle}><option value="">All</option>{semesters.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>Course</label><select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={selectStyle}><option value="">All</option>{courses.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={labelStyle}>Year</label><select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}><option value="">All</option>{yearLevels.map(y => <option key={y}>{y}</option>)}</select></div>
            <div><label style={labelStyle}>Block</label><select value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)} style={selectStyle}><option value="">All</option>{blocks.map(b => <option key={b}>{b}</option>)}</select></div>
          </div>
          {(selectedSubjectId || selectedSemester || selectedCourse || selectedYear || selectedBlock || search) && <div style={{ marginTop: 10 }}><button style={{ ...buttonStyles.danger, fontSize: '.6rem', padding: '6px 10px' }} onClick={() => { setSelectedSubjectId(''); setSelectedSemester(''); setSelectedCourse(''); setSelectedYear(''); setSelectedBlock(''); setSearch(''); setSelectedRequestIds([]); }}>Clear Filters</button></div>}
        </div>

        <div style={{ ...cardStyles.default, padding: 16, marginBottom: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ key: 'Pending', icon: '⏳', count: pending.length }, { key: 'Approved', icon: '✅', count: approved.length }, { key: 'Rejected', icon: '❌', count: rejected.length }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ ...(tab === t.key ? buttonStyles.primary : buttonStyles.secondary), padding: '8px 14px', fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{t.icon}</span>{t.key}
                <span style={{ background: tab === t.key ? '#fff' : '#0369a1', color: tab === t.key ? '#0369a1' : '#fff', fontSize: '.55rem', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{t.count}</span>
              </button>
            ))}
        </div>

        {loading ? (
          <div style={{ ...cardStyles.default, textAlign: 'center', padding: 40 }}><span style={{ fontSize: '2rem' }}>⏳</span><p style={{ margin: 0, fontSize: '.75rem', color: '#0369a1', fontWeight: 600 }}>Loading requests...</p></div>
        ) : currentData.length ? (
          renderTable()
        ) : (
          <div style={{ ...cardStyles.default, textAlign: 'center', padding: 50 }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📭</div>
            <p style={{ margin: 0, fontSize: '.75rem', color: '#64748b' }}>No {tab.toLowerCase()} requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
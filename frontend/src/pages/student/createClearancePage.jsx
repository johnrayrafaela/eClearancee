import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { injectKeyframes, gradients, cardStyles, modalStyles, composeButton, colors, badgeStyles } from '../../style/theme';

// Themed style helpers
const styles = {
  container: { padding: '36px 30px 60px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Segoe UI, system-ui, Arial', position: 'relative' },
  hero: { background: gradients.hero, padding: '38px 44px', borderRadius: 28, position: 'relative', overflow: 'hidden', marginBottom: 34, boxShadow: '0 18px 50px -12px rgba(2,119,189,0.45)', color: '#fff' },
  heroTitle: { margin: 0, fontWeight: 900, fontSize: '2.3rem', letterSpacing: 1.2, textShadow: '0 3px 10px rgba(0,0,0,0.35)' },
  heroSubtitle: { margin: '10px 0 0', fontSize: '1.05rem', fontWeight: 500, opacity: .92, letterSpacing: .4 },
  summaryBar: { display: 'flex', flexWrap: 'wrap', gap: 16, margin: '-18px 0 26px', position: 'relative', zIndex: 2 },
  metricCard: { flex: '1 1 180px', minWidth: 160, background: 'linear-gradient(135deg,#ffffff 0%,#f1f9ff 100%)', border: '1px solid #e1f5fe', borderRadius: 20, padding: '14px 18px', boxShadow: '0 6px 16px rgba(2,119,189,0.12)', display: 'flex', flexDirection: 'column', gap: 4 },
  metricLabel: { fontSize: 12, fontWeight: 700, letterSpacing: .65, textTransform: 'uppercase', color: colors.primary },
  metricValue: { fontSize: 20, fontWeight: 800, letterSpacing: .6, color: '#0f3757' },
  panel: cardStyles.panel,
  section: cardStyles.section,
  error: { color: colors.danger, background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 14, marginTop: 20, textAlign: 'center', fontWeight: 600, letterSpacing: .3 },
  label: { display: 'inline-block', width: 110, fontWeight: 600, color: colors.primary, marginBottom: 6, fontSize: 13, letterSpacing: .3 },
  input: { border: '2px solid #e1f5fe', borderRadius: 14, padding: '10px 14px', marginLeft: 6, marginBottom: 12, background: '#f8fafc', color: colors.primary, fontSize: 14, minWidth: 130, outline: 'none', fontWeight: 500 },
  select: { border: '2px solid #e1f5fe', borderRadius: 30, padding: '10px 18px', background: '#fff', fontSize: 14, fontWeight: 600, color: colors.primary, outline: 'none', boxShadow: '0 4px 14px rgba(2,119,189,0.08)' },
  tableWrap: { border: '2px solid #e1f5fe', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 26px rgba(2,119,189,0.08)', background: gradients.light },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: gradients.card, padding: '10px 12px', textAlign: 'left', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, color: colors.primary, borderBottom: '2px solid #e1f5fe' },
  td: { padding: '10px 12px', borderBottom: '1px solid #e1f5fe', fontWeight: 500, color: '#334155' },
  stepBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '30px 0 34px', flexWrap: 'wrap' },
  stepItem: { display: 'flex', alignItems: 'center', gap: 10 },
  stepCircle: (active, done) => ({ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, background: done ? gradients.primary : (active ? gradients.info : 'linear-gradient(135deg,#e3f2fd 0%,#f1f9ff 100%)'), color: done || active ? '#fff' : colors.primary, boxShadow: active ? '0 0 0 6px rgba(2,119,189,0.18)' : '0 0 0 3px rgba(2,119,189,0.14)', transition: 'all .25s' }),
  stepLabel: (active) => ({ fontSize: 13, fontWeight: 700, color: active ? colors.primary : '#90a4ae', letterSpacing: '.6px', textTransform:'uppercase' }),
  progressTrack: { position: 'relative', height: 10, background: 'linear-gradient(90deg,#e1f5fe,#f1f9ff)', borderRadius: 10, overflow: 'hidden', margin: '0 auto 28px', width: '100%', maxWidth: 600, boxShadow:'inset 0 2px 6px rgba(2,119,189,0.08)' },
  progressFill: (pct) => ({ position: 'absolute', top:0, left:0, bottom:0, width: pct+'%', background: 'linear-gradient(90deg,#0277bd,#29b6f6)', transition: 'width .45s cubic-bezier(.4,.0,.2,1)' }),
  chipWrap: { display:'flex', flexWrap:'wrap', gap:10, marginTop: 12 },
  chip: { background: '#e3f2fd', color: colors.primary, padding:'6px 14px', borderRadius: 30, display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, letterSpacing:.5, boxShadow:'0 4px 12px rgba(2,119,189,0.12)' },
  chipRemoveBtn: { background:'transparent', border:'none', color: colors.primary, cursor:'pointer', fontWeight:900, fontSize:16, lineHeight:1, padding:0 },
  toolbar: { display:'flex', flexWrap:'wrap', gap:14, alignItems:'center', margin:'10px 0 14px' },
  searchInput: { border:'2px solid #e1f5fe', borderRadius:40, padding:'10px 20px', minWidth:240, flex:'1 1 260px', fontSize:14, outline:'none', background:'#fff', boxShadow:'0 4px 16px rgba(2,119,189,0.08)', fontWeight:500 },
  selectSmall: { border:'2px solid #e1f5fe', borderRadius:40, padding:'10px 16px', fontSize:13, background:'#fff', outline:'none', fontWeight:600, color: colors.primary },
  toastContainer: { position:'fixed', bottom:20, right:20, display:'flex', flexDirection:'column', gap:14, zIndex:1500, maxWidth:360 },
  toast: (type) => ({ background:'#fff', borderLeft:`6px solid ${type==='error'? colors.danger : type==='warn'? '#fb8c00' : colors.primary}`, boxShadow:'0 8px 26px rgba(2,32,54,0.18)', padding:'14px 18px 14px 16px', borderRadius:18, display:'flex', gap:14, animation:'fadeInUp .45s ease', fontSize:14, fontWeight:500, letterSpacing:.3 }),
  toastMsg: { flex:1, color: colors.text, lineHeight:1.4, fontWeight:500 },
  toastClose: { background:'transparent', border:'none', cursor:'pointer', color:'#607d8b', fontWeight:800, fontSize:18, lineHeight:'16px', padding:0 },
  collapseBtn: { background:'#fff', border:'2px solid #e1f5fe', color: colors.primary, padding:'8px 18px', borderRadius:40, fontSize:12, cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6, letterSpacing:.7, boxShadow:'0 4px 14px rgba(2,119,189,0.08)' }
};

const semesters = ['1st','2nd'];

const CreateClearancePage = () => {
  const { user, userType } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [clearance, setClearance] = useState(null);
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  // Enhancements
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('nameAsc');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showDepartments, setShowDepartments] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Determine wizard step
  const currentStep = useMemo(()=>{
    if (clearance) return 3;
    if (showConfirm) return 2;
    return 1;
  },[clearance, showConfirm]);

  const steps = [
    { id:1, label:'Semester' },
    { id:2, label:'Select Subjects' },
    { id:3, label:'Review' }
  ];

  const progressPct = (currentStep-1)/(steps.length-1)*100;

  const addToast = useCallback((message, type='info', ttl=3500)=>{
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{ id, message, type }]);
    setTimeout(()=> setToasts(t=> t.filter(x=> x.id!==id)), ttl);
  },[]);

  const dismissToast = useCallback(id=> setToasts(t=> t.filter(x=> x.id!==id)),[]);

  const resetSelectionState = ()=>{
    setClearance(null); setStudent(null); setSubjects([]); setCreated(false); setShowConfirm(false); setDepartments([]); setSelectedSubjects([]); setSearch(''); setSort('nameAsc');
  };

  useEffect(()=>{
    injectKeyframes();
    if (!user || userType !== 'user' || !selectedSemester){
      resetSelectionState(); setLoading(false); return;
    }
    // Immediately clear stale data while loading new semester
    setClearance(null); setStudent(null); setSubjects([]); setCreated(false); setShowConfirm(false);
    setLoading(true);
  api.get(`/clearance/status?student_id=${user.student_id}&semester=${selectedSemester}`)
      .then(cRes => {
        if (cRes.data.clearance){
          setClearance(cRes.data.clearance);
          setStudent(cRes.data.student);
          setSubjects(cRes.data.subjects);
          setCreated(true);
        } else {
          setCreated(false);
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          // No clearance for this semester yet; show request button
          setCreated(false); setClearance(null); setStudent(null); setSubjects([]);
        } else {
          setError('Failed to fetch clearance.');
        }
      })
      .finally(()=> {
  api.get('/departments')
          .then(dRes => setDepartments(dRes.data||[]))
          .catch(()=> setDepartments([]))
          .finally(()=> setLoading(false));
      });
  },[user,userType,selectedSemester]);

  const handlePrecheck = async ()=>{
    setLoading(true); setError('');
    try {
  const resp = await api.get(`/clearance/precheck?student_id=${user.student_id}&semester=${selectedSemester}`);
      setStudent(resp.data.student); setSubjects(resp.data.subjects); setSelectedSubjects([]); setShowConfirm(true); addToast('Precheck complete. Select subjects to include.','info');
    } catch (e){ setError(e.response?.data?.message || 'Failed to load student info.'); }
    finally { setLoading(false); }
  };

  const handleCreateClearance = async ()=>{
    setShowConfirm(false); setLoading(true); setError('');
    try {
      // Check if clearance already exists
      if (clearance) {
        // Update existing clearance with new subject selections
        const resp = await api.patch('/clearance/update-subjects',{ student_id: user.student_id, semester: selectedSemester, subject_ids: selectedSubjects.map(s=>s.subject_id)});
        setClearance(resp.data.clearance); setStudent(resp.data.student); setSubjects(resp.data.subjects); setDepartments(resp.data.departments||[]); setCreated(true);
        addToast('Clearance subjects updated successfully.','success');
      } else {
        // Create new clearance
        const resp = await api.post('/clearance/create',{ student_id: user.student_id, semester: selectedSemester, subject_ids: selectedSubjects.map(s=>s.subject_id)});
        setClearance(resp.data.clearance); setStudent(resp.data.student); setSubjects(resp.data.subjects); setDepartments(resp.data.departments||[]); setCreated(true);
        addToast('Clearance created successfully.','success');
      }
    } catch(e){ setError(e.response?.data?.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleDeleteClearance = async ()=>{
    setLoading(true); setDeleteError('');
  try { await api.delete('/clearance/delete',{ data: { student_id: user.student_id, password: deletePassword, semester: selectedSemester }}); setCreated(false); setClearance(null); setStudent(null); setSubjects([]); setShowConfirm(false); setShowDeleteConfirm(false); setDeletePassword(''); addToast('Clearance deleted. You may start again.','warn'); }
    catch(e){ setDeleteError(e.response?.data?.message || 'Failed to delete clearance.'); addToast('Failed to delete clearance.','error'); }
    finally { setLoading(false); }
  };

  // Filter & sort subjects when selecting
  const filteredSubjects = useMemo(()=>{
    let list = [...subjects];

    // Specific year selection (exact match)
    if (selectedYear && selectedYear !== 'all') {
      list = list.filter(s => String(s.year_level) === String(selectedYear));
      return list;
    }

    if (search.trim()){
      const q = search.toLowerCase();
      list = list.filter(s=> s.name.toLowerCase().includes(q) || (s.teacher && `${s.teacher.firstname} ${s.teacher.lastname}`.toLowerCase().includes(q)));
    }
    switch (sort){
      case 'nameDesc': list.sort((a,b)=> b.name.localeCompare(a.name)); break;
      case 'teacherAsc': list.sort((a,b)=> {
        const ta = a.teacher ? `${a.teacher.firstname} ${a.teacher.lastname}` : '';
        const tb = b.teacher ? `${b.teacher.firstname} ${b.teacher.lastname}` : '';
        return ta.localeCompare(tb);
      }); break;
      case 'teacherDesc': list.sort((a,b)=> {
        const ta = a.teacher ? `${a.teacher.firstname} ${a.teacher.lastname}` : '';
        const tb = b.teacher ? `${b.teacher.firstname} ${b.teacher.lastname}` : '';
        return tb.localeCompare(ta);
      }); break;
      case 'nameAsc':
      default: list.sort((a,b)=> a.name.localeCompare(b.name));
    }
    return list;
  },[subjects, search, sort, selectedYear]);

  const parseYear = (y) => {
    if (!y) return 0;
    const m = String(y).match(/(\d+)/);
    if (m) return parseInt(m[1],10);
    const map = { '1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5 };
    return map[String(y).toLowerCase()] || 0;
  };

  // Compute unique year options from subjects (sorted)
  const yearOptions = useMemo(()=>{
    const set = new Set(subjects.map(s=> s.year_level).filter(Boolean));
    const arr = Array.from(set);
    return arr.sort((a,b)=> parseYear(a) - parseYear(b));
  },[subjects]);

  // Close modal on ESC
  useEffect(()=>{
    if (!showConfirm) return;
    const onKey = (e)=>{ if (e.key==='Escape' && !loading){ setShowConfirm(false);} };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[showConfirm, loading]);

  if (!user || userType !== 'user') return <div style={styles.error}>❌ Access denied.</div>;

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📄 Create Clearance</h1>
        <p style={styles.heroSubtitle}>Start or manage your clearance request by choosing a semester and selecting subjects you are enrolled in.</p>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .18, background: 'radial-gradient(circle at 70% 30%,rgba(255,255,255,0.8),transparent 60%)' }} />
      </div>
      {/* Summary Metrics */}
      <div style={styles.summaryBar}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Current Step</span>
          <span style={styles.metricValue}>{currentStep} / 3</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Semester</span>
          <span style={styles.metricValue}>{selectedSemester || '—'}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Subjects Found</span>
          <span style={styles.metricValue}>{subjects.length || 0}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Selected</span>
          <span style={styles.metricValue}>{selectedSubjects.length}</span>
        </div>
        {clearance && (
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Clearance Status</span>
            <span style={{ ...styles.metricValue, fontSize:18 }}>{clearance.status}</span>
          </div>
        )}
      </div>

      {/* Steps Progress */}
      <div style={styles.stepBar} aria-label="progress steps">
        {steps.map((s,i)=>{
          const active = currentStep===s.id;
          const done = currentStep> s.id;
          return (
            <div key={s.id} style={styles.stepItem}>
              <div style={styles.stepCircle(active, done)}>{done? '✓' : s.id}</div>
              <div style={styles.stepLabel(active || done)}>{s.label}</div>
              {i<steps.length-1 && <div style={{ width:50, height:4, background: currentStep> s.id ? 'linear-gradient(90deg,#0277bd,#29b6f6)' : '#e1f5fe', borderRadius: 4, transition: 'all .35s' }} />}
            </div>
          );
        })}
      </div>
      <div style={styles.progressTrack}><div style={styles.progressFill(progressPct)} /></div>
      <div style={{ marginBottom:30, display:'flex', justifyContent:'center' }}>
        <div style={{ display:'flex', gap:14, alignItems:'center', background:gradients.light, padding:'18px 26px', borderRadius:30, boxShadow:'0 10px 30px rgba(2,119,189,0.12)', border:'2px solid #e1f5fe' }}>
          <span style={{ fontWeight:700, letterSpacing:.6, color:colors.primary }}>Semester</span>
          <select style={styles.select} value={selectedSemester} onChange={e=>{ const sem=e.target.value; setSelectedSemester(sem); // full reset to avoid showing previous semester data
            setClearance(null); setStudent(null); setSubjects([]); setDepartments([]); setCreated(false); setShowConfirm(false); setShowDeleteConfirm(false); setDeletePassword(''); setError(''); }} required>
            <option value=''>Select</option>
            {semesters.map(s=> <option key={s} value={s}>{s} Semester</option> )}
          </select>
          {selectedSemester && (
            <span style={badgeStyles.neutral}>{selectedSemester}</span>
          )}
        </div>
      </div>
      {clearance && student && (
        <div style={{ ...cardStyles.section, padding:24, marginBottom:40 }}>
          <h3 style={{ margin:0, color:colors.primary, fontSize:20, fontWeight:800, letterSpacing:.8 }}>📝 My Clearance</h3>
          <div style={{ marginTop:18, ...styles.tableWrap }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Year Level</th>
                  <th style={styles.th}>Block</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>{student.firstname} {student.lastname}</td>
                  <td style={styles.td}>{student.course}</td>
                  <td style={styles.td}>{student.year_level}</td>
                  <td style={styles.td}>{student.block}</td>
                  <td style={styles.td}>{clearance.status}</td>
                  <td style={styles.td}><button style={{ ...composeButton('danger'), padding:'8px 18px', borderRadius:14 }} onClick={()=> setShowDeleteConfirm(true)} disabled={loading}>🗑 Delete</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h4 style={{ margin:'26px 0 8px', color:colors.primary, fontSize:16, fontWeight:800, letterSpacing:.5 }}>📘 Subjects</h4>
          {subjects.length? (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Subject Name</th><th style={styles.th}>Teacher</th></tr></thead>
                <tbody>
                  {subjects.map(sub=> (
                    <tr key={sub.subject_id}>
                      <td style={styles.td}>{sub.name}</td>
                      <td style={styles.td}>{sub.teacher ? `${sub.teacher.firstname} ${sub.teacher.lastname}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p style={{ fontSize:13, color:'#607d8b', margin:'6px 0 0' }}>No subjects found.</p>}
          <h4 style={{ margin:'30px 0 8px', color:colors.primary, fontSize:16, fontWeight:800, letterSpacing:.5 }}>🏢 Departments</h4>
          {departments.length? (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Department Name</th><th style={styles.th}>Assigned Staff</th></tr></thead>
                <tbody>
                  {departments.map((d,i)=>(
                    <tr key={d.department_id || i}>
                      <td style={styles.td}>{d.name}</td>
                      <td style={styles.td}>{d.staff ? `${d.staff.firstname} ${d.staff.lastname}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p style={{ fontSize:13, color:'#607d8b', margin:'6px 0 0' }}>No departments found.</p>}
        </div>
      )}

      {!clearance && !showConfirm && !created && (
        <div style={{ textAlign:'center', margin:'10px 0 10px' }}>
          <button
            onClick={handlePrecheck}
            disabled={loading || !selectedSemester}
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #0277bd 100%)',
              color: '#fff',
              padding: '14px 36px',
              borderRadius: 40,
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(25,118,210,0.22)'
            }}
          >
            {loading? 'Loading...' : '🚀 Request Clearance'}
          </button>
        </div>
      )}

      {showConfirm && !created && student && (
        <div style={modalStyles.backdrop} aria-modal='true' role='dialog' aria-label='Select subjects and departments'>
          <div style={{ ...modalStyles.containerLg, background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.28)', padding: 28, maxWidth: 980 }}>
            <button onClick={()=> setShowConfirm(false)} style={{ ...modalStyles.closeBtn, background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: '#fff' }} aria-label='Close modal'>×</button>
            <h3 style={{ margin:'0 0 6px', fontSize:26, fontWeight:900, letterSpacing:1.1, color:'#0277bd' }}>Finalize Clearance</h3>
            <p style={{ margin:'0 0 28px', color:'#455a64', fontSize:14, fontWeight:500 }}>Review your information, choose the subjects to include, and confirm.</p>
            <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
              {/* Student Info Card */}
              <div style={{ ...cardStyles.section, flex:'1 1 250px', minWidth:240, maxWidth:330 }}>
                <h4 style={{ margin:'0 0 16px', color:colors.primary, fontSize:17, letterSpacing:.7, fontWeight:800 }}>👤 Student Information</h4>
                <div><label style={styles.label}>Name:</label><input value={`${student.firstname} ${student.lastname}`} readOnly style={styles.input} /></div>
                <div><label style={styles.label}>Course:</label><input value={student.course} readOnly style={styles.input} /></div>
                <div><label style={styles.label}>Year:</label><input value={student.year_level} readOnly style={styles.input} /></div>
                <div><label style={styles.label}>Block:</label><input value={student.block} readOnly style={styles.input} /></div>
                <div><label style={styles.label}>Semester:</label><input value={selectedSemester} readOnly style={styles.input} /></div>
              </div>
              {/* Subjects + Departments */}
              <div style={{ flex:'3 1 520px', minWidth:300 }}>
                <div style={{ ...cardStyles.section, padding:'20px 22px 24px' }}>
                  <h4 style={{ margin:'0 0 18px', color:colors.primary, fontSize:17, letterSpacing:.7, fontWeight:800 }}>📘 Select Subjects</h4>
                  {subjects.length ? (
                    <>
                      <div style={styles.toolbar}>
                        <input
                          placeholder="Search subject or teacher..."
                          value={search}
                          onChange={e=> setSearch(e.target.value)}
                          style={styles.searchInput}
                          autoFocus
                        />
                        <select value={selectedYear} onChange={e=> setSelectedYear(e.target.value)} style={{ ...styles.selectSmall, width:180 }}>
                          <option value="all">All years (select below)</option>
                          {yearOptions.map(y=> <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={sort} onChange={e=> setSort(e.target.value)} style={styles.selectSmall}>
                          <option value="nameAsc">Name A→Z</option>
                          <option value="nameDesc">Name Z→A</option>
                          <option value="teacherAsc">Teacher A→Z</option>
                          <option value="teacherDesc">Teacher Z→A</option>
                        </select>
                        <div style={{ fontSize:11, fontWeight:800, color:colors.primary, letterSpacing:1 }}>{selectedSubjects.length} / {subjects.length} SELECTED</div>
                      </div>
                      <p style={{ margin: '4px 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: .5, color: '#607d8b' }}>✅ Tip: You can select subjects from all year levels in {student.course}. Use the year dropdown to filter by year level, then click rows to toggle selection. Your current year level: <strong>{student.year_level}</strong></p>
                      <div style={{ maxHeight:260, overflow:'auto', border:'2px solid #e1f5fe', borderRadius:16 }}>
                        <table style={{ ...styles.table, marginTop:0 }}>
                          <thead><tr><th style={styles.th}>Subject Name</th><th style={styles.th}>Year Level</th><th style={styles.th}>Teacher</th><th style={styles.th}>Selected</th></tr></thead>
                          <tbody>
                            {filteredSubjects.map(sub => {
                              const isSelected = selectedSubjects.some(s=> s.subject_id === sub.subject_id);
                                                            const isCurrentYear = sub.year_level === student.year_level;
                              return (
                                <tr
                                  key={sub.subject_id}
                                  onClick={() => {
                                    setSelectedSubjects(prev => {
                                      if (isSelected) return prev.filter(p => p.subject_id !== sub.subject_id);
                                      return [...prev, sub];
                                    });
                                  }}
                                  style={{ transition:'background .25s, transform .25s', cursor:'pointer', background: isSelected ? 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%)' : (isCurrentYear ? 'rgba(2,119,189,0.03)' : undefined) }}>
                                  <td style={styles.td}>{sub.name}</td>
                                  <td style={{ ...styles.td, fontWeight: isCurrentYear ? 700 : 500, color: isCurrentYear ? colors.primary : '#607d8b' }}>
                                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background: isCurrentYear ? '#e3f2fd' : '#f5f5f5', color: isCurrentYear ? colors.primary : '#607d8b', fontWeight: 700, fontSize:11, padding:'4px 8px', borderRadius:12 }}>
                                      {isCurrentYear && '📌 '}{sub.year_level}{isCurrentYear && ' (Current)'}
                                    </span>
                                  </td>
                                  <td style={styles.td}>{sub.teacher ? `${sub.teacher.firstname} ${sub.teacher.lastname}` : 'N/A'}</td>
                                  <td style={styles.td}>
                                    {isSelected ? (
                                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#e8f5e9', color:'#2e7d32', fontWeight:700, fontSize:11, padding:'4px 10px', borderRadius:20 }}>✓ Selected</span>
                                    ) : (
                                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#fff3e0', color:'#ef6c00', fontWeight:700, fontSize:11, padding:'4px 10px', borderRadius:20 }}>⬤ Not Selected</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            {!filteredSubjects.length && (
                              <tr><td style={styles.td} colSpan={3}>(No matches)</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop:16 }}>
                        <h5 style={{ color:colors.primary, margin:'0 0 10px', fontSize:13, fontWeight:800, letterSpacing:.7 }}>Selected Subjects</h5>
                        {selectedSubjects.length ? (
                          <div style={styles.chipWrap}>
                            {selectedSubjects.map(s=> (
                              <div key={s.subject_id} style={styles.chip}>
                                <span>{s.name}</span>
                                <button aria-label={`remove ${s.name}`} style={styles.chipRemoveBtn} onClick={()=> setSelectedSubjects(selectedSubjects.filter(x=> x.subject_id!==s.subject_id))}>×</button>
                              </div>
                            ))}
                          </div>
                        ) : <p style={{ color:'#90a4ae', fontSize:12, fontWeight:600, letterSpacing:.5 }}>No subjects selected.</p>}
                      </div>
                    </>
                  ) : <p style={{ margin:0 }}>No subjects found.</p>}
                </div>
                {departments.length ? (
                  <div style={{ ...cardStyles.section, marginTop:26, padding:'20px 22px 24px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <h4 style={{ color:colors.primary, margin:0, fontSize:15, fontWeight:800, letterSpacing:.7 }}>🏢 Departments</h4>
                      <button type="button" style={styles.collapseBtn} onClick={()=> setShowDepartments(v=> !v)}>
                        {showDepartments ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {showDepartments && (
                      <div style={{ maxHeight:200, overflow:'auto', border:'2px solid #e1f5fe', borderRadius:16 }}>
                        <table style={{ ...styles.table, marginTop:0 }}>
                          <thead><tr><th style={styles.th}>Department Name</th><th style={styles.th}>Assigned Staff</th></tr></thead>
                          <tbody>{departments.map((d,i)=>(<tr key={d.department_id || i}><td style={styles.td}>{d.name}</td><td style={styles.td}>{d.staff? `${d.staff.firstname} ${d.staff.lastname}`:'N/A'}</td></tr>))}</tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:16, marginTop:36, flexWrap:'wrap' }}>
              <button onClick={()=> setShowConfirm(false)} disabled={loading} style={{ background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 30, fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleCreateClearance} disabled={loading || !selectedSubjects.length} style={{ background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', color: '#fff', border: 'none', padding: '14px 34px', borderRadius: 40, fontWeight:800, cursor:'pointer', boxShadow:'0 10px 30px rgba(2,119,189,0.22)' }}>{loading? 'Submitting...' : (clearance ? '✅ Update Clearance' : '✅ Confirm & Submit')}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={modalStyles.backdrop}>
          <div style={{ ...cardStyles.panel, maxWidth:480, width:'100%', position:'relative', padding:'40px 46px 46px' }}>
            <button onClick={()=> { setShowDeleteConfirm(false); setDeletePassword(''); }} style={{ position:'absolute', top:14, right:16, background:'transparent', border:'none', fontSize:26, color:'#607d8b', cursor:'pointer', fontWeight:700 }}>×</button>
            <h3 style={{ margin:'0 0 10px', fontSize:22, fontWeight:900, letterSpacing:.8, color:colors.danger }}>Delete Clearance</h3>
            <p style={{ margin:'0 0 20px', fontSize:14, color:'#607d8b', fontWeight:500 }}>Enter your password to confirm deletion of this clearance. This action cannot be undone.</p>
            <div style={{ position:'relative', marginBottom:24 }}>
              <input type={showPassword? 'text':'password'} placeholder='Password' value={deletePassword} onChange={e=> setDeletePassword(e.target.value)} style={{ ...styles.input, width:'100%', paddingRight:100, marginLeft:0 }} />
              <button type='button' onClick={()=> setShowPassword(p=> !p)} style={{ position:'absolute', right:14, top:10, background:gradients.card, border:'2px solid #e1f5fe', color:colors.primary, cursor:'pointer', fontSize:12, fontWeight:800, borderRadius:30, padding:'6px 14px' }}>{showPassword? 'Hide':'Show'}</button>
            </div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <button style={{ ...composeButton('danger'), padding:'12px 30px', borderRadius:34 }} onClick={handleDeleteClearance} disabled={loading || !deletePassword}>{loading? 'Deleting...' : '🗑 Confirm Delete'}</button>
              <button style={{ ...composeButton('secondary'), padding:'12px 30px', borderRadius:34 }} onClick={()=> { setShowDeleteConfirm(false); setDeletePassword(''); }} disabled={loading}>Cancel</button>
            </div>
            {deleteError && <div style={styles.error}>{deleteError}</div>}
          </div>
        </div>
      )}
      {/* Toasts */}
      {!!toasts.length && (
        <div style={styles.toastContainer} aria-live='polite'>
          {toasts.map(t=> (
            <div key={t.id} style={styles.toast(t.type)}>
              <div style={styles.toastMsg}>{t.message}</div>
              <button onClick={()=> dismissToast(t.id)} style={styles.toastClose} aria-label='Dismiss'>×</button>
            </div>
          ))}
        </div>
      )}
      {error && <div style={styles.error}>❌ {error}</div>}
    </div>
  );
};

export default CreateClearancePage;

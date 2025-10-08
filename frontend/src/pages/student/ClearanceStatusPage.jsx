import React, { useContext, useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api, { buildFileUrl } from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { gradients, buttonStyles, fadeInUp, typeScale } from '../../style/CommonStyles';

const styles = {
  container: { padding: '24px 20px', margin: '0 auto 60px', background: gradients.light, borderRadius: 24, boxShadow: '0 10px 30px -6px rgba(2,119,189,0.15)', fontFamily: 'Segoe UI, Arial, sans-serif', maxWidth: '1600px', ...fadeInUp },
  hero: { background: 'linear-gradient(135deg,#0277bd 0%,#01579b 60%,#013e63 100%)', padding: '28px 26px', borderRadius: 18, position: 'relative', color: '#fff', overflow: 'hidden', marginBottom: 22, boxShadow: '0 12px 28px -8px rgba(2,119,189,0.35)' },
  heroTitle: { margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '.75px', textShadow: '0 3px 8px rgba(0,0,0,0.25)' },
  heroSubtitle: { margin: '6px 0 0', fontSize: typeScale.md, opacity: .92, fontWeight: 500, letterSpacing: '.25px' },
  summaryGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom: 20 },
  summaryCard: { background:'#fff', border:'1px solid #e1f5fe', borderRadius:16, padding:'14px 16px', boxShadow:'0 6px 14px rgba(2,119,189,0.08)', display:'flex', flexDirection:'column', gap:6, position:'relative', overflow:'hidden' },
  progressBar: { display:'flex', width:'100%', height:10, borderRadius:6, overflow:'hidden', background:'#e3f2fd', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 22px -6px rgba(2,119,189,0.18)', marginTop: 14, border: '1px solid #e1f5fe' },
  th: { background: 'linear-gradient(120deg,#0277bd 0%,#016aa9 50%,#015079 100%)', color: '#fff', border: 'none', padding: '10px 10px', fontWeight: 700, textAlign: 'left', fontSize: typeScale.base, letterSpacing: '.5px', position:'relative' },
  td: { borderBottom: '1px solid #edf6fb', padding: '10px 10px', color: '#2d3e50', verticalAlign: 'top', fontSize: '0.78rem', lineHeight: 1.35, background:'#fff' },
  error: { color: '#d32f2f', background: gradients.light, border: '2px solid #ffcdd2', padding: 15, borderRadius: 10, marginTop: 16, textAlign: 'center', fontWeight: 600 },
  button: { ...buttonStyles.primary, padding: '6px 14px', fontSize: '0.65rem', borderRadius: 14, marginRight: 4, fontWeight: 700, letterSpacing: '.5px', boxShadow: '0 4px 12px rgba(2,119,189,0.25)' },
  label: { display: 'block', marginBottom: 4, fontWeight: 600, color: '#0277bd', fontSize: typeScale.xl },
  input: { padding: '8px 12px', borderRadius: 14, border: '2px solid #cae9f9', width: '100%', maxWidth: 240, fontSize: '0.75rem', color: '#1e3a5f', background: '#f5fbff', transition: 'all 0.25s ease', outline: 'none', fontWeight: 600 },
  checklistItem: { display: 'flex', alignItems: 'center', marginBottom: 4, padding: '6px 8px', borderRadius: 10, background: 'linear-gradient(135deg,#ffffff 0%,#f2faff 100%)', border: '1px solid #d9eefb', boxShadow:'0 2px 4px rgba(2,119,189,0.06)' },
  instructionBox: { fontSize: typeScale.xs, marginTop: 4, padding: '6px 8px', background: '#e3f2fd', borderRadius: 6, color: '#1976d2', border: '1px solid #bbdefb' },
  badge: { display:'inline-flex', alignItems:'center', gap:4, color:'#fff', padding:'4px 10px', fontSize:'0.63rem', fontWeight:700, letterSpacing:'.5px', borderRadius:24, boxShadow:'0 2px 4px rgba(0,0,0,0.2)' },
  checklistScroll: { maxHeight: 110, overflowY: 'auto', paddingRight: 4, scrollbarWidth: 'thin' }
};

const semesters = ['1st', '2nd'];

const ClearanceStatusPage = ({ onStatusChange, onStatusesUpdate }) => {
  const { user, userType } = useContext(AuthContext);
  const [clearance, setClearance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectStatuses, setSubjectStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('1st');
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState({});
  const [files, setFiles] = useState({});
  const [deptFiles, setDeptFiles] = useState({});
  const [deptLinks, setDeptLinks] = useState({});
  const [deptChecklists, setDeptChecklists] = useState({});
  const [deptRequesting, setDeptRequesting] = useState({});
  // Restored missing state used throughout JSX/actions
  const [submittedChecklists, setSubmittedChecklists] = useState({}); // { [subject_id]: boolean[] }
  const [submittedLinks, setSubmittedLinks] = useState({}); // { [subject_id]: string }
  const [instructionModal, setInstructionModal] = useState(null); // { subjectId, name, type, instructions }
  const [remarksModal, setRemarksModal] = useState(null); // { subjectId, name, remarks }
  const printingRef = useRef(false);
  const downloadingRef = useRef(false);

  // Upsert helper to avoid duplicate subject statuses
  const upsertSubjectStatus = React.useCallback((prev, newEntry) => {
    const map = new Map();
    prev.forEach(s => map.set(s.subject_id, s));
    const existing = map.get(newEntry.subject_id) || {};
    map.set(newEntry.subject_id, { ...existing, ...newEntry, semester: newEntry.semester || existing.semester || selectedSemester || '1st' });
    return Array.from(map.values());
  }, [selectedSemester]);

  // Load clearance/subjects/departments & statuses
  useEffect(() => {
    if (!user || userType !== 'user') return;
    const effectiveSemester = selectedSemester || '1st';
    Promise.all([
  api.get(`/clearance/status?student_id=${user.student_id}&semester=${effectiveSemester}`),
  api.get(`/student-subject-status/requested-statuses?student_id=${user.student_id}&semester=${effectiveSemester}`),
  api.get('/departments')
    ])
      .then(([clearanceRes, statusRes, deptRes]) => {
        if (!clearanceRes.data.clearance) {
          setClearance(null);
          setSubjects([]);
          setSubjectStatuses([]);
          setDepartments([]);
          setError('You have not created a clearance for this semester yet.');
        } else {
          setClearance(clearanceRes.data.clearance);
          setSubjects(clearanceRes.data.subjects || []);
          setSubjectStatuses(statusRes.data.statuses || []);
          setDepartments(deptRes.data || []);
          setError('');
          onStatusesUpdate && onStatusesUpdate({ subjects: clearanceRes.data.subjects, statuses: statusRes.data.statuses || [] });
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setClearance(null);
          setSubjects([]);
          setSubjectStatuses([]);
          setDepartments([]);
          setError('No clearance found for this semester.');
        } else {
          setError('Failed to load clearance or related data.');
        }
      });
  }, [user, userType, selectedSemester, onStatusesUpdate]);

  // One-time dedupe after initial load of subject statuses (in case historical duplicates exist)
  useEffect(() => {
    setSubjectStatuses(prev => {
      const seen = new Set();
      const cleaned = [];
      for (const s of prev) {
        if (!seen.has(s.subject_id)) {
          seen.add(s.subject_id);
          cleaned.push(s);
        }
      }
      return cleaned;
    });
  }, [selectedSemester]);

  // Fetch department statuses
  useEffect(() => {
    if (!user || userType !== 'user' || !selectedSemester) return;
  api.get(`/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`)
      .then(res => {
        setDepartmentStatuses(res.data.statuses || []);
      })
      .catch(() => setDepartmentStatuses([]));
  }, [user, userType, selectedSemester, onStatusesUpdate]);

  // Helper to get department status
  const getDeptStatus = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found ? found.status : 'Pending';
  };
  const getDeptRemarks = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found && found.remarks ? found.remarks : null;
  };
  const getDeptFile = (departmentId) => {
    const found = departmentStatuses.find(s => s.department_id === departmentId);
    return found && found.file_path ? found.file_path : null;
  };

  // Request approval for a department
  const requestDeptApproval = async (departmentId) => {
    if (!window.confirm('Are you sure you want to request approval for this department?')) return;
    setDeptRequesting(prev => ({ ...prev, [departmentId]: true }));
    try {
      const deptObj = departments.find(d => d.department_id === departmentId);
      const reqRaw = deptObj && deptObj.requirements ? deptObj.requirements : '';
  let parsed = null; try { parsed = JSON.parse(reqRaw); } catch { /* ignore parse error */ }
      const type = parsed?.type || 'Text';
      const effectiveSemester = selectedSemester || '1st';
      if (type === 'Link') {
        const linkVal = deptLinks[departmentId];
        if (!linkVal || !/^https?:\/\//.test(linkVal)) {
          alert('Enter a valid link (http/https) for this department requirement.');
          setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
          return;
        }
  await api.post('/department-status/request', {
          student_id: user.student_id,
          department_id: departmentId,
            semester: effectiveSemester,
            requirements: reqRaw,
            link: linkVal
        });
        setDeptLinks(prev => ({ ...prev, [departmentId]: '' }));
      } else if (type === 'Checklist') {
        const checklistVals = deptChecklists[departmentId];
        if (!checklistVals || !checklistVals.some(Boolean)) {
          alert('Check at least one checklist item before requesting.');
          setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
          return;
        }
  await api.post('/department-status/request', {
          student_id: user.student_id,
          department_id: departmentId,
          semester: effectiveSemester,
          requirements: reqRaw,
          checklist: checklistVals
        });
        setDeptChecklists(prev => ({ ...prev, [departmentId]: [] }));
      } else { // File/Text/Other treat as multipart
        const formData = new FormData();
        formData.append('semester', effectiveSemester);
        formData.append('requirements', reqRaw);
        if (deptFiles[departmentId] && deptFiles[departmentId].length > 0) {
          formData.append('file', deptFiles[departmentId][0]);
        }
  await api.post('/department-status/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setDeptFiles(prev => ({ ...prev, [departmentId]: null }));
      }
  const res = await api.get(`/department-status/statuses?student_id=${user.student_id}&semester=${selectedSemester}`);
      setDepartmentStatuses(res.data.statuses || []);
      onStatusChange && onStatusChange();
    } catch (e) {
      console.error(e);
      setError('Failed to request department approval.');
    }
    setDeptRequesting(prev => ({ ...prev, [departmentId]: false }));
  };

  // Request approval for a subject
  const requestApproval = async (subjectId) => {
    if (!window.confirm('Are you sure you want to request approval for this subject? This will submit your uploaded file and requirements.')) {
      return;
    }
    setRequesting(prev => ({ ...prev, [subjectId]: true }));
    try {
      const formData = new FormData();
      formData.append('student_id', user.student_id);
      formData.append('subject_id', subjectId);
      // Allow requesting even if user did not manually select a semester.
      // Fallback order: user selection -> subject's own semester -> '1st'
      const subjectObj = subjects.find(s => s.subject_id === subjectId);
      const effectiveSemester = selectedSemester || (subjectObj && subjectObj.semester) || '1st';
      formData.append('semester', effectiveSemester);
      // No requirements field
      if (files[subjectId] && files[subjectId].length > 0) {
        files[subjectId].forEach((file) => {
          formData.append('files', file); // backend should accept array under 'files'
        });
      }
  await api.post('/student-subject-status/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Upsert status locally (no duplicates)
      setSubjectStatuses(prev => {
        const updated = upsertSubjectStatus(prev, { subject_id: subjectId, status: 'Requested', semester: effectiveSemester });
        onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
        // Dispatch global event for dashboards/analytics listeners
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subjectId, status: 'Requested', semester: effectiveSemester } }));
        }
        return updated;
      });
  onStatusChange && onStatusChange();
      // No requirements reset
      setFiles(prev => ({ ...prev, [subjectId]: null }));
    } catch (err) {
      console.error('Error requesting approval:', err);
      setError('Failed to request approval.');
    }
    setRequesting(prev => ({ ...prev, [subjectId]: false }));
  };

  // Helper to get status for a subject
  const getStatus = (subjectId) => {
    const found = subjectStatuses.find(s => s.subject_id === subjectId);
    return found ? found.status : 'Pending';
  };

  // --- Polling: keep subject statuses fresh after teacher approves/rejects ---
  // Without this, the student would continue to see 'Requested' (or 'Pending' if initial fetch missed)
  // until a manual page refresh. Poll gently (every 15s) when a clearance exists.
  React.useEffect(() => {
    if (!user || userType !== 'user' || !clearance) return; // only when clearance present
    let cancelled = false;
    const interval = setInterval(() => {
      const effectiveSemester = selectedSemester || '1st';
  api.get(`/student-subject-status/requested-statuses?student_id=${user.student_id}&semester=${effectiveSemester}`)
        .then(res => {
          if (cancelled) return;
            const incoming = (res.data.statuses || []).map(s => ({ ...s, semester: s.semester || effectiveSemester }));
            // Merge with existing using latest status per subject_id
            const map = new Map();
            subjectStatuses.forEach(s => map.set(s.subject_id, s));
            let changed = false;
            incoming.forEach(s => {
              const prev = map.get(s.subject_id);
              if (!prev || prev.status !== s.status) {
                changed = true;
              }
              map.set(s.subject_id, { ...prev, ...s, semester: s.semester || prev?.semester || effectiveSemester });
            });
            if (changed) {
              const updated = Array.from(map.values());
              setSubjectStatuses(updated);
              onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { refresh: true, semester: effectiveSemester } }));
              }
            }
        })
        .catch(() => { /* silent */ });
    }, 15000); // 15s gentle polling
    return () => { cancelled = true; clearInterval(interval); };
  }, [user, userType, clearance, selectedSemester, subjectStatuses, subjects, onStatusesUpdate]);

  if (!user || userType !== 'user') {
    return <div style={styles.error}>❌ Access denied. Only students can view clearance status.</div>;
  }

  // Derive helper flags
  // (Removed unused derived flag needToRequest)
  // Aggregated summary data
  const subjectAgg = subjectStatuses.reduce((acc,s)=>{ acc[s.status]=(acc[s.status]||0)+1; return acc; },{});
  const departmentAgg = departmentStatuses.reduce((acc,s)=>{ acc[s.status]=(acc[s.status]||0)+1; return acc; },{});
  const totalSubjects = subjects.length;
  const totalDepartments = departments.length;
  const segBar = (approved, requested, pending, rejected) => {
    const sum = (approved+requested+pending+rejected)||1;
    const w = v => (v/sum)*100;
    return (
      <div style={styles.progressBar}>
        <div style={{ width:w(approved)+'%', background:'linear-gradient(90deg,#4caf50,#2e7d32)', transition:'width .4s' }} />
        <div style={{ width:w(requested)+'%', background:'linear-gradient(90deg,#ffb300,#ff9800)', transition:'width .4s' }} />
        <div style={{ width:w(pending)+'%', background:'linear-gradient(90deg,#0288d1,#0277bd)', transition:'width .4s' }} />
        <div style={{ width:w(rejected)+'%', background:'linear-gradient(90deg,#e53935,#c62828)', transition:'width .4s' }} />
      </div>
    );
  };
  const badge = (status) => {
    if(!status) return <span style={{ ...styles.badge, background:'#90a4ae' }}>—</span>;
    const map = {
      Approved: { bg:'linear-gradient(135deg,#43a047,#1b5e20)', icon:'✅' },
      Requested: { bg:'linear-gradient(135deg,#ff9800,#ef6c00)', icon:'🔄' },
      Pending: { bg:'linear-gradient(135deg,#0277bd,#01579b)', icon:'⏳' },
      Rejected: { bg:'linear-gradient(135deg,#e53935,#b71c1c)', icon:'❌' }
    };
    const cfg = map[status] || { bg:'linear-gradient(135deg,#607d8b,#455a64)', icon:'?' };
    return <span style={{ ...styles.badge, background: cfg.bg }}>{cfg.icon} {status}</span>;
  };

  // Build Half-Letter (5.5in x 8.5in) compressed clearance HTML for printing
  const buildHalfLetterHTML = () => {
    const genDate = new Date();
    const fmtDate = genDate.toLocaleDateString();
    const fmtTime = genDate.toLocaleTimeString();
    // Map statuses for quick lookup
    const subjStatusMap = new Map(subjectStatuses.map(s=>[s.subject_id,s]));
    const deptStatusMap = new Map(departmentStatuses.map(s=>[s.department_id,s]));
    const esc = (str='') => String(str).replace(/[&<>]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
    // Subjects list: show teacher name (always) beneath subject; signature only if Approved
    const subjectItems = subjects.map(sub => {
      const st = subjStatusMap.get(sub.subject_id)?.status || 'Pending';
      const approved = st === 'Approved';
      const teacherName = sub.teacher ? `${sub.teacher.firstname||''} ${sub.teacher.lastname||''}`.trim() : '';
      const sigImg = approved && sub.teacher?.signature ? `<img src='${sub.teacher.signature}' alt='sig' style='max-height:22px;max-width:54px;display:block;margin:0 auto;' />` : '';
      const sigCell = approved ? (sigImg || `<span class="sig">${esc(teacherName)}</span>`) : '<span class="line" />';
      const teacherLine = teacherName ? `<br/><em style='font-size:6.2px;color:#334155;'>${esc(teacherName)}</em>` : '';
      return `<li class="it s-${st[0]}"><span class="n">${esc(sub.name)}${teacherLine}</span><span class="st">${st}</span>${sigCell}</li>`;
    }).join('');
    const deptItems = departments.map(dept => {
      const st = deptStatusMap.get(dept.department_id)?.status || 'Pending';
      const approved = st === 'Approved';
      const staffName = approved && dept.staff ? `${dept.staff.firstname||''} ${dept.staff.lastname||''}`.trim() : '';
      const sigImg = approved && dept.staff?.signature ? `<img src='${dept.staff.signature}' alt='sig' style='max-height:22px;max-width:54px;display:block;margin:0 auto;' />` : '';
      const sigCell = approved ? (sigImg || `<span class="sig">${esc(staffName)}</span>`) : '<span class="line" />';
      return `<li class="it s-${st[0]}"><span class="n">${esc(dept.name)}</span><span class="st">${st}</span>${sigCell}</li>`;
    }).join('');
    const clearanceStatus = clearance?.status || '—';
  return `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Clearance</title>
      <style>
        @page { size: 5.5in 8.5in; margin:0.35in; }
        html,body { padding:0; margin:0; }
        body { width:5.5in; height:8.5in; overflow:hidden; font-family:'Segoe UI',Arial,sans-serif; font-size:10px; color:#0f172a; }
        * { box-sizing:border-box; }
        .hdr { display:flex; align-items:center; gap:8px; margin:0 0 2px; }
        .hdr img { height:26px; width:auto; display:block; object-fit:contain; }
        .hdr-title { flex:1; text-align:center; font-size:13px; font-weight:700; letter-spacing:.6px; color:#013352; }
        h1 { font-size:14px; margin:0 0 2px; text-align:center; font-weight:700; letter-spacing:.5px; }
        .sub { text-align:center; font-size:8px; margin:0 0 4px; color:#475569; }
        .bar { height:4px; width:100%; background:linear-gradient(90deg,#01579b,#0288d1,#43a047); border-radius:3px; margin:2px 0 4px; }
        .meta { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:2px 8px; margin:2px 0 4px; }
        .meta div { font-size:8.5px; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sections { display:flex; gap:6px; margin-top:2px; height: calc(8.5in - 0.35in - 0.35in - 115px); }
        .col { flex:1; display:flex; flex-direction:column; min-width:0; }
  h2 { font-size:9.5px; margin:4px 0 4px; padding:4px 6px; background:#0277bd !important; color:#fff; border-radius:6px; letter-spacing:.55px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.15); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        ul.list { list-style:none; padding:0; margin:0; column-count:1; column-gap:0; }
        /* Multi-column if large */
        ul.list.large { column-count:2; }
        li.it { break-inside:avoid; border:1px solid #cfe8f7; background:#f8fcff; margin:0 0 2px; padding:2px 3px 2px 4px; display:grid; grid-template-columns: 1fr auto 54px; align-items:center; border-radius:4px; }
        li.it:nth-child(even){ background:#eef7fd; }
        .n { font-size:7.5px; line-height:1.1; padding-right:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .st { font-size:7px; font-weight:600; padding:2px 4px; border-radius:10px; background:#e0f2fe; color:#0369a1; letter-spacing:.3px; }
        .s-A .st { background:#e6f6ec; color:#1b5e20; }
        .s-R .st { background:#fde7e7; color:#b71c1c; }
        .s-P .st { background:#e0f2fe; color:#01579b; }
        .s-Rj .st { background:#fff4e5; color:#b45309; }
        .sig { font-family:"Brush Script MT","Segoe Script",cursive; font-size:9px; text-align:center; color:#2e7d32; }
        .line { display:block; height:10px; border-bottom:1px solid #64748b; margin:0 6px; }
        footer { position:absolute; left:0; right:0; bottom:0.25in; text-align:center; font-size:7px; color:#64748b; }
        .legend { display:flex; gap:4px; justify-content:center; margin:2px 0 4px; flex-wrap:wrap; }
        .legend span { font-size:6.5px; padding:2px 5px; border-radius:10px; background:#e2e8f0; }
        .legend .A { background:#c8ead2; }
        .legend .P { background:#cbe7f7; }
        .legend .R { background:#f8d4d4; }
        .legend .Rj { background:#ffe2bf; }
        .sign-row { display:flex; gap:10px; margin-top:2px; }
        .sign-slot { flex:1; text-align:center; font-size:7px; }
        .sign-slot .line { height:12px; }
        /* Scaling wrapper */
        #scaleWrap { transform-origin: top left; }
        .print-bar { position:sticky; top:0; background:#012d4a; color:#fff; padding:6px 10px; display:flex; align-items:center; gap:10px; font-size:9px; z-index:50; }
        .print-bar button { background:#ffb300; border:none; color:#012d4a; font-weight:700; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:9px; }
        .print-bar button:hover { background:#ffa000; }
      </style>
      <script>
        (function(){
          let printed=false;
          function fit(){
            const wrap=document.getElementById('scaleWrap');
            if(!wrap) return;
            const availH= (window.innerHeight - 10);
            const h= wrap.scrollHeight;
            if(h>availH){
              const scale= Math.max(0.42, availH / h);
              wrap.style.transform='scale('+scale+')';
            }
          }
          window.addEventListener('load',()=>{
            fit();
            setTimeout(()=>{ if(!printed){ printed=true; try{ window.print(); }catch(e){} } }, 180);
          });
          window.addEventListener('afterprint',()=>{ printed=true; });
        })();
      </script>
  </head><body><base href="${window.location.origin}/"><div id='scaleWrap'>
      <div class='hdr'>
        <img src='/eClearance.png' alt='eClearance Logo' />
        <div class='hdr-title'>OFFICIAL CLEARANCE</div>
      </div>
      <div class='sub'>Generated: ${fmtDate} ${fmtTime}</div>
      <div class='bar'></div>
      <div class='meta'>
        <div><strong>Student:</strong> ${esc(user?.firstname)} ${esc(user?.lastname)}</div>
        <div><strong>ID:</strong> ${esc(user?.student_id)}</div>
        <div><strong>Course:</strong> ${esc(user?.course||'—')}</div>
        <div><strong>Year:</strong> ${esc(user?.year_level||'—')}</div>
        <div><strong>Semester:</strong> ${esc(selectedSemester||'1st')}</div>
        <div><strong>Clr ID:</strong> ${esc(clearance?.clearance_id||'')}</div>
        <div><strong>Status:</strong> ${esc(clearanceStatus)}</div>
        <div><strong>Subjects:</strong> ${subjects.length}</div>
        <div><strong>Depts:</strong> ${departments.length}</div>
      </div>
      <div class='legend'><span class='A'>Approved</span><span class='P'>Pending/Requested</span><span class='R'>Rejected</span><span class='Rj'>Re-eval</span></div>
      <div class='sections'>
        <div class='col'>
          <h2>Subjects</h2>
          <ul class='list ${subjects.length>8?'large':''}'>${subjectItems||'<li class="it"><span class="n">None</span></li>'}</ul>
        </div>
        <div class='col'>
          <h2>Departments</h2>
          <ul class='list ${departments.length>8?'large':''}'>${deptItems||'<li class="it"><span class="n">None</span></li>'}</ul>
        </div>
      </div>
      <div class='sign-row'>
        <div class='sign-slot'>${(clearanceStatus==='Approved' && user?.signature) ? `<img src='${user.signature}' alt='Student Signature' style='max-height:24px;max-width:70px;display:block;margin:0 auto 2px;' />` : `<span class='line'></span>`} ${esc(user?.firstname||'')} ${esc(user?.lastname||'')}<div style='font-size:6px;color:#475569;'>Student</div></div>
        <div class='sign-slot'><span class='line'></span> Registrar</div>
        <div class='sign-slot'><span class='line'></span> Dean</div>
      </div>
      <footer>Compressed half-letter format. Signatures show only for approved items. System generated.</footer>
    </div></body></html>`;
  };

  // Build Full Letter (8.5in x 11in) readable clearance HTML with adaptive scaling
  const buildFullLetterHTML = () => {
    const now = new Date();
    const fmtDate = now.toLocaleDateString();
    const fmtTime = now.toLocaleTimeString();
    const subjStatusMap = new Map(subjectStatuses.map(s=>[s.subject_id,s]));
    const deptStatusMap = new Map(departmentStatuses.map(s=>[s.department_id,s]));
    const esc = (str='') => String(str).replace(/[&<>]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
    // (Removed requirement type parsing; table now shows Teacher and Staff names instead.)
  // (Action items removed from output per request)
    // Subjects table: replace Requirement Type column with Teacher name column
    const subjectRows = subjects.map(sub => {
      const st = subjStatusMap.get(sub.subject_id)?.status || 'Pending';
      const approved = st === 'Approved';
      const teacherName = sub.teacher ? `${sub.teacher.firstname||''} ${sub.teacher.lastname||''}`.trim() : '—';
      const cls = st === 'Approved' ? 'A' : (st === 'Rejected' ? 'R' : (st === 'Pending' ? 'P' : 'Re'));
      const sigImg = approved && sub.teacher?.signature ? `<img src='${sub.teacher.signature}' alt='sig' style='max-height:30px;max-width:110px;display:block;margin:0 auto;' />` : '';
      const sigCell = approved ? (sigImg || `<span class='sig'>${esc(teacherName)}</span>`) : '<span class="line"></span>';
      return `<tr class="r ${cls}"><td class="nm">${esc(sub.name)}</td><td class="tp">${esc(teacherName)}</td><td class="st">${esc(st)}</td><td class="sg">${sigCell}</td></tr>`;
    }).join('');
    const deptRows = departments.map(dept => {
      const st = deptStatusMap.get(dept.department_id)?.status || 'Pending';
      const approved = st === 'Approved';
      const staffName = dept.staff ? `${dept.staff.firstname||''} ${dept.staff.lastname||''}`.trim() : '—';
      const cls = st === 'Approved' ? 'A' : (st === 'Rejected' ? 'R' : (st === 'Pending' ? 'P' : 'Re'));
      const sigImg = approved && dept.staff?.signature ? `<img src='${dept.staff.signature}' alt='sig' style='max-height:30px;max-width:110px;display:block;margin:0 auto;' />` : '';
      const sigCell = approved ? (sigImg || `<span class='sig'>${esc(staffName)}</span>`) : '<span class="line"></span>';
      return `<tr class="r ${cls}"><td class="nm">${esc(dept.name)}</td><td class="tp">${esc(staffName)}</td><td class="st">${esc(st)}</td><td class="sg">${sigCell}</td></tr>`;
    }).join('');
    const clearanceStatus = clearance?.status || '—';
    const many = subjects.length + departments.length > 26; // extra column threshold
    const countBy = (arr, getter) => arr.reduce((m,x)=>{ const k=getter(x); m[k]=(m[k]||0)+1; return m; },{});
    const subjCounts = countBy(subjects, s=> (subjStatusMap.get(s.subject_id)?.status||'Pending'));
    const deptCounts = countBy(departments, d=> (deptStatusMap.get(d.department_id)?.status||'Pending'));
    const val = (o,k) => o[k]||0;
  // Progress metrics removed (previously: totalNeeded, totalApproved, completionPct)
  // Removed actionsHTML and Next Steps section
    return `<!DOCTYPE html><html><head><meta charset='utf-8'/>
      <style>
        @page { size: Letter portrait; margin:0.55in; }
        body { font-family:'Segoe UI',Arial,sans-serif; margin:0; color:#0f172a; font-size:12px; }
        h1 { text-align:center; margin:0 0 4px; font-size:24px; letter-spacing:.5px; font-weight:700; }
        .hdr { display:flex; align-items:center; gap:16px; margin:0 0 8px; }
        .hdr img { height:52px; width:auto; object-fit:contain; display:block; }
        .hdr-block { flex:1; text-align:center; }
        .sys-name { font-size:13px; font-weight:600; letter-spacing:1px; color:#01579b; }
        .doc-title { font-size:22px; font-weight:800; letter-spacing:.75px; color:#012d4a; margin-top:2px; }
        .sub { text-align:center; font-size:11px; margin:0 0 10px; color:#475569; }
        .meta { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:4px 16px; margin:0 0 14px; font-size:11px; }
        .meta div { line-height:1.25; }
        .legend { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin:0 0 10px; }
        .legend span { font-size:10px; padding:4px 10px; border-radius:16px; background:#e2e8f0; font-weight:600; letter-spacing:.3px; }
        .legend .A{background:#c8ead2;color:#1b5e20;} .legend .P{background:#cbe7f7;color:#01579b;} .legend .R{background:#f8d4d4;color:#b71c1c;} .legend .Re{background:#ffe2bf;color:#b45309;}
        .tables { display:flex; gap:24px; align-items:flex-start; }
        .tbl-wrap { flex:1; min-width:0; }
  h2 { margin:0 0 10px; font-size:15px; letter-spacing:.4px; color:#fff; background:#0277bd !important; background:linear-gradient(135deg,#0277bd 0%,#015b90 70%); padding:8px 14px; border-radius:10px; border:none; box-shadow:0 2px 4px rgba(0,0,0,0.12); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        table { width:100%; border-collapse:separate; border-spacing:0; font-size:${many? '10px':'11.5px'}; }
        th { background:linear-gradient(135deg,#0277bd,#01579b); color:#fff; padding:${many? '5px 6px':'7px 8px'}; text-align:left; font-weight:600; font-size:${many? '10px':'12px'}; }
        td { background:#fff; border-bottom:1px solid #e2ecf3; padding:${many? '4px 6px':'6px 8px'}; vertical-align:middle; }
        tr:nth-child(even) td { background:#f5fafe; }
        td.st { font-weight:600; }
        tr.A td.st { color:#1b5e20; }
        tr.P td.st { color:#01579b; }
        tr.R td.st { color:#b71c1c; }
        tr.Re td.st { color:#b45309; }
        .sig { font-family:"Brush Script MT","Segoe Script",cursive; font-size:${many? '14px':'16px'}; color:#2e7d32; }
        .line { display:block; height:${many? '16px':'18px'}; border-bottom:1px solid #475569; }
        footer { margin-top:18px; text-align:center; font-size:10px; color:#64748b; }
        .signatures { display:flex; gap:60px; justify-content:center; margin-top:18px; }
        .sig-slot { text-align:center; font-size:11px; }
        .sig-slot .line { height:20px; margin-bottom:4px; }
        #scaleWrap { transform-origin: top left; }
        .print-bar { position:sticky; top:0; background:#012d4a; color:#fff; padding:8px 12px; display:flex; align-items:center; gap:14px; font-size:11px; z-index:60; }
        .print-bar button { background:#ffb300; border:none; color:#012d4a; font-weight:700; padding:6px 14px; border-radius:8px; cursor:pointer; font-size:11px; }
        .print-bar button:hover { background:#ffa000; }
      </style>
      <script>
        (function(){
          let printed=false;
          function fit(){
            const wrap=document.getElementById('scaleWrap');
            if(!wrap) return; 
            const limit= (window.innerHeight * 0.98);
            const h= wrap.scrollHeight; 
            if(h>limit){
              const scale=Math.max(0.65, limit/h);
              wrap.style.transform='scale('+scale.toFixed(3)+')';
            }
          }
          window.addEventListener('load',()=>{ fit(); setTimeout(()=>{ if(!printed){ printed=true; try{window.print();}catch(e){} } },200); });
          window.addEventListener('afterprint',()=>{ printed=true; });
        })();
      </script>
  </head><body><base href="${window.location.origin}/"><div id='scaleWrap'>
      <div class='hdr'>
        <img src='/eClearance.png' alt='eClearance Logo' />
        <div class='hdr-block'>
          <div class='sys-name'>eCLEARANCE SYSTEM</div>
          <div class='doc-title'>OFFICIAL CLEARANCE</div>
          <div class='sub'>Generated: ${fmtDate} ${fmtTime}</div>
        </div>
      </div>
      <div class='meta'>
        <div><strong>Student:</strong> ${esc(user?.firstname)} ${esc(user?.lastname)}</div>
        <div><strong>ID:</strong> ${esc(user?.student_id)}</div>
        <div><strong>Course:</strong> ${esc(user?.course||'—')}</div>
        <div><strong>Year:</strong> ${esc(user?.year_level||'—')}</div>
        <div><strong>Semester:</strong> ${esc(selectedSemester||'1st')}</div>
        <div><strong>Clearance ID:</strong> ${esc(clearance?.clearance_id||'')}</div>
        <div><strong>Clearance Status:</strong> ${esc(clearanceStatus)}</div>
        <div><strong>Subjects:</strong> ${subjects.length} (A:${val(subjCounts,'Approved')} / Rq:${val(subjCounts,'Requested')} / Rej:${val(subjCounts,'Rejected')})</div>
        <div><strong>Departments:</strong> ${departments.length} (A:${val(deptCounts,'Approved')} / Rq:${val(deptCounts,'Requested')} / Rej:${val(deptCounts,'Rejected')})</div>
      </div>
      <!-- Progress and status definition section removed per request -->
      <!-- Next Steps section removed per user request -->
      <div class='legend'><span class='A'>Approved</span><span class='P'>Pending / Requested</span><span class='R'>Rejected</span><span class='Re'>Re-eval</span></div>
      <div class='tables'>
        <div class='tbl-wrap'>
          <h2>Subjects</h2>
          <table>
            <thead><tr><th style='width:44%'>Subject</th><th style='width:16%'>Teacher</th><th style='width:20%'>Status</th><th style='width:20%'>Signature</th></tr></thead>
            <tbody>${subjectRows || '<tr><td colspan=4>No subjects</td></tr>'}</tbody>
          </table>
        </div>
        <div class='tbl-wrap'>
          <h2>Departments</h2>
          <table>
            <thead><tr><th style='width:44%'>Department</th><th style='width:16%'>Staff</th><th style='width:20%'>Status</th><th style='width:20%'>Signature</th></tr></thead>
            <tbody>${deptRows || '<tr><td colspan=4>No departments</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class='signatures'>
        <div class='sig-slot'>${(clearanceStatus==='Approved' && user?.signature) ? `<img src='${user.signature}' alt='Student Signature' style='max-height:40px;max-width:150px;display:block;margin:0 auto 4px;' />` : `<span class='line'></span>`}<div>${esc(user?.firstname||'')} ${esc(user?.lastname||'')}</div><div style='font-size:10px;color:#475569;'>Student</div></div>
        <div class='sig-slot'><span class='line'></span>Registrar</div>
        <div class='sig-slot'><span class='line'></span>Dean</div>
      </div>
  <footer>Detailed Letter format. Signatures only appear when status is Approved. System generated.</footer>
    </div></body></html>`;
  };

  // ---- Print Helper (Iframe) to avoid about:blank popup window ----
  // Controlled popup print using data URL (eliminates about:blank & double print in Chrome)
  const printHTML = (rawHtml) => {
    if (printingRef.current) return; // guard multiple rapid clicks
    printingRef.current = true;
    try {
      const blob = new Blob([rawHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, 'PRINT_WINDOW', 'noopener,noreferrer,width=950,height=1200');
      if (!w) { printingRef.current = false; URL.revokeObjectURL(url); return; }
      // Release guard after a few seconds (auto close removed so user can reprint manually inside popup)
      setTimeout(()=>{ printingRef.current=false; URL.revokeObjectURL(url); }, 4000);
    } catch(e) {
      console.error('Failed to open print window', e);
      printingRef.current = false;
    }
  };

  // Download PDF (render the full letter HTML into a canvas and then PDF)
  const downloadPDF = async (mode='full') => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    try {
  const html = mode === 'half' ? buildHalfLetterHTML() : buildFullLetterHTML();
      // Create a sandbox container to render HTML (hidden)
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.background = '#fff';
      container.innerHTML = html
        .replace(/<!DOCTYPE[\s\S]*?<body[^>]*>/i,'')
        .replace(/<\/body>[\s\S]*?<\/html>/i,'');
      document.body.appendChild(container);
  const target = container; // entire rendered content
  const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      // Determine page size (letter portrait)
      const pdf = new jsPDF('p','pt','letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let renderWidth = pageWidth - 40; // margins
      let renderHeight = renderWidth / ratio;
      if (renderHeight > pageHeight - 40) {
        renderHeight = pageHeight - 40;
        renderWidth = renderHeight * ratio;
      }
      const x = (pageWidth - renderWidth)/2;
      const y = 20;
      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
      const fileName = `clearance_${user?.student_id||'student'}_${mode}_${Date.now()}.pdf`;
      pdf.save(fileName);
      document.body.removeChild(container);
    } catch(err) {
      console.error('PDF generation failed', err);
      downloadingRef.current = false;
      return;
    }
    downloadingRef.current = false;
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📝 Clearance Status</h1>
        <p style={styles.heroSubtitle}>Monitor progress for subjects and departments this semester.</p>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 85% 25%, rgba(255,255,255,0.18), transparent 60%)', pointerEvents:'none' }} />
        {/* Print Button */}
        {clearance && (
          <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:8 }}>
            <button
              onClick={() => {
                const html = buildFullLetterHTML();
                printHTML(html);
              }}
              style={{
                background:'linear-gradient(135deg,#ffb300 0%,#f57c00 100%)',
                border:'none',
                color:'#fff',
                padding:'10px 18px',
                borderRadius:14,
                cursor:'pointer',
                fontWeight:700,
                fontSize:'0.7rem',
                boxShadow:'0 4px 12px rgba(245,124,0,0.35)',
                letterSpacing:'.5px'
              }}
            >
              🖨️ Print Detailed (Letter)
            </button>
            <button
              onClick={() => {
                const html = buildHalfLetterHTML();
                printHTML(html);
              }}
              style={{
                background:'linear-gradient(135deg,#0288d1 0%,#01579b 100%)',
                border:'none',
                color:'#fff',
                padding:'10px 14px',
                borderRadius:14,
                cursor:'pointer',
                fontWeight:700,
                fontSize:'0.65rem',
                boxShadow:'0 4px 12px rgba(2,119,189,0.35)',
                letterSpacing:'.5px'
              }}
            >
              � Compact
            </button>
            <button
              onClick={() => downloadPDF('full')}
              style={{
                background:'linear-gradient(135deg,#43a047 0%,#2e7d32 100%)',
                border:'none',
                color:'#fff',
                padding:'10px 14px',
                borderRadius:14,
                cursor:'pointer',
                fontWeight:700,
                fontSize:'0.65rem',
                boxShadow:'0 4px 12px rgba(56,142,60,0.35)',
                letterSpacing:'.5px'
              }}
            >⬇️ PDF</button>
          </div>
        )}
      </div>
      {clearance && (
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'.75px', color:'#0277bd', textTransform:'uppercase' }}>Subjects Progress</div>
            {segBar(subjectAgg.Approved||0, subjectAgg.Requested||0, (totalSubjects - ((subjectAgg.Approved||0)+(subjectAgg.Requested||0)+(subjectAgg.Rejected||0))), subjectAgg.Rejected||0)}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6rem', marginTop:6, fontWeight:600 }}>
              <span>Approved {subjectAgg.Approved||0}</span>
              <span>Requested {subjectAgg.Requested||0}</span>
              <span>Rejected {subjectAgg.Rejected||0}</span>
              <span>Total {totalSubjects}</span>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'.75px', color:'#0277bd', textTransform:'uppercase' }}>Departments Progress</div>
            {segBar(departmentAgg.Approved||0, departmentAgg.Requested||0, (totalDepartments - ((departmentAgg.Approved||0)+(departmentAgg.Requested||0)+(departmentAgg.Rejected||0))), departmentAgg.Rejected||0)}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6rem', marginTop:6, fontWeight:600 }}>
              <span>Approved {departmentAgg.Approved||0}</span>
              <span>Requested {departmentAgg.Requested||0}</span>
              <span>Rejected {departmentAgg.Rejected||0}</span>
              <span>Total {totalDepartments}</span>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'.75px', color:'#0277bd', textTransform:'uppercase' }}>Clearance Status</div>
            <div style={{ marginTop:6 }}>{badge(clearance?.status)}</div>
            <div style={{ fontSize:'0.6rem', marginTop:6, fontWeight:600, color:'#455a64' }}>Semester: {selectedSemester || '1st'}</div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <label style={styles.label}>Semester (optional)</label>
        <select
          style={styles.input}
          value={selectedSemester}
          onChange={e => {
            e.stopPropagation();
            setSelectedSemester(e.target.value);
          }}
          onFocus={e => e.stopPropagation()}
          onBlur={e => e.stopPropagation()}
        >
          <option value="">(Auto) Default: 1st</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>
      </div>
  {/* Loading text removed to prevent persistent display */}
      {error && !clearance && (
        <div style={styles.error}>
          {error}
          { /No clearance for this semester/i.test(error) && (
            <div style={{ marginTop: 8, fontSize: 13, display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
              <span>👉 You have not created a clearance for this semester yet.</span>
              <button
                onClick={() => window.location.href = '/student/clearance'}
                style={{
                  background:'linear-gradient(135deg,#0277bd 0%,#01579b 100%)',
                  color:'#fff',
                  border:'none',
                  padding:'10px 18px',
                  fontSize:typeScale.lg,
                  borderRadius:28,
                  cursor:'pointer',
                  fontWeight:700,
                  letterSpacing:'.5px',
                  boxShadow:'0 6px 18px rgba(2,119,189,0.35)',
                  display:'inline-flex',
                  alignItems:'center',
                  gap:8
                }}
              >
                ✨ Create Clearance Now
              </button>
            </div>
          )}
        </div>
      )}
      {/* Individual clearance status box replaced by summary above */}
      {/* If no clearance for selected semester, show instruction and hide subjects/departments */}
      {!clearance && (
        <div style={{
          background: 'linear-gradient(135deg,#fff8e1 0%,#ffecb3 100%)',
          border: '1px solid #ffcc80',
          padding: '22px 24px',
          borderRadius: 18,
          marginTop: 14,
          color: '#8d560c',
          fontWeight: 600,
          textAlign: 'center',
          boxShadow: '0 8px 24px -6px rgba(255,171,0,0.35)',
          display:'flex',
          flexDirection:'column',
          gap:14,
          alignItems:'center'
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: 0, letterSpacing:'.5px', fontWeight:800 }}>⚠️ Clearance Not Created</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.55 }}>
            You haven't created a clearance for the <strong>{selectedSemester || '1st'}</strong> semester yet.<br/>
            Click the button below to create one. After creation, your subjects and department requirements will appear here automatically.
          </div>
          <button
            onClick={() => window.location.href = '/student/clearance'}
            style={{
              background:'linear-gradient(135deg,#0277bd 0%,#01579b 100%)',
              color:'#fff',
              border:'none',
              padding:'12px 28px',
              fontSize:typeScale.xl,
              borderRadius:30,
              cursor:'pointer',
              fontWeight:800,
              letterSpacing:'.75px',
              boxShadow:'0 10px 28px -6px rgba(2,119,189,0.45)',
              display:'inline-flex',
              alignItems:'center',
              gap:10
            }}
          >
            🚀 Create Clearance Now
          </button>
        </div>
      )}
      {clearance && (
        <>
          

          {/* Subjects Table */}
          <h3 style={{ 
            color: '#0277bd', 
            fontSize: '1.2rem',
            fontWeight: 700,
            marginTop: 25,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            📘 Subjects
          </h3>
          {subjects.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Teacher</th>
                  <th style={styles.th}>Requirement Type</th>
                  <th style={styles.th}>Instructions</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Submission</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Only show subjects that are in the student's clearance (already filtered by backend) */}
                {subjects.map(subject => {
                  const status = getStatus(subject.subject_id);
                  // Parse requirements as JSON if possible
                  let reqObj = { type: 'Text', instructions: '', checklist: [] };
                  if (subject.requirements) {
                    try {
                      reqObj = JSON.parse(subject.requirements);
                      // Ensure instructions field exists (backward compatibility)
                      if (!reqObj.instructions) {
                        reqObj.instructions = reqObj.value || '';
                      }
                    } catch {
                      reqObj = { type: 'Text', instructions: subject.requirements, checklist: [] };
                    }
                  }
                  // Find student's submitted link if any
                  const statusObj = subjectStatuses.find(s => s.subject_id === subject.subject_id);
                  let studentLink = statusObj && statusObj.link ? statusObj.link : '';
                  // Find student's submitted checklist if any
                  let studentChecklist = statusObj && statusObj.checklist ? statusObj.checklist : [];
                  return (
                    <tr key={subject.subject_id}>
                      <td style={styles.td}>{subject.name}</td>
                      <td style={styles.td}>
                        {subject.teacher
                          ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                          : 'N/A'}
                      </td>
                      {/* Requirement Type */}
                      <td style={styles.td}>
                        {(() => {
                          const type = reqObj.type || 'Text';
                          switch(type){
                            case 'Checklist': return '✅ Checklist';
                            case 'Link': return '🔗 Link/URL';
                            case 'File': return '📁 File Upload';
                            case 'Text': return '📝 Text';
                            case 'Other': return '🔧 Other';
                            default: return type;
                          }
                        })()}
                      </td>
                      {/* Instructions Column */}
                      <td style={styles.td}>
                        {(() => {
                          const raw = (reqObj.instructions || '').trim();
                          if (!raw) {
                            return <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#666' }}>No instructions</span>;
                          }
                          const LONG_THRESHOLD = 70;
                          if (raw.length > LONG_THRESHOLD) {
                            return (
                              <button
                                style={{ ...buttonStyles.secondary, padding: '6px 10px', fontSize: '0.6rem', borderRadius: 6, lineHeight: 1.2 }}
                                onClick={() => setInstructionModal({ subjectId: subject.subject_id, name: subject.name, type: reqObj.type, instructions: raw })}
                              >
                                View Instructions ({raw.length} chars)
                              </button>
                            );
                          }
                          return <span style={{ fontSize: '0.7rem', color: '#1976d2' }}>{raw}</span>;
                        })()}
                      </td>
                      <td style={styles.td}>{badge(status)}</td>
                      <td style={styles.td}>
                        {(() => {
                          const statusObjLocal = subjectStatuses.find(s => s.subject_id === subject.subject_id);
                          if (status === 'Rejected' && statusObjLocal?.remarks) {
                            return (
                              <button
                                style={{ ...buttonStyles.danger, padding:'6px 10px', fontSize:'0.6rem', borderRadius:6 }}
                                onClick={() => setRemarksModal({ subjectId: subject.subject_id, name: subject.name, remarks: statusObjLocal.remarks })}
                              >
                                View Remarks
                              </button>
                            );
                          }
                          if (status === 'Approved') {
                            return <span style={{ fontSize:'0.6rem', color:'#2e7d32', fontStyle:'italic' }}>No remarks</span>;
                          }
                          return <span style={{ fontSize:'0.6rem', color:'#9ca3af' }}>-</span>;
                        })()}
                      </td>
                      <td style={styles.td}>
                        {/* If requirement is Checklist, show checklist UI */}
                        {(status === 'Pending' || status === 'Rejected') && reqObj.type === 'Checklist' ? (
                          <div style={reqObj.checklist && reqObj.checklist.length > 2 ? styles.checklistScroll : undefined}>
                            {reqObj.checklist && reqObj.checklist.length > 0 ? (
                              reqObj.checklist.map((item, idx) => (
                                <label key={idx} style={styles.checklistItem}>
                                  <input
                                    type="checkbox"
                                    checked={submittedChecklists[subject.subject_id]?.[idx] || false}
                                    onChange={e => {
                                      e.stopPropagation();
                                      const newChecklist = [...(submittedChecklists[subject.subject_id] || [])];
                                      newChecklist[idx] = e.target.checked;
                                      setSubmittedChecklists(prev => ({ ...prev, [subject.subject_id]: newChecklist }));
                                    }}
                                    onFocus={e => e.stopPropagation()}
                                    onBlur={e => e.stopPropagation()}
                                    style={{ marginRight: 8 }}
                                  />
                                  <span style={{ fontSize: '0.8rem', color: '#333' }}>{item}</span>
                                </label>
                              ))
                            ) : (
                              <div style={{ 
                                fontStyle: 'italic', 
                                color: '#666',
                                padding: 8,
                                background: '#fff3e0',
                                borderRadius: 6,
                                border: '1px solid #ffcc02',
                                fontSize: '0.8rem'
                              }}>
                                💡 No checklist items available. Please contact your teacher.
                              </div>
                            )}
                          </div>
                        ) : (status === 'Pending' || status === 'Rejected') && reqObj.type === 'Link' ? (
                          <>
                            <input
                              type="url"
                              style={styles.input}
                              value={submittedLinks[subject.subject_id] || ''}
                              placeholder="Paste your link here..."
                              onChange={e => {
                                e.stopPropagation();
                                setSubmittedLinks(prev => ({ ...prev, [subject.subject_id]: e.target.value }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                              onKeyDown={e => e.stopPropagation()}
                              onKeyUp={e => e.stopPropagation()}
                            />
                            {studentLink && (
                              <div style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
                                <b>Submitted:</b> <a href={studentLink} target="_blank" rel="noopener noreferrer">{studentLink}</a>
                              </div>
                            )}
                          </>
                        ) : (status === 'Pending' || status === 'Rejected') && (reqObj.type === 'File' || reqObj.type === 'Text') ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              multiple
                              onChange={e => {
                                e.stopPropagation();
                                const fileArr = Array.from(e.target.files);
                                setFiles(prev => ({ ...prev, [subject.subject_id]: fileArr }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                            />
                            {files[subject.subject_id] && files[subject.subject_id].length > 0 && (
                              <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontSize: 12 }}>
                                {files[subject.subject_id].map((file, idx) => (
                                  <li key={idx}>{file.name}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (status !== 'Pending' && status !== 'Rejected') ? <span>-</span> : null}
                        {/* Show submitted link or checklist for Requested/Approved */}
                        {(status === 'Requested' || status === 'Approved') && (() => {
                          if (reqObj.type === 'Checklist' && studentChecklist.length) {
                            return (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12 }}>
                                {(reqObj.checklist || []).map((item, idx) => (
                                  <li key={idx}>
                                    <span style={{ color: studentChecklist[idx] ? '#43a047' : '#e11d48', fontWeight: 600 }}>
                                      {studentChecklist[idx] ? '✔️' : '❌'}
                                    </span> {item}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          if (reqObj.type === 'Link' && studentLink) {
                            return (
                              <a href={studentLink} target="_blank" rel="noopener noreferrer">View Submitted Link</a>
                            );
                          }
                          if (reqObj.type === 'File' && statusObj && (statusObj.file_paths?.length || statusObj.file_path)) {
                            const fileList = statusObj.file_paths && statusObj.file_paths.length
                              ? statusObj.file_paths
                              : (statusObj.file_path ? [statusObj.file_path] : []);
                            return (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {fileList.map((fp, i) => (
                                  <li key={i}>
                                    <a
                                      href={buildFileUrl(`/student-subject-status/file/${subject.subject_id}?file=${encodeURIComponent(fp)}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View Uploaded File {fileList.length > 1 ? i + 1 : ''}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return <span>-</span>;
                        })()}
                      </td>
                      <td style={styles.td}>
                        {(status === 'Pending' || status === 'Rejected') && (
                          <button
                            style={styles.button}
                            disabled={
                              requesting[subject.subject_id] ||
                              (reqObj.type === 'File' && (!files[subject.subject_id] || files[subject.subject_id].length === 0)) ||
                              (reqObj.type === 'Link' && (!submittedLinks[subject.subject_id] || !/^https?:\/\//.test(submittedLinks[subject.subject_id]))) ||
                              (reqObj.type === 'Checklist' && !(submittedChecklists[subject.subject_id] && submittedChecklists[subject.subject_id].some(Boolean)))
                            }
                            onClick={async () => {
                              if (reqObj.type === 'Link') {
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: true }));
                                try {
                                  const resp = await api.post('/student-subject-status/request', {
                                    student_id: user.student_id,
                                    subject_id: subject.subject_id,
                                    semester: selectedSemester,
                                    link: submittedLinks[subject.subject_id]
                                  });
                                  const record = resp?.data?.record;
                                  setSubjectStatuses(prev => {
                                    const updated = upsertSubjectStatus(prev, {
                                      subject_id: subject.subject_id,
                                      status: 'Requested',
                                      link: record?.link || submittedLinks[subject.subject_id] || ''
                                    });
                                    onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
                                    if (typeof window !== 'undefined') {
                                      window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subject.subject_id, status: 'Requested' } }));
                                    }
                                    return updated;
                                  });
                                  setSubmittedLinks(prev => ({ ...prev, [subject.subject_id]: '' }));
                                  onStatusChange && onStatusChange();
                                } catch (err) {
                                  console.error('Error requesting approval:', err);
                                  setError('Failed to request approval.');
                                }
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: false }));
                              } else if (reqObj.type === 'Checklist') {
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: true }));
                                try {
                                  await api.post('/student-subject-status/request', {
                                    student_id: user.student_id,
                                    subject_id: subject.subject_id,
                                    semester: selectedSemester,
                                    checklist: submittedChecklists[subject.subject_id]
                                  });
                                  setSubjectStatuses(prev => {
                                    const updated = upsertSubjectStatus(prev, {
                                      subject_id: subject.subject_id,
                                      status: 'Requested',
                                      checklist: submittedChecklists[subject.subject_id]
                                    });
                                    onStatusesUpdate && onStatusesUpdate({ subjects, statuses: updated });
                                    if (typeof window !== 'undefined') {
                                      window.dispatchEvent(new CustomEvent('student-subject-status-changed', { detail: { subject_id: subject.subject_id, status: 'Requested' } }));
                                    }
                                    return updated;
                                  });
                                  setSubmittedChecklists(prev => ({ ...prev, [subject.subject_id]: [] }));
                                  onStatusChange && onStatusChange();
                                } catch (err) {
                                  console.error('Error requesting approval:', err);
                                  setError('Failed to request approval.');
                                }
                                setRequesting(prev => ({ ...prev, [subject.subject_id]: false }));
                              } else {
                                requestApproval(subject.subject_id);
                              }
                            }}
                          >
                            {requesting[subject.subject_id] ? 'Requesting...' : 'Request Approval'}
                          </button>
                        )}
                        {status === 'Requested' && (
                          <span style={{ 
                            color: '#0277bd', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ⏳ Waiting for Teacher
                          </span>
                        )}
                        {status === 'Approved' && (
                          <span style={{ 
                            color: '#43a047', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ✅ Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            selectedSemester && <p>No subjects found.</p>
          )}

          {/* Instruction Modal */}
          {instructionModal && (
            <div
              onClick={(e)=>{ if(e.target===e.currentTarget) setInstructionModal(null); }}
              style={{
                position:'fixed', top:0,left:0,width:'100vw',height:'100vh',
                background:'rgba(0,0,0,0.55)', display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:10000, backdropFilter:'blur(4px)'
              }}
            >
              <div style={{ background:'#ffffff', borderRadius:18, padding:0, width:'92%', maxWidth:620, boxShadow:'0 18px 50px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', maxHeight:'80vh' }}>
                {/* Header */}
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #e1f5fe', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,#0277bd 0%, #01579b 100%)' }}>
                  <div style={{ fontSize:'1.6rem' }}>📋</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ margin:0, color:'#fff', fontSize:'1.05rem', fontWeight:700 }}>{instructionModal.name}</h4>
                    <div style={{ fontSize:'0.65rem', color:'#e1f5fe', letterSpacing:'0.5px', textTransform:'uppercase', fontWeight:600 }}>
                      {instructionModal.type} Requirement
                    </div>
                  </div>
                  <button
                    onClick={()=>setInstructionModal(null)}
                    style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'0.7rem', fontWeight:600 }}
                  >Close ✕</button>
                </div>
                {/* Content */}
                <div style={{ padding:'18px 22px', overflowY:'auto', lineHeight:1.55 }}>
                  <div style={{
                    fontSize:'0.8rem', background:'#f8fafc', border:'1px solid #e1f5fe', borderRadius:10,
                    padding:'14px 16px', color:'#0d47a1', whiteSpace:'pre-wrap'
                  }}>
                    {instructionModal.instructions}
                  </div>
                </div>
                {/* Footer */}
                <div style={{ padding:'10px 16px', borderTop:'1px solid #e1f5fe', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                  <span style={{ fontSize:'0.6rem', color:'#607d8b' }}>Scroll vertically to read full instructions</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(instructionModal.instructions); }}
                      style={{ ...buttonStyles.secondary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Copy</button>
                    <button
                      onClick={()=>setInstructionModal(null)}
                      style={{ ...buttonStyles.primary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Done</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remarks Modal (Teacher or Department) */}
          {remarksModal && (
            <div
              onClick={(e)=>{ if(e.target===e.currentTarget) setRemarksModal(null); }}
              style={{
                position:'fixed', top:0,left:0,width:'100vw',height:'100vh',
                background:'rgba(0,0,0,0.55)', display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:10001, backdropFilter:'blur(4px)'
              }}
            >
              <div style={{ background:'#ffffff', borderRadius:18, padding:0, width:'92%', maxWidth:520, boxShadow:'0 18px 50px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', maxHeight:'75vh' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #e1f5fe', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,#b71c1c 0%, #880e4f 100%)' }}>
                  <div style={{ fontSize:'1.4rem' }}>📝</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ margin:0, color:'#fff', fontSize:'1rem', fontWeight:700 }}>
                      {remarksModal.type === 'department' ? 'Department Remarks' : 'Teacher Remarks'}
                    </h4>
                    <div style={{ fontSize:'0.6rem', color:'#ffebee', letterSpacing:'0.5px', textTransform:'uppercase', fontWeight:600 }}>
                      {remarksModal.name}
                    </div>
                  </div>
                  <button
                    onClick={()=>setRemarksModal(null)}
                    style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'0.65rem', fontWeight:600 }}
                  >Close ✕</button>
                </div>
                <div style={{ padding:'18px 22px', overflowY:'auto' }}>
                  <div style={{
                    fontSize:'0.75rem', background:'#fff8f8', border:'1px solid #ffcdd2', borderRadius:10,
                    padding:'14px 16px', color:'#b71c1c', whiteSpace:'pre-wrap', lineHeight:1.5
                  }}>
                    {remarksModal.remarks}
                  </div>
                </div>
                <div style={{ padding:'10px 16px', borderTop:'1px solid #e1f5fe', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                  <span style={{ fontSize:'0.6rem', color:'#607d8b' }}>
                    {remarksModal.type === 'department' ? 'These remarks were written by department staff.' : 'These remarks were written by your teacher.'}
                  </span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(remarksModal.remarks || ''); }}
                      style={{ ...buttonStyles.secondary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Copy</button>
                    <button
                      onClick={()=>setRemarksModal(null)}
                      style={{ ...buttonStyles.primary, padding:'6px 12px', fontSize:'0.6rem', borderRadius:6 }}
                    >Done</button>
                  </div>
                </div>
              </div>
            </div>
          )}




          {/* Departments Table */}
          <h3 style={{ 
            color: '#0277bd', 
            fontSize: '1.2rem',
            fontWeight: 700,
            marginTop: 30,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🏢 Departments
          </h3>
          {departments.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Department Name</th>
                  <th style={styles.th}>Assigned Staff</th>
                  <th style={styles.th}>Requirement Type</th>
                  <th style={styles.th}>Instructions</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Submission</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => {
                  const deptStatus = getDeptStatus(dept.department_id);
                  const uploadedFile = getDeptFile(dept.department_id);
                  const deptRemarks = getDeptRemarks(dept.department_id);
                  let staffName = '-';
                  if (dept.staff && (dept.staff.firstname || dept.staff.lastname)) {
                    staffName = `${dept.staff.firstname || ''} ${dept.staff.lastname || ''}`.trim();
                  }
                  // Parse structured requirements similar to subjects
                  let deptReqObj = { type: 'Text', instructions: '', checklist: [] };
                  if (dept.requirements && dept.requirements.trim() !== '') {
                    try {
                      deptReqObj = JSON.parse(dept.requirements);
                      if (!deptReqObj.instructions) {
                        deptReqObj.instructions = deptReqObj.value || '';
                      }
                      if (!deptReqObj.type) deptReqObj.type = 'Text';
                    } catch {
                      // legacy plain text stored
                      deptReqObj = { type: 'Text', instructions: dept.requirements, checklist: [] };
                    }
                  }
                  return (
                    <tr key={dept.department_id || idx}>
                      <td style={styles.td}>{dept.name}</td>
                      <td style={styles.td}>{staffName}</td>
                      {/* Requirement Type */}
                      <td style={styles.td}>
                        {(() => {
                          const type = deptReqObj.type || 'Text';
                          switch(type){
                            case 'Checklist': return '✅ Checklist';
                            case 'Link': return '🔗 Link/URL';
                            case 'File': return '📁 File Upload';
                            case 'Text': return '📝 Text';
                            case 'Other': return '🔧 Other';
                            default: return type;
                          }
                        })()}
                      </td>
                      {/* Instructions (with modal trigger if long) */}
                      <td style={styles.td}>
                        {(() => {
                          const raw = (deptReqObj.instructions || '').trim();
                          if (!raw) {
                            return <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#666' }}>No instructions</span>;
                          }
                          const LONG_THRESHOLD = 70;
                          if (raw.length > LONG_THRESHOLD) {
                            return (
                              <button
                                style={{ ...buttonStyles.secondary, padding: '6px 10px', fontSize: '0.6rem', borderRadius: 6, lineHeight: 1.2 }}
                                onClick={() => setInstructionModal({ departmentId: dept.department_id, name: dept.name, type: deptReqObj.type, instructions: raw })}
                              >
                                View Instructions ({raw.length} chars)
                              </button>
                            );
                          }
                          return <span style={{ fontSize: '0.7rem', color: '#1976d2' }}>{raw}</span>;
                        })()}
                      </td>
                      <td style={styles.td}>{badge(deptStatus)}</td>
                      <td style={styles.td}>
                        {deptStatus === 'Rejected' && deptRemarks ? (
                          <button
                            style={{ ...styles.button, padding: '4px 8px', fontSize: '0.65rem' }}
                            onClick={() => setRemarksModal({
                              type: 'department',
                              name: dept.name,
                              remarks: deptRemarks
                            })}
                          >View</button>
                        ) : <span>-</span>}
                      </td>
                      <td style={styles.td}>
                        {/* Submission cell adapts based on requirement type (display only for now) */}
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && (deptReqObj.type === 'File' || deptReqObj.type === 'Text' || deptReqObj.type === 'Other') ? (
                          <>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={styles.input}
                              onChange={e => {
                                e.stopPropagation();
                                const fileArr = Array.from(e.target.files);
                                setDeptFiles(prev => ({ ...prev, [dept.department_id]: fileArr }));
                              }}
                              onFocus={e => e.stopPropagation()}
                              onBlur={e => e.stopPropagation()}
                            />
                            {deptFiles[dept.department_id] && deptFiles[dept.department_id].length > 0 && (
                              <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontSize: 12 }}>
                                {deptFiles[dept.department_id].map((file, idx) => (
                                  <li key={idx}>{file.name}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (deptStatus === 'Pending' || deptStatus === 'Rejected') && deptReqObj.type === 'Link' ? (
                          <div>
                            <input
                              type="url"
                              placeholder="Paste link (http/https)..."
                              value={deptLinks[dept.department_id] || ''}
                              onChange={e => setDeptLinks(prev => ({ ...prev, [dept.department_id]: e.target.value }))}
                              style={styles.input}
                            />
                            {departmentStatuses.find(s => s.department_id === dept.department_id)?.link && (
                              <div style={{ fontSize:'0.6rem', marginTop:4 }}>
                                <strong>Submitted:</strong> <a href={departmentStatuses.find(s => s.department_id === dept.department_id)?.link} target="_blank" rel="noopener noreferrer">View Link</a>
                              </div>
                            )}
                          </div>
                        ) : (deptStatus === 'Pending' || deptStatus === 'Rejected') && deptReqObj.type === 'Checklist' ? (
                          <div style={deptReqObj.checklist && deptReqObj.checklist.length > 2 ? styles.checklistScroll : undefined}>
                            {(deptReqObj.checklist && deptReqObj.checklist.length > 0) ? (
                              (deptReqObj.checklist).map((item, cIdx) => (
                                <label key={cIdx} style={styles.checklistItem}>
                                  <input
                                    type="checkbox"
                                    checked={deptChecklists[dept.department_id]?.[cIdx] || false}
                                    onChange={e => {
                                      const list = [...(deptChecklists[dept.department_id] || [])];
                                      list[cIdx] = e.target.checked;
                                      setDeptChecklists(prev => ({ ...prev, [dept.department_id]: list }));
                                    }}
                                    style={{ marginRight:6 }}
                                  />
                                  <span style={{ fontSize:'0.65rem' }}>{item}</span>
                                </label>
                              ))
                            ) : (
                              <div style={{ fontSize:'0.6rem', fontStyle:'italic', color:'#666' }}>No checklist items defined.</div>
                            )}
                          </div>
                        ) : <span>-</span>}
                        {(deptStatus === 'Requested' || deptStatus === 'Approved') && uploadedFile && (
                          <a
                            href={buildFileUrl(`/department-status/file/${dept.department_id}?file=${uploadedFile}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Uploaded File
                          </a>
                        )}
                        {((deptStatus === 'Requested' || deptStatus === 'Approved') && !uploadedFile) && <span>-</span>}
                      </td>
                      <td style={styles.td}>
                        {(deptStatus === 'Pending' || deptStatus === 'Rejected') && (
                          <button
                            style={styles.button}
                            disabled={
                              deptRequesting[dept.department_id] ||
                              ((deptReqObj.type === 'File' || deptReqObj.type === 'Text' || deptReqObj.type === 'Other') && (!deptFiles[dept.department_id] || deptFiles[dept.department_id].length === 0)) ||
                              (deptReqObj.type === 'Link' && (!deptLinks[dept.department_id] || !/^https?:\/\//.test(deptLinks[dept.department_id]))) ||
                              (deptReqObj.type === 'Checklist' && !(deptChecklists[dept.department_id] && deptChecklists[dept.department_id].some(Boolean)))
                            }
                            onClick={() => requestDeptApproval(dept.department_id)}
                          >
                            {deptRequesting[dept.department_id] ? 'Requesting...' : 'Request Approval'}
                          </button>
                        )}
                        {deptStatus === 'Requested' && (
                          <span style={{ 
                            color: '#0277bd', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ⏳ Waiting for Department
                          </span>
                        )}
                        {deptStatus === 'Approved' && (
                          <span style={{ 
                            color: '#43a047', 
                            fontWeight: 600,
                            fontStyle: 'italic'
                          }}>
                            ✅ Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No departments found.</p>
          )}
          
        </>
      )}
      {/* Printable Section (hidden on screen) */}
      {clearance && (
        <div id="printable-clearance" style={{ display:'none', padding:0, background:'#fff', color:'#000', fontFamily:'Segoe UI, Arial, sans-serif' }}>
          <div style={{ padding: 0 }}>
            <h1>OFFICIAL CLEARANCE</h1>
            <div style={{ textAlign:'center', fontSize:8, marginTop:0 }}>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
            <div className="meta-grid">
              <div className="meta-item"><strong>Student:</strong> {user?.firstname} {user?.lastname}</div>
              <div className="meta-item"><strong>ID:</strong> {user?.student_id}</div>
              <div className="meta-item"><strong>Course:</strong> {user?.course || '—'}</div>
              <div className="meta-item"><strong>Year:</strong> {user?.year_level || '—'}</div>
              <div className="meta-item"><strong>Semester:</strong> {selectedSemester || '1st'}</div>
              <div className="meta-item"><strong>Clearance ID:</strong> {clearance?.clearance_id}</div>
              <div className="meta-item"><strong>Clr Status:</strong> {clearance?.status}</div>
              <div className="meta-item"><strong>Total Subjects:</strong> {subjects.length}</div>
            </div>
            <h2>SUBJECTS</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ width:'46%' }}>Subject</th>
                  <th style={{ width:'18%' }}>Status</th>
                  <th style={{ width:'36%' }}>Signature</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(sub => {
                  const st = getStatus(sub.subject_id);
                  const teacherName = sub.teacher ? `${sub.teacher.firstname} ${sub.teacher.lastname}` : '';
                  const approved = st === 'Approved';
                  const statusClass = st === 'Approved' ? 'status-A' : (st === 'Pending' ? 'status-P' : (st === 'Rejected' ? 'status-R' : 'status-Re'));
                  return (
                    <tr key={sub.subject_id}>
                      <td>{sub.name}</td>
                      <td className={statusClass}>{st}</td>
                      <td style={{ textAlign:'center' }}>
                        {approved ? (
                          <div className="signed">{teacherName}</div>
                        ) : <div className="signature-line" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h2 style={{ marginTop:8 }}>DEPARTMENTS</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ width:'46%' }}>Department</th>
                  <th style={{ width:'18%' }}>Status</th>
                  <th style={{ width:'36%' }}>Signature</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => {
                  const st = getDeptStatus(dept.department_id);
                  const staffName = dept.staff ? `${dept.staff.firstname || ''} ${dept.staff.lastname || ''}`.trim() : '';
                  const approved = st === 'Approved';
                  const statusClass = st === 'Approved' ? 'status-A' : (st === 'Pending' ? 'status-P' : (st === 'Rejected' ? 'status-R' : 'status-Re'));
                  return (
                    <tr key={dept.department_id}>
                      <td>{dept.name}</td>
                      <td className={statusClass}>{st}</td>
                      <td style={{ textAlign:'center' }}>
                        {approved ? (
                          <div className="signed">{staffName}</div>
                        ) : <div className="signature-line" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="signatures">
              <div className="sig">
                <div className="signature-line" />
                <small>Student</small>
              </div>
              <div className="sig">
                <div className="signature-line" />
                <small>Registrar</small>
              </div>
              <div className="sig">
                <div className="signature-line" />
                <small>Dean</small>
              </div>
            </div>
            <footer>
              System-generated clearance. Approved items show system e-signature. Printed on Letter size.
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceStatusPage;
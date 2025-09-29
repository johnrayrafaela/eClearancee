
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import ClearanceStatusPage from './ClearanceStatusPage';
import { typeScale } from '../../style/CommonStyles';



const StudentDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [subjectAnalytics, setSubjectAnalytics] = useState({});
  const [liveStatuses, setLiveStatuses] = useState([]); // latest raw statuses
  const [subjectsCache, setSubjectsCache] = useState([]); // subjects list for pending derivation if needed
  const [refreshToken, setRefreshToken] = useState(0); // increments when a subject status changes
  const [semesterScope, setSemesterScope] = useState('all'); // 'all' | '1st' | '2nd'

  useEffect(() => {
    if (!user || userType !== 'user') return;
    axios.get(`http://localhost:5000/api/student-subject-status/analytics/student?student_id=${user.student_id}`)
      .then(res => setSubjectAnalytics(res.data || {}))
      .catch(() => setSubjectAnalytics({}));
  }, [user, userType, refreshToken]);

  // Real-time listener: update analytics when global event fires
  useEffect(() => {
    if (!user || userType !== 'user') return;
    const handler = () => {
      // Optimistically increment refresh token triggering refetch
      setRefreshToken(t => t + 1);
    };
    window.addEventListener('student-subject-status-changed', handler);
    return () => window.removeEventListener('student-subject-status-changed', handler);
  }, [user, userType]);

  // Calculate subject totals with semester scope filter
  let totalSubjects = 0, totalApproved = 0, totalRejected = 0, totalRequested = 0, totalPending = 0;
  const semesters = Object.keys(subjectAnalytics);
  const applySemesters = semesterScope === 'all' ? semesters : semesters.filter(s => s === semesterScope);
  applySemesters.forEach(key => {
    const sem = subjectAnalytics[key] || {};
    totalSubjects += sem.total || 0;
    totalApproved += sem.Approved || 0;
    totalRejected += sem.Rejected || 0;
    totalRequested += sem.Requested || 0;
    totalPending += sem.Pending || 0;
  });

  // If liveStatuses is newer than analytics (optimistic), overlay counts
  if (liveStatuses.length) {
    // Build a map per subject latest status
    const map = new Map();
    liveStatuses.forEach(s => {
      // Respect semester scope; skip if not in selected scope
      if (semesterScope !== 'all' && s.semester && s.semester !== semesterScope) return;
      map.set(s.subject_id, s.status);
    });
    // Recompute from subjectsCache length (fallback to current totalSubjects if cache empty)
    const scopedSubjects = semesterScope === 'all' ? subjectsCache : subjectsCache.filter(sub => !sub.semester || sub.semester === semesterScope);
    const uniqueSubjects = scopedSubjects.length ? scopedSubjects.length : totalSubjects;
    let a=0,r=0,req=0,p=0;
    map.forEach(st => {
      if (st === 'Approved') a++;
      else if (st === 'Rejected') r++;
      else if (st === 'Requested') req++;
      else p++;
    });
    // Pending subjects without status entries yet
    const accounted = a + r + req + p;
    if (accounted < uniqueSubjects) {
      p += (uniqueSubjects - accounted);
    }
    totalSubjects = uniqueSubjects;
    totalApproved = a; totalRejected = r; totalRequested = req; totalPending = p;
  }

  return (
    <div style={styles.container}>
      <h1 style={{fontWeight: 700, color: '#0277bd', marginBottom: 10, fontSize: typeScale.xxl}}>Student Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: 16, color: '#0277bd', fontSize: typeScale.md, lineHeight: 1.3 }}>
        Welcome, {user?.firstname}! Track your clearance and subject progress.
      </p>


      {/* Scope Selector */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16, gap:10, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', background:'#fff', padding:'6px 12px', borderRadius:22, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #e0f2fe' }}>
          <span style={{ fontWeight:600, color:'#0277bd', fontSize: typeScale.lg, letterSpacing:.25 }}>Semester:</span>
          <select value={semesterScope} onChange={e=> setSemesterScope(e.target.value)} style={{ border:'1px solid #b3e5fc', padding:'4px 10px', borderRadius:18, fontWeight:600, color:'#0277bd', background:'#f5fbff', outline:'none', fontSize: typeScale.lg }}>
            <option value='1st'>1st</option>
            <option value='2nd'>2nd</option>
          </select>
        </div>
      </div>

      {/* Subject Status Cards */}
      <div style={styles.cardRow}>
        <StatCard label='Total' value={totalSubjects} bg='#26c6da' />
        <StatCard label='Pending' value={totalPending} bg='#b9bb66ff' />
        <StatCard label='Requested' value={totalRequested} bg='#0277bd' />
        <StatCard label='Approved' value={totalApproved} bg='#66bb6a' />
        <StatCard label='Rejected' value={totalRejected} bg='#ef5350' />
      </div>

      {/* Clearance Status Section */}
      <div>
        <ClearanceStatusPage
          onStatusChange={() => setRefreshToken(t => t + 1)}
          onStatusesUpdate={({ subjects, statuses }) => {
            setSubjectsCache(subjects || []);
            setLiveStatuses(statuses || []);
          }}
        />
      </div>

    </div>

    
  );
};


  
const styles = {
  container: {
    padding: '20px 16px',
    background: '#f7fafc',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
  },
  cardRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  cardBase: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    padding: '12px 16px',
    minWidth: 170,
    flex: '1 1 150px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  notifications: {
    listStyle: 'disc',
    paddingLeft: '1.2rem',
    color: '#444',
    fontSize: typeScale.base,
  },
};

const StatCard = ({ label, value, bg }) => (
  <div style={{ ...styles.cardBase, background: bg, color: '#fff' }}>
    <div style={{ fontWeight: 600, fontSize: typeScale.xl }}>{label}</div>
    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{value}</div>
  </div>
);

export default StudentDashboard;
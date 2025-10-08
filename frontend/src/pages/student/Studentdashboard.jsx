
import React, { useContext, useEffect, useState } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import ClearanceStatusPage from './ClearanceStatusPage';
import {
  fadeInUp,
  slideInLeft,
  slideInRight,
  keyframes,
  gradients,
  pageStyles,
  cardStyles,
  headerStyles,
  buttonStyles,
  injectKeyframes,
  typeScale,
} from '../../style/CommonStyles';

const StudentDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [liveStatuses, setLiveStatuses] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [semesterScope, setSemesterScope] = useState('all'); // 'all' | '1st' | '2nd'
  const [loading, setLoading] = useState(true);
  const [initialRender, setInitialRender] = useState(true); // control one-time animations

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => { setInitialRender(false); }, []);

  useEffect(() => {
    if (!user || userType !== 'user') return;
    // Only show skeleton on very first load to avoid flicker "popping up"
    if (refreshToken === 0 && initialRender) setLoading(true);
  api.get(`/student-subject-status/analytics/student`, { params: { student_id: user.student_id }})
      .then(res => setAnalytics(res.data || {}))
      .catch(() => setAnalytics({}))
      .finally(()=> setLoading(false));
  }, [user, userType, refreshToken, initialRender]);

  useEffect(() => {
    if (!user || userType !== 'user') return;
    const handler = () => setRefreshToken(t => t + 1);
    window.addEventListener('student-subject-status-changed', handler);
    return () => window.removeEventListener('student-subject-status-changed', handler);
  }, [user, userType]);

  // Helper for semester counts
  const getSemCounts = (sem) => {
    const data = analytics?.[sem] || {};
    return {
      Approved: data.Approved || 0,
      Requested: data.Requested || 0,
      Pending: data.Pending || 0,
      Rejected: data.Rejected || 0,
      Total: data.total || ( (data.Approved||0)+(data.Requested||0)+(data.Pending||0)+(data.Rejected||0) )
    };
  };
  const sem1 = getSemCounts('1st');
  const sem2 = getSemCounts('2nd');

  const combine = (...objs) => objs.reduce((acc,o) => {
    Object.entries(o).forEach(([k,v])=> { acc[k]=(acc[k]||0)+(v||0);}); return acc; }, {});
  const allTotals = combine(sem1, sem2);

  const filteredTotals = (() => {
    if (semesterScope === '1st') return sem1;
    if (semesterScope === '2nd') return sem2;
    return allTotals;
  })();

  // Live overlay similar to original (optimistic update) - kept simple
  if (liveStatuses.length) {
    // Could integrate recalculation here if needed.
  }

  const buildBar = (counts) => {
    const { Approved, Requested, Pending, Rejected } = counts;
    const sum = (Approved + Requested + Pending + Rejected) || 1;
    const seg = v => (v / sum) * 100;
    return (
      <div style={{ display:'flex', width:'100%', height:10, borderRadius:6, overflow:'hidden', background:'#eceff1', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
        <div style={{ width: seg(Approved)+'%', background:'linear-gradient(90deg,#4caf50,#2e7d32)', display: Approved? 'block':'none', transition:'width .4s' }} />
        <div style={{ width: seg(Requested)+'%', background:'linear-gradient(90deg,#ffb300,#ff9800)', display: Requested? 'block':'none', transition:'width .4s' }} />
        <div style={{ width: seg(Pending)+'%', background:'linear-gradient(90deg,#0288d1,#0277bd)', display: Pending? 'block':'none', transition:'width .4s' }} />
        <div style={{ width: seg(Rejected)+'%', background:'linear-gradient(90deg,#e53935,#c62828)', display: Rejected? 'block':'none', transition:'width .4s' }} />
      </div>
    );
  };

  const StatLine = ({ label, value, color }) => (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize: typeScale.base, color:'#455a64', lineHeight:1.2 }}>
      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ width:10, height:10, borderRadius:3, background: color, boxShadow:'0 0 0 1px rgba(0,0,0,0.05)' }} />
        {label}
      </span>
      <strong style={{ fontWeight:600 }}>{value}</strong>
    </div>
  );

  const SemesterCard = ({ title, counts, delay, animate=true }) => {
    const sum = counts.Approved + counts.Requested + counts.Pending + counts.Rejected;
    const approvalRate = sum ? ((counts.Approved / sum) * 100).toFixed(1) : '0.0';
    const rejectionRate = sum ? ((counts.Rejected / sum) * 100).toFixed(1) : '0.0';
    return (
      <div style={{
        background: gradients.light,
        padding: '12px 14px',
        border: '1px solid #e1f5fe',
        borderRadius: 14,
        boxShadow:'0 4px 10px rgba(2,119,189,0.05)',
        display:'flex', flexDirection:'column', gap:6,
        ...(animate ? { animation:'fadeInUp .6s ease', animationDelay: delay, animationFillMode:'backwards' } : {})
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ margin:0, fontSize: typeScale.xl, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>{title}</h4>
          <span style={{ fontSize: typeScale.base, background:'#0277bd', color:'#fff', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>{approvalRate}% ✓</span>
        </div>
        {buildBar(counts)}
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          <StatLine label="Approved" value={counts.Approved} color="#4caf50" />
          <StatLine label="Requested" value={counts.Requested} color="#ff9800" />
          <StatLine label="Pending" value={counts.Pending} color="#0277bd" />
          <StatLine label="Rejected" value={counts.Rejected} color="#e53935" />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
          <span style={{ fontSize:typeScale.xxs, background:'#e8f5e9', color:'#2e7d32', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>✓ {approvalRate}% approved</span>
          <span style={{ fontSize:typeScale.xxs, background:'#ffebee', color:'#c62828', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>✗ {rejectionRate}% rejected</span>
          <span style={{ fontSize:typeScale.xxs, background:'#fff8e1', color:'#ef6c00', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>Σ {sum}</span>
        </div>
      </div>
    );
  };

  const overallSum = filteredTotals.Approved + filteredTotals.Requested + filteredTotals.Pending + filteredTotals.Rejected;
  const overallApprovalRate = overallSum ? ((filteredTotals.Approved / overallSum) * 100).toFixed(1) : '0.0';
  const overallRejectionRate = overallSum ? ((filteredTotals.Rejected / overallSum) * 100).toFixed(1) : '0.0';

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        {/* Hero */}
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding:24 }}>
          <div style={{ fontSize:'1.4rem', marginBottom:8 }}>🎓</div>
          <h1 style={{ ...headerStyles.pageTitle, color:'#fff', fontSize: typeScale.xxl, marginBottom:4, textShadow:'1px 1px 2px rgba(0,0,0,0.25)' }}>
            Student Dashboard
          </h1>
          <p style={{ fontSize:typeScale.md, opacity:.9, margin:0, lineHeight:1.3 }}>
            Welcome back, {user?.firstname || 'Student'}! Monitor your subject clearance progress.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', background:'#fff', padding:'6px 14px', borderRadius:22, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #e1f5fe' }}>
            <span style={{ fontWeight:600, color:'#0277bd', fontSize: typeScale.base, letterSpacing:'.25px' }}>Semester</span>
            <select value={semesterScope} onChange={e=> setSemesterScope(e.target.value)} style={{ border:'1px solid #b3e5fc', padding:'6px 12px', borderRadius:18, fontWeight:600, color:'#0277bd', background:'#f5fbff', outline:'none', fontSize: typeScale.base }}>
              <option value='all'>All</option>
              <option value='1st'>1st</option>
              <option value='2nd'>2nd</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={()=> setRefreshToken(t=>t+1)} style={{ ...buttonStyles.secondary, padding:'8px 18px', borderRadius:18, fontSize:typeScale.base }}>🔄 Refresh</button>
            <a href="/student/clearancestatus" style={{ textDecoration:'none' }}>
              <div style={{ ...buttonStyles.primary, padding:'8px 18px', borderRadius:18, fontSize:typeScale.base, display:'flex', alignItems:'center', gap:6 }}>📄 Clearance Status</div>
            </a>
          </div>
        </div>

        {/* Analytics Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:18 }}>
          <div style={{ ...cardStyles.info, ...slideInLeft, minWidth:220, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <h3 style={{ ...headerStyles.sectionTitle, margin:0, fontSize:typeScale.xl }}>📊 Subject Analytics</h3>
              <div style={{ fontSize:'1.2rem' }}>📈</div>
            </div>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[1,2].map(i => <div key={i} style={{ background:'#eceff1', borderRadius:12, height:78, animation:'shimmer 1.5s infinite' }} />)}
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, width:'100%', marginBottom:12 }}>
                  {semesterScope === 'all' && (
                    <>
                      <SemesterCard title="1st Semester" counts={sem1} delay="0s" animate={initialRender} />
                      <SemesterCard title="2nd Semester" counts={sem2} delay=".1s" animate={initialRender} />
                    </>
                  )}
                  {semesterScope === '1st' && (
                    <SemesterCard title="1st Semester" counts={sem1} delay="0s" animate={initialRender} />
                  )}
                  {semesterScope === '2nd' && (
                    <SemesterCard title="2nd Semester" counts={sem2} delay="0s" animate={initialRender} />
                  )}
                </div>
                <div style={{ background:'linear-gradient(135deg,#0277bd 0%,#01579b 100%)', color:'#fff', padding:'10px 14px', borderRadius:14, display:'flex', flexDirection:'column', gap:6, boxShadow:'0 6px 16px rgba(2,119,189,0.25)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <strong style={{ fontSize:typeScale.xl, letterSpacing:'.5px' }}>Overall Summary ({semesterScope === 'all' ? 'All Semesters' : semesterScope})</strong>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>✓ {overallApprovalRate}% approved</span>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>✗ {overallRejectionRate}% rejected</span>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>Σ {overallSum}</span>
                    </div>
                  </div>
                  {buildBar(filteredTotals)}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:6, marginTop:4 }}>
                    <StatLine label="Approved" value={filteredTotals.Approved} color="#c8e6c9" />
                    <StatLine label="Requested" value={filteredTotals.Requested} color="#ffe0b2" />
                    <StatLine label="Pending" value={filteredTotals.Pending} color="#bbdefb" />
                    <StatLine label="Rejected" value={filteredTotals.Rejected} color="#ffcdd2" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ ...cardStyles.info, ...slideInRight, minWidth:220, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <h3 style={{ ...headerStyles.sectionTitle, margin:0, fontSize:typeScale.xl }}>🚀 Quick Actions</h3>
              <div style={{ fontSize:'1.2rem' }}>⚡</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <a href="/student/clearancestatus" style={{ textDecoration:'none' }} className="btn-hover">
                <div style={{ ...buttonStyles.primary, padding:'8px 14px', borderRadius:18, display:'flex', alignItems:'center', gap:8, fontSize:typeScale.lg, fontWeight:600 }}>📄 View Clearance Status</div>
              </a>
              <a href="/student/profile" style={{ textDecoration:'none' }} className="btn-hover">
                <div style={{ ...buttonStyles.secondary, padding:'8px 14px', borderRadius:18, display:'flex', alignItems:'center', gap:8, fontSize:typeScale.lg, fontWeight:600 }}>👤 Profile</div>
              </a>
              <button onClick={()=> setRefreshToken(t=>t+1)} className="btn-hover" style={{ ...buttonStyles.warning, padding:'8px 14px', borderRadius:18, display:'flex', alignItems:'center', gap:8, fontSize:typeScale.lg, fontWeight:600 }}>
                🔄 Refresh Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Clearance Management Hub */}
        <div style={{ ...cardStyles.default, ...fadeInUp, animationDelay:'0.25s' }}>
          <div style={{ background: gradients.primary, padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:'1.4rem' }}>🧾</div>
            <div>
              <h3 style={{ margin:0, fontWeight:600, fontSize:typeScale.xl, letterSpacing:'.25px' }}>Clearance Management Hub</h3>
              <p style={{ margin:'2px 0 0 0', opacity:.9, fontSize:typeScale.md }}>Track subject statuses and progress toward full clearance</p>
            </div>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <p style={{ color:'#546e7a', fontSize:typeScale.base, lineHeight:1.3, marginBottom:14, textAlign:'center' }}>
              Below is your up-to-date clearance status by subject. Actions taken by teachers will reflect here automatically.
            </p>
            <ClearanceStatusPage
              onStatusChange={() => setRefreshToken(t => t + 1)}
              onStatusesUpdate={({ statuses }) => {
                setLiveStatuses(statuses || []);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
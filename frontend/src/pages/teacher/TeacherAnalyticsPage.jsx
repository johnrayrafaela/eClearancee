import React from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  fadeInUp,
  keyframes,
  gradients,
  pageStyles,
  cardStyles,
  headerStyles,
  buttonStyles,
  injectKeyframes,
  typeScale,
} from '../../style/CommonStyles';

ChartJS.register(ArcElement, Tooltip, Legend);

const TeacherAnalyticsPage = () => {
  const { user, userType } = React.useContext(AuthContext);
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedSemester, setSelectedSemester] = React.useState('all');

  React.useEffect(() => { injectKeyframes(); }, []);

  React.useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true); setError(null);
  api.get('/student-subject-status/analytics/teacher', { params: { teacher_id: user.teacher_id } })
      .then(res => setAnalytics(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const getSemCounts = (sem) => ({
    Requested: analytics?.[sem]?.Requested || 0,
    Approved: analytics?.[sem]?.Approved || 0,
    Rejected: analytics?.[sem]?.Rejected || 0,
  });

  const sem1 = getSemCounts('1st');
  const sem2 = getSemCounts('2nd');
  const totalRequested = sem1.Requested + sem2.Requested;
  const totalApproved = sem1.Approved + sem2.Approved;
  const totalRejected = sem1.Rejected + sem2.Rejected;
  const grandTotal = totalRequested + totalApproved + totalRejected;
  const overallApprovalRate = grandTotal ? ((totalApproved / grandTotal) * 100).toFixed(1) : '0.0';
  const overallRejectionRate = grandTotal ? ((totalRejected / grandTotal) * 100).toFixed(1) : '0.0';

  // Filtered data for doughnut based on selectedSemester
  const filtered = (() => {
    if (selectedSemester === '1st') return sem1;
    if (selectedSemester === '2nd') return sem2;
    return { Requested: totalRequested, Approved: totalApproved, Rejected: totalRejected };
  })();
  const filteredTotal = filtered.Requested + filtered.Approved + filtered.Rejected;

  const pieData = {
    labels: ['Approved', 'Requested', 'Rejected'],
    datasets: [
      {
        data: [filtered.Approved, filtered.Requested, filtered.Rejected],
        backgroundColor: ['#4caf50', '#ffb300', '#e53935'],
        borderColor: ['#2e7d32', '#ef6c00', '#c62828'],
        borderWidth: 1,
        hoverOffset: 6,
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 14, padding: 12, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const base = filteredTotal || 1;
            const pct = ((value / base) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      }
    },
    animation: { animateRotate: true, animateScale: true },
    cutout: '52%'
  };

  // (Removed unused cardShadow styling from original staff analytics adaptation)

  const buildBar = (counts) => {
    const { Approved, Requested, Rejected } = counts;
    const sum = Approved + Requested + Rejected || 1;
    const seg = (val) => (val / sum) * 100;
    return (
      <div style={{ display:'flex', width:'100%', height:10, borderRadius:6, overflow:'hidden', background:'#eceff1', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
        <div style={{ width: seg(Approved)+'%', background:'linear-gradient(90deg,#4caf50,#2e7d32)', transition:'width .4s', display: Approved? 'block':'none' }} />
        <div style={{ width: seg(Requested)+'%', background:'linear-gradient(90deg,#ffb300,#ff9800)', transition:'width .4s', display: Requested? 'block':'none' }} />
        <div style={{ width: seg(Rejected)+'%', background:'linear-gradient(90deg,#e53935,#c62828)', transition:'width .4s', display: Rejected? 'block':'none' }} />
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

  const SemesterCard = ({ title, counts, delay }) => {
    const sum = counts.Approved + counts.Requested + counts.Rejected;
    const approvalRate = sum ? ((counts.Approved / sum) * 100).toFixed(1) : '0.0';
    const rejectionRate = sum ? ((counts.Rejected / sum) * 100).toFixed(1) : '0.0';
    return (
      <div style={{
        background: gradients.light,
        padding: '12px 14px',
        borderRadius: 14,
        border:'1px solid #e1f5fe',
        boxShadow:'0 4px 10px rgba(2,119,189,0.05)',
        display:'flex',
        flexDirection:'column',
        gap:6,
        animation:'fadeInUp .6s ease',
        animationDelay: delay,
        animationFillMode:'backwards'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ margin:0, fontSize: typeScale.xl, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>{title}</h4>
          <span style={{ fontSize: typeScale.base, background:'#0277bd', color:'#fff', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>{approvalRate}% ✓</span>
        </div>
        {buildBar(counts)}
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          <StatLine label="Approved" value={counts.Approved} color="#4caf50" />
          <StatLine label="Requested" value={counts.Requested} color="#ff9800" />
          <StatLine label="Rejected" value={counts.Rejected} color="#e53935" />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
          <span style={{ fontSize: typeScale.xxs, background:'#e8f5e9', color:'#2e7d32', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>✓ {approvalRate}% approved</span>
          <span style={{ fontSize: typeScale.xxs, background:'#ffebee', color:'#c62828', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>✗ {rejectionRate}% rejected</span>
          <span style={{ fontSize: typeScale.xxs, background:'#fff8e1', color:'#ef6c00', padding:'3px 6px', borderRadius:12, fontWeight:600 }}>Σ {sum}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        {/* Hero Header */}
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding:24 }}>
          <div style={{ fontSize:'1.4rem', marginBottom:8 }}>📊</div>
          <h1 style={{ ...headerStyles.pageTitle, color:'#fff', fontSize:typeScale.xxl, textShadow:'1px 1px 2px rgba(0,0,0,0.25)', marginBottom:4 }}>Teacher Subject Analytics</h1>
          <p style={{ fontSize:typeScale.md, opacity:.9, margin:0, lineHeight:1.3 }}>
            Track subject approval outcomes across semesters.
          </p>
        </div>

        {/* Semester Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, marginBottom:18 }}>
          {loading ? (
            <div style={{ background:'#eceff1', borderRadius:12, height:120, animation:'shimmer 1.5s infinite' }} />
          ) : error ? (
            <div style={{ background:'#ffebee', border:'1px solid #ffcdd2', padding:16, borderRadius:12, color:'#c62828' }}>{error}</div>
          ) : (
            <>
              <SemesterCard title="1st Semester" counts={sem1} delay="0s" />
              <SemesterCard title="2nd Semester" counts={sem2} delay=".1s" />
            </>
          )}
        </div>

        {/* Overall Summary + Pie */}
        <div style={{ ...cardStyles.default, animation:'fadeInUp .6s ease', animationDelay:'.15s' }}>
          <div style={{ background:gradients.primary, padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:'1.4rem' }}>📈</div>
            <div>
              <h3 style={{ margin:0, fontWeight:600, fontSize:typeScale.xl, letterSpacing:'.25px' }}>Overall Summary</h3>
              <p style={{ margin:'2px 0 0 0', opacity:.9, fontSize:typeScale.md }}>Combined performance (all semesters or filtered).</p>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <label style={{ fontSize:typeScale.sm, fontWeight:600, color:'#e1f5fe' }}>View:</label>
              <select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value)} style={{
                padding:'6px 10px',
                borderRadius:10,
                border:'1px solid rgba(255,255,255,0.6)',
                background:'rgba(255,255,255,0.15)',
                color:'#fff',
                fontSize:typeScale.sm,
                backdropFilter:'blur(4px)',
                outline:'none'
              }}>
                <option value="all">All</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
              </select>
            </div>
          </div>
          <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:18 }}>
            {buildBar({ Approved: totalApproved, Requested: totalRequested, Rejected: totalRejected })}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
              <div style={{ background:'#e8f5e9', padding:'10px 12px', borderRadius:12, display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:typeScale.sm, fontWeight:600, color:'#2e7d32' }}>Approved</span>
                <strong style={{ fontSize:typeScale.xl }}>{totalApproved}</strong>
                <span style={{ fontSize:typeScale.xxs, color:'#2e7d32' }}>{overallApprovalRate}% rate</span>
              </div>
              <div style={{ background:'#fff8e1', padding:'10px 12px', borderRadius:12, display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:typeScale.sm, fontWeight:600, color:'#ef6c00' }}>Requested</span>
                <strong style={{ fontSize:typeScale.xl }}>{totalRequested}</strong>
                <span style={{ fontSize:typeScale.xxs, color:'#ef6c00' }}>in progress</span>
              </div>
              <div style={{ background:'#ffebee', padding:'10px 12px', borderRadius:12, display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:typeScale.sm, fontWeight:600, color:'#c62828' }}>Rejected</span>
                <strong style={{ fontSize:typeScale.xl }}>{totalRejected}</strong>
                <span style={{ fontSize:typeScale.xxs, color:'#c62828' }}>{overallRejectionRate}% rate</span>
              </div>
              <div style={{ background:'#e3f2fd', padding:'10px 12px', borderRadius:12, display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:typeScale.sm, fontWeight:600, color:'#01579b' }}>Total</span>
                <strong style={{ fontSize:typeScale.xl }}>{grandTotal}</strong>
                <span style={{ fontSize:typeScale.xxs, color:'#01579b' }}>all requests</span>
              </div>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:18, alignItems:'stretch' }}>
              <div style={{ flex:'1 1 280px', minWidth:260, background:'#fafafa', border:'1px solid #e0f2f1', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', position:'relative' }}>
                <h4 style={{ margin:'0 0 8px 0', fontSize:typeScale.lg, fontWeight:600, color:'#006064', letterSpacing:'.25px', display:'flex', alignItems:'center', gap:6 }}>
                  <span>🧮</span> Distribution ({selectedSemester === 'all' ? 'All' : selectedSemester})
                </h4>
                {filteredTotal === 0 ? (
                  <div style={{ fontSize:typeScale.base, color:'#546e7a', padding:'12px 4px' }}>No data yet to visualize.</div>
                ) : (
                  <div style={{ height:260, position:'relative' }}>
                    <Doughnut data={pieData} options={pieOptions} />
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
                      <div style={{ fontSize:typeScale.sm, fontWeight:600, color:'#37474f' }}>Total</div>
                      <div style={{ fontSize:typeScale.xl, fontWeight:700, color:'#01579b' }}>{filteredTotal}</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ flex:'1 1 320px', minWidth:280, background:'#f5fafd', border:'1px solid #e1f5fe', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:10 }}>
                <h4 style={{ margin:0, fontSize:typeScale.lg, fontWeight:600, color:'#01579b', letterSpacing:'.25px' }}>Highlights</h4>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6, fontSize:typeScale.base, color:'#455a64' }}>
                  <li><strong style={{ color:'#2e7d32' }}>{overallApprovalRate}%</strong> approval rate overall.</li>
                  <li><strong style={{ color:'#ef6c00' }}>{totalRequested}</strong> currently in requested state.</li>
                  <li><strong style={{ color:'#c62828' }}>{totalRejected}</strong> rejected submissions to review.</li>
                  <li><strong style={{ color:'#01579b' }}>{grandTotal}</strong> total processed / in-progress items.</li>
                </ul>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
              <a href="/teacher/dashboard" style={{ textDecoration:'none' }} className="btn-hover">
                <div style={{ ...buttonStyles.secondary, padding:'8px 18px', borderRadius:18, fontSize:typeScale.base }}>⬅ Back to Dashboard</div>
              </a>
              <a href="/teacher/subject-requests" style={{ textDecoration:'none' }} className="btn-hover">
                <div style={{ ...buttonStyles.primary, padding:'8px 18px', borderRadius:18, fontSize:typeScale.base }}>📋 Manage Requests</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;

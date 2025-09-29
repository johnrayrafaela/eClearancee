import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import '../../style/StudentSubjectAnalytics.css';
import { typeScale, buttonStyles, fadeInUp, keyframes } from '../../style/CommonStyles';

const StudentSubjectAnalytics = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptLoading, setDeptLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subject');
  const [activeSemester, setActiveSemester] = useState('All');
  const [deptActiveSemester, setDeptActiveSemester] = useState('All');
  const [refreshToken, setRefreshToken] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const prevAnalyticsRef = useRef(null);
  const prevDeptAnalyticsRef = useRef(null);

  // Register chart components safely (idempotent)
  useEffect(() => { try { ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement); } catch { /* ignore */ } }, []);

  // Subject analytics fetch
  useEffect(() => {
    if (!user || userType !== 'user') return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/student-subject-status/analytics/student?student_id=${user.student_id}`)
      .then(res => {
        prevAnalyticsRef.current = analytics;
        setAnalytics(res.data);
        setLastUpdated(new Date());
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userType, refreshToken]);

  // Department analytics fetch
  useEffect(() => {
    if (!user || userType !== 'user') return;
    setDeptLoading(true);
    axios.get(`http://localhost:5000/api/department-status/analytics/student?student_id=${user.student_id}`)
      .then(res => {
        prevDeptAnalyticsRef.current = deptAnalytics;
        setDeptAnalytics(res.data);
      })
      .catch(() => setDeptAnalytics(null))
      .finally(() => setDeptLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userType, refreshToken]);

  // Real-time refresh events
  useEffect(() => {
    if (!user || userType !== 'user') return;
    const handler = () => setRefreshToken(t => t + 1);
    window.addEventListener('student-subject-status-changed', handler);
    window.addEventListener('department-status-changed', handler);
    return () => {
      window.removeEventListener('student-subject-status-changed', handler);
      window.removeEventListener('department-status-changed', handler);
    };
  }, [user, userType]);

  const computeDeltas = (current, prev) => {
    if (!current || !prev) return null;
    const statuses = ['Approved','Requested','Pending','Rejected'];
    const sumBy = (obj, key) => Object.values(obj || {}).reduce((acc, sem) => acc + (sem?.[key] || 0), 0);
    const deltas = {};
    statuses.forEach(s => { deltas[s] = sumBy(current, s) - sumBy(prev, s); });
    return deltas;
  };
  const subjectDeltas = computeDeltas(analytics, prevAnalyticsRef.current);
  const deptDeltas = computeDeltas(deptAnalytics, prevDeptAnalyticsRef.current);

  const semesterOrder = ['1st', '2nd'];
  const semesters = analytics ? semesterOrder.filter(sem => analytics[sem]) : [];

  const analyticsToShow = activeSemester === 'All' ? analytics : (analytics && analytics[activeSemester] ? { [activeSemester]: analytics[activeSemester] } : {});
  const deptAnalyticsToShow = deptActiveSemester === 'All' ? deptAnalytics : (deptAnalytics && deptAnalytics[deptActiveSemester] ? { [deptActiveSemester]: deptAnalytics[deptActiveSemester] } : {});

  // Aggregate subject stats
  let overallApproved = 0, overallTotal = 0;
  if (analytics) {
    Object.values(analytics).forEach(data => {
      overallApproved += data.Approved || 0;
      overallTotal += data.total || 0;
    });
  }
  const overallPercent = overallTotal ? Math.round((overallApproved / overallTotal) * 100) : 0;

  // Aggregate department stats
  let deptOverallApproved = 0, deptOverallTotal = 0;
  if (deptAnalytics) {
    Object.values(deptAnalytics).forEach(data => {
      deptOverallApproved += data.Approved || 0;
      deptOverallTotal += data.total || 0;
    });
  }
  const deptOverallPercent = deptOverallTotal ? Math.round((deptOverallApproved / deptOverallTotal) * 100) : 0;

  const statusLabels = ['Approved', 'Requested', 'Pending', 'Rejected'];
  const statusColors = { Approved: '#43a047', Requested: '#0277bd', Pending: '#f59e0b', Rejected: '#e53935' };

  const getPieData = () => {
    let data = { Approved: 0, Requested: 0, Pending: 0, Rejected: 0 };
    if (activeSemester === 'All') {
      if (analytics) {
        Object.values(analytics).forEach(semData => {
          statusLabels.forEach(status => { data[status] += semData[status] || 0; });
        });
      }
    } else if (analytics && analytics[activeSemester]) {
      statusLabels.forEach(status => { data[status] = analytics[activeSemester][status] || 0; });
    }
    return data;
  };
  const pieData = getPieData();
  const total = Object.values(pieData).reduce((a, b) => a + b, 0);
  const chartData = { labels: statusLabels, datasets: [{ data: statusLabels.map(s => pieData[s]), backgroundColor: statusLabels.map(s => statusColors[s]), borderWidth: 0, hoverOffset: 6 }] };

  const getDeptPieData = () => {
    let data = { Approved: 0, Requested: 0, Pending: 0, Rejected: 0 };
    if (deptActiveSemester === 'All') {
      if (deptAnalytics) {
        Object.values(deptAnalytics).forEach(semData => { statusLabels.forEach(status => { data[status] += semData[status] || 0; }); });
      }
    } else if (deptAnalytics && deptAnalytics[deptActiveSemester]) {
      statusLabels.forEach(status => { data[status] = deptAnalytics[deptActiveSemester][status] || 0; });
    }
    return data;
  };
  const deptPieData = getDeptPieData();
  const deptTotal = Object.values(deptPieData).reduce((a,b)=>a+b,0);
  const deptChartData = { labels: statusLabels, datasets: [{ data: statusLabels.map(s => deptPieData[s]), backgroundColor: statusLabels.map(s => statusColors[s]), borderWidth: 0, hoverOffset: 6 }] };

  // Build bar dataset for semester comparison (subjects)
  const subjectComparisonBar = (analytics && analytics['1st'] && analytics['2nd']) ? {
    labels: statusLabels,
    datasets: [
      { label: '1st', data: statusLabels.map(s => analytics['1st'][s] || 0), backgroundColor: 'rgba(2,119,189,0.65)', borderRadius: 6, barThickness: 24 },
      { label: '2nd', data: statusLabels.map(s => analytics['2nd'][s] || 0), backgroundColor: 'rgba(67,160,71,0.65)', borderRadius: 6, barThickness: 24 }
    ]
  } : null;

  const deptComparisonBar = (deptAnalytics && deptAnalytics['1st'] && deptAnalytics['2nd']) ? {
    labels: statusLabels,
    datasets: [
      { label: '1st', data: statusLabels.map(s => deptAnalytics['1st'][s] || 0), backgroundColor: 'rgba(2,119,189,0.65)', borderRadius: 6, barThickness: 24 },
      { label: '2nd', data: statusLabels.map(s => deptAnalytics['2nd'][s] || 0), backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 6, barThickness: 24 }
    ]
  } : null;

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#0f4c81', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#0f4c81', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#0f4c81', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.08)' }, beginAtZero: true }
    }
  };

  const donutOptions = (dark) => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: dark ? '#fff' : '#0f4c81', font: { size: 12 }, boxWidth: 14 } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.formattedValue}` } }
    },
    layout: { padding: 4 }
  });

  const styles = {
    root: { padding: '26px 22px 60px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' },
    hero: { ...fadeInUp, background: 'linear-gradient(135deg,#0277bd 0%,#01579b 60%,#013e63 100%)', color: '#fff', padding: '28px 30px', borderRadius: 24, marginBottom: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 14px 34px -10px rgba(2,119,189,0.45)' },
    heroTitle: { margin: 0, fontSize: '2.1rem', fontWeight: 800, letterSpacing: '.75px', textShadow: '0 3px 8px rgba(0,0,0,0.25)' },
    heroSubtitle: { margin: '8px 0 0', fontSize: typeScale.lg, opacity: .92, fontWeight: 500 },
    tabsRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 },
    tabBtn: (active) => ({ cursor: 'pointer', background: active ? '#0277bd' : '#e1f5fe', color: active ? '#fff' : '#0277bd', border: '1px solid #b3e5fc', padding: '8px 18px', borderRadius: 22, fontWeight: 700, fontSize: typeScale.base, letterSpacing: '.4px', boxShadow: active ? '0 4px 14px rgba(2,119,189,0.4)' : '0 2px 4px rgba(2,119,189,0.08)', transition: 'all .25s' }),
  metricPill: () => ({ background: '#fff', border: '1px solid #e1f5fe', padding: '8px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: typeScale.base, color: '#034067', boxShadow: '0 3px 8px rgba(2,119,189,0.06)' }),
    sectionCard: { background: '#fff', border: '1px solid #e1f5fe', borderRadius: 20, padding: '20px 22px', boxShadow: '0 10px 28px -8px rgba(2,119,189,0.18)', display: 'flex', flexDirection: 'column', gap: 16 },
    subHeading: { margin: 0, fontSize: typeScale.xl, fontWeight: 700, color: '#0f4c81', letterSpacing: '.5px' },
    divider: { height: 1, background: 'linear-gradient(90deg,rgba(2,119,189,0) 0%,rgba(2,119,189,.35) 50%,rgba(2,119,189,0) 100%)', margin: '8px 0 4px' },
    progressWrap: { marginTop: 6, height: 8, background: '#e2f2fa', borderRadius: 6, overflow: 'hidden', position: 'relative' },
    progressBar: (pct) => ({ width: pct + '%', background: 'linear-gradient(90deg,#43a047,#2e7d32)', height: '100%', transition: 'width .5s ease', boxShadow: '0 0 0 1px rgba(255,255,255,0.25) inset' })
  };

  if (!user || userType !== 'user') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only students can view analytics.</div>;
  }

  return (
  <div style={styles.root}>
      <style>{keyframes}</style>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>📈</div>
        <h1 style={styles.heroTitle}>Student Subject Analytics</h1>
        <p style={styles.heroSubtitle}>Insight into your clearance journey across subjects and departments.</p>
      </div>
      {/* Tab Switch */}
      <div style={styles.tabsRow}>
        <button onClick={()=> setActiveTab('subject')} style={styles.tabBtn(activeTab==='subject')}>Subjects</button>
        <button onClick={()=> setActiveTab('department')} style={styles.tabBtn(activeTab==='department')}>Departments</button>
        <button onClick={()=> setRefreshToken(t=>t+1)} style={{ ...buttonStyles.primary, padding: '8px 18px', borderRadius: 22, fontSize: typeScale.base }}>🔄 Refresh</button>
        <button onClick={()=> setShowCharts(s=>!s)} style={{ ...buttonStyles.secondary, padding:'8px 18px', borderRadius:22, fontSize:typeScale.base }}>{showCharts ? 'Hide Charts' : 'Show Charts'}</button>
      </div>

      {/* STATUS METRICS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {activeTab === 'subject' && analytics && statusLabels.map(k => {
          const val = Object.values(analytics || {}).reduce((acc, sem) => acc + (sem[k] || 0), 0);
          const delta = subjectDeltas ? subjectDeltas[k] : 0;
          return (
            <div key={k} style={styles.metricPill(statusColors[k])}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: statusColors[k] }} />{k}: {val}
              {delta !== 0 && <span style={{ fontSize: 11, fontWeight: 800, color: delta > 0 ? '#2e7d32' : '#c62828' }}> {delta > 0 ? `+${delta}` : delta}</span>}
            </div>
          );
        })}
        {activeTab === 'department' && deptAnalytics && statusLabels.map(k => {
          const val = Object.values(deptAnalytics || {}).reduce((acc, sem) => acc + (sem[k] || 0), 0);
          const delta = deptDeltas ? deptDeltas[k] : 0;
          return (
            <div key={k} style={styles.metricPill(statusColors[k])}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: statusColors[k] }} />{k}: {val}
              {delta !== 0 && <span style={{ fontSize: 11, fontWeight: 800, color: delta > 0 ? '#2e7d32' : '#c62828' }}> {delta > 0 ? `+${delta}` : delta}</span>}
            </div>
          );
        })}
      </div>

      {activeTab === 'subject' && <>
        <h2 className="student-analytics-heading" style={styles.subHeading}>📊 Subject Progress</h2>
        {analytics && semesters.length > 0 && (
          <div style={styles.tabsRow}>
            <button key="All" style={styles.tabBtn(activeSemester==='All')} onClick={() => setActiveSemester('All')}>All</button>
            {semesters.map(sem => <button key={sem} style={styles.tabBtn(activeSemester===sem)} onClick={()=> setActiveSemester(sem)}>{sem}</button>)}
          </div>
        )}
        {showCharts && (
          <div style={{ display:'grid', gridTemplateColumns: subjectComparisonBar ? 'repeat(auto-fit,minmax(260px,1fr))':'1fr', gap:18, marginBottom: 18 }}>
            <div style={styles.sectionCard}>
              <h4 style={{ margin:0, fontSize:typeScale.lg, fontWeight:700, color:'#0f4c81' }}>Status Distribution ({activeSemester})</h4>
              <div style={{ height: 220 }}>
                {loading ? <div style={{fontSize:13,color:'#0277bd'}}>Loading...</div> : total === 0 ? <div style={{fontSize:typeScale.base, opacity:.7, paddingTop:30}}>No data</div> : <Doughnut data={chartData} options={donutOptions(false)} />}
              </div>
            </div>
            {activeSemester==='All' && subjectComparisonBar && (
              <div style={styles.sectionCard}>
                <h4 style={{ margin:0, fontSize:typeScale.lg, fontWeight:700, color:'#0f4c81' }}>Semester Comparison</h4>
                <div style={{ height: 240 }}>
                  <Bar data={subjectComparisonBar} options={barOptions} />
                </div>
              </div>
            )}
          </div>
        )}
        {analytics && overallTotal > 0 && activeSemester === 'All' && (
          <div style={{ margin: '0 auto 16px auto', background: '#e1f5fe', borderRadius: 8, padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: overallPercent === 100 ? '#43a047' : '#0277bd', fontSize: typeScale.xxl }}>
            Overall Cleared: {overallApproved} / {overallTotal} subjects &mdash; <span style={{ fontWeight: 900 }}>{overallPercent}% {overallPercent === 100 ? 'Cleared 🎉' : 'Cleared'}</span>
            {lastUpdated && <div style={{marginTop:6,fontSize:11,fontWeight:500,color:'#0f4c81'}}>Updated {lastUpdated.toLocaleTimeString()}</div>}
          </div>
        )}
        {analyticsToShow && typeof analyticsToShow === 'object' && Object.keys(analyticsToShow).length > 0 ? (
          <div style={{display:'grid', gap:16, marginTop:8}}>
            {Object.entries(analyticsToShow).map(([semester, data]) => {
              if (!data) return null;
              const percent = data.total ? Math.round((data.Approved || 0) / data.total * 100) : 0;
              return (
                <div key={semester} style={{background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px', boxShadow:'0 2px 6px rgba(0,0,0,0.04)'}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:typeScale.xxl, color:'#0f4c81' }}>{semester}</div>
                    <div style={{ fontSize:typeScale.lg, fontWeight:600, color:'#555' }}>Total: {data.total}</div>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
                    {statusLabels.map(k => (
                      <div key={k} style={{background:'#f1f5f9', padding:'4px 8px', borderRadius:6, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:6, color:'#022c43'}}>
                        <span style={{width:10,height:10,borderRadius:3, background:statusColors[k]}}></span>{k}: {data[k] || 0}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, fontSize:typeScale.xl, fontWeight:600, color: percent===100 ? '#2e7d32' : '#0277bd' }}>
                    Cleared (Approved): {data.Approved || 0} / {data.total} ({percent}%)
                  </div>
                  <div style={{ marginTop:6, height:6, background:'#e2e8f0', borderRadius:4, overflow:'hidden' }}>
                    <div style={{width: `${percent}%`, background:'linear-gradient(90deg,#43a047,#66bb6a)', height:'100%'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (!loading && <div className="student-analytics-nodata">No semester data available.</div>)}
      </>}

      {activeTab === 'department' && <>
        <h2 className="student-analytics-heading" style={styles.subHeading}>🏢 Department Progress</h2>
        {deptAnalytics && semesterOrder.filter(sem => deptAnalytics[sem]).length > 0 && (
          <div style={styles.tabsRow}>
            <button key="All" style={styles.tabBtn(deptActiveSemester==='All')} onClick={()=> setDeptActiveSemester('All')}>All</button>
            {semesterOrder.filter(sem => deptAnalytics[sem]).map(sem => (
              <button key={sem} style={styles.tabBtn(deptActiveSemester===sem)} onClick={()=> setDeptActiveSemester(sem)}>{sem}</button>
            ))}
          </div>
        )}
        {showCharts && (
          <div style={{ display:'grid', gridTemplateColumns: deptComparisonBar ? 'repeat(auto-fit,minmax(260px,1fr))':'1fr', gap:18, marginBottom: 18 }}>
            <div style={styles.sectionCard}>
              <h4 style={{ margin:0, fontSize:typeScale.lg, fontWeight:700, color:'#0f4c81' }}>Status Distribution ({deptActiveSemester})</h4>
              <div style={{ height: 220 }}>
                {deptLoading ? <div style={{fontSize:13,color:'#0277bd'}}>Loading...</div> : deptTotal === 0 ? <div style={{fontSize:typeScale.base, opacity:.7, paddingTop:30}}>No data</div> : <Doughnut data={deptChartData} options={donutOptions(false)} />}
              </div>
            </div>
            {deptActiveSemester==='All' && deptComparisonBar && (
              <div style={styles.sectionCard}>
                <h4 style={{ margin:0, fontSize:typeScale.lg, fontWeight:700, color:'#0f4c81' }}>Semester Comparison</h4>
                <div style={{ height: 240 }}>
                  <Bar data={deptComparisonBar} options={barOptions} />
                </div>
              </div>
            )}
          </div>
        )}
        {deptAnalytics && deptOverallTotal > 0 && deptActiveSemester === 'All' && (
          <div style={{ margin: '0 auto 16px auto', background: '#e1f5fe', borderRadius: 8, padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: deptOverallPercent === 100 ? '#43a047' : '#0277bd', fontSize: typeScale.xxl }}>
            Overall Cleared: {deptOverallApproved} / {deptOverallTotal} departments &mdash; <span style={{ fontWeight: 900 }}>{deptOverallPercent}% {deptOverallPercent === 100 ? 'Cleared 🎉' : 'Cleared'}</span>
            {lastUpdated && <div style={{marginTop:6,fontSize:11,fontWeight:500,color:'#0f4c81'}}>Updated {lastUpdated.toLocaleTimeString()}</div>}
          </div>
        )}
        {deptAnalyticsToShow && typeof deptAnalyticsToShow === 'object' && Object.keys(deptAnalyticsToShow).length > 0 ? (
          <div style={{display:'grid', gap:16, marginTop:8}}>
            {Object.entries(deptAnalyticsToShow).map(([semester, data]) => {
              if (!data) return null;
              const percent = data.total ? Math.round((data.Approved || 0) / data.total * 100) : 0;
              return (
                <div key={semester} style={{background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px', boxShadow:'0 2px 6px rgba(0,0,0,0.04)'}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:typeScale.xxl, color:'#0f4c81' }}>{semester}</div>
                    <div style={{ fontSize:typeScale.lg, fontWeight:600, color:'#555' }}>Total: {data.total}</div>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
                    {statusLabels.map(k => (
                      <div key={k} style={{background:'#f1f5f9', padding:'4px 8px', borderRadius:6, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:6, color:'#022c43'}}>
                        <span style={{width:10,height:10,borderRadius:3, background:statusColors[k]}}></span>{k}: {data[k] || 0}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, fontSize:typeScale.xl, fontWeight:600, color: percent===100 ? '#2e7d32' : '#0277bd' }}>
                    Cleared (Approved): {data.Approved || 0} / {data.total} ({percent}%)
                  </div>
                  <div style={{ marginTop:6, height:6, background:'#e2e8f0', borderRadius:4, overflow:'hidden' }}>
                    <div style={{width: `${percent}%`, background:'linear-gradient(90deg,#43a047,#66bb6a)', height:'100%'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (!deptLoading && <div className="student-analytics-nodata">No semester data available.</div>)}
      </>}
    </div>
  );
};

export default StudentSubjectAnalytics;

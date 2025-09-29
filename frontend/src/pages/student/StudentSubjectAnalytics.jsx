import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../style/StudentSubjectAnalytics.css';
import { typeScale } from '../../style/CommonStyles';

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
  const prevAnalyticsRef = useRef(null);
  const prevDeptAnalyticsRef = useRef(null);

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
  const chartData = { labels: statusLabels, datasets: [{ data: statusLabels.map(s => pieData[s]), backgroundColor: statusLabels.map(s => statusColors[s]), borderWidth: 2 }] };

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
  const deptChartData = { labels: statusLabels, datasets: [{ data: statusLabels.map(s => deptPieData[s]), backgroundColor: statusLabels.map(s => statusColors[s]), borderWidth: 2 }] };

  if (!user || userType !== 'user') {
    return <div style={{ color: '#e11d48', padding: 20 }}>❌ Access denied. Only students can view analytics.</div>;
  }

  return (
  <div className="student-analytics-root compact">
      <div className="student-analytics-tabs" style={{ marginBottom: 32 }}>
        <button className={`student-analytics-tab-btn${activeTab === 'subject' ? ' active' : ''}`} onClick={() => setActiveTab('subject')}>Subject Analytics</button>
        <button className={`student-analytics-tab-btn${activeTab === 'department' ? ' active' : ''}`} onClick={() => setActiveTab('department')}>Department Analytics</button>
      </div>

      <div style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:24}}>
  <button onClick={()=> setRefreshToken(t=>t+1)} style={{background:'#0277bd', color:'#fff', border:'none', padding:'6px 12px', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:typeScale.lg}}>🔄 Refresh</button>
        {activeTab==='subject' && analytics && (
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            {statusLabels.map(k=>{
              const val = Object.values(analytics||{}).reduce((acc,sem)=>acc+(sem[k]||0),0);
              const delta = subjectDeltas ? subjectDeltas[k] : 0;
              return (
                <div key={k} style={{background:'#f1f5f9', padding:'6px 10px', borderRadius:8, fontSize:typeScale.xl, fontWeight:700, display:'flex', alignItems:'center', gap:6, color:'#034067'}}>
                  <span style={{width:10,height:10,borderRadius:3,background:statusColors[k]}}></span>{k}: {val}
                  {delta !== 0 && <span style={{fontSize:11,fontWeight:800,color: delta>0? '#2e7d32':'#c62828'}}> {delta>0?`+${delta}`:delta}</span>}
                </div>
              );
            })}
          </div>
        )}
        {activeTab==='department' && deptAnalytics && (
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            {statusLabels.map(k=>{
              const val = Object.values(deptAnalytics||{}).reduce((acc,sem)=>acc+(sem[k]||0),0);
              const delta = deptDeltas ? deptDeltas[k] : 0;
              return (
                <div key={k} style={{background:'#f1f5f9', padding:'6px 10px', borderRadius:8, fontSize:typeScale.xl, fontWeight:700, display:'flex', alignItems:'center', gap:6, color:'#034067'}}>
                  <span style={{width:10,height:10,borderRadius:3,background:statusColors[k]}}></span>{k}: {val}
                  {delta !== 0 && <span style={{fontSize:11,fontWeight:800,color: delta>0? '#2e7d32':'#c62828'}}> {delta>0?`+${delta}`:delta}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeTab === 'subject' && <>
  <h2 className="student-analytics-heading" style={{fontSize:typeScale.xl}}>📊 Subject Progress</h2>
        {analytics && semesters.length > 0 && (
          <div className="student-analytics-tabs">
            <button key="All" className={`student-analytics-tab-btn${activeSemester === 'All' ? ' active' : ''}`} onClick={() => setActiveSemester('All')}>All</button>
            {semesters.map(sem => (
              <button key={sem} className={`student-analytics-tab-btn${activeSemester === sem ? ' active' : ''}`} onClick={() => setActiveSemester(sem)}>{sem} Semester</button>
            ))}
          </div>
        )}
        <div className="student-analytics-pie-container">
          {loading ? <div style={{fontSize:13,color:'#0277bd'}}>Loading analytics...</div> : total === 0 ? <div className="student-analytics-nodata">No data to display.</div> : (
            <Pie 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins:{ 
                  legend:{ 
                    position:'bottom', 
                    labels:{ color:'#0277bd', font:{ size:14 }, boxWidth:14 } 
                  } 
                },
                layout:{ padding: 4 }
              }} 
            />)}
        </div>
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
  <h2 className="student-analytics-heading" style={{fontSize:typeScale.xl}}>🏢 Department Progress</h2>
        {deptAnalytics && semesterOrder.filter(sem => deptAnalytics[sem]).length > 0 && (
          <div className="student-analytics-tabs">
            <button key="All" className={`student-analytics-tab-btn${deptActiveSemester === 'All' ? ' active' : ''}`} onClick={() => setDeptActiveSemester('All')}>All</button>
            {semesterOrder.filter(sem => deptAnalytics[sem]).map(sem => (
              <button key={sem} className={`student-analytics-tab-btn${deptActiveSemester === sem ? ' active' : ''}`} onClick={() => setDeptActiveSemester(sem)}>{sem} Semester</button>
            ))}
          </div>
        )}
        <div className="student-analytics-pie-container">
          {deptLoading ? <div style={{fontSize:13,color:'#0277bd'}}>Loading analytics...</div> : deptTotal === 0 ? <div className="student-analytics-nodata">No data to display.</div> : (
            <Pie 
              data={deptChartData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins:{ 
                  legend:{ 
                    position:'bottom', 
                    labels:{ color:'#0277bd', font:{ size:14 }, boxWidth:14 } 
                  } 
                },
                layout:{ padding: 4 }
              }} 
            />)}
        </div>
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

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
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

const StaffDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  // Inject keyframes once
  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    if (!user || userType !== 'staff') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/department-status/staff-requests', {
      params: { staff_id: user.staff_id }
    })
      .then(res => {
        const data = res.data || [];
        const obj = {};
        data.forEach(r => {
          const sem = r.semester;
          if (!obj[sem]) obj[sem] = { Requested: 0, Approved: 0, Rejected: 0 };
          if (r.status === 'Requested') obj[sem].Requested++;
          if (r.status === 'Approved') obj[sem].Approved++;
          if (r.status === 'Rejected') obj[sem].Rejected++;
        });
        setAnalytics(obj);
      })
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const cardShadow = {
    ...cardStyles.info,
    minWidth: 220,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    ...fadeInUp
  };

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

  const buildBar = (counts) => {
    const { Approved, Requested, Rejected } = counts;
    const sum = Approved + Requested + Rejected || 1; // avoid division by zero
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
        <div style={{ 
          ...pageStyles.hero,
          ...fadeInUp,
          padding:24
        }}>
          <div style={{ fontSize:'1.4rem', marginBottom:8 }}>🧩</div>
          <h1 style={{ 
            ...headerStyles.pageTitle,
            color:'#fff',
            fontSize:typeScale.xxl,
            textShadow:'1px 1px 2px rgba(0,0,0,0.25)',
            marginBottom:4
          }}>Staff Dashboard</h1>
          <p style={{ fontSize:typeScale.md, opacity:.9, margin:0, lineHeight:1.3 }}>
            Welcome back, {user?.name || 'Staff'}! Manage department approval workflows.
          </p>
        </div>

        {/* Analytics + Quick Actions */}
        <div style={{ 
          display:'grid', 
          gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', 
          gap:16, 
          marginBottom:18 
        }}>
          {/* Department Analytics */}
          <div style={{ ...cardShadow, ...slideInLeft }}>
            <div style={{ 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'space-between', 
              marginBottom:15 
            }}>
              <h3 style={{ 
                ...headerStyles.sectionTitle, 
                margin:0, 
                fontSize:typeScale.xl, 
                fontWeight:600 
              }}>🏢 Department Analytics</h3>
              <div style={{ fontSize:'1.2rem' }}>📊</div>
            </div>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ background:'#eceff1', borderRadius:12, height:78, animation:'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <>
                <div style={{ 
                  display:'grid', 
                  gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', 
                  gap:12, 
                  width:'100%', 
                  marginBottom:12 
                }}>
                  <SemesterCard title="1st Semester" counts={sem1} delay="0s" />
                  <SemesterCard title="2nd Semester" counts={sem2} delay=".1s" />
                </div>
                <div style={{
                  background:'linear-gradient(135deg,#0277bd 0%,#01579b 100%)',
                  color:'#fff',
                  padding:'10px 14px',
                  borderRadius:14,
                  display:'flex',
                  flexDirection:'column',
                  gap:6,
                  boxShadow:'0 6px 16px rgba(2,119,189,0.25)'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <strong style={{ fontSize:typeScale.xl, letterSpacing:'.5px' }}>Overall Summary</strong>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>✓ {overallApprovalRate}% approved</span>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>✗ {overallRejectionRate}% rejected</span>
                      <span style={{ fontSize:typeScale.xxs, background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:20, fontWeight:600 }}>Σ {grandTotal || 0}</span>
                    </div>
                  </div>
                  {buildBar({ Approved: totalApproved, Requested: totalRequested, Rejected: totalRejected })}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:6, marginTop:4 }}>
                    <StatLine label="Approved" value={totalApproved} color="#c8e6c9" />
                    <StatLine label="Requested" value={totalRequested} color="#ffe0b2" />
                    <StatLine label="Rejected" value={totalRejected} color="#ffcdd2" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ ...cardShadow, ...slideInRight }}>
            <div style={{ 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'space-between', 
              marginBottom:15 
            }}>
              <h3 style={{ 
                ...headerStyles.sectionTitle, 
                margin:0, 
                fontSize:typeScale.xl, 
                fontWeight:600 
              }}>🚀 Quick Actions</h3>
              <div style={{ fontSize:'1.2rem' }}>⚡</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <a 
                href="/staff/department-requests" 
                style={{ textDecoration:'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.primary,
                  padding:'8px 14px',
                  borderRadius:18,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'flex-start',
                  gap:8,
                  fontSize:typeScale.lg,
                  fontWeight:600,
                  transition:'all 0.25s ease',
                  border:'none',
                  boxShadow:'0 3px 8px rgba(2,119,189,0.18)'
                }}>
                  <span style={{ fontSize:'1rem' }}>📋</span>
                  View Requests
                </div>
              </a>
              <a 
                href="/staff/analytics" 
                style={{ textDecoration:'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.info,
                  padding:'8px 14px',
                  borderRadius:18,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'flex-start',
                  gap:8,
                  fontSize:typeScale.lg,
                  fontWeight:600,
                  transition:'all 0.25s ease',
                  border:'none',
                  boxShadow:'0 3px 8px rgba(33,150,243,0.18)'
                }}>
                  <span style={{ fontSize:'1rem' }}>📊</span>
                  View Analytics
                </div>
              </a>
              <a 
                href="/staff/dashboard" 
                style={{ textDecoration:'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.info,
                  padding:'8px 14px',
                  borderRadius:18,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'flex-start',
                  gap:8,
                  fontSize:typeScale.lg,
                  fontWeight:600,
                  transition:'all 0.25s ease',
                  border:'none',
                  boxShadow:'0 3px 8px rgba(33,150,243,0.18)'
                }}>
                  <span style={{ fontSize:'1rem' }}>🔄</span>
                  Refresh Analytics
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Department Management Hub */}
        <div style={{ 
          ...cardStyles.default,
          ...fadeInUp,
          animationDelay:'0.25s'
        }}>
          <div style={{ 
            background:gradients.primary,
            padding:'14px 16px',
            color:'#fff',
            display:'flex',
            alignItems:'center',
            gap:10
          }}>
            <div style={{ fontSize:'1.4rem' }}>🏢</div>
            <div>
              <h3 style={{ 
                margin:0,
                fontWeight:600,
                fontSize:typeScale.xl,
                letterSpacing:'.25px'
              }}>Department Management Hub</h3>
              <p style={{ 
                margin:'2px 0 0 0',
                opacity:.9,
                fontSize:typeScale.md
              }}>Oversee and process student department clearance requests.</p>
            </div>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <p style={{ 
              color:'#546e7a',
              fontSize:typeScale.base,
              lineHeight:1.3,
              marginBottom:12,
              textAlign:'center'
            }}>
              Review department approval statuses. Track progress and manage actions efficiently.
            </p>
            <div style={{ 
              display:'flex',
              justifyContent:'center',
              gap:10,
              flexWrap:'wrap'
            }}>
              <a 
                href="/staff/department-requests" 
                style={{ textDecoration:'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.primary,
                  fontSize:typeScale.lg,
                  padding:'8px 18px',
                  borderRadius:18
                }}>
                  📋 Manage Requests
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
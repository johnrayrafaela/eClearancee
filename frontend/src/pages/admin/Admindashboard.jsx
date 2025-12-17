import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
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

// Helper fetch wrapper with safe fallback using api client
const safeFetch = async (url) => {
  try {
    const res = await api.get(url);
    return res.data;
  } catch { return []; }
};

const Admindashboard = () => {
  const { userType } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [clearance, setClearance] = useState({ Pending: 0, Approved: 0, Rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [distMode, setDistMode] = useState('counts'); // 'counts' | 'percent'

  // Admin-only protection
  useEffect(() => {
    console.log('[AdminDashboard] userType:', userType);
    if (userType && userType !== 'admin') {
      console.warn('[AdminDashboard] Access denied for:', userType);
      navigate('/', { replace: true });
    }
  }, [userType, navigate]);

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [u, st, t] = await Promise.all([
  safeFetch('/users'),
  safeFetch('/staff'),
  safeFetch('/teachers'),
      ]);
      if (!mounted) return;
      setUsers(Array.isArray(u) ? u : []);
      setStaffs(Array.isArray(st) ? st : []);
      setTeachers(Array.isArray(t) ? t : []);
      try {
        const r = await api.get('/clearance/analytics/status');
        const data = r.data || {};
        setClearance({
          Pending: data.Pending || 0,
            Approved: data.Approved || 0,
            Rejected: data.Rejected || 0,
        });
  } catch { /* ignore */ }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const totalStudents = users.length; // users table represents students
  const totalStaff = staffs.length;
  const totalTeachers = teachers.length;
  const totalOverall = totalStudents + totalStaff + totalTeachers; // overall user population

  const { Pending, Approved, Rejected } = clearance;
  const totalClearance = Pending + Approved + Rejected;
  const approvalRate = totalClearance ? ((Approved / totalClearance) * 100).toFixed(1) : '0.0';
  const rejectionRate = totalClearance ? ((Rejected / totalClearance) * 100).toFixed(1) : '0.0';

  // Pie chart dataset for user distribution
  const userPieData = {
    labels: ['Students', 'Staff', 'Teachers'],
    datasets: [
      {
        data: [totalStudents, totalStaff, totalTeachers],
        backgroundColor: [
          'rgba(2,119,189,0.85)', // students
          'rgba(171,71,188,0.85)', // staff
          'rgba(255,167,38,0.85)', // teachers
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
        cutout: '56%'
      }
    ]
  };

  const userPieOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 }
      }
    },
    animation: { duration: 600 },
    maintainAspectRatio: false
  };

  const buildBar = (segments) => {
    const sum = Object.values(segments).reduce((a, b) => a + b, 0) || 1;
    const seg = (v) => (v / sum) * 100;
    return (
      <div style={{ display:'flex', width:'100%', height:10, borderRadius:6, overflow:'hidden', background:'#eceff1', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
        <div style={{ width: seg(Approved)+'%', background:'linear-gradient(90deg,#4caf50,#2e7d32)', transition:'width .4s', display: Approved? 'block':'none' }} />
        <div style={{ width: seg(Pending)+'%', background:'linear-gradient(90deg,#ffb300,#ff9800)', transition:'width .4s', display: Pending? 'block':'none' }} />
        <div style={{ width: seg(Rejected)+'%', background:'linear-gradient(90deg,#e53935,#c62828)', transition:'width .4s', display: Rejected? 'block':'none' }} />
      </div>
    );
  };

  const MetricCard = ({ label, value, icon, color, delay }) => (
    <div style={{
      background: gradients.light,
      padding: '14px 16px',
      borderRadius: 14,
      border: '1px solid #e1f5fe',
      boxShadow: '0 4px 10px rgba(2,119,189,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      animation: 'fadeInUp .55s ease',
      animationDelay: delay,
      animationFillMode: 'backwards',
      minWidth: 180
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize: typeScale.base, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>{label}</span>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight:700, color: color || '#01579b', textShadow:'0 1px 2px rgba(2,119,189,0.18)' }}>{value}</div>
      <div style={{ height:4, borderRadius:2, background:'linear-gradient(90deg,#0288d1,#81d4fa)' }} />
    </div>
  );

  const StatLine = ({ label, value, color }) => (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize: typeScale.base, color:'#455a64', lineHeight:1.2 }}>
      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ width:10, height:10, borderRadius:3, background: color, boxShadow:'0 0 0 1px rgba(0,0,0,0.05)' }} />
        {label}
      </span>
      <strong style={{ fontWeight:600 }}>{value}</strong>
    </div>
  );

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      <div style={pageStyles.content}>
        {/* Hero */}
        <div style={{ ...pageStyles.hero, ...fadeInUp, padding:24 }}>
          <div style={{ fontSize:'1.4rem', marginBottom:8 }}>🛠️</div>
            <h1 style={{
              ...headerStyles.pageTitle,
              color:'#fff',
              fontSize: typeScale.xxl,
              textShadow:'1px 1px 2px rgba(0,0,0,0.25)',
              marginBottom:4
            }}>Admin Dashboard</h1>
            <p style={{ fontSize: typeScale.md, opacity:.9, margin:0, lineHeight:1.3 }}>
              Central oversight: users, faculty, staff, clearance performance & system management.
            </p>
        </div>

        {/* User Population Metric Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:14 }}>
          {loading ? (
            Array.from({ length: 6 }).map((_,i) => (
              <div key={i} style={{ background:'#eceff1', borderRadius:14, height:110, animation:'shimmer 1.4s infinite' }} />
            ))
          ) : (
            <>
              <MetricCard label="All Users" value={totalOverall} icon="👥" delay="0s" />
              <MetricCard label="Students" value={totalStudents} icon="🎓" delay=".05s" />
              <MetricCard label="Staff" value={totalStaff} icon="🧩" delay=".1s" />
              <MetricCard label="Teachers" value={totalTeachers} icon="👨‍🏫" delay=".15s" />
            </>
          )}
        </div>

        {/* Clearance Status Metric Cards */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', marginBottom:8 }}>
          <h3 style={{ margin:0, fontSize:typeScale.lg, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>Clearance Status Snapshot</h3>
          {!loading && (
            <span style={{ fontSize:typeScale.xxs, background:'#e1f5fe', padding:'4px 10px', borderRadius:18, fontWeight:600, letterSpacing:'.5px', color:'#0277bd' }}>Updated</span>
          )}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:20 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_,i) => (
              <div key={i} style={{ background:'#eceff1', borderRadius:14, height:100, animation:'shimmer 1.4s infinite' }} />
            ))
          ) : (
            <>
              <MetricCard label="Pending" value={Pending} icon="⏳" delay="0s" />
              <MetricCard label="Approved" value={Approved} icon="✅" delay=".05s" />
              <MetricCard label="Rejected" value={Rejected} icon="❌" delay=".1s" />
            </>
          )}
        </div>

        {/* Overall Distribution Stacked Bar */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:typeScale.base, fontWeight:600, color:'#0277bd', marginBottom:6, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <span>User Population Distribution</span>
            <span style={{ fontSize:typeScale.xxs, background:'#e1f5fe', padding:'4px 10px', borderRadius:20, fontWeight:600, letterSpacing:'.35px' }}>Σ {totalOverall}</span>
          </div>
          <div style={{ position:'relative', height:18, width:'100%', background:'#eceff1', borderRadius:10, overflow:'hidden', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
            {totalOverall > 0 && (
              <>
                <div title={`Students ${((totalStudents/totalOverall)*100).toFixed(1)}%`} style={{ position:'absolute', left:0, top:0, bottom:0, width:`${(totalStudents/totalOverall)*100}%`, background:'linear-gradient(90deg,#0288d1,#0277bd)' }} />
                <div title={`Staff ${((totalStaff/totalOverall)*100).toFixed(1)}%`} style={{ position:'absolute', left:`${(totalStudents/totalOverall)*100}%`, top:0, bottom:0, width:`${(totalStaff/totalOverall)*100}%`, background:'linear-gradient(90deg,#ab47bc,#8e24aa)' }} />
                <div title={`Teachers ${((totalTeachers/totalOverall)*100).toFixed(1)}%`} style={{ position:'absolute', right:0, top:0, bottom:0, width:`${(totalTeachers/totalOverall)*100}%`, background:'linear-gradient(90deg,#ffa726,#fb8c00)' }} />
              </>
            )}
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:6, fontSize:typeScale.xxs, fontWeight:600, color:'#546e7a' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:12, borderRadius:4, background:'#0288d1' }} />Students {totalOverall? ((totalStudents/totalOverall)*100).toFixed(1):'0.0'}%</span>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:12, borderRadius:4, background:'#ab47bc' }} />Staff {totalOverall? ((totalStaff/totalOverall)*100).toFixed(1):'0.0'}%</span>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:12, height:12, borderRadius:4, background:'#ffa726' }} />Teachers {totalOverall? ((totalTeachers/totalOverall)*100).toFixed(1):'0.0'}%</span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:20, marginBottom:24 }}>
          {/* Clearance Analytics */}
          <div style={{
            ...cardStyles.default,
            ...slideInLeft,
            display:'flex',
            flexDirection:'column',
            gap:14
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin:0, fontSize:typeScale.xl, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>📄 Clearance Analytics</h3>
              <span style={{ fontSize:typeScale.sm, background:'#0277bd', color:'#fff', padding:'4px 10px', borderRadius:20, fontWeight:600 }}>{approvalRate}% ✓</span>
            </div>
            {loading ? (
              <div style={{ background:'#eceff1', height:90, borderRadius:12, animation:'shimmer 1.5s infinite' }} />
            ) : (
              <>
                {buildBar({ Approved, Pending, Rejected })}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8 }}>
                  <StatLine label="Approved" value={Approved} color="#4caf50" />
                  <StatLine label="Pending" value={Pending} color="#ff9800" />
                  <StatLine label="Rejected" value={Rejected} color="#e53935" />
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:typeScale.xxs, background:'#e8f5e9', color:'#2e7d32', padding:'4px 8px', borderRadius:18, fontWeight:600 }}>✓ {approvalRate}% approved</span>
                  <span style={{ fontSize:typeScale.xxs, background:'#ffebee', color:'#c62828', padding:'4px 8px', borderRadius:18, fontWeight:600 }}>✗ {rejectionRate}% rejected</span>
                  <span style={{ fontSize:typeScale.xxs, background:'#fff8e1', color:'#ef6c00', padding:'4px 8px', borderRadius:18, fontWeight:600 }}>Σ {totalClearance || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
            <div style={{
              ...cardStyles.default,
              ...slideInRight,
              display:'flex',
              flexDirection:'column',
              gap:14
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0, fontSize:typeScale.xl, fontWeight:600, color:'#0277bd' }}>🚀 Quick Actions</h3>
                <span style={{ fontSize:'1.2rem' }}>⚡</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Link to="/admin/teachermanagement" style={{ textDecoration:'none' }}>
                  <div style={{ ...buttonStyles.primary, padding:'8px 14px', borderRadius:18, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>👨‍🏫 Manage Teachers</div>
                </Link>
                <Link to="/staffmanagement" style={{ textDecoration:'none' }}>
                  <div style={{ ...buttonStyles.info, padding:'8px 14px', borderRadius:18, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>🧩 Manage Staff</div>
                </Link>
                <Link to="/admin/departmentmanagement" style={{ textDecoration:'none' }}>
                  <div style={{ ...buttonStyles.secondary, padding:'8px 14px', borderRadius:18, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>🏢 Departments</div>
                </Link>
                <Link to="/admin/subjects" style={{ textDecoration:'none' }}>
                  <div style={{ ...buttonStyles.success, padding:'8px 14px', borderRadius:18, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>📚 Subjects</div>
                </Link>
                <Link to="/admin/analytics" style={{ textDecoration:'none' }}>
                  <div style={{ ...buttonStyles.warning, padding:'8px 14px', borderRadius:18, fontSize:typeScale.lg, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>📊 View Analytics</div>
                </Link>
              </div>
            </div>

          {/* User Distribution Pie */}
          <div style={{
            ...cardStyles.default,
            ...fadeInUp,
            animationDelay: '.15s',
            display:'flex',
            flexDirection:'column',
            gap:14
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <h3 style={{ margin:0, fontSize:typeScale.xl, fontWeight:600, color:'#0277bd', letterSpacing:'.25px' }}>👥 User Distribution</h3>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={()=> setDistMode(m => m==='counts' ? 'percent' : 'counts')} style={{
                  ...buttonStyles.secondary,
                  padding:'6px 14px',
                  borderRadius:18,
                  fontSize:typeScale.sm,
                  fontWeight:600,
                  cursor:'pointer'
                }}>{distMode === 'counts' ? 'Show %' : 'Show Counts'}</button>
                <span style={{ fontSize:typeScale.sm, background:'#0277bd', color:'#fff', padding:'4px 10px', borderRadius:20, fontWeight:600 }}>Σ {totalOverall}</span>
              </div>
            </div>
            {loading ? (
              <div style={{ background:'#eceff1', borderRadius:14, height:220, animation:'shimmer 1.5s infinite' }} />
            ) : totalOverall === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#607d8b', fontSize:typeScale.base }}>No users found.</div>
            ) : (
              <div style={{ position:'relative', height:220 }}>
                <Pie data={userPieData} options={userPieOptions} />
                <div style={{
                  position:'absolute',
                  inset:0,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexDirection:'column',
                  pointerEvents:'none'
                }}>
                  {distMode === 'counts' ? (
                    <>
                      <div style={{ fontSize:typeScale.lg, fontWeight:700, color:'#01579b', lineHeight:1 }}>All</div>
                      <div style={{ fontSize:typeScale.md, fontWeight:600, color:'#0277bd' }}>{totalOverall}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:typeScale.lg, fontWeight:700, color:'#01579b', lineHeight:1 }}>Share</div>
                      <div style={{ fontSize:typeScale.md, fontWeight:600, color:'#0277bd' }}>100%</div>
                    </>
                  )}
                </div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8 }}>
              {['Students','Staff','Teachers'].map(role => {
                const value = role==='Students'? totalStudents : role==='Staff'? totalStaff : totalTeachers;
                const pct = totalOverall? ((value/totalOverall)*100).toFixed(1):'0.0';
                const color = role==='Students'? '#0288d1' : role==='Staff'? '#ab47bc' : '#ffa726';
                return (
                  <div key={role} style={{ display:'flex', flexDirection:'column', gap:2, background:'#f5fbff', border:'1px solid #e1f5fe', padding:'8px 10px', borderRadius:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:typeScale.xxs, fontWeight:600, color:'#0277bd' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10, height:10, borderRadius:3, background:color }} />{role}</span>
                      <span style={{ fontSize:typeScale.xxs, background:'#ffffff', border:'1px solid #e1f5fe', padding:'2px 6px', borderRadius:10, color:'#455a64' }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize:typeScale.base, fontWeight:700, color:'#01579b', textAlign:'right' }}>
                      {distMode === 'counts' ? value : pct + '%'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Management Hub */}
        <div style={{ ...cardStyles.default, ...fadeInUp, animationDelay:'0.25s' }}>
          <div style={{ background: gradients.primary, padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:'1.4rem' }}>🧭</div>
            <div>
              <h3 style={{ margin:0, fontWeight:600, fontSize:typeScale.xl, letterSpacing:'.25px' }}>System Management Hub</h3>
              <p style={{ margin:'2px 0 0 0', opacity:.9, fontSize:typeScale.md }}>Centralize control of personnel, curriculum & clearance workflows</p>
            </div>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <p style={{ color:'#546e7a', fontSize:typeScale.base, lineHeight:1.3, marginBottom:12, textAlign:'center' }}>
              Oversee platform entities, track clearance throughput and ensure academic & administrative operations run smoothly.
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
              <Link to="/admin/clearancerequest" style={{ textDecoration:'none' }}>
                <div style={{ ...buttonStyles.primary, fontSize:typeScale.lg, padding:'8px 18px', borderRadius:18 }}>📄 Clearance Requests</div>
              </Link>
              <Link to="/admin/teachermanagement" style={{ textDecoration:'none' }}>
                <div style={{ ...buttonStyles.secondary, fontSize:typeScale.lg, padding:'8px 18px', borderRadius:18 }}>👨‍🏫 Faculty</div>
              </Link>
              <Link to="/staffmanagement" style={{ textDecoration:'none' }}>
                <div style={{ ...buttonStyles.info, fontSize:typeScale.lg, padding:'8px 18px', borderRadius:18 }}>🧩 Staff</div>
              </Link>
              <Link to="/admin/departmentmanagement" style={{ textDecoration:'none' }}>
                <div style={{ ...buttonStyles.success, fontSize:typeScale.lg, padding:'8px 18px', borderRadius:18 }}>🏢 Departments</div>
              </Link>
              <Link to="/admin/analytics" style={{ textDecoration:'none' }}>
                <div style={{ ...buttonStyles.warning, fontSize:typeScale.lg, padding:'8px 18px', borderRadius:18 }}>📊 Analytics</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
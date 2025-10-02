import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/image/logo/eClearance.png';
import { buttonStyles, injectKeyframes } from '../style/CommonStyles';

const Landingpage = () => {
  useEffect(() => { injectKeyframes(); }, []);

  const year = new Date().getFullYear();

  // --- Styles & Tokens ---
  const palette = {
    lightBg: 'linear-gradient(135deg,#ffffff 0%,#f3f9fc 55%,#e8f4ff 100%)',
    accent: '#ffb300',
    accentGrad: 'linear-gradient(135deg,#ffb300,#ff9800)',
    primary: '#01579b',
    textDark: '#103446',
    softText: '#476172',
    surface: '#ffffff',
    panel: 'linear-gradient(150deg,rgba(255,255,255,0.65),rgba(255,255,255,0.35))'
  };

  const outer = {
    minHeight: '100vh',
    width: '100%',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: palette.lightBg,
    color: palette.textDark,
    overflowX: 'hidden',
    position: 'relative'
  };

  const gradientOverlay = {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at 20% 25%,rgba(255,179,0,0.18),transparent 55%), radial-gradient(circle at 85% 70%,rgba(2,119,189,0.15),transparent 55%)',
    pointerEvents: 'none'
  };

  const noise = { position:'absolute', inset:0, pointerEvents:'none', mixBlendMode:'overlay', opacity:.08,
    background:'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22 viewBox=%220 0 240 240%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22240%22 height=%22240%22 filter=%22url(%23n)%22 opacity=%220.4%22/%3E%3C/svg%3E") repeat' };

  const nav = {
    display: 'flex', alignItems:'center', justifyContent:'space-between',
    padding: '16px clamp(1rem,4vw,3.2rem)', position:'relative', zIndex:20
  };

  const logoWrap = { display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:palette.primary };
  const logoImg = { width:58, height:58, borderRadius:'18px', boxShadow:'0 4px 16px -4px rgba(2,119,189,0.30)', objectFit:'cover', background:'#fff', padding:6 };
  const brandTxt = { fontSize:'1.6rem', fontWeight:800, letterSpacing:'.8px', margin:0, color:palette.primary };

  const navActions = { display:'flex', gap:14 };
  const ghostBtn = { ...buttonStyles.secondary, background:'#ffffff', border:'1px solid #d7e7ef', color:palette.primary, padding:'10px 20px', fontSize:'.8rem', fontWeight:600, letterSpacing:'.5px', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' };
  const solidBtn = { ...buttonStyles.primary, background:palette.accentGrad, padding:'10px 24px', fontSize:'.8rem', fontWeight:700, letterSpacing:'.6px', boxShadow:'0 6px 22px -6px rgba(255,152,0,0.45)' };

  const hero = { position:'relative', padding:'clamp(2rem,5.6vw,4rem) clamp(1rem,5vw,4.5rem) clamp(2.2rem,5vw,4rem)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', alignItems:'center', gap:'3.5rem', zIndex:10, maxWidth:1600, margin:'0 auto' };
  const heroText = { position:'relative'};
  const kicker = { textTransform:'uppercase', letterSpacing:'3px', fontSize:'.63rem', fontWeight:800, color:palette.accent, margin:'0 0 14px', background:'rgba(255,179,0,0.18)', padding:'6px 14px', borderRadius:40, display:'inline-block', boxShadow:'0 2px 6px rgba(255,179,0,0.25)' };
  const h1 = { fontSize:'clamp(2.5rem,4.2vw,3.6rem)', margin:'0 0 16px', lineHeight:1.05, fontWeight:800, letterSpacing:'.5px', color:palette.primary };
  const lead = { fontSize:'clamp(.95rem,1.1vw,1.1rem)', lineHeight:1.55, color:palette.softText, maxWidth:660, fontWeight:500, margin:'0 0 28px' };
  const ctaRow = { display:'flex', gap:18, flexWrap:'wrap', marginBottom:28 };
  const bigCTA = { ...solidBtn, fontSize:'.9rem', padding:'16px 36px', borderRadius:16 };
  const outlineCTA = { ...ghostBtn, fontSize:'.85rem', padding:'16px 26px', borderRadius:16 };

  const metrics = { display:'flex', flexWrap:'wrap', gap:22, marginTop:10 };
  const metricCard = { flex:'1 1 140px', minWidth:140, background:'#ffffff', padding:'16px 18px 18px', border:'1px solid #dcecf3', borderRadius:20, boxShadow:'0 4px 18px -6px rgba(0,0,0,0.12)', position:'relative', overflow:'hidden' };
  const metricVal = { fontSize:'1.55rem', fontWeight:800, letterSpacing:'.5px', color:palette.primary, margin:'0 0 4px' };
  const metricLbl = { fontSize:'.6rem', textTransform:'uppercase', letterSpacing:'1.8px', fontWeight:700, color:palette.softText };

  const featureBand = { position:'relative', marginTop:'3.5rem', padding:'0  clamp(1rem,5vw,4.5rem) 4.5rem' };
  const bandGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'26px', maxWidth:1600, margin:'0 auto' };
  const featureCard = { background:'#ffffff', border:'1px solid #d9e7ef', padding:'20px 20px 26px', borderRadius:22, position:'relative', overflow:'hidden', boxShadow:'0 6px 22px -8px rgba(0,0,0,0.12)', transition:'transform .35s cubic-bezier(.34,1.56,.4,1)', cursor:'default' };
  const featureIcon = { fontSize:'1.9rem', marginBottom:14 };
  const featureTitle = { margin:'0 0 10px', fontSize:'1.05rem', fontWeight:700, letterSpacing:'.4px', color:palette.primary };
  const featureTxt = { margin:0, fontSize:'.8rem', lineHeight:1.55, color:palette.softText, fontWeight:500 };

  const footer = { textAlign:'center', padding:'44px 20px 34px', fontSize:'.7rem', color:palette.softText, letterSpacing:'.5px', borderTop:'1px solid #d9e7ef', marginTop:'2.8rem' };

  // Decorative floating shapes
  const decoWrap = { position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' };
  const blob = (w,h,left,top,delay,bg) => ({ position:'absolute', width:w, height:h, left, top, background:bg, filter:'blur(48px)', opacity:.22, borderRadius:'50%', animation:'floatY 18s ease-in-out infinite', animationDelay:delay });

  return (
    <div style={outer}>
      <style>{`
        @keyframes floatY { 0%,100%{ transform:translateY(-18px);} 50%{transform:translateY(28px);} }
        @media (max-width: 780px){
          .hero-metrics { flex-direction:row; }
          .hero-metrics > div { flex:1 1 calc(50% - 12px); }
        }
        @media (max-width:620px){
          .hero-metrics { flex-direction:column; }
          .hero-metrics > div { width:100%; }
          .hero-grid { gap:2.4rem; }
        }
      `}</style>
      <div style={decoWrap} aria-hidden="true">
  <div style={blob('480px','420px','-90px','-80px','0s','linear-gradient(120deg,#c8e9ff,#9dd7ff)')} />
  <div style={blob('420px','380px','70%','-110px','3s','linear-gradient(120deg,#ffe2a8,#ffd27a)')} />
  <div style={blob('380px','360px','65%','65%','6s','linear-gradient(120deg,#d6ffe8,#a6f2cc)')} />
      </div>
      <div style={gradientOverlay} />
      <div style={noise} />
      {/* NAVBAR */}
      <header style={nav}>
        <div style={logoWrap}>
          <img src={logo} alt="eClearance" style={logoImg} />
          <h1 style={brandTxt}>eClearance</h1>
        </div>
        <nav style={navActions} aria-label="Primary">
          <Link to="/login" style={ghostBtn}>Login</Link>
          <Link to="/register" style={solidBtn}>Get Started</Link>
        </nav>
      </header>
      {/* HERO */}
      <section style={hero} className="hero-grid">
        <div style={heroText}>
          <div style={kicker}>DIGITAL CLEARANCE PLATFORM</div>
          <h2 style={h1}>Fast, Transparent & Paper‑Light Student Clearance</h2>
            <p style={lead}>
              Streamline academic & departmental sign‑offs. Upload requirements, track approvals in real‑time, and print a validated clearance sheet— all in one unified workspace.
            </p>
            <div style={ctaRow}>
              <Link to="/register" style={bigCTA}>Create Clearance Account →</Link>
              <Link to="/login" style={outlineCTA}>I already have an account</Link>
            </div>
            <div style={{ fontSize:'.7rem', letterSpacing:'1px', color:palette.primary, textTransform:'uppercase', fontWeight:700, opacity:.8 }}>Built for Students • Teachers • Staff • Admins</div>
            <div style={{ ...metrics, marginTop:28 }} className="hero-metrics">
              <div style={metricCard}>
                <div style={metricVal}>98%</div>
                <div style={metricLbl}>LESS MANUAL CHASING</div>
              </div>
              <div style={metricCard}>
                <div style={metricVal}>24/7</div>
                <div style={metricLbl}>STATUS VISIBILITY</div>
              </div>
              <div style={metricCard}>
                <div style={metricVal}>1‑Page</div>
                <div style={metricLbl}>FINAL CLEARANCE</div>
              </div>
              <div style={metricCard}>
                <div style={metricVal}>Zero</div>
                <div style={metricLbl}>LOST FORMS</div>
              </div>
            </div>
        </div>
        <div style={{ position:'relative', minHeight:340 }}>
          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>
            <div style={{ width:'min(440px,90%)', background:palette.panel, border:'1px solid rgba(255,255,255,0.15)', padding:'32px 30px 38px', borderRadius:26, backdropFilter:'blur(12px)', boxShadow:'0 18px 55px -12px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 75% 20%,rgba(255,179,0,0.18),transparent 55%)' }} />
              <h3 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, letterSpacing:'.5px', color:'#fff', display:'flex', alignItems:'center', gap:8 }}>🚀 Why eClearance?</h3>
              <ul style={{ listStyle:'none', margin:'18px 0 0', padding:0, display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  ['Realtime tracking', 'Instant visibility on every approval & rejection event.'],
                  ['Unified requirements', 'Subjects & departments in one consistent interface.'],
                  ['Smart printing', 'Auto-scaled single‑page clearance sheet with signatures.'],
                  ['Role‑based access', 'Tailored dashboards for students, teachers and staff.']
                ].map(([title,desc]) => (
                  <li key={title} style={{ display:'flex', gap:14 }}>
                    <div style={{ width:38, height:38, borderRadius:14, background:'linear-gradient(135deg,#0277bd,#014f82)', display:'grid', placeItems:'center', fontSize:'1rem', boxShadow:'0 6px 14px -4px rgba(0,0,0,0.5)' }}>✔</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.85rem', fontWeight:700, letterSpacing:'.4px', color:'#fff' }}>{title}</div>
                      <div style={{ fontSize:'.72rem', lineHeight:1.4, color:'#b9dced' }}>{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Band */}
      <section style={featureBand}>
        <div style={{ textAlign:'center', maxWidth:900, margin:'0 auto 42px' }}>
          <h2 style={{ margin:'0 0 14px', fontSize:'clamp(1.9rem,3vw,2.45rem)', fontWeight:800, letterSpacing:'.6px', color:palette.primary }}>Everything you need to finish clearance on time</h2>
          <p style={{ fontSize:'clamp(.9rem,1.05vw,1.08rem)', lineHeight:1.55, margin:0, color:palette.softText, fontWeight:500 }}>From submission to approval to final print — optimized, transparent and secure.</p>
        </div>
        <div style={bandGrid}>
          {[{
            icon:'📑', title:'Centralized Records', text:'All subject & department requirements unified—no more scattered printouts.'
          },{
            icon:'🔔', title:'Live Status Signals', text:'Real-time updates so you act immediately on rejections or remarks.'
          },{
            icon:'🛡️', title:'Role Security', text:'Granular access across admin, teacher, staff & student roles.'
          },{
            icon:'⚡', title:'Optimized Printing', text:'One-page smart scaling with conditional signatures embedded.'
          },{
            icon:'☁️', title:'Cloud Ready', text:'Works across devices – consistent responsive experience.'
          },{
            icon:'📊', title:'Analytics Built-in', text:'Dashboards surface progress and bottlenecks instantly.'
          }].map(f => (
            <div key={f.title} style={featureCard} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-8px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <div style={featureIcon}>{f.icon}</div>
              <h3 style={featureTitle}>{f.title}</h3>
              <p style={featureTxt}>{f.text}</p>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 85% 20%,rgba(2,119,189,0.06),transparent 62%)' }} />
            </div>
          ))}
        </div>
      </section>

      <footer style={footer}>
        <div>© {year} eClearance Platform · Accelerating academic clearance workflows.</div>
        <div style={{ marginTop:8, fontSize:'.63rem', letterSpacing:'1px', color:palette.primary, opacity:.6 }}>Made with performance‑focused React components</div>
      </footer>
    </div>
  );
};

export default Landingpage;
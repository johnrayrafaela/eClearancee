// Common styling constants and animations for the eClearance application
// Centralized theme used across pages (TeacherAddSubject, CreateClearancePage, etc.)

// Keyframes string (injected once)
export const keyframes = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
  @keyframes slideIn { from { opacity:0; transform: translateX(-30px);} to { opacity:1; transform: translateX(0);} }
  @keyframes slideInLeft { from { opacity:0; transform: translateX(-50px);} to { opacity:1; transform: translateX(0);} }
  @keyframes slideInRight { from { opacity:0; transform: translateX(50px);} to { opacity:1; transform: translateX(0);} }
  @keyframes bounceIn { 0% { opacity:0; transform: scale(.3);} 50% { opacity:1; transform: scale(1.05);} 70% { transform: scale(.9);} 100% { opacity:1; transform: scale(1);} }
  @keyframes pulse { 0% { transform: scale(1);} 50% { transform: scale(1.05);} 100% { transform: scale(1);} }
  @keyframes shimmer { 0% { background-position: -200px 0;} 100% { background-position: calc(200px + 100%) 0;} }

  .btn-hover { transition: all .3s ease; position: relative; overflow:hidden; }
  .btn-hover:hover { transform: translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,0.18)!important; }
  .btn-hover:active { transform: translateY(0); }
  .card-hover { transition: all .3s ease; }
  .card-hover:hover { transform: translateY(-5px); box-shadow:0 15px 40px rgba(0,0,0,0.15)!important; }
  .search-focus { transition: all .3s ease; }
  .search-focus:focus { border-color:#0277bd!important; box-shadow:0 0 0 3px rgba(2,119,189,0.15)!important; transform:scale(1.02); }
  .loading-shimmer { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; }
`;

export const gradients = {
  primary: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)',
  success: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  warning: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  danger: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
  info: 'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)',
  light: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
  card: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)',
  cardSuccess: 'linear-gradient(135deg, #fff 0%, #e8f5e8 100%)',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
  hero: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #0277bd 100%)'
};

export const buttonStyles = {
  base: { border: 'none', borderRadius: 28, padding: '12px 26px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', color: '#fff', display:'inline-flex', alignItems:'center', gap:10, boxShadow: '0 10px 30px rgba(2,119,189,0.18)', transition: 'all .3s ease' },
  primary: { background: gradients.primary, boxShadow: '0 6px 20px rgba(2,119,189,0.35)' },
  success: { background: gradients.success, boxShadow: '0 6px 20px rgba(76,175,80,0.35)' },
  warning: { background: gradients.warning, boxShadow: '0 6px 20px rgba(255,152,0,0.35)' },
  danger: { background: gradients.danger, boxShadow: '0 6px 20px rgba(244,67,54,0.35)' },
  secondary: { background: 'linear-gradient(135deg,#90a4ae 0%,#607d8b 100%)', boxShadow: '0 6px 20px rgba(96,125,139,0.35)' }
};

export const headerStyles = {
  pageTitle: { color:'#0277bd', fontWeight:900, fontSize:'2.4rem', margin:'0 0 10px', letterSpacing:'2px', textShadow:'0 2px 4px rgba(2,119,189,0.15)' },
  subtitle: { color:'#546e7a', fontSize:'1.05rem', margin:0, lineHeight:1.5 }
};

export const cardStyles = {
  panel: { background: gradients.light, borderRadius: 20, padding: 30, boxShadow:'0 20px 60px rgba(2,119,189,0.10)', border:'2px solid #e1f5fe' },
  section: { background:'linear-gradient(135deg,#fff 0%, #f1f9ff 100%)', borderRadius:16, padding:20, border:'1px solid #e3f2fd', boxShadow:'0 4px 16px rgba(2,119,189,0.06)' }
};

export const modalStyles = {
  backdrop: { position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)', zIndex:1100, display:'flex', justifyContent:'center', alignItems:'flex-start', overflowY:'auto', padding:'60px 20px 40px' },
  containerLg: { background: gradients.light, width:'100%', maxWidth:1100, borderRadius:20, boxShadow:'0 28px 70px rgba(2,32,54,0.28)', padding:'28px 32px', position:'relative', animation:'fadeInUp .55s ease' },
  closeBtn: { position:'absolute', top:14, right:16, background:'linear-gradient(135deg,#f44336 0%,#d32f2f 100%)', border:'none', borderRadius:'50%', width:44, height:44, cursor:'pointer', fontSize:24, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 24px rgba(244,67,54,0.28)' }
};

export const badgeStyles = {
  neutral: { background:'#e1f5fe', color:'#0277bd', padding:'4px 10px', borderRadius: 20, fontSize:12, fontWeight:700, letterSpacing:.5 }
};

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32 };

export const colors = { primary:'#0277bd', accent:'#29b6f6', text:'#37474f', danger:'#e11d48', border:'#e1f5fe' };

export const injectKeyframes = (() => {
  let injected = false;
  return () => {
    if (typeof document === 'undefined' || injected) return;
    const style = document.createElement('style');
    style.id = 'eClearance-theme-keyframes';
    style.textContent = keyframes;
    document.head.appendChild(style);
    injected = true;
  };
})();

export const composeButton = (variant='primary') => ({ ...buttonStyles.base, ...(buttonStyles[variant] || buttonStyles.primary) });

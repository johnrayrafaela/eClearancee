import React from 'react';
import { cardStyles, buttonStyles, typeScale, gradients } from '../../style/CommonStyles';

/*
  UnifiedProfileCard
  Props:
    role: 'student' | 'teacher' | 'staff'
    user: object with firstname, lastname, email, ids, optional course/year_level/block/phone
    editable: boolean
    onEdit: fn
    extraFields: array of { label, value }
*/

const fieldRow = (label, value) => (
  <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
    <span style={{ fontSize:typeScale.xxs, fontWeight:600, letterSpacing:.5, textTransform:'uppercase', color:'#0277bd' }}>{label}</span>
    <span style={{ fontSize:typeScale.md, fontWeight:500, color:'#37474f' }}>{value || '—'}</span>
  </div>
);

const UnifiedProfileCard = ({ role, user, editable=false, onEdit, extraFields=[] }) => {
  if (!user) return null;
  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
  const avatarUrl = user.avatar ? (user.avatar.startsWith('http') ? user.avatar : (window.location.origin + '/' + user.avatar.replace(/^\//,''))) : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(fullName)}`;
  const roleLabel = role.charAt(0).toUpperCase()+role.slice(1);
  const baseFields = [];
  if (role === 'student') {
    baseFields.push(
      { label:'Student ID', value: user.student_id },
      { label:'Course', value: user.course },
      { label:'Year Level', value: user.year_level },
      { label:'Block', value: user.block },
      { label:'Phone', value: user.phone }
    );
  } else if (role === 'teacher') {
    baseFields.push(
      { label:'Teacher ID', value: user.teacher_id },
      { label:'Email', value: user.email }
    );
  } else if (role === 'staff') {
    baseFields.push(
      { label:'Staff ID', value: user.staff_id },
      { label:'Email', value: user.email }
    );
  }
  const all = [...baseFields, ...extraFields];
  return (
    <div style={{ ...cardStyles.default, padding:0, overflow:'hidden', maxWidth:900, margin:'0 auto', boxShadow:'0 8px 24px -4px rgba(2,119,189,0.15)' }}>
      <div style={{ background: gradients.primary, padding:'28px 28px 68px 28px', position:'relative', color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:22, flexWrap:'wrap' }}>
          <img src={avatarUrl} alt='avatar' style={{ width:110, height:110, borderRadius:'50%', objectFit:'cover', boxShadow:'0 4px 12px rgba(0,0,0,0.25)', border:'3px solid rgba(255,255,255,0.6)' }} />
          <div style={{ flex:1, minWidth:260 }}>
            <h1 style={{ margin:0, fontSize:'2rem', fontWeight:800, letterSpacing:.5 }}>{fullName || 'Unnamed User'}</h1>
            <div style={{ marginTop:6, fontSize:typeScale.lg, fontWeight:600, letterSpacing:.75, display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.15)', padding:'6px 14px', borderRadius:30 }}>{roleLabel}</span>
              <span style={{ background:'rgba(255,255,255,0.15)', padding:'6px 14px', borderRadius:30 }}>{user.email}</span>
            </div>
          </div>
          {editable && (
            <button onClick={onEdit} style={{ ...buttonStyles.secondary, padding:'10px 22px', borderRadius:26, fontSize:typeScale.base, fontWeight:600 }}>✏️ Edit Profile</button>
          )}
        </div>
        <div style={{ position:'absolute', left:0, right:0, bottom:-32, height:64, background:'linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0))', pointerEvents:'none' }} />
      </div>
      <div style={{ padding:'40px 30px 34px 30px', display:'grid', gap:24, gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))' }}>
        {all.map((f,i)=> <div key={i}>{fieldRow(f.label, f.value)}</div>)}
      </div>
    </div>
  );
};

export default UnifiedProfileCard;

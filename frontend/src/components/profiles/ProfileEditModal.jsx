import React, { useState, useEffect } from 'react';
import { buttonStyles, typeScale } from '../../style/CommonStyles';

/* Generic modal for editing user profile fields */
const overlay = {
  position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
  backdropFilter:'blur(4px)'
};

const modal = {
  background:'#fff', borderRadius:20, width:'100%', maxWidth:520, padding:'26px 28px 30px', boxShadow:'0 12px 40px -8px rgba(2,119,189,0.35)', position:'relative'
};

const fieldWrap = { display:'flex', flexDirection:'column', gap:6 };

const ProfileEditModal = ({ open, onClose, initialValues, fields, title='Edit Profile', onSubmit, submitting, successMessage, error }) => {
  const [form, setForm] = useState(initialValues || {});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(()=> { if(open){ setForm(initialValues || {}); setShowSuccess(false);} }, [open, initialValues]);

  if(!open) return null;

  const handleChange = e => setForm(f=>({...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    const ok = await onSubmit(form);
    if(ok){
      setShowSuccess(true);
      setTimeout(()=> { setShowSuccess(false); onClose(); }, 1200);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onClose} style={{ position:'absolute', top:10, right:10, background:'transparent', border:'none', fontSize:20, cursor:'pointer', color:'#607d8b' }}>×</button>
        {showSuccess ? (
          <div style={{ textAlign:'center', padding:'40px 10px' }}>
            <div style={{ fontSize:'3rem' }}>✅</div>
            <div style={{ fontSize:typeScale.xl, fontWeight:700, color:'#0277bd', marginTop:10 }}>{successMessage || 'Saved!'}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h2 style={{ margin:0, fontSize:'1.55rem', fontWeight:800, color:'#0277bd', letterSpacing:.5 }}>{title}</h2>
            {fields.map(f => (
              <div key={f.name} style={fieldWrap}>
                <label style={{ fontSize:typeScale.base, fontWeight:600, color:'#0277bd' }}>{f.label}</label>
                <input
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  placeholder={f.placeholder || ''}
                  type={f.type || 'text'}
                  required={f.required}
                  style={{ padding:'10px 12px', borderRadius:12, border:'1px solid #b3e5fc', fontSize:typeScale.base, fontWeight:500, background:'#f8fdff' }}
                />
              </div>
            ))}
            {error && <div style={{ color:'#c62828', fontWeight:600 }}>{error}</div>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
              <button type='button' onClick={onClose} style={{ ...buttonStyles.secondary, padding:'10px 22px', borderRadius:16, fontWeight:600 }}>Cancel</button>
              <button type='submit' disabled={submitting} style={{ ...buttonStyles.primary, opacity: submitting? .6:1, padding:'10px 22px', borderRadius:16, fontWeight:700 }}>
                {submitting? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;

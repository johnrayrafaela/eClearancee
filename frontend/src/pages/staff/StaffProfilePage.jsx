import React, { useContext, useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import UnifiedProfileCard from '../../components/profiles/UnifiedProfileCard';
import ProfileEditModal from '../../components/profiles/ProfileEditModal';
import { pageStyles, fadeInUp, typeScale } from '../../style/CommonStyles';

const StaffProfilePage = () => {
  const { user, userType, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);
  const staffId = user?.staff_id;
  useEffect(()=> {
    if (userType !== 'staff' || !staffId) return;
    if (hasFetchedRef.current) return; // avoid repeated fetch & flicker
    hasFetchedRef.current = true;
    let active = true;
    (async () => {
      setLoading(true);
      try {
  const res = await api.get(`/staff/${staffId}`);
        if(!active) return;
        setUser(prev => {
          // Only update if data actually changed to prevent unnecessary re-renders
            const merged = { ...prev, ...res.data };
            const changed = Object.keys(res.data).some(k => res.data[k] !== prev?.[k]);
            return changed ? merged : prev;
        });
      } catch { /* silent */ } finally { if(active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [userType, staffId, setUser]);

  const submit = async (form) => {
    if(!user?.staff_id) return false;
    setSaving(true); setError('');
    try {
      const payload = { firstname:form.firstname, lastname:form.lastname, email:form.email };
      if(form.password) payload.password = form.password; // optional password change
  const res = await api.put(`/staff/${user.staff_id}`, payload);
      setUser({ ...user, ...res.data });
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      return true;
    } catch(err){ setError(err.response?.data?.message || 'Update failed'); return false; }
    finally { setSaving(false); }
  };

  if(userType !== 'staff') return <div style={{ padding:40, textAlign:'center', color:'#c62828' }}>Access denied.</div>;
  if(!user) return <div style={{ padding:40, textAlign:'center' }}>Loading profile...</div>;

  return (
    <div style={{ ...pageStyles.container, minHeight:'calc(100vh - 70px)', paddingTop:30 }}>
      <div style={{ ...pageStyles.content, ...fadeInUp }}>
        <UnifiedProfileCard role='staff' user={user} editable onEdit={()=> setEditOpen(true)} />
  {loading && <div style={{ marginTop:18, textAlign:'center', fontSize:typeScale.base, color:'#0277bd', fontWeight:600 }}>Loading profile...</div>}
      </div>
      <ProfileEditModal
        open={editOpen}
        onClose={()=> setEditOpen(false)}
        initialValues={user}
        fields={[
          { name:'firstname', label:'First Name', required:true },
          { name:'lastname', label:'Last Name', required:true },
          { name:'email', label:'Email', type:'email', required:true },
          { name:'password', label:'New Password', type:'password', placeholder:'Leave blank to keep current' },
        ]}
        onSubmit={submit}
        submitting={saving}
        error={error}
        successMessage='Profile Updated'
      />
    </div>
  );
};

export default StaffProfilePage;

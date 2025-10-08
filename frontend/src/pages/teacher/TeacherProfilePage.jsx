import React, { useContext, useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import UnifiedProfileCard from '../../components/profiles/UnifiedProfileCard';
import ProfileEditModal from '../../components/profiles/ProfileEditModal';
import { pageStyles, fadeInUp, typeScale } from '../../style/CommonStyles';

const TeacherProfilePage = () => {
  const { user, userType, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);
  const teacherId = user?.teacher_id;
  useEffect(()=> {
    if (userType !== 'teacher' || !teacherId) return;
    if (hasFetchedRef.current) return; // prevent redundant refetch flicker
    hasFetchedRef.current = true;
    let active = true;
    (async () => {
      setLoading(true);
      try {
  const res = await api.get(`/teachers/${teacherId}`);
        if(!active) return;
        setUser(prev => {
          const merged = { ...prev, ...res.data };
          const changed = Object.keys(res.data).some(k => res.data[k] !== prev?.[k]);
          return changed ? merged : prev;
        });
      } catch { /* silent */ } finally { if(active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [userType, teacherId, setUser]);

  const submit = async (form) => {
    if(!user?.teacher_id) return false;
    setSaving(true); setError('');
    try {
      const payload = { firstname:form.firstname, lastname:form.lastname, email:form.email };
      if(form.password) payload.password = form.password;
  await api.put(`/teachers/${user.teacher_id}`, payload);
      setUser(prev => ({ ...prev, ...payload }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...payload }));
      return true;
    } catch(err){ setError(err.response?.data?.message || 'Update failed'); return false; }
    finally { setSaving(false); }
  };

  if(userType !== 'teacher') return <div style={{ padding:40, textAlign:'center', color:'#c62828' }}>Access denied.</div>;
  if(!user) return <div style={{ padding:40, textAlign:'center' }}>Loading profile...</div>;

  return (
    <div style={{ ...pageStyles.container, minHeight:'calc(100vh - 70px)', paddingTop:30 }}>
      <div style={{ ...pageStyles.content, ...fadeInUp }}>
        <UnifiedProfileCard role='teacher' user={user} editable onEdit={()=> setEditOpen(true)} />
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

export default TeacherProfilePage;

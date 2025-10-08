import React, { useContext, useState, useEffect } from 'react';
import api from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import UnifiedProfileCard from '../../components/profiles/UnifiedProfileCard';
import ProfileEditModal from '../../components/profiles/ProfileEditModal';
import { pageStyles, fadeInUp, typeScale } from '../../style/CommonStyles';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [fetching, setFetching] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep a local copy of editable fields
  const editableFields = ['firstname','lastname','email','phone','course','year_level','block'];

  useEffect(()=> {
    const load = async () => {
      if(!user?.student_id) return;
      setFetching(true);
      try {
  const res = await api.get(`/users/get/${user.student_id}`);
        setUser(res.data);
  } catch{ /* silent */ }
      finally { setFetching(false); }
    };
    load();
  }, [user?.student_id, setUser]);

  const submitUpdate = async (form) => {
    if(!user?.student_id) return false;
    setSaving(true); setError('');
    try {
      const payload = {};
      editableFields.forEach(f=> { if(form[f] !== undefined) payload[f]=form[f]; });
  const res = await api.put(`/users/${user.student_id}`, payload);
      if(res.data?.user){
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return true;
    } catch(err){
      setError(err.response?.data?.message || 'Update failed');
      return false;
    } finally { setSaving(false); }
  };

  if(!user) return <div style={{ padding:40, textAlign:'center' }}>Loading profile...</div>;

  return (
    <div style={{ ...pageStyles.container, minHeight:'calc(100vh - 70px)', paddingTop:30 }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{ ...pageStyles.content, ...fadeInUp }}>
        <UnifiedProfileCard
          role="student"
            user={user}
            editable
            onEdit={()=> setEditOpen(true)}
            extraFields={[]}
        />
        {fetching && (
          <div style={{ marginTop:18, textAlign:'center', fontSize:typeScale.base, color:'#0277bd', fontWeight:600 }}>Refreshing latest data...</div>
        )}
      </div>
      <ProfileEditModal
        open={editOpen}
        onClose={()=> setEditOpen(false)}
        initialValues={user}
        fields={[
          { name:'firstname', label:'First Name', required:true },
          { name:'lastname', label:'Last Name', required:true },
          { name:'email', label:'Email', type:'email', required:true },
          { name:'phone', label:'Phone' },
          { name:'course', label:'Course' },
          { name:'year_level', label:'Year Level' },
          { name:'block', label:'Block' },
        ]}
        onSubmit={submitUpdate}
        submitting={saving}
        error={error}
        successMessage="Profile Updated"
      />
    </div>
  );
};

export default ProfilePage;
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);

  // Update formData when user is loaded or changed
  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    setFormData({ ...user });
    setEditing(false);
    setMessage('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.student_id}`,
        formData
      );
      setUser(res.data.user);
      setMessage('Profile updated!');
      setEditing(false);
      // Also update localStorage so user stays updated after refresh
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('Update error:', err, err.response);
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2>My Profile</h2>
      {message && <p>{message}</p>}
      {!editing ? (
        <div>
          <div><strong>First Name:</strong> {user.firstname}</div>
          <div><strong>Last Name:</strong> {user.lastname}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>
          <div><strong>Course:</strong> {user.course}</div>
          <div><strong>Year Level:</strong> {user.year_level}</div>
          <div><strong>Block:</strong> {user.block}</div>
          <button style={{ marginTop: 16 }} onClick={handleEdit}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input name="firstname" value={formData.firstname || ''} onChange={handleChange} placeholder="First Name" required />
          <input name="lastname" value={formData.lastname || ''} onChange={handleChange} placeholder="Last Name" required />
          <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" required />
          <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" />

          {/* Read-only dropdowns */}
          <select name="course" value={formData.course || ''} disabled>
            <option value="">Select Course</option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSEd">BSEd</option>
            <option value="BSBA">BSBA</option>
          </select>
          <select name="year_level" value={formData.year_level || ''} disabled>
            <option value="">Select Year Level</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
          <select name="block" value={formData.block || ''} disabled>
            <option value="">Select Block</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <button type="submit">Save Changes</button>
          <button type="button" onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
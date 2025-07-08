import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import '../../style/ProfilePage.css';


const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user && user.student_id) {
        const res = await axios.get(`http://localhost:5000/api/users/${user.student_id}`);
        setUser(res.data); // This will update the context and the profile page
        setFormData({ ...res.data });
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setMessage('');
    setShowModal(false);
    setLoading(false);
    setShowSuccess(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.student_id}`,
        formData
      );
      setUser(res.data.user);
      setLoading(false);
      setShowSuccess(true);
      setMessage('Profile updated!');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setTimeout(() => {
        setShowModal(false);
        setShowSuccess(false);
        setMessage('');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (!user) return <div>Loading...</div>;

  // Clearance status badge

  return (
    <>
      <div className="profile-root">
        <div className="profile-main-row">
          {/* Profile Card */}
          <div className="profile-card">
            <img
              className="profile-avatar"
              src={user.avatar ? `http://localhost:5000/${user.avatar}` : 'https://ui-avatars.com/api/?name=' + user.firstname + '+' + user.lastname}
              alt="Avatar"
            />
            <div className="profile-name">{user.firstname} {user.lastname}</div>
            <div className="profile-role">Student</div>
            <div className="profile-course">{user.course} - {user.year_level} {user.block}</div>
           
          </div>

          {/* Info Section */}
          <div className="profile-info-section">
            <div className="profile-info-card">
              <table className="profile-table">
                <tbody>
                  <tr>
                    <th>Full Name</th>
                    <td>{user.firstname} {user.lastname}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>{user.phone}</td>
                  </tr>
                  <tr>
                    <th>Course</th>
                    <td>{user.course}</td>
                  </tr>
                  <tr>
                    <th>Year Level</th>
                    <td>{user.year_level}</td>
                  </tr>
                  <tr>
                    <th>Block</th>
                    <td>{user.block}</td>
                  </tr>
                </tbody>
              </table>
              <button className="profile-edit-btn" onClick={() => setShowModal(true)}>
                Edit
              </button>
              {message && !showModal && <p>{message}</p>}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="profile-modal-overlay">
            <div className="profile-modal">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{
                    display: 'inline-block',
                    width: 28,
                    height: 28,
                    border: '3px solid #b3e5fc',
                    borderTop: '3px solid #1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto',
                  }}></div>
                  <div style={{ marginTop: 16, color: '#1976d2', fontWeight: 500 }}>Updating...</div>
                </div>
              ) : showSuccess ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'fadeInScale 0.4s',
                }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="24" fill="#b2f5ea"/>
                    <path d="M15 25L22 32L34 18" stroke="#0277bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ color: '#0277bd', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 12 }}>
                    Update Successful!
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ marginBottom: 18, color: '#0277bd' }}>Edit Profile</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                      <label><strong>First Name:</strong></label>
                      <input
                        name="firstname"
                        value={formData.firstname || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #b3e5fc', marginTop: 4 }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label><strong>Last Name:</strong></label>
                      <input
                        name="lastname"
                        value={formData.lastname || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #b3e5fc', marginTop: 4 }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label><strong>Email:</strong></label>
                      <input
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #b3e5fc', marginTop: 4 }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label><strong>Phone:</strong></label>
                      <input
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #b3e5fc', marginTop: 4 }}
                      />
                    </div>
                    {message && <p style={{ color: '#d32f2f', marginBottom: 8 }}>{message}</p>}
                    <div className="profile-modal-btns">
                      <button type="submit" className="profile-save-btn">Save</button>
                      <button type="button" className="profile-cancel-btn" onClick={handleCancel} disabled={loading}>Cancel</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
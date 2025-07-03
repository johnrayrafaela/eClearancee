import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const bgStyle = {
  minHeight: '100vh',
  background: '#f4f7fa',
  fontFamily: 'Segoe UI, sans-serif',
  margin: 0,
  padding: '2rem 0',
};

const containerStyle = {
  padding: '0rem 2rem 2rem 2rem',
  display: 'flex',
  flexDirection: 'row',
  gap: '2rem',
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

const profileCardStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '2rem 2rem 1.5rem 2rem',
  minWidth: 320,
  maxWidth: 340,
  width: 340,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '4px solid #e3eaf1',
  marginBottom: 16,
  background: '#f7fafc',
};

const nameStyle = {
  fontWeight: 'bold',
  fontSize: '1.35rem',
  marginBottom: 4,
  color: '#222',
  textAlign: 'center',
};

const roleStyle = {
  color: '#888',
  fontSize: '1rem',
  marginBottom: 8,
  textAlign: 'center',
};

const locationStyle = {
  color: '#6b7280',
  fontSize: '0.98rem',
  marginBottom: 18,
  textAlign: 'center',
};

// const buttonRow = {
//   display: 'flex',
//   gap: 10,
//   marginBottom: 18,
// };

// const followBtn = {
//   background: '#1976d2',
//   color: '#fff',
//   border: 'none',
//   borderRadius: 4,
//   padding: '0.5rem 1.2rem',
//   fontWeight: 'bold',
//   fontSize: '1rem',
//   cursor: 'pointer',
// };

// const messageBtn = {
//   background: '#fff',
//   color: '#1976d2',
//   border: '1.5px solid #1976d2',
//   borderRadius: 4,
//   padding: '0.5rem 1.2rem',
//   fontWeight: 'bold',
//   fontSize: '1rem',
//   cursor: 'pointer',
// };



const rightColStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: 450,
};

const boxStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '2rem 2rem 1.5rem 2rem',
  border: '1px solid #e0e0e0',
  marginBottom: 18,
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '1.05rem',
  background: '#fff',
};

const thStyle = {
  textAlign: 'left',
  padding: '0.7rem 0.5rem 0.7rem 0',
  color: '#1976d2',
  fontWeight: 'bold',
  width: 160,
  borderBottom: '1px solid #e0e0e0',
  background: 'none',
};

const tdStyle = {
  padding: '0.7rem 0.5rem 0.7rem 0',
  color: '#333',
  borderBottom: '1px solid #e0e0e0',
  background: 'none',
};

const editBtn = {
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '0.5rem 2.2rem',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: 18,
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
  padding: '2rem 2.5rem',
  minWidth: 340,
  maxWidth: 400,
  width: '100%',
  position: 'relative',
  animation: 'fadeInScale 0.3s',
};

const spinnerStyle = {
  display: 'inline-block',
  width: 28,
  height: 28,
  border: '3px solid #b3e5fc',
  borderTop: '3px solid #1976d2',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

const successAnimStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  animation: 'fadeInScale 0.4s',
};

const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.95);}
  100% { opacity: 1; transform: scale(1);}
}
`;

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

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

  return (
    <>
      <style>{keyframes}</style>
      <div style={bgStyle}>
        <div style={containerStyle}>
          {/* Profile Card */}
          <div style={profileCardStyle}>
            <img
              src={`http://localhost:5000/${user.avatar}`}
              alt="Avatar"
              style={avatarStyle}
            />
            <div style={nameStyle}>{user.firstname} {user.lastname}</div>
            <div style={roleStyle}>Student</div>
            <div style={locationStyle}>{user.course} - {user.year_level} {user.block}</div>
            
          </div>

          {/* Info Section */}
          <div style={rightColStyle}>
            <div style={boxStyle}>
              <table style={infoTable}>
                <tbody>
                  <tr>
                    <th style={thStyle}>Full Name</th>
                    <td style={tdStyle}>{user.firstname} {user.lastname}</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>Email</th>
                    <td style={tdStyle}>{user.email}</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>Phone</th>
                    <td style={tdStyle}>{user.phone}</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>Course</th>
                    <td style={tdStyle}>{user.course}</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>Year Level</th>
                    <td style={tdStyle}>{user.year_level}</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>Block</th>
                    <td style={tdStyle}>{user.block}</td>
                  </tr>
                </tbody>
              </table>
              <button style={editBtn} onClick={() => setShowModal(true)}>
                Edit
              </button>
              {message && !showModal && <p>{message}</p>}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={modalOverlayStyle}>
            <div style={modalStyle}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={spinnerStyle}></div>
                  <div style={{ marginTop: 16, color: '#1976d2', fontWeight: 500 }}>Updating...</div>
                </div>
              ) : showSuccess ? (
                <div style={successAnimStyle}>
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
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <button
                        type="submit"
                        style={{
                          background: '#0277bd',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.6rem 1.5rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                          background: '#b0bec5',
                          color: '#263238',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.6rem 1.5rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          cursor: 'pointer',
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
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
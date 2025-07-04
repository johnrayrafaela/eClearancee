import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../style/LoginForm.css';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);
    const result = await login(formData, accountType);
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        if (accountType === 'user') {
          navigate('/student/dashboard');
        } else if (accountType === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (accountType === 'admin') {
          navigate('/admin/dashboard');
        } else if (accountType === 'staff') {
          navigate('/staff/dashboard');
        }
      }, 1200);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">
        {accountType === 'admin' ? (
          <>Administrator <span style={{ fontWeight: 400 }}>Access</span></>
        ) : accountType === 'staff' ? (
          <>Faculty <span style={{ fontWeight: 400 }}>Access</span></>
          ) : accountType === 'teacher' ? (
          <>Teacher <span style={{ fontWeight: 400 }}>Access</span></>
        ) : (
          <>Student <span style={{ fontWeight: 400 }}>Access</span></>
        )}
      </h2>
      {showSuccess && (
        <div className="success-anim">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#b2f5ea"/>
            <path d="M15 25L22 32L34 18" stroke="#0277bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ color: '#0277bd', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 12 }}>
            Login Successful!
          </div>
        </div>
      )}
      {error && <p className="login-error">{error}</p>}
      {!showSuccess && (
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            name="password"
            type="password"
            placeholder="Your Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />

          <div className="login-remember-row">
            <label className="login-remember-label">
              <input type="checkbox" className="login-remember-checkbox" />
              Remember me
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="login-select"
              style={{ width: 'auto', minWidth: 120, marginBottom: 0 }}
            >
              <option value="user">Student Access</option>
              <option value="teacher">Teacher Access</option>
              <option value="admin">Administrator Access</option>
              <option value="staff">Faculty Access</option>
            </select>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>
      )}
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#0288d1', fontWeight: 'bold', textDecoration: 'underline' }}>
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;

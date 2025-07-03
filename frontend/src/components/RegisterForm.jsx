// src/components/RegisterForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../style/RegisterForm.css';

const RegisterForm = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    course: '',
    year_level: '',
    block: '',
  });

  const [message, setMessage] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccountTypeChange = e => {
    setAccountType(e.target.value);
    setShowForm(true);
  };

  const handleGoBack = () => {
    setShowForm(false);
    setAccountType('');
    setMessage('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setShowSuccess(false);
    const result = await register(formData, accountType);
    setMessage(result.message);
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          password: '',
          course: '',
          year_level: '',
          block: '',
        });
        setAccountType('');
        setShowForm(false);
        setShowSuccess(false);
        navigate('/login'); // Redirect to login after success
      }, 1400);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      {showSuccess && (
        <div className="success-anim">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#b2f5ea"/>
            <path d="M15 25L22 32L34 18" stroke="#0277bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ color: '#0277bd', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 12 }}>
            Registration Successful!
          </div>
        </div>
      )}
      {message && !showSuccess && <p className="register-message">{message}</p>}
      {!showSuccess && (!showForm ? (
        <div>
          <label className="register-label">Register as:</label>
          <select
            value={accountType}
            onChange={handleAccountTypeChange}
            required
            className="register-select"
          >
            <option value="">Select Account Type</option>
            <option value="user">Student</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Go Back Arrow Button */}
          <button
            type="button"
            onClick={handleGoBack}
            className="register-back-btn"
            aria-label="Go back"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              color: '#0277bd',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="#0277bd" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ marginLeft: 6 }}>Back</span>
          </button>
          <input
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input"
          />
          {/* Only show phone input for students */}
          {accountType === 'user' && (
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="^09\d{9}$"
              maxLength={11}
              required
              className="register-input"
            />
          )}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="register-input"
          />

          {accountType === 'user' && (
            <>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="register-select"
              >
                <option value="">Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BEED">BEED</option>
                <option value="BSED">BSED</option>
                <option value="BSHM">BSHM</option>
                <option value="ENTREP">ENTREP</option>
              </select>

              <select
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                required
                className="register-select"
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <select
                name="block"
                value={formData.block}
                onChange={handleChange}
                required
                className="register-select"
              >
                <option value="">Select Block</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </>
          )}

          <button type="submit" className="register-button">Register</button>
        </form>
      ))}
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#0288d1', fontWeight: 'bold', textDecoration: 'underline' }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;

// src/components/RegisterForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../style/RegisterForm.css';
import { typeScale } from '../style/CommonStyles';
import logo from '../assets/image/logo/eClearance.png'; // Ensure this path is correct

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
    signature: '',
  });

  const [message, setMessage] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          signature: '',
        });
        setAccountType('');
        setShowForm(false);
        setShowSuccess(false);
        navigate('/login'); // Redirect to login after success
      }, 1400);
    }
  };

  return (
    <div className="register-container compact-register">
      <h2 className="register-title" style={{ fontSize: typeScale.xxl, marginBottom: '1rem', letterSpacing: '.3px' }}>
        <span className="register-title-bar">|</span>
        eClearance <span className="register-title-light">Registration</span>
      </h2>
      <div className="register-subtitle" style={{ fontSize: typeScale.base, marginBottom: '1.2rem' }}>Automated School Clearance System</div>
      {showSuccess && (
        <div className="success-anim">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#b2f5ea"/>
            <path d="M15 25L22 32L34 18" stroke="#0277bd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="success-text">
            Registration Successful!
          </div>
        </div>
      )}
      {message && !showSuccess && <p className="register-message">{message}</p>}
      {!showSuccess && (!showForm ? (
  <div className="register-options-row compact-options">
          <div
            className="register-option compact-option"
            onClick={() => { setAccountType('staff'); setShowForm(true); }}
          >
            <img
              src={logo}
              alt="Faculty"
              className="register-option-img"
            />
            <div className="register-option-label">
              STAFF / FACULTY<br />REGISTRATION
            </div>
          </div>
          <div
            className="register-option compact-option"
            onClick={() => { setAccountType('teacher'); setShowForm(true); }}
          >
            <img
              src={logo}
              alt="Teacher"
              className="register-option-img"
            />
            <div className="register-option-label">
              TEACHER<br />REGISTRATION
            </div>
          </div>
          <div
            className="register-option compact-option"
            onClick={() => { setAccountType('user'); setShowForm(true); }}
          >
            <img
              src={logo}
              alt="Student"
              className="register-option-img"
            />
            <div className="register-option-label">
              STUDENT<br />REGISTRATION
            </div>
          </div>
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
              fontSize: typeScale.xl
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
            className="register-input compact-input"
          />
          <input
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
            className="register-input compact-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input compact-input"
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
              className="register-input compact-input"
            />
          )}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="register-input compact-input"
          />

          {/* Signature Pad (all account types) */}
          <SignaturePad
            value={formData.signature}
            onChange={(dataUrl) => setFormData(prev => ({ ...prev, signature: dataUrl }))}
          />

          {/* Only show course/year/block for students */}
          {accountType === 'user' && (
            <>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="register-select compact-input"
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
                className="register-select compact-input"
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
                className="register-select compact-input"
              >
                <option value="">Select Block</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </>
          )}

          <button type="submit" className="register-button compact-btn" style={{ fontSize: typeScale.xl, padding: '0.55rem 0.75rem' }}>Register</button>
        </form>
      ))}
      <p className="register-login-link" style={{ fontSize: typeScale.base }}>
        Already have an account?{' '}
        <Link to="/login" className="register-login-link-a">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;

// Lightweight inline signature pad component (no external dependency)
const SignaturePad = ({ value, onChange }) => {
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = React.useState(false);
  const [empty, setEmpty] = React.useState(!value);

  React.useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img,0,0);
        setEmpty(false);
      };
      img.src = value;
    }
  }, [value]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0d47a1';
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setEmpty(false);
  };
  const end = () => {
    if (!drawing) return;
    setDrawing(false);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onChange(dataUrl);
  };
  const clear = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    onChange('');
    setEmpty(true);
  };

  return (
    <div style={{ margin:'12px 0 18px', padding:'12px 14px', background:'#f1f9ff', border:'1px solid #cfe8f7', borderRadius:14 }}>
      <div style={{ fontWeight:700, fontSize:'0.75rem', color:'#01579b', marginBottom:6, letterSpacing:'.5px' }}>Electronic Signature</div>
      <canvas
        ref={canvasRef}
        width={340}
        height={120}
        style={{ width:'100%', maxWidth:'340px', height:'120px', background:'#fff', border:'1px solid #90caf9', borderRadius:8, boxShadow:'inset 0 2px 4px rgba(0,0,0,0.06)', touchAction:'none', cursor:'crosshair' }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
        <button onClick={clear} type="button" style={{ background:'#e53935', color:'#fff', border:'none', padding:'6px 12px', borderRadius:8, fontSize:'0.65rem', fontWeight:700, cursor:'pointer' }}>Clear</button>
        <div style={{ fontSize:'0.55rem', color:'#546e7a', alignSelf:'center' }}>{ empty ? 'Draw your signature inside the box' : 'Signature captured' }</div>
      </div>
    </div>
  );
};

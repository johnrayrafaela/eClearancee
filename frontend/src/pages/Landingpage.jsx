import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import '../style/HomepageStyles.css';

const Landingpage = () => {
  const { user, userType } = useContext(AuthContext);
  const navigate = useNavigate();

  // Teacher-specific subtitle and info
  const teacherSubtitle = (
    <>
      Manage student clearances, approve requests, and communicate with students efficiently.<br />
      Log in to view pending approvals and your assigned clearance tasks.
    </>
  );
  const teacherInfo = (
    <ul>
      <li>📝 Approve or reject student clearance requests</li>
      <li>📬 Communicate directly with students</li>
      <li>📊 Track clearance progress for your department</li>
      <li>🔔 Receive real-time notifications for new requests</li>
    </ul>
  );

  // Student-specific subtitle and info
  const studentSubtitle = (
    <>
      An Automated School Clearance Processing System for a faster, paperless, and hassle-free clearance process.<br />
      Log in to monitor, manage, or request your clearance requirements.
    </>
  );
  const studentInfo = (
    <ul>
      <li>⚡ Fast and automated clearance request system</li>
      <li>📄 Digital tracking of pending and approved clearances</li>
      <li>✅ Hassle-free submission with minimal paperwork</li>
      <li>📊 Real-time updates from departments and offices</li>
    </ul>
  );

  return (
    <div className="homepage-container">
      <section className="homepage-hero">
        <h1 className="homepage-title">Welcome to eClearance</h1>
        <p className="homepage-subtitle">
          {userType === 'teacher' ? teacherSubtitle : studentSubtitle}
        </p>
        {!user && (
          <div className="homepage-cta">
            <span className="homepage-cta-text">Get started below:</span>
          </div>
        )}
      </section>
      <section className="homepage-content">
        {!user ? (
          <div className="homepage-auth-section">
            <div className="homepage-form-box">
              <h3 style={{ textAlign: 'center', color: '#0277bd', marginBottom: '1.5rem' }}>Already have an account?</h3>
              <button
                className="homepage-chat-btn"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
            <div className="homepage-form-box">
              <h3 style={{ textAlign: 'center', color: '#0277bd', marginBottom: '1.5rem' }}>New to eClearance?</h3>
              <button
                className="homepage-chat-btn"
                onClick={() => navigate('/register')}
              >
                Go to Register
              </button>
            </div>
          </div>
        ) : (
          <div className="homepage-welcome-box">
            <h2>
              Hello,
              {userType === 'teacher' && (
                <span className="homepage-teacher-label"> (Teacher) </span>
              )}
              {userType === 'admin' && (
                <span className="homepage-teacher-label"> (Admin) </span>
              )}
              {user.firstname}!
            </h2>
            <p>
              {userType === 'teacher'
                ? 'Manage your clearance tasks, approve student requests, and communicate with students directly.'
                : userType === 'admin'
                ? 'Manage users, view reports, and perform administrative tasks.'
                : 'Manage your clearance progress, view pending requirements, or communicate with departments directly.'}
            </p>
            <button
              className="homepage-chat-btn"
              onClick={() => {
                if (userType === 'admin') {
                  navigate('/admin/dashboard');
                } else if (userType === 'teacher') {
                  navigate('/teacher/dashboard');
                } else if (userType === 'staff') {
                  navigate('/staff/dashboard');
                } else {
                  navigate('/student/dashboard');
                }
              }}
            >
              {userType === 'admin'
                ? 'Go to Admin Dashboard'
                : userType === 'teacher'
                ? 'Go to Teacher Dashboard'
                : userType === 'staff'
                ? 'Go to Staff Dashboard'
                : 'Go to Student Dashboard'}
            </button>
          </div>
        )}
      </section>
      <section className="homepage-info-section">
        <h3>Why use eClearance?</h3>
        {userType === 'teacher' ? teacherInfo : studentInfo}
      </section>
    </div>
  );
};

export default Landingpage;

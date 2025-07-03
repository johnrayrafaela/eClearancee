import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
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
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Welcome to eClearance</h1>
        <p style={styles.subtitle}>
          {userType === 'teacher' ? teacherSubtitle : studentSubtitle}
        </p>
        {!user && (
          <div style={styles.cta}>
            <span style={styles.ctaText}>Get started below:</span>
          </div>
        )}
      </section>
      <section style={styles.content}>
        {!user ? (
          <div style={styles.authSection}>
            <div style={styles.formBox}>
              <LoginForm />
            </div>
            <div style={styles.formBox}>
              <RegisterForm />
            </div>
          </div>
        ) : (
          <div style={styles.welcomeBox}>
            <h2>
              Hello,
              {userType === 'teacher' && (
                <span style={styles.teacherLabel}> (Teacher) </span>
              )}
              {user.firstname}!
            </h2>
            <p>
              {userType === 'teacher'
                ? 'Manage your clearance tasks, approve student requests, and communicate with students directly.'
                : 'Manage your clearance progress, view pending requirements, or communicate with departments directly.'}
            </p>
            <button
              style={styles.chatBtn}
              onClick={() => navigate('/clearance')}
            >
              Go to Clearance Dashboard
            </button>
          </div>
        )}
      </section>
      <section style={styles.infoSection}>
        <h3>Why use eClearance?</h3>
        {userType === 'teacher' ? teacherInfo : studentInfo}
      </section>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Segoe UI, sans-serif',
    background: '#f7fafc',
    minHeight: '100vh',
    padding: '0 0 2rem 0',
  },
  hero: {
    background: 'linear-gradient(90deg, #b3e5fc 0%, #e1f5fe 100%)',
    padding: '3rem 1rem 2rem 1rem',
    textAlign: 'center',
    borderBottom: '2px solid #81d4fa',
  },
  title: {
    fontSize: '2.5rem',
    color: '#0277bd',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#0288d1',
    margin: '1rem 0 0.5rem 0',
  },
  cta: {
    marginTop: '1.5rem',
  },
  ctaText: {
    fontWeight: 'bold',
    color: '#01579b',
    fontSize: '1.1rem',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  authSection: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  formBox: {
    background: '#fff',
    padding: '2rem 1.5rem',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    minWidth: 300,
    maxWidth: 350,
  },
  welcomeBox: {
    background: '#fff',
    padding: '2rem 2.5rem',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    textAlign: 'center',
    maxWidth: 400,
  },
  infoSection: {
    margin: '3rem auto 0 auto',
    maxWidth: 600,
    background: '#e1f5fe',
    borderRadius: 8,
    padding: '2rem',
    textAlign: 'center',
    color: '#0277bd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  chatBtn: {
    marginTop: '1.5rem',
    background: '#0277bd',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    transition: 'background 0.2s',
  },
  teacherLabel: {
    fontSize: '1rem',
    color: '#0288d1',
    marginLeft: '0.5rem',
    fontWeight: 'bold',
  },
};

export default HomePage;

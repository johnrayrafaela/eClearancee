import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { 
  fadeInUp, 
  slideInLeft, 
  slideInRight, 
  keyframes, 
  gradients, 
  pageStyles, 
  cardStyles, 
  headerStyles, 
  buttonStyles,
  injectKeyframes
} from '../../style/CommonStyles';

const TeacherDashboard = () => {
  const { user, userType } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  // Inject keyframes on component mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/student-subject-status/analytics/teacher', {
      params: { teacher_id: user.teacher_id }
    })
      .then(res => setAnalytics(res.data))
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, [user, userType]);

  const cardShadow = {
    ...cardStyles.info,
    minWidth: 220,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    ...fadeInUp
  };

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      
      <div style={pageStyles.content}>
        {/* Hero Header */}
        <div style={{ 
          ...pageStyles.hero,
          ...fadeInUp
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 15 }}>👨‍🏫</div>
          <h1 style={{ 
            ...headerStyles.pageTitle,
            color: '#fff',
            fontSize: '2.2rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Teacher Dashboard
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            margin: '10px 0 0 0'
          }}>
            Welcome back, {user?.name || 'Teacher'}! Manage your subjects and track student progress
          </p>
        </div>

        {/* Analytics Cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 25,
          marginBottom: 25
        }}>
          {/* Student Statistics */}
          <div style={{ ...cardShadow, ...slideInLeft }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 15
            }}>
              <h3 style={{ 
                ...headerStyles.sectionTitle,
                margin: 0,
                fontSize: '1.2rem'
              }}>
                📊 Student Analytics
              </h3>
              <div style={{ fontSize: '2rem' }}>📈</div>
            </div>
            
            {loading ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 10 
              }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    background: '#f0f0f0',
                    borderRadius: 8,
                    height: 30,
                    animation: 'shimmer 1.5s infinite'
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 15,
                marginBottom: 15
              }}>
                {['1st', '2nd'].map(sem => (
                  <div key={sem} style={{
                    background: gradients.light,
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #e1f5fe'
                  }}>
                    <h4 style={{ 
                      color: '#0277bd', 
                      margin: '0 0 8px 0',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {sem} Semester
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: '#546e7a' }}>
                      <div>✅ Approved: {analytics[sem]?.Approved || 0}</div>
                      <div>⏳ Requested: {analytics[sem]?.Requested || 0}</div>
                      <div>❌ Rejected: {analytics[sem]?.Rejected || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ ...cardShadow, ...slideInRight }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 15
            }}>
              <h3 style={{ 
                ...headerStyles.sectionTitle,
                margin: 0,
                fontSize: '1.2rem'
              }}>
                🚀 Quick Actions
              </h3>
              <div style={{ fontSize: '2rem' }}>⚡</div>
            </div>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 15
            }}>
              <a 
                href="/teacher/subject-requests" 
                style={{ textDecoration: 'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.primary,
                  padding: '15px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 12,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(2, 119, 189, 0.2)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>📋</span>
                  View Subject Requests
                </div>
              </a>
              
              <a 
                href="/teacher/add-subject" 
                style={{ textDecoration: 'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.success,
                  padding: '15px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 12,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>➕</span>
                  Manage Subjects
                </div>
              </a>
              
              <a 
                href="/teacher/analytics" 
                style={{ textDecoration: 'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.info,
                  padding: '15px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 12,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>📊</span>
                  View Analytics
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Subject Management Hub */}
        <div style={{ 
          ...cardStyles.default,
          ...fadeInUp,
          animationDelay: '0.3s'
        }}>
          <div style={{ 
            background: gradients.primary,
            padding: 25,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 15
          }}>
            <div style={{ fontSize: '2.5rem' }}>📚</div>
            <div>
              <h3 style={{ 
                margin: 0,
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '0.5px'
              }}>
                Subject Management Hub
              </h3>
              <p style={{ 
                margin: '5px 0 0 0',
                opacity: 0.9,
                fontSize: '0.9rem'
              }}>
                Manage student subject requests and approvals efficiently
              </p>
            </div>
          </div>
          
          <div style={{ padding: 30 }}>
            <p style={{ 
              color: '#546e7a',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: 20,
              textAlign: 'center'
            }}>
              Review and process student subject clearance requests. Track approval status 
              and manage your teaching subjects effectively.
            </p>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: 15,
              flexWrap: 'wrap'
            }}>
              <a 
                href="/teacher/subject-requests" 
                style={{ textDecoration: 'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.primary,
                  fontSize: '1rem',
                  padding: '15px 30px'
                }}>
                  📋 Process Requests
                </div>
              </a>
              
              <a 
                href="/teacher/analytics" 
                style={{ textDecoration: 'none' }}
                className="btn-hover"
              >
                <div style={{
                  ...buttonStyles.secondary,
                  fontSize: '1rem',
                  padding: '15px 30px'
                }}>
                  📊 View Reports
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TeacherDashboard;
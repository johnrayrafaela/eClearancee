import React, { useContext, useEffect, useState } from 'react';
import api, { buildFileUrl } from '../../api/client';
import { AuthContext } from '../../Context/AuthContext';
import { 
  fadeInUp, 
  slideInLeft, 
  slideInRight, 
  bounceIn,
  keyframes, 
  gradients, 
  pageStyles, 
  cardStyles, 
  headerStyles, 
  buttonStyles,
  formStyles,
  injectKeyframes
} from '../../style/CommonStyles';

const semesters = ['1st', '2nd'];
const courses = ['BSIT', 'BEED', 'BSED', 'BSHM', 'ENTREP'];
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const blocks = ['A', 'B', 'C', 'D'];

const TeacherSubjectRequests = () => {
  const { user, userType } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');

  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');

  // Inject keyframes on component mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Fetch requests for this teacher, filtered by semester if selected
  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    const params = { teacher_id: user.teacher_id };
    if (selectedSemester) {
      params.semester = selectedSemester.startsWith('1st') ? '1st' : '2nd';
    }
  api.get('/student-subject-status/teacher', { params })
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType, selectedSemester]);

  const handleRespond = async (id, status) => {
  await api.patch(`/student-subject-status/${id}/respond`, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Filter requests by course, year, block, and search
  const filteredRequests = requests.filter(req => {
    const matchCourse = selectedCourse ? req.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? req.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? req.student?.block === selectedBlock : true;
    const matchSearch = search.trim() ? (
      (req.student?.firstname + ' ' + req.student?.lastname).toLowerCase().includes(search.trim().toLowerCase())
    ) : true;
    return matchCourse && matchYear && matchBlock && matchSearch;
  });

  // Separate requests by status
  const pending = filteredRequests.filter(r => r.status === 'Requested');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');

  let currentData = [];
  if (tab === 'Pending') currentData = pending;
  else if (tab === 'Approved') currentData = approved;
  else if (tab === 'Rejected') currentData = rejected;

  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginTop: 20,
    },
    th: {
      background: gradients.primary,
      color: '#fff',
      padding: '15px 12px',
      fontWeight: 700,
      fontSize: '0.9rem',
      textAlign: 'left',
      borderBottom: '2px solid #0277bd'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e0e7ff',
      color: '#374151',
      fontSize: '0.9rem',
      lineHeight: 1.4
    },
    evenRow: {
      background: '#f8fafc'
    }
  };

  const renderTable = (data) => (
    <div style={{ ...cardStyles.default, padding: 0, ...fadeInUp }}>
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.th}>Student Name</th>
            <th style={tableStyles.th}>Subject</th>
            <th style={tableStyles.th}>Semester</th>
            <th style={tableStyles.th}>Status</th>
            <th style={tableStyles.th}>Requirements</th>
            <th style={tableStyles.th}>File</th>
            <th style={tableStyles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((req, index) => (
            <tr key={req.id} style={index % 2 === 0 ? tableStyles.evenRow : {}}>
              <td style={tableStyles.td}>
                <div style={{ fontWeight: 600, color: '#0277bd' }}>
                  {req.student?.firstname} {req.student?.lastname}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {req.student?.course} - {req.student?.year_level} - Block {req.student?.block}
                </div>
              </td>
              <td style={tableStyles.td}>
                <div style={{ fontWeight: 600 }}>{req.subject?.name}</div>
              </td>
              <td style={tableStyles.td}>
                <span style={{
                  background: '#e1f5fe',
                  color: '#0277bd',
                  padding: '4px 8px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {req.subject?.semester || req.semester}
                </span>
              </td>
              <td style={tableStyles.td}>
                <span style={{
                  background: req.status === 'Approved' ? '#e8f5e8' : req.status === 'Rejected' ? '#ffeaea' : '#fff3cd',
                  color: req.status === 'Approved' ? '#2e7d32' : req.status === 'Rejected' ? '#d32f2f' : '#ed6c02',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {req.status}
                </span>
              </td>
              <td style={tableStyles.td}>
                {(() => {
                  if (req.requirements) {
                    try {
                      const parsedReq = JSON.parse(req.requirements);
                      if (parsedReq.type === 'Checklist') {
                        return (
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                            {parsedReq.checklist?.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: 4, color: '#6b7280' }}>
                                ✓ {item}
                              </li>
                            ))}
                          </ul>
                        );
                      } else if (parsedReq.type === 'Link') {
                        return (
                          <a 
                            href={parsedReq.value} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#0277bd', textDecoration: 'underline' }}
                          >
                            🔗 View Link
                          </a>
                        );
                      } else {
                        return parsedReq.value;
                      }
                    } catch (error) {
                        console.error('Error parsing requirements:', error);
                      return req.requirements;
                    }
                  }
                  return <span style={{ color: '#9ca3af' }}>-</span>;
                })()}
              </td>
              <td style={tableStyles.td}>
                {(() => {
                  let files = [];
                  if (Array.isArray(req.file_paths)) {
                    files = req.file_paths.filter(f => f && f.trim() !== '');
                  } else if (typeof req.file_paths === 'string' && req.file_paths.trim() !== '') {
                    files = req.file_paths.split(',').map(f => f.trim()).filter(f => f !== '');
                  }
                  if (files.length > 0) {
                    return files.map((file, idx) => (
                      <div key={idx} style={{ marginBottom: 4 }}>
                        <a
                          href={buildFileUrl(`api/student-subject-status/file/${req.id}?file=${encodeURIComponent(file)}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#0277bd', 
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          📄 File {idx + 1}
                        </a>
                      </div>
                    ));
                  }
                  return <span style={{ color: '#9ca3af' }}>-</span>;
                })()}
              </td>
              <td style={tableStyles.td}>
                {req.status === 'Requested' ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      style={{
                        ...buttonStyles.success,
                        padding: '8px 16px',
                        fontSize: '0.8rem'
                      }}
                      onClick={() => handleRespond(req.id, 'Approved')}
                      className="btn-hover"
                    >
                      ✅ Approve
                    </button>
                    <button
                      style={{
                        ...buttonStyles.danger,
                        padding: '8px 16px',
                        fontSize: '0.8rem'
                      }}
                      onClick={() => handleRespond(req.id, 'Rejected')}
                      className="btn-hover"
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ 
                    color: req.status === 'Approved' ? '#2e7d32' : '#d32f2f', 
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {req.status === 'Approved' ? '✅ ' : '❌ '}{req.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!user || userType !== 'teacher') {
    return (
      <div style={pageStyles.container}>
        <div style={{
          ...cardStyles.danger,
          textAlign: 'center',
          padding: 40,
          ...bounceIn
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🚫</div>
          <h2 style={{ margin: 0, color: '#fff' }}>Access Denied</h2>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
            Only teachers can view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <style>{keyframes}</style>
      
      <div style={pageStyles.content}>
        {/* Hero Header */}
        <div style={{ 
          ...pageStyles.hero,
          ...fadeInUp
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 15 }}>📥</div>
          <h1 style={{ 
            ...headerStyles.pageTitle,
            color: '#fff',
            fontSize: '2.2rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Subject Approval Requests
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            margin: '10px 0 0 0'
          }}>
            Review and manage student clearance requests efficiently
          </p>
        </div>

        {/* Filters Card */}
        <div style={{ 
          ...cardStyles.default,
          ...slideInLeft,
          marginBottom: 25
        }}>
          <div style={{ 
            background: gradients.info,
            padding: 20,
            color: '#fff',
            marginBottom: 25,
            display: 'flex',
            alignItems: 'center',
            gap: 15
          }}>
            <div style={{ fontSize: '2rem' }}>🔍</div>
            <div>
              <h3 style={{ 
                margin: 0,
                fontWeight: 700,
                fontSize: '1.3rem'
              }}>
                Filter & Search Requests
              </h3>
              <p style={{ 
                margin: '5px 0 0 0',
                opacity: 0.9,
                fontSize: '0.9rem'
              }}>
                Filter by semester, course, year level, or search by student name
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 20
          }}>
            <div>
              <label style={formStyles.label}>Semester:</label>
              <select
                style={formStyles.select}
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
              >
                <option value="">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={formStyles.label}>Course:</label>
              <select
                style={formStyles.select}
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={formStyles.label}>Year Level:</label>
              <select
                style={formStyles.select}
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {yearLevels.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={formStyles.label}>Block:</label>
              <select
                style={formStyles.select}
                value={selectedBlock}
                onChange={e => setSelectedBlock(e.target.value)}
              >
                <option value="">All Blocks</option>
                {blocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={formStyles.label}>Search Student:</label>
            <input
              type="text"
              style={formStyles.input}
              placeholder="Enter student name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ 
          ...cardStyles.default,
          padding: 25,
          marginBottom: 25,
          ...slideInRight
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 15,
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'Pending', label: 'Pending', icon: '⏳', count: pending.length },
              { key: 'Approved', label: 'Approved', icon: '✅', count: approved.length },
              { key: 'Rejected', label: 'Rejected', icon: '❌', count: rejected.length }
            ].map(({ key, label, icon, count }) => (
              <button 
                key={key}
                style={{
                  ...buttonStyles.primary,
                  ...(tab === key ? {} : buttonStyles.secondary),
                  padding: '12px 25px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  position: 'relative'
                }}
                onClick={() => setTab(key)}
                className="btn-hover"
              >
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                {label}
                <span style={{
                  background: tab === key ? '#fff' : '#0277bd',
                  color: tab === key ? '#0277bd' : '#fff',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginLeft: 5
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{
            ...cardStyles.default,
            textAlign: 'center',
            padding: 40,
            ...fadeInUp
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>⏳</div>
            <h3 style={{ color: '#0277bd', margin: 0 }}>Loading requests...</h3>
          </div>
        ) : (
          <>
            <div style={{ 
              ...cardStyles.info,
              padding: 20,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...fadeInUp
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {tab === 'Pending' ? '⏳' : tab === 'Approved' ? '✅' : '❌'}
                </span>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>
                  {tab} Requests ({currentData.length})
                </h3>
              </div>
              <div style={{ color: '#fff', opacity: 0.9, fontSize: '0.9rem' }}>
                Total: {filteredRequests.length} requests
              </div>
            </div>

            {currentData.length > 0 ? (
              renderTable(currentData)
            ) : (
              <div style={{
                ...cardStyles.default,
                textAlign: 'center',
                padding: 40,
                ...fadeInUp
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>📭</div>
                <h3 style={{ color: '#6b7280', margin: 0 }}>
                  No {tab.toLowerCase()} requests found
                </h3>
                <p style={{ color: '#9ca3af', margin: '10px 0 0 0' }}>
                  {tab === 'Pending' 
                    ? 'All caught up! No pending requests at the moment.'
                    : `No ${tab.toLowerCase()} requests match your current filters.`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherSubjectRequests;
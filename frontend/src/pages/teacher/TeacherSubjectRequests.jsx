import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
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
  const [teacherSubjects, setTeacherSubjects] = useState([]); // claimed subjects for dropdown
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]); // for bulk actions
  const [bulkLoading, setBulkLoading] = useState(false);

  // Inject keyframes on component mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Fetch requests for this teacher (fetch all; filter client-side)
  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    setLoading(true);
    const params = { teacher_id: user.teacher_id };
    axios.get('http://localhost:5000/api/student-subject-status/teacher', { params })
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user, userType]);

  // Fetch teacher claimed subjects for subject filter
  useEffect(() => {
    if (!user || userType !== 'teacher') return;
    axios.get(`http://localhost:5000/api/subject/teacher/${user.teacher_id}`)
      .then(res => setTeacherSubjects(res.data || []))
      .catch(() => setTeacherSubjects([]));
  }, [user, userType]);

  const handleRespond = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/student-subject-status/${id}/respond`, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    // remove from selection if any
    setSelectedRequestIds(prev => prev.filter(rid => rid !== id));
  };

  const handleToggleSelect = (id) => {
    setSelectedRequestIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const handleSelectAllVisible = (visibleIds) => {
    const allSelected = visibleIds.every(id => selectedRequestIds.includes(id));
    if (allSelected) {
      setSelectedRequestIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedRequestIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkRespond = async (ids, status) => {
    if (!ids.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => axios.patch(`http://localhost:5000/api/student-subject-status/${id}/respond`, { status })));
      setRequests(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
      setSelectedRequestIds(prev => prev.filter(id => !ids.includes(id)));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleApproveSelected = () => handleBulkRespond(selectedRequestIds, 'Approved');
  const handleRejectSelected = () => handleBulkRespond(selectedRequestIds, 'Rejected');
  const handleApproveAllPending = () => {
    const pendingIds = pending.map(p => p.id);
    handleBulkRespond(pendingIds, 'Approved');
  };

  // Apply all filters (subject, semester, course, year level, block, search)
  const filteredRequests = requests.filter(req => {
    const matchSubject = selectedSubjectId ? (req.subject?.subject_id === parseInt(selectedSubjectId)) : true;
    const matchSemester = selectedSemester ? (req.subject?.semester === selectedSemester) : true;
    const matchCourse = selectedCourse ? req.student?.course === selectedCourse : true;
    const matchYear = selectedYear ? req.student?.year_level === selectedYear : true;
    const matchBlock = selectedBlock ? req.student?.block === selectedBlock : true;
    const matchSearch = search.trim() ? (
      (req.student?.firstname + ' ' + req.student?.lastname)
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    ) : true;
    return matchSubject && matchSemester && matchCourse && matchYear && matchBlock && matchSearch;
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

  const renderTable = (data) => {
    const visibleSelectableIds = data.filter(r => r.status === 'Requested').map(r => r.id);
    const allVisibleSelected = visibleSelectableIds.length > 0 && visibleSelectableIds.every(id => selectedRequestIds.includes(id));
    return (
      <div style={{ ...cardStyles.default, padding: 0, ...fadeInUp }}>
        {/* Bulk action bar (only show in Pending tab) */}
        {tab === 'Pending' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid #e0e7ff',
            background: '#f1f5f9'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#0277bd' }}>Bulk Actions:</strong>
            <button
              disabled={!selectedRequestIds.length || bulkLoading}
              onClick={handleApproveSelected}
              style={{
                ...buttonStyles.success,
                opacity: !selectedRequestIds.length || bulkLoading ? 0.6 : 1,
                padding: '6px 12px',
                fontSize: '0.7rem'
              }}
            >
              ✅ Approve Selected ({selectedRequestIds.length})
            </button>
            <button
              disabled={!selectedRequestIds.length || bulkLoading}
              onClick={handleRejectSelected}
              style={{
                ...buttonStyles.danger,
                opacity: !selectedRequestIds.length || bulkLoading ? 0.6 : 1,
                padding: '6px 12px',
                fontSize: '0.7rem'
              }}
            >
              ❌ Reject Selected
            </button>
            <button
              disabled={!visibleSelectableIds.length || bulkLoading}
              onClick={handleApproveAllPending}
              style={{
                ...buttonStyles.primary,
                opacity: !visibleSelectableIds.length || bulkLoading ? 0.6 : 1,
                padding: '6px 12px',
                fontSize: '0.7rem'
              }}
            >
              🚀 Approve All ({pending.length})
            </button>
            {bulkLoading && <span style={{ fontSize: '0.7rem', color: '#374151' }}>Processing...</span>}
          </div>
        )}
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {tab === 'Pending' && (
                <th style={tableStyles.th}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => handleSelectAllVisible(visibleSelectableIds)}
                    title={allVisibleSelected ? 'Deselect all' : 'Select all visible'}
                  />
                </th>
              )}
              <th style={tableStyles.th}>Student Name</th>
              <th style={tableStyles.th}>Subject</th>
              <th style={tableStyles.th}>Semester</th>
              <th style={tableStyles.th}>Status</th>
              <th style={tableStyles.th}>Requirements</th>
              <th style={tableStyles.th}>File</th>
              <th style={tableStyles.th}>Link</th>
              <th style={tableStyles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req, index) => {
              const isSelected = selectedRequestIds.includes(req.id);
              return (
                <tr key={req.id} style={index % 2 === 0 ? tableStyles.evenRow : {}}>
                  {tab === 'Pending' && (
                    <td style={{ ...tableStyles.td, width: 40 }}>
                      {req.status === 'Requested' ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(req.id)}
                        />
                      ) : null}
                    </td>
                  )}
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
                          }
                          return parsedReq.instructions || parsedReq.value || <span style={{ color: '#9ca3af' }}>-</span>;
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
                              href={`http://localhost:5000/api/student-subject-status/file/${req.id}?file=${encodeURIComponent(file)}`}
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
                    {req.link ? (
                      <a
                        href={req.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0277bd', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        🔗 View Link
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Styles for new compact filter selects
  const labelStyle = {
    display: 'block',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#0277bd',
    marginBottom: 4,
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  };

  const selectStyle = {
    width: '100%',
    background: '#ffffff',
    border: '2px solid #e0e7ff',
    borderRadius: 12,
    padding: '9px 10px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#374151',
    outline: 'none',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  };

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
      <style>
        {keyframes}
        {`
          .search-input::placeholder {
            color: rgba(255,255,255,0.7) !important;
          }
          .search-input:focus {
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
            transform: scale(1.02);
          }
          .filter-btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          .filter-btn:active {
            transform: translateY(0);
          }
        `}
      </style>
      
      <div style={pageStyles.content}>
        {/* Hero Header */}
        <div style={{ 
          ...pageStyles.hero,
          ...fadeInUp,
          padding: '40px 0',
          minHeight: '200px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>📥</div>
          <h1 style={{ 
            ...headerStyles.pageTitle,
            color: '#fff',
            fontSize: '1.8rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            margin: '0 0 8px 0'
          }}>
            Subject Approval Requests
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            opacity: 0.9,
            margin: '0'
          }}>
            Review and manage student clearance requests efficiently
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ 
          ...cardStyles.default,
          ...slideInLeft,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: 20
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15
          }}>
            <div style={{ fontSize: '1.5rem' }}>🔍</div>
            <div>
              <h3 style={{ 
                margin: 0,
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                Smart Search & Filters
              </h3>
              <p style={{ 
                margin: '3px 0 0 0',
                opacity: 0.9,
                fontSize: '0.85rem'
              }}>
                Find exactly what you're looking for
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.15)',
            padding: 15,
            borderRadius: 15,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '1.2rem' }}>👤</div>
            <input
              type="text"
              className="search-input"
              style={{
                flex: 1,
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 20,
                fontSize: '0.9rem',
                outline: 'none',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease'
              }}
              placeholder="Search by student name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 10px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Subject & Attribute Filters (Replaces pill filters) */}
        <div style={{ ...cardStyles.default, ...slideInRight, marginBottom: 20, padding: 20 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0277bd', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            🎯 Filter Requests
          </h4>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select
                style={selectStyle}
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
              >
                <option value="">All Subjects</option>
                {teacherSubjects.map(sub => (
                  <option key={sub.subject_id} value={sub.subject_id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Semester</label>
              <select style={selectStyle} value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                <option value="">All</option>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Course</label>
              <select style={selectStyle} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">All</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year Level</label>
              <select style={selectStyle} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="">All</option>
                {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Block</label>
              <select style={selectStyle} value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)}>
                <option value="">All</option>
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Search Student</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Name..."
                style={{ ...selectStyle, padding: '10px 12px' }}
              />
            </div>
          </div>
          {(selectedSemester || selectedCourse || selectedYear || selectedBlock || selectedSubjectId || search) && (
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                style={{ ...buttonStyles.danger, fontSize: '0.7rem', padding: '6px 12px', borderRadius: 16 }}
                onClick={() => {
                  setSelectedSemester('');
                  setSelectedCourse('');
                  setSelectedYear('');
                  setSelectedBlock('');
                  setSelectedSubjectId('');
                  setSearch('');
                }}
              >
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div style={{ 
          ...cardStyles.default,
          padding: 20,
          marginBottom: 20,
          ...slideInRight
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 12,
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
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  position: 'relative'
                }}
                onClick={() => setTab(key)}
                className="btn-hover"
              >
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                {label}
                <span style={{
                  background: tab === key ? '#fff' : '#0277bd',
                  color: tab === key ? '#0277bd' : '#fff',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginLeft: 4
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
            padding: 30,
            ...fadeInUp
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 15 }}>⏳</div>
            <h3 style={{ color: '#0277bd', margin: 0, fontSize: '1.1rem' }}>Loading requests...</h3>
          </div>
        ) : (
          <>
            <div style={{ 
              ...cardStyles.info,
              padding: 15,
              marginBottom: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...fadeInUp
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {tab === 'Pending' ? '⏳' : tab === 'Approved' ? '✅' : '❌'}
                </span>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                  {tab} Requests ({currentData.length})
                </h3>
              </div>
              <div style={{ color: '#fff', opacity: 0.9, fontSize: '0.85rem' }}>
                Total: {filteredRequests.length} requests
              </div>
            </div>

            {currentData.length > 0 ? (
              renderTable(currentData)
            ) : (
              <div style={{
                ...cardStyles.default,
                textAlign: 'center',
                padding: 30,
                ...fadeInUp
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 15 }}>📭</div>
                <h3 style={{ color: '#6b7280', margin: 0, fontSize: '1.1rem' }}>
                  No {tab.toLowerCase()} requests found
                </h3>
                <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
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
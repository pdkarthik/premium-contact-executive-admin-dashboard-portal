import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, LogOut, Trash2, Check, RefreshCw, Search, Filter, BookOpen, Users, Compass, ChevronRight, FileText, CheckCircle, Sun, Moon } from 'lucide-react';

const AdminPortal = ({ onToggleLanding, apiBaseUrl, theme, onToggleTheme }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Load token on startup
  useEffect(() => {
    const token = localStorage.getItem('she_can_admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchSubmissions(token);
    }
  }, []);

  // Fetch Submissions Helper
  const fetchSubmissions = async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('she_can_admin_token');
    if (!token) return;

    setIsLoading(true);
    setFetchError('');
    try {
      const response = await fetch(`${apiBaseUrl}/admin/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmissions(data.data);
      } else {
        setFetchError(data.error || 'Failed to fetch data');
        if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
      }
    } catch (err) {
      setFetchError('Error connecting to backend database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginCreds.username || !loginCreds.password) {
      setLoginError('Please fill out all credentials.');
      return;
    }

    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginCreds)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('she_can_admin_token', data.token);
        setIsAuthenticated(true);
        setLoginCreds({ username: '', password: '' });
        fetchSubmissions(data.token);
      } else {
        setLoginError(data.error || 'Authentication credentials rejected.');
      }
    } catch (err) {
      setLoginError('Could not communicate with backend server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('she_can_admin_token');
    setIsAuthenticated(false);
    setSubmissions([]);
    setSelectedSubmission(null);
    onToggleLanding();
  };

  // CRUD: Update Submission Status
  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem('she_can_admin_token');
    try {
      const response = await fetch(`${apiBaseUrl}/admin/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Update local state
        setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s));
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(data.error || 'Failed to update application status.');
      }
    } catch (err) {
      alert('Network error updating status.');
    }
  };

  // CRUD: Delete Submission
  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this applicant sheet permanently? This cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('she_can_admin_token');
    try {
      const response = await fetch(`${apiBaseUrl}/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmissions(prev => prev.filter(s => s._id !== id));
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission(null);
        }
      } else {
        alert(data.error || 'Failed to delete record.');
      }
    } catch (err) {
      alert('Network error deleting record.');
    }
  };

  // Metrics Calculations
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const reviewedCount = submissions.filter(s => s.status === 'Reviewed' || s.status === 'Accepted').length;

  const roleStats = {
    Scholar: submissions.filter(s => s.role === 'Scholar').length,
    Mentor: submissions.filter(s => s.role === 'Mentor').length,
    Sponsor: submissions.filter(s => s.role === 'Sponsor').length
  };

  // Chart Max Helper
  const maxRoleCount = Math.max(roleStats.Scholar, roleStats.Mentor, roleStats.Sponsor, 1);

  // Filters logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === 'All' || sub.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      
      {/* Dynamic Header */}
      <header className="admin-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <span className="admin-header-title">
            SHE CAN <span className="admin-header-title-highlight">ADMIN CONTROL</span>
          </span>
        </div>

        <div className="admin-header-actions">
          <button onClick={onToggleLanding} className="btn btn-outline admin-header-btn">
            <span className="hide-on-mobile">Go to </span>Home<span className="hide-on-mobile"> Page</span>
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-primary admin-header-btn btn-logout">
              <LogOut size={16} /> <span className="hide-on-mobile">Log Out</span>
            </button>
          )}
          <button 
            onClick={onToggleTheme} 
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-icon">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>
        </div>
      </header>

      {/* Primary Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        {!isAuthenticated ? (
          
          /* Admin Login Screen */
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, var(--secondary), var(--primary))'
              }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(105, 92, 254, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '12px'
                }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Secure Admin Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Please authenticate using admin key credentials.</p>
              </div>

              {loginError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: 'var(--error)',
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={loginCreds.username}
                    onChange={(e) => setLoginCreds(prev => ({ ...prev, username: e.target.value }))}
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Username (default: admin)"
                    disabled={isLoggingIn}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={loginCreds.password}
                    onChange={(e) => setLoginCreds(prev => ({ ...prev, password: e.target.value }))}
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Password (default: admin123)"
                    disabled={isLoggingIn}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {isLoggingIn ? (
                    <>
                      <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }}></span>
                      Verifying...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : isLoading && submissions.length === 0 ? (
          
          /* Centralized Dashboard Loader */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px',
            width: '100%',
            gap: '20px'
          }}>
            <div className="animate-spin" style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%'
            }}></div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Syncing secure executive dashboard data...
            </p>
          </div>
        ) : (
          
          /* Admin Main Dashboard */
          <div>
            
            {/* KPI Cards */}
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <div className="stat-info">
                  <h4>Total Applicants</h4>
                  <p>{totalCount}</p>
                </div>
                <div className="stat-icon icon-purple">
                  <FileText size={22} />
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-info">
                  <h4>Pending Review</h4>
                  <p>{pendingCount}</p>
                </div>
                <div className="stat-icon icon-rose">
                  <RefreshCw size={22} />
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-info">
                  <h4>Reviewed Cases</h4>
                  <p>{reviewedCount}</p>
                </div>
                <div className="stat-icon icon-amber">
                  <CheckCircle size={22} />
                </div>
              </div>
            </div>

            {/* Custom CSS Chart & Role Breakdown */}
            <div className="kpi-breakdown">
              {/* CSS Column Chart */}
              <div className="glass-panel chart-container">
                <div className="chart-header">
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Applicant Role Distribution</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time statistics</span>
                </div>

                <div className="chart-bar-area">
                  <div className="chart-column">
                    <div className="chart-bar" style={{ height: `${(roleStats.Scholar / maxRoleCount) * 100}%` }}>
                      <span className="chart-bar-value">{roleStats.Scholar}</span>
                    </div>
                    <span className="chart-label">Scholars</span>
                  </div>

                  <div className="chart-column">
                    <div className="chart-bar mentor" style={{ height: `${(roleStats.Mentor / maxRoleCount) * 100}%` }}>
                      <span className="chart-bar-value">{roleStats.Mentor}</span>
                    </div>
                    <span className="chart-label">Mentors</span>
                  </div>

                  <div className="chart-column">
                    <div className="chart-bar sponsor" style={{ height: `${(roleStats.Sponsor / maxRoleCount) * 100}%` }}>
                      <span className="chart-bar-value">{roleStats.Sponsor}</span>
                    </div>
                    <span className="chart-label">Sponsors</span>
                  </div>
                </div>
              </div>

              {/* Data Status Legend Card */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Database Health Diagnostics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Server Status</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span> Online
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Token Expiration</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>2 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Diagnostic Check</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Passed</span>
                  </div>
                </div>

                <button 
                  onClick={() => fetchSubmissions()} 
                  className="btn btn-outline" 
                  style={{ width: '100%', marginTop: '24px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> 
                  {isLoading ? 'Syncing...' : 'Sync Database Entries'}
                </button>
              </div>
            </div>

            {/* Entries Grid area */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Applicant Management Panel</h3>
                
                {/* Search and Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="input-container" style={{ maxWidth: '240px' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search submissions..."
                      className="form-input"
                      style={{ padding: '8px 12px 8px 36px', fontSize: '0.9rem', borderRadius: '8px' }}
                    />
                    <Search size={14} style={{ left: '12px' }} className="input-icon" />
                  </div>

                  {/* Filter Role */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 10px' }}>
                    <Filter size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', padding: '8px 4px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Roles</option>
                      <option value="Scholar" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Scholars</option>
                      <option value="Mentor" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Mentors</option>
                      <option value="Sponsor" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Sponsors</option>
                    </select>
                  </div>

                  {/* Filter Status */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 10px' }}>
                    <Filter size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', padding: '8px 4px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Statuses</option>
                      <option value="Pending" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Pending</option>
                      <option value="Reviewed" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Reviewed</option>
                      <option value="Accepted" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Accepted</option>
                      <option value="Declined" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Declined</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading && submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="animate-spin" style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', marginBottom: '16px' }}></div>
                  <p style={{ color: 'var(--text-muted)' }}>Syncing active dashboard data...</p>
                </div>
              ) : fetchError ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>
                  <p>{fetchError}</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No applicant records found matching filters.
                </div>
              ) : (
                /* Submissions Table / Flexible Card Display */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>NAME</th>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ROLE</th>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>EMAIL</th>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>SUBMITTED AT</th>
                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{sub.name}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              color: sub.role === 'Scholar' ? 'var(--primary)' : sub.role === 'Mentor' ? 'var(--secondary)' : 'var(--accent)',
                              background: sub.role === 'Scholar' ? 'rgba(105, 92, 254, 0.08)' : sub.role === 'Mentor' ? 'rgba(244, 63, 151, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: `1.5px solid ${sub.role === 'Scholar' ? 'rgba(105, 92, 254, 0.15)' : sub.role === 'Mentor' ? 'rgba(244, 63, 151, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                            }}>{sub.role}</span>
                          </td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{sub.email}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: sub.status === 'Pending' ? 'var(--warning)' : sub.status === 'Reviewed' ? 'var(--primary)' : sub.status === 'Accepted' ? 'var(--success)' : 'var(--error)',
                              background: sub.status === 'Pending' ? 'rgba(245, 158, 11, 0.08)' : sub.status === 'Reviewed' ? 'rgba(105, 92, 254, 0.08)' : sub.status === 'Accepted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>{sub.status}</span>
                          </td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button onClick={() => setSelectedSubmission(sub)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }} title="View details">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleDeleteSubmission(sub._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.1)' }} title="Delete entry">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Details Side Drawer Modal Overlay */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 6, 20, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 150,
          animation: 'slideIn 0.3s ease-out'
        }} onClick={() => setSelectedSubmission(null)}>
          <div className="applicant-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Applicant Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="btn btn-outline" style={{ padding: '6px 12px', borderRadius: '6px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>APPLICANT NAME</span>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px' }}>{selectedSubmission.name}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EMAIL ADDRESS</span>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedSubmission.email}</p>
              </div>

              {selectedSubmission.phone && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PHONE NUMBER</span>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedSubmission.phone}</p>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>JOIN ROLE</span>
                <div style={{ marginTop: '6px' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: selectedSubmission.role === 'Scholar' ? 'var(--primary)' : selectedSubmission.role === 'Mentor' ? 'var(--secondary)' : 'var(--accent)',
                    background: selectedSubmission.role === 'Scholar' ? 'rgba(105, 92, 254, 0.08)' : selectedSubmission.role === 'Mentor' ? 'rgba(244, 63, 151, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${selectedSubmission.role === 'Scholar' ? 'var(--primary)' : selectedSubmission.role === 'Mentor' ? 'var(--secondary)' : 'var(--accent)'}`
                  }}>{selectedSubmission.role}</span>
                </div>
              </div>

              {selectedSubmission.govId && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GOVERNMENT ID</span>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedSubmission.govId}</p>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SUBMITTED ON</span>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {new Date(selectedSubmission.createdAt).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MOTIVATION & MESSAGE</span>
                <p className="motivation-box" style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  whiteSpace: 'pre-wrap'
                }}>{selectedSubmission.message}</p>
              </div>

              {/* Status Update Options */}
              <div className="drawer-divider" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>UPDATE STATUS ACTION</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Reviewed')}
                    className={`btn ${selectedSubmission.status === 'Reviewed' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Accepted')}
                    className={`btn ${selectedSubmission.status === 'Accepted' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '10px', fontSize: '0.85rem', borderColor: selectedSubmission.status === 'Accepted' ? 'none' : 'rgba(16, 185, 129, 0.2)', color: selectedSubmission.status === 'Accepted' ? '#fff' : 'var(--success)' }}
                  >
                    Accept Case
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Declined')}
                    className={`btn ${selectedSubmission.status === 'Declined' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '10px', fontSize: '0.85rem', color: selectedSubmission.status === 'Declined' ? '#fff' : 'var(--error)' }}
                  >
                    Decline Case
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission._id, 'Pending')}
                    className={`btn ${selectedSubmission.status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    Reset Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;

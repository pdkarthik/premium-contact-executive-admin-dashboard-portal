import React, { useState, useEffect } from 'react';
import { User, Mail, Send, Award, Heart, Shield, CheckCircle, Clock, Copy, ArrowRight, BookOpen, Users, Compass, Sun, Moon, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

const LandingPage = ({ onToggleAdmin, apiBaseUrl, theme, onToggleTheme }) => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Scholar',
    message: '',
    linkedin: '',
    github: '',
    socialMedia: '',
    govId: ''
  });

  // UI States
  const [expandOptions, setExpandOptions] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [shakeActive, setShakeActive] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('president@shecanfoundation.org');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Statistics counters
  const [stats, setStats] = useState({ count: 1200, countries: 24, hours: 450 });

  useEffect(() => {
    // Counter animation
    const interval = setInterval(() => {
      setStats(prev => ({
        count: prev.count < 3500 ? prev.count + 45 : 3500,
        countries: prev.countries < 54 ? prev.countries + 1 : 54,
        hours: prev.hours < 980 ? prev.hours + 12 : 980
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Map dynamic backgrounds and testimonials based on active role tab
  const roleConfig = {
    Scholar: {
      image: '/scholar_female.png',
      quote: '"She Can provided me the mentorship and resources to go from writing my first line of code to landing a full-time software engineering internship."',
      author: 'Maya Lin',
      title: 'Class of 2026 Tech Scholar'
    },
    Mentor: {
      image: '/mentor_female.png',
      quote: '"Mentoring with She Can is the most rewarding way to give back. Watching my scholar grow from a beginner to a confident tech lead is priceless."',
      author: 'Sarah Jenkins',
      title: 'Engineering Manager at Google'
    },
    Sponsor: {
      image: '/sponsors_tech.png',
      quote: '"By sponsoring She Can, we did not just donate; we directly invested in hiring top-tier diverse technical talent that elevates our team."',
      author: 'David Chen',
      title: 'VP of Talent, Stripe'
    }
  };

  const currentRoleConfig = roleConfig[formData.role] || roleConfig.Scholar;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role, govId: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (formData.phone.trim().length < 5) {
      newErrors.phone = 'Please provide a valid phone number.';
    }

    if (formData.role === 'Scholar') {
      if (!formData.govId.trim()) {
        newErrors.govId = 'Government ID is required for scholars.';
      } else if (formData.govId.trim().length < 5) {
        newErrors.govId = 'Government ID must be at least 5 characters.';
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message details are required.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message details must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissionData(data.data);
        setIsSuccess(true);
        // Reset form
        setFormData({ name: '', email: '', phone: '', role: formData.role, message: '', linkedin: '', github: '', socialMedia: '', govId: '' });
        setExpandOptions(false);
      } else {
        setErrors({ submit: data.error || 'Server error. Submission failed.' });
      }
    } catch (err) {
      setErrors({ submit: 'Internal server error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (submissionData && submissionData._id) {
      navigator.clipboard.writeText(submissionData._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleApplyClick = (e, role) => {
    if (e) e.preventDefault();
    setIsSuccess(false);
    if (role) {
      setFormData(prev => ({ ...prev, role, govId: '' }));
    }
    // Scroll smoothly to apply-fold
    const element = document.getElementById('apply-fold');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 1. TOP NAVBAR */}
      <nav className="cw-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={18} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)'
          }}>
            SHE CAN <span style={{ color: '#FFCA0A' }}>FOUNDATION</span>
          </span>
        </div>

        <div className="cw-navbar-links">
          <a href="#mission" className="cw-navbar-link">Our Mission</a>
          <a href="#ways-to-give" className="cw-navbar-link">Ways to Give</a>
          <a href="#spring" className="cw-navbar-link">The Spring</a>
          <a href="#transparency" className="cw-navbar-link">Transparency</a>
        </div>

        <div className="cw-navbar-actions">
          <button onClick={onToggleAdmin} className="btn btn-outline cw-navbar-admin-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}>
            Admin Portal
          </button>
          
          <button 
            onClick={onToggleTheme} 
            className="theme-toggle-btn"
            style={{ width: '36px', height: '36px' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="theme-toggle-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </span>
          </button>

          <a href="#apply-fold" onClick={(e) => handleApplyClick(e)} className="cw-btn-gold cw-navbar-apply-btn">Apply Now</a>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cw-mobile-menu-btn"
            style={{ width: '36px', height: '36px' }}
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Mobile Dropdown Panel inside sticky navbar container */}
        {mobileMenuOpen && (
          <div className="cw-mobile-menu-panel">
            <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="cw-mobile-menu-link">Our Mission</a>
            <a href="#ways-to-give" onClick={() => setMobileMenuOpen(false)} className="cw-mobile-menu-link">Ways to Give</a>
            <a href="#spring" onClick={() => setMobileMenuOpen(false)} className="cw-mobile-menu-link">The Spring</a>
            <a href="#transparency" onClick={() => setMobileMenuOpen(false)} className="cw-mobile-menu-link">Transparency</a>
            <button 
              onClick={() => { onToggleAdmin(); setMobileMenuOpen(false); }} 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '6px', marginTop: '4px' }}
            >
              Admin Portal
            </button>
          </div>
        )}
      </nav>

      {/* 2. HERO SPLIT SCREEN SECTION */}
      <section className="cw-hero-split">
        
        {/* Left Visual Column */}
        <div 
          className="cw-hero-visual" 
          style={{ backgroundImage: `url('${currentRoleConfig.image}')` }}
        >
          <div className="cw-hero-overlay"></div>
          
          {/* Floating Live Metric */}
          <div className="cw-hero-metric">
            <span className="cw-hero-metric-num">{stats.count}+</span>
            <span className="cw-hero-metric-label">Leaders Empowered</span>
          </div>

          {/* Testimonial quote at the bottom */}
          <div className="cw-hero-quote-card">
            <p className="cw-hero-quote-text">{currentRoleConfig.quote}</p>
            <div className="cw-hero-quote-author">
              <div className="cw-hero-quote-avatar">
                <img 
                  src={currentRoleConfig.image} 
                  alt={currentRoleConfig.author} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>
                  {currentRoleConfig.author}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', margin: 0 }}>
                  {currentRoleConfig.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="cw-hero-form-panel">
          <div className="cw-form-wrapper">
            <h1 className="cw-hero-form-title">
              Help bring tech leadership and representation to every woman.
            </h1>
            <p className="cw-hero-form-desc">
              Millions of women are underrepresented in global technology. The daily barriers to accessing coding cohorts, device registries, and executive mentors limit career options. Access to training changes everything.
            </p>

            {/* Pristine white/dark form card */}
            <div id="apply-fold" className="cw-form-card">
              
              {/* Tab selector header */}
              <div className="cw-tabs-header">
                <button 
                  className={`cw-tab ${formData.role === 'Scholar' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('Scholar')}
                >
                  <BookOpen size={18} />
                  <span>Scholar</span>
                </button>
                <button 
                  className={`cw-tab ${formData.role === 'Mentor' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('Mentor')}
                >
                  <Users size={18} />
                  <span>Mentor</span>
                </button>
                <button 
                  className={`cw-tab ${formData.role === 'Sponsor' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('Sponsor')}
                >
                  <Compass size={18} />
                  <span>Sponsor</span>
                </button>
              </div>

              {/* Form body */}
              <div className="cw-form-body">
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className={shakeActive ? 'shake' : ''}>
                    
                    {/* Name */}
                    <div className="cw-input-container">
                      <label className="cw-input-label">
                        Full Name <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>
                      </label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="cw-input"
                        placeholder="e.g. Maya Lin"
                        required
                      />
                      {errors.name && <span className="error-msg"><Clock size={12} /> {errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="cw-input-container">
                      <label className="cw-input-label">
                        Email Address <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>
                      </label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="cw-input"
                        placeholder="e.g. maya@domain.com"
                        required
                      />
                      {errors.email && <span className="error-msg"><Clock size={12} /> {errors.email}</span>}
                    </div>

                    {/* Phone Number */}
                    <div className="cw-input-container">
                      <label className="cw-input-label">
                        Phone Number <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>
                      </label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="cw-input"
                        placeholder="e.g. +1 (555) 000-0000"
                        required
                      />
                      {errors.phone && <span className="error-msg"><Clock size={12} /> {errors.phone}</span>}
                    </div>

                    {/* Government ID for Scholar */}
                    {formData.role === 'Scholar' && (
                      <div className="cw-input-container">
                        <label className="cw-input-label">
                          Government ID Number (Aadhaar / SSN / CNIC / National ID) <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>
                        </label>
                        <input 
                          type="text"
                          name="govId"
                          value={formData.govId}
                          onChange={handleInputChange}
                          className="cw-input"
                          placeholder="e.g. National ID / SSN"
                          required
                        />
                        {errors.govId && <span className="error-msg"><Clock size={12} /> {errors.govId}</span>}
                      </div>
                    )}

                    {/* Expandable options (e.g. LinkedIn/Portfolio, GitHub, Facebook/Instagram) */}
                    <div 
                      className="cw-expand-header"
                      onClick={() => setExpandOptions(!expandOptions)}
                    >
                      {expandOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>
                        {formData.role === 'Sponsor' 
                          ? 'Add profile links (LinkedIn, Facebook/Instagram)' 
                          : 'Add profile links (LinkedIn/Portfolio, GitHub)'}
                      </span>
                    </div>

                    {expandOptions && (
                      <div className="cw-expand-body">
                        <div className="cw-input-container">
                          <label className="cw-input-label">
                            {formData.role === 'Sponsor' ? 'LinkedIn URL' : 'LinkedIn / Portfolio URL'}
                          </label>
                          <input 
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            className="cw-input"
                            placeholder={formData.role === 'Sponsor' ? 'e.g. linkedin.com/in/username' : 'e.g. linkedin.com or portfolio link'}
                          />
                        </div>
                        {formData.role === 'Sponsor' ? (
                          <div className="cw-input-container">
                            <label className="cw-input-label">Facebook / Instagram URL</label>
                            <input 
                              type="url"
                              name="socialMedia"
                              value={formData.socialMedia}
                              onChange={handleInputChange}
                              className="cw-input"
                              placeholder="e.g. facebook.com or instagram.com"
                            />
                          </div>
                        ) : (
                          <div className="cw-input-container">
                            <label className="cw-input-label">GitHub URL</label>
                            <input 
                              type="url"
                              name="github"
                              value={formData.github}
                              onChange={handleInputChange}
                              className="cw-input"
                              placeholder="e.g. github.com/username"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <div className="cw-input-container">
                      <label className="cw-input-label">Why do you want to join She Can?</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="cw-input"
                        placeholder="Share your goals and vision..."
                        style={{ minHeight: '130px', maxHeight: '220px', resize: 'vertical' }}
                        required
                        maxLength={500}
                      />
                      <span className="char-counter">{formData.message.length}/500</span>
                      {errors.message && <span className="error-msg" style={{ bottom: '-22px' }}><Clock size={12} /> {errors.message}</span>}
                    </div>

                    {/* Server side error display */}
                    {errors.submit && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '12px',
                        borderRadius: '4px',
                        color: 'var(--error)',
                        fontSize: '0.8rem',
                        marginBottom: '16px',
                        textAlign: 'center'
                      }}>
                        {errors.submit}
                      </div>
                    )}

                    {/* Impact Bar */}
                    <div className="cw-impact-bar">
                      <Heart size={16} className="cw-impact-icon" fill="currentColor" />
                      <span>
                        {formData.role === 'Scholar' && 'Empowers 1 female leader in tech with laptop access.'}
                        {formData.role === 'Mentor' && 'Provides weekly 1-on-1 industry mentorship.'}
                        {formData.role === 'Sponsor' && 'Funds scholarship pipelines for active cohorts.'}
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cw-btn-gold"
                      style={{ width: '100%', padding: '14px', justifyContent: 'center', borderRadius: '4px' }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>

                  </form>
                ) : (
                  
                  /* Success Screen */
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--success)'
                    }}>
                      <CheckCircle size={32} />
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                      Thank You!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      We will reach out to you soon.
                    </p>

                    {submissionData && (
                      <div style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'left',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REGISTRATION TICKET</span>
                          <span style={{
                            fontSize: '0.65rem',
                            background: '#FFCA0A',
                            color: '#222520',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontWeight: 800
                          }}>{submissionData.role}</span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{submissionData.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{submissionData.email}</p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(0,0,0,0.05)',
                          padding: '6px 10px',
                          borderRadius: '4px'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ID: {submissionData._id?.substring(0, 16)}...
                          </span>
                          <button
                            onClick={handleCopyId}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedId ? 'var(--success)' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem'
                            }}
                          >
                            <Copy size={12} /> {copiedId ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setIsSuccess(false)} 
                      className="btn btn-outline" 
                      style={{ width: '100%', padding: '10px', borderRadius: '4px' }}
                    >
                      Submit Another Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. SECTION: MORE WAYS TO GIVE */}
      <section id="ways-to-give" className="cw-section">
        <div className="cw-section-container">
          
          <div className="cw-section-header">
            <h2 className="serif-title cw-section-title">More ways to give</h2>
          </div>

          <div className="cw-ways-grid">
            
            {/* Card 1: Honor educator */}
            <div className="cw-way-card">
              <div className="cw-way-icon-box">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <rect x="15" y="25" width="70" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M15 25 L50 55 L85 25" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M42 48 C44 50, 48 52, 50 52 C52 52, 56 50, 58 48" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="50" cy="42" r="7" fill="#FFCA0A" />
                </svg>
              </div>
              <h3 className="cw-way-card-title">Honor someone special</h3>
              <p className="cw-way-card-text">
                Honor or remember someone special by making a technical scholarship gift in their name.
              </p>
              <a href="#apply-fold" className="cw-way-link">GIVE IN HONOR OF SOMEONE</a>
            </div>

            {/* Card 2: Legacy giving */}
            <div className="cw-way-card">
              <div className="cw-way-icon-box">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <path d="M50 85 L50 45" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M50 45 Q35 35, 30 25 Q35 15, 50 25" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M50 45 Q65 35, 70 25 Q65 15, 50 25" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="50" cy="22" r="4" fill="#FFCA0A" />
                  <path d="M20 75 Q40 85, 50 85 Q60 85, 80 75" fill="none" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </div>
              <h3 className="cw-way-card-title">Legacy giving</h3>
              <p className="cw-way-card-text">
                Join us in shaping the future and making gender diversity in tech a part of your lasting legacy.
              </p>
              <a href="#apply-fold" className="cw-way-link">LEARN MORE</a>
            </div>

            {/* Card 3: Crypto */}
            <div className="cw-way-card">
              <div className="cw-way-icon-box">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <rect x="42" y="32" width="16" height="36" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="42" y1="44" x2="58" y2="44" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="42" y1="56" x2="58" y2="56" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="6" fill="#FFCA0A" />
                </svg>
              </div>
              <h3 className="cw-way-card-title">Donate with cryptocurrency</h3>
              <p className="cw-way-card-text">
                We accept bitcoin, ether, litecoin, USDC, Solana, and other top-tier decentralized assets.
              </p>
              <a href="#apply-fold" className="cw-way-link">GIVE CRYPTO</a>
            </div>

            {/* Card 4: Check/Stock */}
            <div className="cw-way-card">
              <div className="cw-way-icon-box">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <rect x="15" y="30" width="70" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="25" y1="42" x2="75" y2="42" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="25" y1="55" x2="55" y2="55" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="68" cy="55" r="5" fill="#FFCA0A" />
                  <path d="M72 25 L82 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="cw-way-card-title">Give by check or stock</h3>
              <p className="cw-way-card-text">
                We also accept secure direct donations by checks, wire transfers, stock grants, or corporate matching.
              </p>
              <a href="#apply-fold" className="cw-way-link">GET THE DETAILS</a>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION: TRUST AND TRANSPARENCY */}
      <section id="transparency" className="cw-section" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="cw-section-container">
          
          <div className="cw-section-header">
            <h2 className="serif-title cw-section-title">You deserve to give with confidence</h2>
            <p className="cw-section-desc">
              All of our operational expenses are funded by a private community of visionary founders, so you can trust 100% of your sponsor support goes directly to scholar devices, tech bootcamps, and career resources. Every cent, every time.
            </p>
          </div>

          {/* Badges Container */}
          <div className="cw-badges-flex">
            
            {/* Badge 1: Top Rated */}
            <div className="cw-trust-badge">
              <svg viewBox="0 0 80 80" style={{ width: '60px', height: '60px', marginBottom: '12px' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M25 50 C25 35, 55 35, 55 50 Z" fill="#222520" />
                <circle cx="40" cy="30" r="8" fill="#FFCA0A" />
                <path d="M15 40 L65 40" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Charity Watch</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOP-RATED</span>
            </div>

            {/* Badge 2: Platinum */}
            <div className="cw-trust-badge">
              <svg viewBox="0 0 80 80" style={{ width: '60px', height: '60px', marginBottom: '12px' }}>
                <rect x="20" y="15" width="40" height="50" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M30 35 L40 45 L50 25" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="40" cy="38" r="14" fill="none" stroke="#FFCA0A" strokeWidth="2" strokeDasharray="3,3" />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Platinum</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRANSPARENCY 2026</span>
            </div>

            {/* Badge 3: Navigator */}
            <div className="cw-trust-badge">
              <svg viewBox="0 0 80 80" style={{ width: '60px', height: '60px', marginBottom: '12px' }}>
                <path d="M40 10 L50 35 L78 35 L55 50 L65 78 L40 60 L15 78 L25 50 L2 35 L30 35 Z" fill="#FFCA0A" stroke="currentColor" strokeWidth="1" />
                <circle cx="40" cy="42" r="10" fill="none" stroke="#fff" strokeWidth="1.5" />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Charity Navigator</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>FOUR-STAR ★★★★</span>
            </div>

            {/* Badge 4: BBB */}
            <div className="cw-trust-badge">
              <svg viewBox="0 0 80 80" style={{ width: '60px', height: '60px', marginBottom: '12px' }}>
                <polygon points="40,10 65,22 65,58 40,70 15,58 15,22" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="25" y="46" fontFamily="var(--font-heading)" fontSize="20" fontWeight="900" fill="currentColor">BBB</text>
                <circle cx="40" cy="60" r="4" fill="#FFCA0A" />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>BBB Accredited</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHARITY SEAMLESS</span>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION: JOIN THE SPRING COLLAGE & COHORT SPONSOR */}
      <section id="spring" className="cw-section cream">
        <div className="cw-section-container">
          
          {/* Collage Split */}
          <div className="cw-spring-split">
            
            {/* Left Col: Three Tilted Real People Images */}
            <div className="cw-spring-split-col">
              <div className="cw-spring-collage">
                <div className="cw-collage-card">
                  <img src="/spring_member_1.png" alt="Spring Member 1" />
                </div>
                <div className="cw-collage-card">
                  <img src="/spring_member_2.png" alt="Spring Member 2" />
                </div>
                <div className="cw-collage-card">
                  <img src="/spring_member_3.png" alt="Spring Member 3" />
                </div>
              </div>
            </div>

            {/* Right Col: Call to Action */}
            <div className="cw-spring-split-col" style={{ textAlign: 'left' }}>
              <h2 className="serif-title cw-section-title" style={{ fontSize: '2.3rem', lineHeight: '1.2' }}>
                Join The Spring to invest in clean tech representation & sustainability
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '24px 0 32px 0', lineHeight: '1.6' }}>
                Support monthly, and you'll become a part of The Spring, a passionate community of global mentors and sponsors invested in a world where every woman has equal access to shape the technical future.
              </p>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Sponsor')} className="cw-btn-gold" style={{ padding: '14px 32px' }}>JOIN TODAY</a>
            </div>

          </div>

          {/* Alternate Split: Left Text, Right Large Image */}
          <div className="cw-spring-split alternate">
            
            {/* Right Col: Large Image */}
            <div className="cw-spring-split-col">
              <div className="cw-split-image-container">
                <img src="/tech_pioneers.png" alt="Tech Pioneers Coding" />
              </div>
            </div>

            {/* Left Col: Text */}
            <div className="cw-spring-split-col" style={{ textAlign: 'left' }}>
              <h2 className="serif-title cw-section-title" style={{ fontSize: '2.3rem', lineHeight: '1.2' }}>
                Sponsor a tech cohort or regional chapter project
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '24px 0 32px 0', lineHeight: '1.6' }}>
                Transform an entire regional code club, high-school chapter, or community tech bootcamp with a corporate talent pipeline sponsorship or device grant of $10,000 or more.
              </p>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Sponsor')} className="cw-btn-gold" style={{ padding: '14px 32px' }}>LEARN MORE</a>
            </div>

          </div>

        </div>
      </section>

      {/* 6. METRICS OVERVIEW */}
      <section id="mission" className="cw-section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="cw-section-container" style={{ textAlign: 'center' }}>
          
          <h2 className="serif-title cw-section-title" style={{ marginBottom: '50px' }}>Our Collective Impact</h2>
          
          <div className="cw-metrics-grid">
            <div>
              <h3 style={{ fontSize: '3rem', color: '#695CFE', fontWeight: 800, margin: 0 }}>{stats.count}+</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>Active Members</p>
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', color: '#FFCA0A', fontWeight: 800, margin: 0 }}>{stats.countries}+</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>University Chapters</p>
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', color: '#F43F97', fontWeight: 800, margin: 0 }}>{stats.hours}k+</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}>Mentorship Hours</p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. PREMIUM MULTI-COLUMN FOOTER */}
      <footer className="cw-footer">
        <div className="cw-section-container" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          
          {/* Main Footer Directory Grid */}
          <div className="cw-footer-grid">
            
            {/* Column 1: Take Action */}
            <div className="cw-footer-col">
              <span className="cw-footer-col-title">Take Action</span>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Scholar')} className="cw-footer-link">Apply as Scholar</a>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Mentor')} className="cw-footer-link">Apply as Mentor</a>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Sponsor')} className="cw-footer-link">Sponsor a Chapter</a>
              <a href="#spring" className="cw-footer-link">Join The Spring</a>
              <a href="#ways-to-give" className="cw-footer-link">Other Ways to Support</a>
              <a href="#apply-fold" onClick={(e) => handleApplyClick(e, 'Sponsor')} className="cw-footer-link">Gift in Honor of Someone</a>
            </div>

            {/* Column 2: About Us */}
            <div className="cw-footer-col">
              <span className="cw-footer-col-title">About Us</span>
              <a href="#mission" className="cw-footer-link">Our Tech Mission</a>
              <a href="#transparency" className="cw-footer-link">Financial Auditing</a>
              <a href="#transparency" className="cw-footer-link">Transparency Reports</a>
              <a href="#mission" className="cw-footer-link">Chapter Locations</a>
              <a href="#apply-fold" className="cw-footer-link">Leadership & Team</a>
              <a href="#apply-fold" className="cw-footer-link">Frequently Asked FAQs</a>
            </div>

            {/* Column 3: Tech Impact */}
            <div className="cw-footer-col">
              <span className="cw-footer-col-title">Tech Impact</span>
              <a href="#mission" className="cw-footer-link">Technical Bootcamps</a>
              <a href="#mission" className="cw-footer-link">Device Procurements</a>
              <a href="#mission" className="cw-footer-link">Mentorship Guild</a>
              <a href="#mission" className="cw-footer-link">Cohort Pipelines</a>
              <a href="#mission" className="cw-footer-link">Workspace Foundations</a>
              <a href="#transparency" className="cw-footer-link">Confidence Badges</a>
            </div>

            {/* Column 4: Newsletter Sign-up */}
            <div className="cw-footer-col">
              <span className="cw-footer-col-title">Stay Connected</span>
              <p className="cw-footer-text">
                Receive quarterly impact digests, inspiring scholar stories, and organizational transparency summaries.
              </p>
              <form 
                className="cw-newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing to the She Can Foundation newsletter!');
                  e.target.reset();
                }}
              >
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="cw-newsletter-input" 
                  required 
                />
                <button type="submit" className="cw-newsletter-btn">
                  <Send size={15} />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Copyright and Branding Credit */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '30px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} color="#FFCA0A" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                SHE CAN FOUNDATION
              </span>
            </div>

            {/* Social Media Links with Icons & Names */}
            <div className="cw-footer-social-row">
              <a href="https://www.linkedin.com/company/shecanfoundation" target="_blank" rel="noopener noreferrer" className="cw-social-footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://www.instagram.com/_shecanfoundation_" target="_blank" rel="noopener noreferrer" className="cw-social-footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
              <a href="https://wa.me/918283841830" target="_blank" rel="noopener noreferrer" className="cw-social-footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>WhatsApp</span>
              </a>
              <button 
                onClick={handleCopyEmail}
                className="cw-social-footer-link" 
                style={{ 
                  cursor: 'pointer', 
                  background: copiedEmail ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: copiedEmail ? '#2ed573' : 'var(--border-color)',
                  color: copiedEmail ? '#2ed573' : 'var(--text-secondary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                title="Click to copy email address"
              >
                {copiedEmail ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ed573" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                )}
                <span>{copiedEmail ? 'Copied!' : 'president@shecanfoundation.org'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              © 2026 She Can Foundation. All rights reserved. 100% of community-sourced sponsorships directly fund women developer bootcamps, chapter workspace equipment, and dedicated technical training registries worldwide. She Can is a certified global diversity advocacy guild.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

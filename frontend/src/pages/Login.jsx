import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { coimbatoreDoctors } from '../data/mockData';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import './login.css';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';
  const [activeRole, setActiveRole] = useState(initialRole.toLowerCase()); // 'patient' | 'doctor' | 'hospital'

  const { loginPatient, loginDoctor, loginHospital, sendPatientOtp, verifyPatientOtp } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [patientInput, setPatientInput] = useState('9876543210');
  const [patientAuthMode, setPatientAuthMode] = useState('otp'); // 'otp' | 'password'
  const [patientOtp, setPatientOtp] = useState('123456');
  const [patientPassword, setPatientPassword] = useState('patient123');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');

  const [doctorEmail, setDoctorEmail] = useState('dr.kumar@medicare.com');
  const [doctorPassword, setDoctorPassword] = useState('doctor123');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc_1');

  const [hospitalEmail, setHospitalEmail] = useState('kmch@hospital.com');
  const [hospitalPassword, setHospitalPassword] = useState('kmch123');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sync role with search query if it changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['patient', 'doctor', 'hospital'].includes(roleParam.toLowerCase())) {
      setActiveRole(roleParam.toLowerCase());
    }
  }, [searchParams]);

  // Request Patient OTP
  const handleSendOtp = async () => {
    if (!patientInput) {
      setErrorMessage('Please enter your mobile number first.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await sendPatientOtp(patientInput);
      setOtpSent(true);
      if (res.mockOtp) {
        setPatientOtp(res.mockOtp);
        setOtpNotice(`Code sent! Development Mock OTP is: ${res.mockOtp}`);
      } else {
        setOtpNotice(res.message || 'Verification OTP code dispatched.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit by Role
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (activeRole === 'patient') {
        if (patientAuthMode === 'otp') {
          if (!patientOtp) {
            setErrorMessage('Please enter the 6-digit verification OTP code.');
            setIsLoading(false);
            return;
          }
          await verifyPatientOtp(patientInput, patientOtp);
        } else {
          await loginPatient(patientInput, null, patientPassword);
        }
      } else if (activeRole === 'doctor') {
        await loginDoctor(doctorEmail || selectedDoctorId, doctorPassword);
      } else if (activeRole === 'hospital') {
        await loginHospital(hospitalEmail, hospitalPassword);
      }

      const redirectPath = searchParams.get('redirect') || '/';
      navigate(redirectPath);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Pre-fill helpers
  const handleQuickFillPatient = () => {
    setPatientInput('9876543210');
    setPatientOtp('123456');
    setPatientPassword('patient123');
    setOtpSent(true);
    setOtpNotice('Demo Mobile: 9876543210 • Dev OTP: 123456 ready');
  };

  const handleSelectDoctorChip = (doc) => {
    setSelectedDoctorId(doc.id);
    const generatedEmail = `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@medicare.com`;
    setDoctorEmail(generatedEmail);
    setDoctorPassword('doctor123');
  };

  const handleQuickFillHospital = () => {
    setHospitalEmail('kmch@hospital.com');
    setHospitalPassword('kmch123');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="split-login-wrapper fade-in">
      {/* =====================================================================
          LEFT SIDE: Cyan / Turquoise Gradient Hero with Subtle Curved Shapes
          ===================================================================== */}
      <div className="split-login-hero">
        <div className="hero-glow-shape-1" />
        <div className="hero-glow-shape-2" />

        <svg
          className="hero-curved-svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,186.7C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        <div className="hero-content-inner">
          <div className="hero-brand">
            <div className="hero-brand-icon">
              <Stethoscope size={20} strokeWidth={2.4} />
            </div>
            <span className="hero-brand-name">
              MediCare<span className="hero-brand-plus">+</span>
            </span>
          </div>

          <div className="hero-main-block">
            <div className="hero-badge-pill">
              <Sparkles size={14} /> Unified Healthcare Management
            </div>

            <h1 className="hero-heading">
              Welcome to <br />MediCare+
            </h1>

            <p className="hero-subtitle">
              Your interconnected digital healthcare ecosystem. Manage prescriptions, track daily routine medicines, consult verified specialists online, and coordinate hospital operations.
            </p>

            <div className="hero-features-list">
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <User size={18} />
                </div>
                <div className="hero-feature-text">
                  <h4>Patient Health Dashboard</h4>
                  <p>Active prescriptions, routine medicine schedules & doctor appointments</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <Stethoscope size={18} />
                </div>
                <div className="hero-feature-text">
                  <h4>Doctor Consultation Console</h4>
                  <p>Review teleconsultation requests, approve video appointments & issue prescriptions</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <Building2 size={18} />
                </div>
                <div className="hero-feature-text">
                  <h4>Institutional Hospital Management</h4>
                  <p>Super-specialty OPD receipts, inpatient billing & pharmacy dispensing system</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-footer-badge">
            <ShieldCheck size={16} />
            <span>256-Bit SSL Encrypted Healthcare Portal • Role-Based JWT Secure</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          RIGHT SIDE: White Background with Professional Login Form
          ===================================================================== */}
      <div className="split-login-content">
        <div className="split-login-form-container">
          {/* Three Separate Login Options Tabs */}
          <div className="role-tabs-container">
            <button
              type="button"
              className={`role-tab-btn ${activeRole === 'patient' ? 'active' : ''}`}
              onClick={() => { setActiveRole('patient'); setErrorMessage(''); }}
            >
              <User size={16} />
              <span>Patient Login</span>
            </button>

            <button
              type="button"
              className={`role-tab-btn ${activeRole === 'doctor' ? 'active' : ''}`}
              onClick={() => { setActiveRole('doctor'); setErrorMessage(''); }}
            >
              <Stethoscope size={16} />
              <span>Doctor Login</span>
            </button>

            <button
              type="button"
              className={`role-tab-btn ${activeRole === 'hospital' ? 'active' : ''}`}
              onClick={() => { setActiveRole('hospital'); setErrorMessage(''); }}
            >
              <Building2 size={16} />
              <span>Hospital Login</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header-block">
            {activeRole === 'patient' && (
              <>
                <span className="form-role-tag patient">● Patient Portal</span>
                <h2 className="form-main-title">Patient Sign In</h2>
                <p className="form-subtitle-text">
                  Enter your mobile number with OTP verification or PIN to access your prescriptions and routine medicines.
                </p>
              </>
            )}

            {activeRole === 'doctor' && (
              <>
                <span className="form-role-tag doctor">● Doctor Console</span>
                <h2 className="form-main-title">Doctor Sign In</h2>
                <p className="form-subtitle-text">
                  Sign in with registered doctor credentials to review appointments and clinical records.
                </p>
              </>
            )}

            {activeRole === 'hospital' && (
              <>
                <span className="form-role-tag hospital">● Hospital Desk</span>
                <h2 className="form-main-title">Hospital Management Sign In</h2>
                <p className="form-subtitle-text">
                  Authorized institutional access for KMCH Hospital billing, OPD, and pharmacy systems.
                </p>
              </>
            )}
          </div>

          {/* Error Alert Display */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Fillers */}
          {activeRole === 'patient' && (
            <div className="quick-fill-box">
              <span className="quick-fill-label">Demo Patient Account:</span>
              <button
                type="button"
                className="quick-fill-btn"
                onClick={handleQuickFillPatient}
              >
                <span>⚡ Fill: Demo Patient (9876543210 / OTP 123456)</span>
              </button>
            </div>
          )}

          {activeRole === 'doctor' && (
            <div className="quick-fill-box" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="quick-fill-label">Select Specialist Doctor for Demo:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', width: '100%', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  className="quick-fill-btn"
                  style={{
                    backgroundColor: selectedDoctorId === 'doc_1' ? '#0d9488' : '#ffffff',
                    color: selectedDoctorId === 'doc_1' ? '#ffffff' : '#0d9488'
                  }}
                  onClick={() => handleSelectDoctorChip(coimbatoreDoctors[0])}
                >
                  ⚡ Dr. Kumar (KMCH - General)
                </button>
                <button
                  type="button"
                  className="quick-fill-btn"
                  style={{
                    backgroundColor: selectedDoctorId === 'doc_2' ? '#0d9488' : '#ffffff',
                    color: selectedDoctorId === 'doc_2' ? '#ffffff' : '#0d9488'
                  }}
                  onClick={() => handleSelectDoctorChip(coimbatoreDoctors[1])}
                >
                  ⚡ Dr. Priya (ABC - Diabetes)
                </button>
              </div>
            </div>
          )}

          {activeRole === 'hospital' && (
            <div className="quick-fill-box">
              <span className="quick-fill-label">Demo Hospital Account:</span>
              <button
                type="button"
                className="quick-fill-btn"
                onClick={handleQuickFillHospital}
              >
                <span>⚡ Fill: KMCH Hospital Admin</span>
              </button>
            </div>
          )}

          {/* The Login Form */}
          <form onSubmit={handleLoginSubmit}>
            {/* 1. PATIENT FORM FIELDS */}
            {activeRole === 'patient' && (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setPatientAuthMode('otp')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: patientAuthMode === 'otp' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      background: patientAuthMode === 'otp' ? '#f0fdfa' : '#ffffff',
                      color: patientAuthMode === 'otp' ? '#0f766e' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    📱 Mobile OTP Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientAuthMode('password')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: patientAuthMode === 'password' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      background: patientAuthMode === 'password' ? '#f0fdfa' : '#ffffff',
                      color: patientAuthMode === 'password' ? '#0f766e' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    🔒 Password / PIN
                  </button>
                </div>

                <div className="modern-form-group">
                  <label className="modern-form-label" htmlFor="patient-input">
                    Mobile Number
                  </label>
                  <div className="input-icon-wrapper" style={{ display: 'flex' }}>
                    <Phone className="input-left-icon" size={18} />
                    <input
                      id="patient-input"
                      type="text"
                      className="modern-rounded-input"
                      value={patientInput}
                      onChange={(e) => setPatientInput(e.target.value)}
                      placeholder="e.g. 9876543210"
                      required
                    />
                    {patientAuthMode === 'otp' && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#0d9488',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {patientAuthMode === 'otp' && (
                  <div className="modern-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="modern-form-label" htmlFor="patient-otp" style={{ margin: 0 }}>
                        Enter 6-Digit OTP Code
                      </label>
                      <span style={{ fontSize: '0.725rem', color: '#0d9488', fontWeight: '700' }}>
                        Mock OTP: 123456
                      </span>
                    </div>
                    <div className="input-icon-wrapper">
                      <KeyRound className="input-left-icon" size={18} />
                      <input
                        id="patient-otp"
                        type="text"
                        maxLength={6}
                        className="modern-rounded-input"
                        value={patientOtp}
                        onChange={(e) => setPatientOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        required
                      />
                    </div>
                    {otpNotice && (
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={13} /> {otpNotice}
                      </p>
                    )}
                  </div>
                )}

                {patientAuthMode === 'password' && (
                  <div className="modern-form-group">
                    <label className="modern-form-label" htmlFor="patient-password">
                      Password / Verification PIN
                    </label>
                    <div className="input-icon-wrapper">
                      <Lock className="input-left-icon" size={18} />
                      <input
                        id="patient-password"
                        type={showPassword ? 'text' : 'password'}
                        className="modern-rounded-input"
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="Enter password or PIN"
                        required
                      />
                      <button
                        type="button"
                        className="input-right-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. DOCTOR FORM FIELDS */}
            {activeRole === 'doctor' && (
              <>
                <div className="modern-form-group">
                  <label className="modern-form-label" htmlFor="doctor-email">
                    Doctor Email Address
                  </label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-left-icon" size={18} />
                    <input
                      id="doctor-email"
                      type="text"
                      className="modern-rounded-input"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      placeholder="e.g. dr.kumar@medicare.com"
                      required
                    />
                  </div>
                </div>

                <div className="modern-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="modern-form-label" htmlFor="doctor-password" style={{ margin: 0 }}>
                      Doctor Portal Password
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      Demo password: <strong>doctor123</strong>
                    </span>
                  </div>
                  <div className="input-icon-wrapper">
                    <Lock className="input-left-icon" size={18} />
                    <input
                      id="doctor-password"
                      type={showPassword ? 'text' : 'password'}
                      className="modern-rounded-input"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="input-right-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 3. HOSPITAL FORM FIELDS */}
            {activeRole === 'hospital' && (
              <>
                <div className="modern-form-group">
                  <label className="modern-form-label" htmlFor="hospital-email">
                    Hospital Administrative Email
                  </label>
                  <div className="input-icon-wrapper">
                    <Building2 className="input-left-icon" size={18} />
                    <input
                      id="hospital-email"
                      type="email"
                      className="modern-rounded-input"
                      value={hospitalEmail}
                      onChange={(e) => setHospitalEmail(e.target.value)}
                      placeholder="e.g. kmch@hospital.com"
                      required
                    />
                  </div>
                </div>

                <div className="modern-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="modern-form-label" htmlFor="hospital-password" style={{ margin: 0 }}>
                      Hospital Portal Password
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      Demo password: <strong>kmch123</strong>
                    </span>
                  </div>
                  <div className="input-icon-wrapper">
                    <Lock className="input-left-icon" size={18} />
                    <input
                      id="hospital-password"
                      type={showPassword ? 'text' : 'password'}
                      className="modern-rounded-input"
                      value={hospitalPassword}
                      onChange={(e) => setHospitalPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="input-right-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Options Bar: Remember me & Forgot Password */}
            <div className="form-options-bar">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this session</span>
              </label>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setIsForgotModalOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            {/* Modern Gradient Submit Button */}
            <button
              type="submit"
              className="modern-login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>
                    {activeRole === 'patient' && (patientAuthMode === 'otp' ? 'Verify OTP & Sign In' : 'Sign In with Password')}
                    {activeRole === 'doctor' && 'Sign In to Doctor Console'}
                    {activeRole === 'hospital' && 'Sign In to Hospital Desk'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Actions: Register link and Back to home */}
          <div className="form-footer-actions">
            {activeRole === 'patient' && (
              <p className="register-prompt-text">
                Don't have a patient account?
                <Link to="/register" className="register-link-highlight">
                  Register as Patient
                </Link>
              </p>
            )}

            {activeRole === 'doctor' && (
              <p className="register-prompt-text">
                Need to register your medical practice?
                <Link to="/nearby" className="register-link-highlight">
                  Join Hospital Network
                </Link>
              </p>
            )}

            {activeRole === 'hospital' && (
              <p className="register-prompt-text">
                New healthcare institution onboarding?
                <Link to="/nearby" className="register-link-highlight">
                  Partner with MediCare+
                </Link>
              </p>
            )}

            <Link to="/" className="back-home-link">
              ← Return to Healthcare Public Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsForgotModalOpen(false)}
          title="Reset Account Password"
          subtitle="We will send password recovery instructions to your registered email or phone"
        >
          {forgotSent ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Recovery Link Dispatched</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                Please check your inbox at <strong>{forgotEmail}</strong> to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              <div className="modern-form-group">
                <label className="modern-form-label" htmlFor="forgot-email">
                  Registered Email Address or Mobile Number
                </label>
                <div className="input-icon-wrapper">
                  <Mail className="input-left-icon" size={18} />
                  <input
                    id="forgot-email"
                    type="text"
                    className="modern-rounded-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email or mobile"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button type="button" variant="outline" onClick={() => setIsForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Send Recovery Link
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

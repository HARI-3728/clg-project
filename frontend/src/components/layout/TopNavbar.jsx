import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  PhoneCall,
  User,
  ChevronDown,
  LogOut,
  CheckCircle2,
  LogIn,
  Building2,
  Stethoscope,
  Pill,
  FileText,
  CalendarCheck,
  Calendar,
  Clock,
  Syringe,
  Check,
  CheckCheck,
  Video,
  ShoppingBag,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePatientData } from '../../context/PatientContext';
import { Button } from '../ui/Button';
import './layout.css';

export const TopNavbar = () => {
  const { user, logout } = useAuth();
  const {
    notifications = [],
    unreadNotificationsCount = 0,
    markNotificationAsRead,
    toggleNotificationRead,
    markAllNotificationsAsRead,
    appointments = [],
    orders = [],
    medicineReminders = [],
    vaccinations = [],
    hospitalBills = []
  } = usePatientData();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCategory, setNotifCategory] = useState('all');

  const userRole = user?.role || 'patient';

  // Section 14: Dynamic role-specific notifications
  const roleNotifications = useMemo(() => {
    if (userRole === 'doctor') {
      // For doctors: Upcoming appointment reminders & relevant appointment status updates
      const list = [];
      const docName = (user?.name || 'Dr. Kumar').toLowerCase();
      const myApts = (appointments || []).filter((a) => {
        const d = (a.doctor || '').toLowerCase();
        return d.includes(docName) || docName.includes(d) || d.includes('kumar');
      });

      myApts.forEach((apt) => {
        if (apt.status === 'Pending' || apt.status === 'Pending Doctor Acceptance') {
          list.push({
            id: `doc_req_${apt.id}`,
            title: `Consultation Request: ${apt.patientName || 'Patient'}`,
            message: `New booking for ${apt.condition || 'Consultation'} on ${apt.date} at ${apt.time}. Requires doctor approval.`,
            type: 'appointment_update',
            category: 'request',
            time: 'Pending Review',
            unread: true,
            link: '/'
          });
        } else if (apt.status === 'Confirmed' || apt.status === 'Accepted') {
          list.push({
            id: `doc_apt_${apt.id}`,
            title: `Upcoming Appointment: ${apt.patientName || 'Patient'}`,
            message: `Scheduled for ${apt.date} at ${apt.time} (${apt.type || 'OPD'}). Token: ${apt.tokenNo || 'Standard'}.`,
            type: 'appointment_reminder',
            category: 'appointment',
            time: apt.time,
            unread: false,
            link: '/'
          });
        }
      });
      return list.length > 0 ? list : [
        {
          id: 'doc_empty',
          title: 'Schedule Up to Date',
          message: 'No pending appointment requests in your clinical queue.',
          type: 'general',
          category: 'all',
          time: 'Now',
          unread: false,
          link: '/'
        }
      ];
    }

    if (userRole === 'hospital') {
      // For hospital staff: New patient medicine orders, orders awaiting action, billing-related notifications
      const list = [];
      (orders || []).forEach((ord) => {
        if (ord.status === 'Pending') {
          list.push({
            id: `hosp_ord_${ord.id}`,
            title: `New Medicine Order: ${ord.orderNumber}`,
            message: `Patient ${ord.patientName || 'Patient'} ordered ${ord.items?.length || 1} items (${ord.total ? '₹' + ord.total : 'Awaiting quote'}). Awaiting review.`,
            type: 'order_action',
            category: 'order',
            time: ord.orderTime || 'Recent',
            unread: true,
            link: '/pharmacy-bills'
          });
        } else if (!ord.billed && ord.status !== 'Cancelled') {
          list.push({
            id: `hosp_bill_due_${ord.id}`,
            title: `Order Awaiting Billing: ${ord.orderNumber}`,
            message: `Order approved (${ord.status}). Official pharmacy bill ready for counter issuance.`,
            type: 'billing_notification',
            category: 'billing',
            time: 'Action Required',
            unread: true,
            link: '/pharmacy-bills'
          });
        }
      });

      (hospitalBills || []).slice(0, 3).forEach((b) => {
        list.push({
          id: `hosp_bill_${b.id}`,
          title: `Bill Recorded: ${b.billNo}`,
          message: `${b.patientName || 'Patient'} • ${b.type || 'Pharmacy'} Bill total ${b.amount || '₹' + b.subtotal}. Status: ${b.status || 'Paid'}.`,
          type: 'billing_notification',
          category: 'billing',
          time: b.date || 'Recent',
          unread: false,
          link: '/hospital-bills'
        });
      });

      return list.length > 0 ? list : [
        {
          id: 'hosp_empty',
          title: 'All Orders Processed',
          message: 'No patient medicine orders currently awaiting hospital action.',
          type: 'general',
          category: 'all',
          time: 'Now',
          unread: false,
          link: '/pharmacy-bills'
        }
      ];
    }

    // Default: Patient role
    // Medicine reminders, appointment reminders, vaccination reminders, order status updates
    const patientList = [];

    // 1. Medicine reminders
    (medicineReminders || []).filter((r) => r.active !== false).forEach((r) => {
      patientList.push({
        id: `med_rem_${r.id}`,
        title: `Medicine Reminder: ${r.medicineName}`,
        message: `Scheduled at ${r.time}. ${r.instructions || r.frequency || 'Take as advised.'}`,
        type: 'medicine_reminder',
        category: 'medicine',
        time: r.time,
        unread: !r.taken,
        link: '/reminders'
      });
    });

    // 2. Appointment reminders
    (appointments || []).filter((a) => a.status !== 'Cancelled' && a.status !== 'Declined').forEach((a) => {
      patientList.push({
        id: `apt_rem_${a.id}`,
        title: `Appointment: Dr. ${a.doctor}`,
        message: `${a.type === 'Online' ? '📹 Online Consultation' : '🏥 OPD Visit'} on ${a.date} at ${a.time} at ${a.hospital}. Status: ${a.status}.`,
        type: 'appointment_reminder',
        category: 'appointment',
        time: a.date,
        unread: a.status === 'Accepted' || a.status === 'Confirmed',
        link: '/appointments?tab=scheduled'
      });
    });

    // 3. Vaccination reminders
    (vaccinations || []).filter((v) => v.reminderEnabled).forEach((v) => {
      patientList.push({
        id: `vac_rem_${v.id}`,
        title: `Vaccination Alert: ${v.name}`,
        message: `Due on ${v.date} at ${v.administeredBy} (${v.dose || 'Dose'}).`,
        type: 'vaccination_reminder',
        category: 'vaccination',
        time: v.date,
        unread: true,
        link: '/vaccinations'
      });
    });

    // 4. Order status updates
    (orders || []).slice(0, 3).forEach((ord) => {
      patientList.push({
        id: `ord_status_${ord.id}`,
        title: `Medicine Order: ${ord.orderNumber}`,
        message: `Current Status: ${ord.status.toUpperCase()}. ${ord.billed ? 'Official bill generated.' : 'Under pharmacy processing.'}`,
        type: 'order_update',
        category: 'order',
        time: ord.orderDate || 'Recent',
        unread: ord.status === 'Ready' || ord.status === 'Confirmed',
        link: '/medicines'
      });
    });

    return patientList.length > 0 ? patientList : (notifications || []);
  }, [userRole, appointments, orders, medicineReminders, vaccinations, hospitalBills, notifications, user]);

  const roleUnreadCount = roleNotifications.filter((n) => n.unread).length;

  const filteredNotifications = roleNotifications.filter((n) => {
    if (notifCategory === 'all') return true;
    return n.category === notifCategory || n.type?.includes(notifCategory);
  });

  const getPageTitle = (pathname) => {
    if (pathname === '/') {
      if (!user) return 'Welcome to MediCare+';
      if (user.role === 'hospital') return 'KMCH Hospital Management Portal';
      if (user.role === 'doctor') return 'Doctor Consultation Console';
      return 'Patient Dashboard';
    }
    if (pathname.startsWith('/medicines')) return 'Medicines Catalog';
    if (pathname === '/routine-medicines') return 'My Routine Medicines';
    if (pathname === '/prescriptions') return 'Prescriptions';
    if (pathname === '/medical-history-reports') return 'Medical History & Reports';
    if (pathname === '/health-records') return 'Medical Reports & Records';
    if (pathname === '/medical-history') return 'Medical History';
    if (pathname === '/appointments') return 'Appointments';
    if (pathname === '/notifications') return 'Centralized Notifications';
    if (pathname === '/reminders') return 'Pill Reminders & Schedule';
    if (pathname === '/diet-plan') return 'Diet Plan';
    if (pathname === '/vaccinations') return 'Vaccination Tracker';
    if (pathname === '/nearby') return 'Hospitals & Doctors';
    if (pathname === '/hospital-bills') return '🏥 Hospital Bills System';
    if (pathname === '/pharmacy-bills') return '💊 Pharmacy Bills System';
    if (pathname === '/profile') return user?.role === 'doctor' ? 'Doctor Profile' : user?.role === 'hospital' ? 'Hospital Profile' : 'My Patient Profile';
    if (pathname === '/login') return 'MediCare+ Portal Sign In';
    if (pathname === '/hospital-login') return 'Hospital Management Sign In';
    return 'MediCare+';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle(location.pathname)}</h1>
      </div>

      {/* Global Search Bar */}
      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search medicines, doctors, hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="navbar-right">
        {/* Public Navigation Links when not logged in */}
        {!user && (
          <div className="public-nav-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/" className={`public-nav-item ${location.pathname === '/' ? 'active' : ''}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: location.pathname === '/' ? 'var(--primary-600)' : 'var(--neutral-700)', padding: '0.4rem 0.6rem' }}>
              Home
            </Link>
            <Link to="/medicines" className={`public-nav-item ${location.pathname.startsWith('/medicines') ? 'active' : ''}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: location.pathname.startsWith('/medicines') ? 'var(--primary-600)' : 'var(--neutral-700)', padding: '0.4rem 0.6rem' }}>
              Medicines
            </Link>
            <Link to="/nearby" className={`public-nav-item ${location.pathname === '/nearby' ? 'active' : ''}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: location.pathname === '/nearby' ? 'var(--primary-600)' : 'var(--neutral-700)', padding: '0.4rem 0.6rem' }}>
              Hospitals & Doctors
            </Link>
          </div>
        )}

        {/* Logged in User Notifications Dropdown (Bell at Top-Right) */}
        {user && (
          <div className="notifications-wrapper" style={{ position: 'relative' }}>
            <button
              className={`navbar-icon-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              title="Reminders & Notifications"
              style={{ position: 'relative' }}
              aria-label="Patient Reminders"
            >
              <Bell size={20} />
              {roleUnreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    backgroundColor: '#e11d48',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 1px 4px rgba(225, 29, 72, 0.4)'
                  }}
                >
                  {roleUnreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="dropdown-panel notifications-panel fade-in"
                style={{
                  width: '380px',
                  maxWidth: '92vw',
                  right: 0,
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: 0,
                  overflow: 'hidden',
                  zIndex: 1000
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'var(--neutral-900)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} style={{ color: '#38bdf8' }} />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>
                      {userRole === 'doctor' ? 'Clinical Alerts' : userRole === 'hospital' ? 'Hospital Notifications' : 'Reminders & Alerts'}
                    </h4>
                    {roleUnreadCount > 0 ? (
                      <span className="badge" style={{ backgroundColor: '#e11d48', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                        {roleUnreadCount} Unread
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#059669', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                        All Caught Up
                      </span>
                    )}
                  </div>

                  {roleUnreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead && markAllNotificationsAsRead()}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.725rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} /> Mark All Read
                    </button>
                  )}
                </div>

                {/* Role-Specific Filter Tabs */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.35rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--neutral-50)',
                    borderBottom: '1px solid var(--border-subtle)',
                    overflowX: 'auto'
                  }}
                >
                  {(userRole === 'doctor' ? [
                    { id: 'all', label: 'All' },
                    { id: 'request', label: '⏳ Requests' },
                    { id: 'appointment', label: '📅 Scheduled' }
                  ] : userRole === 'hospital' ? [
                    { id: 'all', label: 'All' },
                    { id: 'order', label: '📦 Orders' },
                    { id: 'billing', label: '💳 Bills' }
                  ] : [
                    { id: 'all', label: 'All' },
                    { id: 'medicine', label: '💊 Medicines' },
                    { id: 'appointment', label: '📅 Appts' },
                    { id: 'vaccination', label: '💉 Vaccines' },
                    { id: 'order', label: '📦 Orders' }
                  ]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setNotifCategory(tab.id)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: notifCategory === tab.id ? 'var(--primary-600)' : 'transparent',
                        color: notifCategory === tab.id ? 'white' : 'var(--neutral-600)',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Reminders List */}
                <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n) => {
                      const isMed = n.type?.includes('medicine') || n.category === 'medicine';
                      const isApt = n.type?.includes('appointment') || n.category === 'appointment';
                      const isVac = n.type?.includes('vaccination') || n.category === 'vaccination';
                      const isOrd = n.type?.includes('order') || n.category === 'order';
                      const isBill = n.type?.includes('billing') || n.category === 'billing';

                      const iconBg = isMed ? '#fef3c7' : isApt ? '#ecfdf5' : isVac ? '#f3e8ff' : isOrd ? '#ede9fe' : isBill ? '#dcfce7' : '#e0f2fe';
                      const iconColor = isMed ? '#d97706' : isApt ? '#059669' : isVac ? '#9333ea' : isOrd ? '#7c3aed' : isBill ? '#15803d' : '#0284c7';
                      const IconComponent = isMed ? Pill : isApt ? CalendarCheck : isVac ? Syringe : isOrd ? ShoppingBag : isBill ? Receipt : Bell;

                      return (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start',
                            backgroundColor: n.unread ? 'rgba(239, 246, 255, 0.6)' : 'transparent',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            position: 'relative'
                          }}
                          onClick={() => {
                            if (markNotificationAsRead) markNotificationAsRead(n.id);
                            setShowNotifications(false);
                            if (n.link) {
                              navigate(n.link);
                            }
                          }}
                        >
                          {/* Left Icon */}
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: iconBg,
                              color: iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          >
                            <IconComponent size={18} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span
                                style={{
                                  fontSize: '0.675rem',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  color: iconColor
                                }}
                              >
                                {isMed ? 'Medicine Schedule' : isApt ? 'Appointment' : isVac ? 'Immunization' : isOrd ? 'Medicine Order' : isBill ? 'Billing' : 'Alert'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                                {n.time}
                              </span>
                            </div>

                            <p
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: n.unread ? '800' : '600',
                                color: n.unread ? 'var(--neutral-900)' : 'var(--neutral-700)',
                                margin: '0 0 0.15rem 0',
                                lineHeight: 1.35
                              }}
                            >
                              {n.title}
                            </p>

                            <p
                              style={{
                                fontSize: '0.775rem',
                                color: 'var(--text-muted)',
                                margin: 0,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {n.message}
                            </p>
                          </div>

                          {/* Read / Unread Indicator & Toggle */}
                          <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flexShrink: 0, marginLeft: '0.25rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (toggleNotificationRead) {
                                toggleNotificationRead(n.id);
                              } else if (markNotificationAsRead) {
                                markNotificationAsRead(n.id);
                              }
                            }}
                            title={n.unread ? 'Click to mark as Read' : 'Click to mark as Unread'}
                          >
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: n.unread ? '#2563eb' : '#94a3b8',
                                boxShadow: n.unread ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: n.unread ? '#2563eb' : 'var(--text-light)' }}>
                              {n.unread ? 'Unread' : 'Read'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={32} style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>No notifications in this category</p>
                      <span style={{ fontSize: '0.75rem' }}>You're completely up to date</span>
                    </div>
                  )}
                </div>

                {/* Footer Shortcuts */}
                <div
                  style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: 'var(--neutral-50)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                    Showing {filteredNotifications.length} items
                  </span>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/reminders'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                    >
                      Pill Schedule →
                    </button>
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/vaccinations'); }}
                      style={{ background: 'none', border: 'none', color: '#9333ea', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                    >
                      Vaccines →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logged in User Profile Dropdown OR Public Login Button */}
        {user ? (
          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
            >
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={user.name} className="nav-user-avatar" />
              <span className="nav-user-name">
                {user.role === 'hospital' ? user.name : `Welcome, ${user.name}`}
              </span>
              <ChevronDown size={16} />
            </button>

            {showUserDropdown && (
              <div className="dropdown-panel user-panel fade-in">
                <div className="user-panel-info">
                  <p className="user-panel-name">{user.name}</p>
                  <p className="user-panel-email">{user.email}</p>
                  {user.role === 'patient' && (
                    <div className="user-panel-tags">
                      <span className="badge badge-success">ID: {user.medicalID || 'MC-8942-021'}</span>
                      <span className="badge badge-info">{user.bloodGroup || 'O+'}</span>
                    </div>
                  )}
                  {user.role === 'hospital' && (
                    <div className="user-panel-tags">
                      <span className="badge badge-info">KMCH Hospital</span>
                    </div>
                  )}
                </div>
                <div className="user-panel-divider"></div>
                {user.role === 'patient' && (
                  <>
                    <button className="dropdown-item" onClick={() => { navigate('/routine-medicines'); setShowUserDropdown(false); }}>
                      <Pill size={16} />
                      <span>My Routine Medicines</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/prescriptions'); setShowUserDropdown(false); }}>
                      <FileText size={16} />
                      <span>My Prescriptions</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/appointments'); setShowUserDropdown(false); }}>
                      <CalendarCheck size={16} />
                      <span>Appointments</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}>
                      <User size={16} />
                      <span>My Health Profile</span>
                    </button>
                  </>
                )}
                <button className="dropdown-item danger" onClick={() => { logout(); navigate('/'); setShowUserDropdown(false); }}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="login-dropdown-wrapper" style={{ position: 'relative' }}>
            <Button
              variant="primary"
              size="md"
              icon={LogIn}
              onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            >
              Login <ChevronDown size={14} />
            </Button>

            {showLoginDropdown && (
              <div className="dropdown-panel fade-in" style={{ right: 0, width: '220px', padding: '0.5rem' }}>
                <button
                  className="dropdown-item"
                  onClick={() => { navigate('/login'); setShowLoginDropdown(false); }}
                  style={{ display: 'flex', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  <User size={18} className="text-primary" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>Patient Login</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OTP Authentication</div>
                  </div>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => { navigate('/hospital-login'); setShowLoginDropdown(false); }}
                  style={{ display: 'flex', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem', marginTop: '0.25rem' }}
                >
                  <Building2 size={18} style={{ color: '#0284c7' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>Hospital Login</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KMCH Portal</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

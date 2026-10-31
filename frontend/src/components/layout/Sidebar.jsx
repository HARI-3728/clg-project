import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  FileText,
  Activity,
  Bell,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  LogIn,
  ShieldAlert,
  Building2,
  CalendarCheck,
  Calendar,
  Clock,
  ShoppingBag,
  Syringe,
  History,
  FileSpreadsheet,
  Utensils,
  Receipt,
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePatientData } from '../../context/PatientContext';
import './layout.css';

export const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const { prescriptions, unreadNotificationsCount } = usePatientData();
  const navigate = useNavigate();

  const activeRxCount = prescriptions.filter((r) => r.status.toUpperCase() === 'ACTIVE').length;

  let navItems = [];

  if (!user) {
    // Public Navigation (No Emergency Menu)
    navItems = [
      { label: 'Home', path: '/', icon: LayoutDashboard },
      { label: 'Medicines', path: '/medicines', icon: Pill },
      { label: 'Hospitals & Doctors', path: '/nearby', icon: Building2 },
      { label: 'Sign In', path: '/login', icon: LogIn }
    ];
  } else if (user.role === 'hospital') {
    // Hospital Navigation (Billing & Pharmacy, Hospital Bills, Doctors & OPD)
    navItems = [
      { label: 'Hospital Dashboard', path: '/', icon: Building2 },
      { label: 'Billing & Pharmacy', path: '/pharmacy-bills', icon: Receipt },
      { label: 'Hospital Bills', path: '/hospital-bills', icon: FileText },
      { label: 'Doctors & OPD', path: '/appointments', icon: CalendarCheck },
      { label: 'Hospitals & Doctors', path: '/nearby', icon: MapPin }
    ];
  } else if (user.role === 'doctor') {
    // Doctor Navigation
    navItems = [
      { label: 'Doctor Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Appointments & OPD', path: '/appointments', icon: CalendarCheck },
      { label: 'Prescriptions', path: '/prescriptions', icon: FileText },
      { label: 'Patient Records', path: '/medical-history-reports', icon: History },
      { label: 'Hospitals & Network', path: '/nearby', icon: Building2 },
      { label: 'Doctor Profile', path: '/profile', icon: User }
    ];
  } else {
    // Patient Navigation (Full Healthcare Suite)
    navItems = [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Book Appointment', path: '/appointments?tab=book', icon: Calendar },
      { label: 'Scheduled Appointments', path: '/appointments?tab=scheduled', icon: CalendarCheck },
      { label: 'Book Check-ups & Scans', path: '/checkups-scans', icon: Activity },
      { label: 'Order Medicines', path: '/medicines', icon: ShoppingBag },
      { label: 'Prescriptions', path: '/prescriptions', icon: FileText, badge: activeRxCount ? `${activeRxCount}` : null, badgeVariant: 'success' },
      { label: 'Routine Medicines', path: '/routine-medicines', icon: Pill },
      { label: 'Medicine Reminders', path: '/reminders', icon: Clock },
      { label: 'Vaccination Reminders', path: '/vaccinations', icon: Syringe },
      { label: 'Diet Plan', path: '/diet-plan', icon: Utensils },
      { label: 'Medical History', path: '/medical-history', icon: History },
      { label: 'Health Records', path: '/health-records', icon: FileSpreadsheet },
      { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null, badgeVariant: 'primary' },
      { label: 'Nearby Healthcare', path: '/nearby', icon: MapPin },
      { label: 'Emergency 24x7', path: '/emergency', icon: ShieldAlert },
      { label: 'Profile', path: '/profile', icon: User }
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getSectionTitle = () => {
    if (!user) return 'PUBLIC MENU';
    if (user.role === 'hospital') return 'HOSPITAL MENU';
    if (user.role === 'doctor') return 'DOCTOR MENU';
    return 'PATIENT MENU';
  };

  const getUserSubtitle = () => {
    if (user.role === 'hospital') return 'KMCH Hospital';
    if (user.role === 'doctor') return `${user.specialty || 'Specialist'} • ${user.hospital || 'Hospital'}`;
    return `Blood: ${user.bloodGroup || 'O+'}`;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Stethoscope size={24} />
        </div>
        {!isCollapsed && (
          <div className="brand-info">
            <span className="brand-name">MediCare<span className="brand-plus">+</span></span>
            <span className="brand-tagline">Healthcare Portal</span>
          </div>
        )}
        <button className="collapse-toggle" onClick={toggleCollapse} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">{!isCollapsed ? getSectionTitle() : '•'}</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              end={item.path === '/'}
            >
              <Icon className="nav-icon" size={20} />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className={`nav-badge ${item.badgeVariant ? `badge-${item.badgeVariant}` : ''}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Bar / Logout */}
      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="user-profile-widget">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={user.name} className="user-avatar" />
              {!isCollapsed && (
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-blood-group">{getUserSubtitle()}</span>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <NavLink to="/login" style={{ width: '100%' }}>
              <button className="nav-item active" style={{ width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <LogIn size={18} />
                {!isCollapsed && <span>Sign In</span>}
              </button>
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Stethoscope,
  LayoutDashboard,
  Pill,
  FileText,
  Activity,
  Bell,
  MapPin,
  LogOut,
  PhoneCall,
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

export const MobileNavbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadNotificationsCount, prescriptions } = usePatientData();
  const navigate = useNavigate();

  const activeRxCount = prescriptions ? prescriptions.filter((r) => r.status.toUpperCase() === 'ACTIVE').length : 0;

  let drawerItems = [];
  let bottomNavItems = [];

  if (!user) {
    drawerItems = [
      { label: 'Home', path: '/', icon: LayoutDashboard },
      { label: 'Medicines', path: '/medicines', icon: Pill },
      { label: 'Hospitals & Doctors', path: '/nearby', icon: Building2 },
      { label: 'Sign In', path: '/login', icon: LogIn }
    ];

    bottomNavItems = [
      { label: 'Home', path: '/', icon: LayoutDashboard },
      { label: 'Medicines', path: '/medicines', icon: Pill },
      { label: 'Doctors', path: '/nearby', icon: Building2 },
      { label: 'Sign In', path: '/login', icon: LogIn }
    ];
  } else if (user.role === 'hospital') {
    drawerItems = [
      { label: 'Hospital Dashboard', path: '/', icon: Building2 },
      { label: '🏥 Hospital Bills', path: '/hospital-bills', icon: Receipt },
      { label: '💊 Pharmacy Bills', path: '/pharmacy-bills', icon: FileText },
      { label: 'Hospitals & Doctors', path: '/nearby', icon: MapPin }
    ];

    bottomNavItems = [
      { label: 'Home', path: '/', icon: Building2 },
      { label: 'H.Bills', path: '/hospital-bills', icon: Receipt },
      { label: 'Rx.Bills', path: '/pharmacy-bills', icon: FileText },
      { label: 'Doctors', path: '/nearby', icon: MapPin }
    ];
  } else if (user.role === 'doctor') {
    drawerItems = [
      { label: 'Doctor Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Appointments & OPD', path: '/appointments', icon: CalendarCheck },
      { label: 'Prescriptions', path: '/prescriptions', icon: FileText },
      { label: 'Patient Records', path: '/medical-history-reports', icon: History },
      { label: 'Hospitals & Network', path: '/nearby', icon: Building2 },
      { label: 'Profile', path: '/profile', icon: User }
    ];

    bottomNavItems = [
      { label: 'Home', path: '/', icon: LayoutDashboard },
      { label: 'Appts', path: '/appointments', icon: CalendarCheck },
      { label: 'Rx', path: '/prescriptions', icon: FileText },
      { label: 'Records', path: '/medical-history-reports', icon: History },
      { label: 'Profile', path: '/profile', icon: User }
    ];
  } else {
    // Patient Navigation (Full Healthcare Suite)
    drawerItems = [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Book Appointment', path: '/appointments?tab=book', icon: Calendar },
      { label: 'Scheduled Appointments', path: '/appointments?tab=scheduled', icon: CalendarCheck },
      { label: 'Book Check-ups & Scans', path: '/checkups-scans', icon: Activity },
      { label: 'Order Medicines', path: '/medicines', icon: ShoppingBag },
      { label: 'Prescriptions', path: '/prescriptions', icon: FileText, badge: activeRxCount ? `${activeRxCount}` : null },
      { label: 'Routine Medicines', path: '/routine-medicines', icon: Pill },
      { label: 'Medicine Reminders', path: '/reminders', icon: Clock },
      { label: 'Vaccination Reminders', path: '/vaccinations', icon: Syringe },
      { label: 'Diet Plan', path: '/diet-plan', icon: Utensils },
      { label: 'Medical History', path: '/medical-history', icon: History },
      { label: 'Health Records', path: '/health-records', icon: FileSpreadsheet },
      { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null },
      { label: 'Nearby Healthcare', path: '/nearby', icon: MapPin },
      { label: 'Emergency 24x7', path: '/emergency', icon: ShieldAlert },
      { label: 'Profile', path: '/profile', icon: User }
    ];

    bottomNavItems = [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Book Appt', path: '/appointments?tab=book', icon: Calendar },
      { label: 'Check-ups', path: '/checkups-scans', icon: Activity },
      { label: 'Medicines', path: '/medicines', icon: ShoppingBag },
      { label: 'Profile', path: '/profile', icon: User }
    ];
  }

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    setIsDrawerOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-drawer-toggle"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="mobile-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Stethoscope size={22} className="mobile-brand-icon" />
            <span className="mobile-brand-name">MediCare+</span>
          </div>
        </div>

        <div className="mobile-header-right">
          {user ? (
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary-500)' }}
              />
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="mobile-drawer fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-brand">
                <Stethoscope size={24} className="mobile-brand-icon" />
                <span className="mobile-brand-name">MediCare+</span>
              </div>
              <button
                className="mobile-drawer-close"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="mobile-user-card">
                <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={user.name} />
                <div>
                  <p className="mobile-user-name">{user.name}</p>
                  <p className="mobile-user-sub">
                    {user.role === 'hospital' ? 'KMCH Hospital Portal' : `ID: ${user.medicalID || 'MC-8942'} • Blood: ${user.bloodGroup}`}
                  </p>
                </div>
              </div>
            )}

            <nav className="mobile-drawer-nav">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                    end={item.path === '/'}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge badge-warning" style={{ marginLeft: 'auto' }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mobile-drawer-footer">
              {user ? (
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              ) : (
                <button className="mobile-logout-btn" style={{ background: 'var(--primary-600)', color: 'white' }} onClick={() => { setIsDrawerOpen(false); navigate('/login'); }}>
                  <LogIn size={18} />
                  <span>Sign In / Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="mobile-bottom-bar">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bottom-bar-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

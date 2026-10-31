import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  Video,
  FileText,
  Utensils,
  FileSpreadsheet,
  Trash2,
  CheckCheck,
  ArrowRight,
  Clock,
  Pill
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const Notifications = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
  } = usePatientData();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MEDICINE') return notif.type === 'medicine_reminder';
    if (activeFilter === 'PRESCRIPTION') return notif.type === 'prescription_reminder';
    if (activeFilter === 'DIET') return notif.type === 'diet_reminder';
    if (activeFilter === 'APPOINTMENTS') return notif.type === 'online_appointment' || notif.type === 'offline_appointment';
    if (activeFilter === 'REPORTS') return notif.type === 'medical_report';
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'medicine_reminder':
        return <Pill size={18} color="#d97706" />;
      case 'prescription_reminder':
        return <FileText size={18} color="var(--primary-600)" />;
      case 'diet_reminder':
        return <Utensils size={18} color="#7c3aed" />;
      case 'online_appointment':
        return <Video size={18} color="#059669" />;
      case 'offline_appointment':
        return <CalendarCheck size={18} color="#0284c7" />;
      case 'medical_report':
        return <FileSpreadsheet size={18} color="#059669" />;
      default:
        return <Bell size={18} color="var(--primary-600)" />;
    }
  };

  const getNotifBadge = (type) => {
    switch (type) {
      case 'medicine_reminder':
        return <span className="badge badge-warning">Medicine Reminder</span>;
      case 'prescription_reminder':
        return <span className="badge badge-info">Prescription Alert</span>;
      case 'diet_reminder':
        return <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>Diet-Plan Reminder</span>;
      case 'online_appointment':
        return <span className="badge badge-success">Online Consultation</span>;
      case 'offline_appointment':
        return <span className="badge badge-info">Upcoming OPD Visit</span>;
      case 'medical_report':
        return <span className="badge badge-success">Medical Report</span>;
      default:
        return <span className="badge badge-neutral">Notification</span>;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="notifications-page fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Centralized Notifications</h1>
          <p className="page-subtitle">
            Reminders for medicines, prescriptions, diet plans, online consultation approvals & upcoming appointments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllNotificationsAsRead}>
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" icon={Trash2} onClick={clearAllNotifications} style={{ color: '#e11d48' }}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'ALL', label: `All (${notifications.length})` },
          { id: 'MEDICINE', label: 'Medicine Reminders' },
          { id: 'PRESCRIPTION', label: 'Prescriptions' },
          { id: 'DIET', label: 'Diet-Plan Reminders' },
          { id: 'APPOINTMENTS', label: 'Appointments & Doctor Approvals' },
          { id: 'REPORTS', label: 'Medical Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeFilter === tab.id ? 'var(--primary-600)' : 'var(--surface-card)',
              color: activeFilter === tab.id ? 'white' : 'var(--neutral-700)',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                backgroundColor: notif.unread ? 'var(--primary-50)' : 'var(--surface-card)',
                border: notif.unread ? '1.5px solid var(--primary-200)' : '1px solid var(--border-subtle)',
                transition: 'all 0.2s'
              }}
            >
              {/* Icon Container */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getNotifIcon(notif.type)}
              </div>

              {/* Notification Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getNotifBadge(notif.type)}
                    {notif.unread && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', display: 'inline-block' }}></span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {notif.time}
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0.2rem 0' }}>
                  {notif.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--neutral-700)', margin: 0, lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                {/* Bottom Action Links */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
                  {notif.link && (
                    <button
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        navigate(notif.link);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--primary-600)',
                        fontWeight: '800',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      View Details & Action <ArrowRight size={14} />
                    </button>
                  )}

                  {notif.unread && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.775rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.775rem',
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                    title="Dismiss notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)', marginBottom: '2.5rem' }}>
          <Bell size={44} style={{ color: 'var(--neutral-400)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>No Notifications Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            All caught up! You will receive timely alerts for medicine schedules, doctor approvals, and test results.
          </p>
        </div>
      )}
    </div>
  );
};

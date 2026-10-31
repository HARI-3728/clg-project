import React from 'react';
import { PhoneCall, ShieldAlert, Ambulance, HeartPulse, Building2, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { mockNearbyHealthcare } from '../data/mockData';
import './pages.css';

export const Emergency = () => {
  const emergencyHospitals = mockNearbyHealthcare.filter(h => h.emergency24x7);

  return (
    <div className="emergency-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* SOS Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #e11d48, #be123c)',
        color: 'white',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        boxShadow: '0 12px 28px rgba(225, 29, 72, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <ShieldAlert size={16} /> 24/7 EMERGENCY RESPONSE
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2' }}>Need Immediate Medical Assistance?</h1>
          <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '1rem', maxWidth: '600px' }}>
            Call emergency responders or connect with nearest trauma centers instantly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="tel:108" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg" icon={PhoneCall} style={{ background: 'white', color: '#be123c', fontWeight: '900', border: 'none' }}>
              🚨 EMERGENCY [ CALL 108 ]
            </Button>
          </a>
          <a href="tel:911" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="lg" icon={Ambulance} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: '800' }}>
              Call 911 SOS
            </Button>
          </a>
        </div>
      </div>

      {/* Emergency Hotline Numbers */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--neutral-900)' }}>
        Emergency Helplines & Numbers
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <Card style={{ padding: '1.25rem', borderLeft: '5px solid #e11d48' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ambulance size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>National Ambulance Service</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#e11d48' }}>108 / 112</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '5px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>KMCH Emergency Trauma</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-700)' }}>+91 422 432 3800</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>24x7 Poison Control & Helpline</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>1800-11-6117</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* 24x7 Emergency Hospitals */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--neutral-900)' }}>
        24x7 Emergency Hospitals & Centers
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {emergencyHospitals.map(hosp => (
          <Card key={hosp.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={hosp.image} alt={hosp.name} style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
              <div>
                <span className="badge badge-danger" style={{ marginBottom: '0.25rem' }}>24x7 Emergency Ready</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)' }}>{hosp.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {hosp.address} ({hosp.distance})
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {hosp.services.map((svc, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{svc}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <a href={`tel:${hosp.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                <Button variant="primary" size="sm" icon={PhoneCall} style={{ width: '100%' }}>
                  Call Emergency Desk
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

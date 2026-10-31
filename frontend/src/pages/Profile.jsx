import React from 'react';
import { User, Mail, Phone, ShieldCheck, Stethoscope, Building2, Calendar, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export const Profile = () => {
  const { user } = useAuth();
  const profile = user || {
    name: 'Patient',
    email: 'patient@medicare.com',
    role: 'patient',
    bloodGroup: 'O+',
    age: 28,
    emergencyContact: '+91 98765 43210',
    medicalID: 'MC-8942-021'
  };

  const isDoctor = profile.role === 'doctor';
  const isHospital = profile.role === 'hospital';

  return (
    <div className="profile-page fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">
            {isDoctor ? 'Doctor Profile' : isHospital ? 'Hospital Profile' : 'Patient Profile'}
          </h1>
          <p className="page-subtitle">
            {isDoctor
              ? 'Medical practitioner accreditation & clinical schedule'
              : isHospital
              ? 'Healthcare facility certification & institutional details'
              : 'Personal information & medical health records'}
          </p>
        </div>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <img
            src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profile.name}
            style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '3px solid var(--primary-600)' }}
          />
          <div>
            <span className={`badge ${isDoctor ? 'badge-info' : isHospital ? 'badge-primary' : 'badge-success'}`}>
              {isDoctor
                ? `Reg. No: ${profile.medicalRegNo || 'TNMC-48821'}`
                : isHospital
                ? `Reg: ${profile.registrationNo || 'CBE-HOSP-1990'}`
                : `Patient ID: ${profile.medicalID || 'MC-8942-021'}`}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.25rem', color: 'var(--neutral-900)' }}>
              {profile.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {profile.email} • {profile.contact || profile.emergencyContact || '+91 98765 43210'}
            </p>
          </div>
        </div>

        {/* Doctor Specific Details */}
        {isDoctor && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medical Specialty</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                {profile.specialty || 'General Physician'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Affiliated Hospital</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.hospital || 'KMCH Hospital'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857' }}>
                {profile.fee || '₹500'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clinical Availability</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.availability || '10:00 AM - 01:00 PM'}
              </h3>
            </div>
          </div>
        )}

        {/* Hospital Specific Details */}
        {isHospital && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Institution Category</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                {profile.type || 'Multi-Specialty Super Hospital'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary Campus</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.location || 'Avinashi Road, Coimbatore'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official Contact</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.emergencyPhone || '+91 422 432 3800'}
              </h3>
            </div>
          </div>
        )}

        {/* Patient Specific Details */}
        {!isDoctor && !isHospital && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood Group</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                {profile.bloodGroup || 'O+'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age / Gender</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.age || '28'} Yrs / {profile.gender || 'Male'}
              </h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Height / Weight</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)' }}>
                {profile.height || '172 cm'} / {profile.weight || '68 kg'}
              </h3>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

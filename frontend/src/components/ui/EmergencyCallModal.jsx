import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Ambulance, Building2, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { usePatientData } from '../../context/PatientContext';

export const EmergencyCallModal = ({ isOpen, onClose }) => {
  const [callInitiated, setCallInitiated] = useState(false);
  const { triggerEmergencyCall } = usePatientData();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setCallInitiated(true);
    if (triggerEmergencyCall) {
      triggerEmergencyCall();
    }
    // Trigger telephone anchor after brief confirmation feedback
    setTimeout(() => {
      window.location.href = 'tel:108';
    }, 600);
  };

  const handleClose = () => {
    setCallInitiated(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🚨 Emergency Call Confirmation"
      subtitle="Immediate 24x7 Ambulance & Medical Response"
    >
      <div style={{ padding: '0.5rem 0' }}>
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1.5px solid #fecdd3',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#be123c', margin: '0 0 0.25rem 0' }}>
              Confirm Emergency Assistance Request?
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#9f1239', margin: 0, lineHeight: 1.5 }}>
              This will immediately dial the <strong>National Ambulance Hotline (108)</strong> for urgent medical dispatch and notify nearby trauma care facilities.
            </p>
          </div>
        </div>

        {/* Emergency Centers in Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--neutral-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e11d48', fontWeight: '800', fontSize: '0.85rem' }}>
              <Ambulance size={16} /> 108 AMBULANCE
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', marginTop: '0.2rem' }}>
              Dial 108 / 112
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toll-free 24/7 Priority</span>
          </div>

          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--neutral-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: '800', fontSize: '0.85rem' }}>
              <Building2 size={16} /> KMCH TRAUMA
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--neutral-900)', marginTop: '0.2rem' }}>
              +91 422 432 3800
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avinashi Road, Coimbatore</span>
          </div>
        </div>

        {callInitiated ? (
          <div style={{
            textAlign: 'center',
            padding: '1.25rem',
            backgroundColor: '#dcfce7',
            borderRadius: 'var(--radius-md)',
            color: '#15803d',
            fontWeight: '800'
          }}>
            <p style={{ margin: 0 }}>📞 Initiating Emergency Call to 108...</p>
            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Please stay on the line with the emergency responder.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <Button variant="outline" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={PhoneCall}
              onClick={handleConfirm}
              style={{
                backgroundColor: '#e11d48',
                borderColor: '#e11d48',
                color: 'white',
                fontWeight: '800'
              }}
            >
              Confirm Emergency Call
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

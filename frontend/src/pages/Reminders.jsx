import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Check,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const Reminders = () => {
  const {
    medicineReminders = [],
    addMedicineReminder,
    editMedicineReminder,
    deleteMedicineReminder,
    toggleMedicineReminder,
    prescriptions = []
  } = usePatientData();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Form fields
  const [selectedRxId, setSelectedRxId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState('Once Daily (Morning)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [verificationNotice, setVerificationNotice] = useState('');

  // Open modal for new reminder
  const handleOpenAddModal = (fromRx = null) => {
    setEditingReminder(null);
    if (fromRx) {
      setSelectedRxId(fromRx.id);
      setMedicineName(fromRx.medicineName || '');
      setInstructions(fromRx.instructions || '');
      setFrequency(fromRx.frequency || 'Twice Daily (Morning + Night)');
      setTime('08:00 AM');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(fromRx.expiryDate || '');
      setIsActive(true);
      setVerificationNotice('Verified details imported from Dr. ' + (fromRx.doctorName || 'Doctor') + '. Please verify and adjust your preferred intake time and schedule.');
    } else {
      setSelectedRxId('');
      setMedicineName('');
      setInstructions('');
      setTime('08:00 AM');
      setFrequency('Once Daily (Morning)');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setIsActive(true);
      setVerificationNotice('');
    }
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (rem) => {
    setEditingReminder(rem);
    setSelectedRxId(rem.prescriptionId || '');
    setMedicineName(rem.medicineName || '');
    setInstructions(rem.instructions || '');
    setTime(rem.time || '08:00 AM');
    setFrequency(rem.frequency || '');
    setStartDate(rem.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(rem.endDate || '');
    setIsActive(rem.active !== false);
    setVerificationNotice('');
    setIsModalOpen(true);
  };

  // When patient selects a prescription from dropdown
  const handlePrescriptionSelect = (rxId) => {
    setSelectedRxId(rxId);
    if (!rxId) {
      setVerificationNotice('');
      return;
    }
    const matchedRx = prescriptions.find(p => p.id === rxId);
    if (matchedRx) {
      setMedicineName(matchedRx.medicineName || '');
      setInstructions(matchedRx.instructions || '');
      setFrequency(matchedRx.frequency || 'Once Daily');
      setVerificationNotice(`Loaded from verified prescription (${matchedRx.code || matchedRx.id}). Please verify the timing and duration before saving.`);
    }
  };

  // Handle form submit (Add or Edit)
  const handleSubmitReminder = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      alert('Please enter or select a medicine name.');
      return;
    }
    if (!time.trim()) {
      alert('Please specify an intake time.');
      return;
    }

    const payload = {
      medicineName: medicineName.trim(),
      instructions: instructions.trim(),
      time: time.trim(),
      frequency: frequency.trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate.trim(),
      active: isActive,
      prescriptionId: selectedRxId || null,
      category: 'today'
    };

    if (editingReminder) {
      await editMedicineReminder(editingReminder.id, payload);
    } else {
      await addMedicineReminder(payload);
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDeleteReminder = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the reminder for "${name}"?`)) {
      await deleteMedicineReminder(id);
    }
  };

  // Filter list
  const filteredReminders = medicineReminders.filter((rem) => {
    if (activeFilter === 'active') return rem.active !== false;
    if (activeFilter === 'inactive') return rem.active === false;
    return true;
  });

  const activePrescriptions = prescriptions.filter(p => p.status === 'ACTIVE' || !p.status);

  return (
    <div className="reminders-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Medicine Reminders</h1>
          <p className="page-subtitle">Personalized pill schedule connected to your verified prescriptions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleOpenAddModal()}
          >
            Add New Reminder
          </Button>
        </div>
      </div>

      {/* Verified Prescription Quick Action Banner */}
      {activePrescriptions.length > 0 && (
        <Card style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1e3a8a' }}>
                  Verified Doctor Prescriptions Available ({activePrescriptions.length})
                </h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#3b82f6' }}>
                  Easily create reminders directly from your clinical prescriptions without manually typing.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activePrescriptions.slice(0, 2).map((rx) => (
                <button
                  key={rx.id}
                  onClick={() => handleOpenAddModal(rx)}
                  style={{
                    backgroundColor: 'white',
                    border: '1.5px solid #2563eb',
                    color: '#1d4ed8',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <FileText size={14} /> Add from {rx.medicineName?.split(' ')[0] || rx.code}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tabs Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: 'var(--neutral-100)', padding: '0.3rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.55rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFilter === 'all' ? 'var(--primary-600)' : 'transparent',
            color: activeFilter === 'all' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          All Reminders ({medicineReminders.length})
        </button>

        <button
          onClick={() => setActiveFilter('active')}
          style={{
            padding: '0.55rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFilter === 'active' ? '#059669' : 'transparent',
            color: activeFilter === 'active' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          Active Schedule ({medicineReminders.filter(r => r.active !== false).length})
        </button>

        <button
          onClick={() => setActiveFilter('inactive')}
          style={{
            padding: '0.55rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFilter === 'inactive' ? 'var(--neutral-700)' : 'transparent',
            color: activeFilter === 'inactive' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          Paused / Inactive ({medicineReminders.filter(r => r.active === false).length})
        </button>
      </div>

      {/* Reminder Cards Grid */}
      {filteredReminders.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {filteredReminders.map((rem) => {
            const isRemActive = rem.active !== false;
            return (
              <Card
                key={rem.id}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: isRemActive ? '5px solid var(--primary-600)' : '5px solid var(--neutral-400)',
                  opacity: isRemActive ? 1 : 0.75,
                  position: 'relative'
                }}
              >
                {/* Header: Time & Active Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-700)', fontWeight: '800', fontSize: '1.15rem' }}>
                    <Clock size={20} />
                    <span>{rem.time || 'Set Time'}</span>
                  </div>
                  <button
                    onClick={() => toggleMedicineReminder(rem.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: isRemActive ? '#059669' : 'var(--neutral-500)'
                    }}
                    title={isRemActive ? 'Click to pause reminder' : 'Click to activate reminder'}
                  >
                    {isRemActive ? (
                      <>
                        <span className="badge badge-success">ACTIVE</span>
                        <ToggleRight size={22} color="#059669" />
                      </>
                    ) : (
                      <>
                        <span className="badge badge-neutral">PAUSED</span>
                        <ToggleLeft size={22} color="var(--neutral-400)" />
                      </>
                    )}
                  </button>
                </div>

                {/* Medicine Title & Frequency */}
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.35rem 0' }}>
                    {rem.medicineName}
                  </h3>
                  {rem.frequency && (
                    <span className="badge badge-info" style={{ fontWeight: '700' }}>
                      {rem.frequency}
                    </span>
                  )}
                </div>

                {/* Instructions */}
                {rem.instructions && (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--neutral-700)' }}>
                    <strong>Instructions:</strong> {rem.instructions}
                  </div>
                )}

                {/* Date Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={15} />
                  <span>
                    Start: <strong>{rem.startDate || 'Immediate'}</strong>
                    {rem.endDate ? <> • End: <strong>{rem.endDate}</strong></> : ' • Ongoing'}
                  </span>
                </div>

                {/* Linked Prescription Reference */}
                {rem.prescriptionId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                    <FileText size={14} />
                    <span>Linked to Prescription: <strong>{rem.prescriptionId}</strong></span>
                  </div>
                )}

                {/* Actions: Edit & Delete */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleOpenEditModal(rem)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteReminder(rem.id, rem.medicineName)}
                    style={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)', marginBottom: '2.5rem' }}>
          <Bell size={48} style={{ color: 'var(--neutral-400)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--neutral-800)' }}>
            No Reminders Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            You haven't scheduled any medicine reminders in this view. Create one manually or link from your prescriptions.
          </p>
          <Button variant="primary" icon={Plus} onClick={() => handleOpenAddModal()}>
            Create First Reminder
          </Button>
        </div>
      )}

      {/* Add / Edit Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? 'Edit Medicine Reminder' : 'Create Medicine Reminder'}
      >
        <form onSubmit={handleSubmitReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Select from Prescription */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
              Link to Doctor Prescription (Optional)
            </label>
            <select
              value={selectedRxId}
              onChange={(e) => handlePrescriptionSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">-- Manual Entry (No linked prescription) --</option>
              {prescriptions.map((rx) => (
                <option key={rx.id} value={rx.id}>
                  {rx.medicineName} ({rx.code || rx.id}) — Dr. {rx.doctorName || 'Doctor'}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Notice Banner */}
          {verificationNotice && (
            <div style={{ padding: '0.85rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <AlertCircle size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.825rem', color: '#1e40af', lineHeight: '1.45' }}>
                {verificationNotice}
              </div>
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
              Medicine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Paracetamol 650mg, Cetirizine 10mg"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Time & Frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
                Intake Time *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 08:00 AM or 09:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
                Frequency (When provided)
              </label>
              <input
                type="text"
                placeholder="e.g., Once Daily, Twice Daily"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
                End Date (When provided)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--neutral-800)' }}>
              Special Instructions (When provided)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Take after food with warm water. Avoid dairy products within 1 hour."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Active Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveToggle" style={{ fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>
              Reminder is Active (Receive in-app & notification alerts)
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
            >
              {editingReminder ? 'Save Changes' : 'Confirm & Save Reminder'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

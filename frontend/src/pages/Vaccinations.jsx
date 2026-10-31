import React, { useState } from 'react';
import {
  Syringe,
  Calendar,
  CheckCircle2,
  Download,
  ShieldCheck,
  Plus,
  Bell,
  Clock,
  AlertTriangle,
  BellRing,
  Check,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const Vaccinations = () => {
  const {
    vaccinations = [],
    scheduleVaccination,
    toggleVaccinationReminder
  } = usePatientData();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [vacName, setVacName] = useState('Annual Influenza (Flu) Shot 2026');
  const [customName, setCustomName] = useState('');
  const [vacDate, setVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [facility, setFacility] = useState('KMCH Immunization Hub');
  const [dose, setDose] = useState('Annual Dose');
  const [reminderActive, setReminderActive] = useState(true);

  // Identify next upcoming or due vaccine for the Reminder display widget
  const nextVaccine = vaccinations.find(v => v.status === 'Scheduled' || v.status === 'Due Soon') || vaccinations[0];

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const finalName = vacName === 'custom' ? customName.trim() : vacName;
    if (!finalName) {
      alert('Please enter a vaccination name.');
      return;
    }

    const payload = {
      name: finalName,
      date: vacDate,
      administeredBy: facility,
      status: 'Scheduled',
      dose: dose || 'Routine Dose',
      batchNo: 'Pending',
      certificateAvailable: false,
      reminderEnabled: reminderActive
    };

    if (scheduleVaccination) {
      await scheduleVaccination(payload);
    }
    setIsBookModalOpen(false);
    setCustomName('');
  };

  return (
    <div className="vaccinations-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Vaccination & Immunization Tracker ({vaccinations.length})</h1>
          <p className="page-subtitle">Track vaccination names, upcoming immunization dates, and active reminders</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsBookModalOpen(true)}>
          Schedule Vaccination Slot
        </Button>
      </div>

      {/* Module C: Dedicated Vaccine Reminder Display Widget */}
      {nextVaccine && (
        <Card className="vaccine-reminder-widget-card" style={{ marginBottom: '1.75rem', padding: '1.5rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BellRing size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-warning" style={{ backgroundColor: '#f59e0b', color: 'white', fontWeight: '800' }}>
                    Upcoming Vaccine Reminder
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: '700' }}>
                    Scheduled Date: {nextVaccine.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#78350f', margin: '0 0 0.25rem 0' }}>
                  {nextVaccine.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0 }}>
                  Facility: <strong>{nextVaccine.administeredBy}</strong> ({nextVaccine.dose || 'Standard Dose'})
                </p>
              </div>
            </div>

            <Button
              variant={nextVaccine.reminderEnabled ? 'secondary' : 'outline'}
              size="sm"
              icon={nextVaccine.reminderEnabled ? Check : Bell}
              onClick={() => toggleVaccinationReminder && toggleVaccinationReminder(nextVaccine.id)}
              style={{
                backgroundColor: nextVaccine.reminderEnabled ? '#059669' : 'white',
                color: nextVaccine.reminderEnabled ? 'white' : '#b45309',
                borderColor: nextVaccine.reminderEnabled ? '#059669' : '#d97706',
                fontWeight: '800'
              }}
            >
              {nextVaccine.reminderEnabled ? '✓ Reminder Active' : 'Enable Notification Alert'}
            </Button>
          </div>
        </Card>
      )}

      {/* Vaccines List */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--neutral-900)' }}>
        Saved Immunization Records & Scheduled Shots
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {vaccinations.map((vac) => {
          const isCompleted = vac.status === 'Completed';
          return (
            <Card key={vac.id} className="record-item-card" hoverable style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7',
                    color: isCompleted ? '#059669' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Syringe size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                      {vac.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Facility: <strong>{vac.administeredBy}</strong> • Date: <strong>{vac.date}</strong> • Dose: {vac.dose}
                    </p>
                    {vac.batchNo && vac.batchNo !== 'Pending' && (
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                        Batch Code: {vac.batchNo}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span className={`badge ${
                    isCompleted ? 'badge-success' :
                    vac.status === 'Scheduled' ? 'badge-info' : 'badge-warning'
                  }`} style={{ fontWeight: '800', padding: '0.35rem 0.75rem' }}>
                    {vac.status}
                  </span>

                  {!isCompleted && (
                    <button
                      onClick={() => toggleVaccinationReminder && toggleVaccinationReminder(vac.id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.4rem 0.7rem',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: vac.reminderEnabled ? '#059669' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Toggle Reminder Notification"
                    >
                      <Bell size={14} color={vac.reminderEnabled ? '#059669' : 'var(--neutral-400)'} />
                      {vac.reminderEnabled ? 'Alert On' : 'Alert Off'}
                    </button>
                  )}

                  {vac.certificateAvailable && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => alert(`Downloading official vaccination certificate for ${vac.name}...`)}
                    >
                      Certificate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Book Vaccine Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Vaccination Slot"
      >
        <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Select Vaccine
            </label>
            <select
              value={vacName}
              onChange={(e) => setVacName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}
            >
              <option value="Annual Influenza (Flu) Shot 2026">Annual Influenza (Flu) Shot 2026</option>
              <option value="COVID-19 Booster (KP.2)">COVID-19 Booster (KP.2)</option>
              <option value="Hepatitis B (Recombinant)">Hepatitis B (Recombinant)</option>
              <option value="Tetanus & Diphtheria (Tdap)">Tetanus & Diphtheria (Tdap)</option>
              <option value="Typhoid Conjugate Vaccine (TCV)">Typhoid Conjugate Vaccine (TCV)</option>
              <option value="custom">+ Other / Custom Vaccine Name</option>
            </select>
          </div>

          {vacName === 'custom' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                Enter Custom Vaccine Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Pneumococcal Conjugate Vaccine"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                Vaccination Date *
              </label>
              <input
                type="date"
                required
                value={vacDate}
                onChange={(e) => setVacDate(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                Dose Type
              </label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g., Annual Dose, Booster Shot"
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Healthcare Facility
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}
            >
              <option value="KMCH Immunization Hub">KMCH Immunization Hub (Peelamedu)</option>
              <option value="MetroCare Health Hub">MetroCare Health Hub (Gandhipuram)</option>
              <option value="Ganga Hospital Immunization Clinic">Ganga Hospital Immunization Clinic (Ram Nagar)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="vacReminderCheckbox"
              checked={reminderActive}
              onChange={(e) => setReminderActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="vacReminderCheckbox" style={{ fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>
              Enable Notification Bell Reminder for this vaccine
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Confirm & Save Vaccination
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

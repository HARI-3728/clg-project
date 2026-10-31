import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Bell,
  BellOff,
  Edit2,
  Trash2,
  AlertCircle,
  Activity,
  Heart,
  Droplet,
  Search,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const RoutineMedicines = () => {
  const {
    routineMedicines,
    addRoutineMedicine,
    editRoutineMedicine,
    deleteRoutineMedicine,
    markRoutineMedicineTaken,
    toggleRoutineMedicineReminder
  } = usePatientData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'TAKEN' | 'DIABETES' | 'BP'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sugar / Diabetes',
    dosage: '',
    frequency: 'Once Daily',
    timing: 'Morning (After Breakfast)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderEnabled: true,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Sugar / Diabetes',
      dosage: '',
      frequency: 'Once Daily',
      timing: 'Morning (After Breakfast)',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reminderEnabled: true,
      notes: ''
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name || '',
      category: med.category || 'Sugar / Diabetes',
      dosage: med.dosage || '',
      frequency: med.frequency || 'Once Daily',
      timing: med.timing || 'Morning (After Breakfast)',
      startDate: med.startDate || '',
      endDate: med.endDate || '',
      reminderEnabled: med.reminderEnabled ?? true,
      notes: med.notes || ''
    });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMedicine(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      alert('Please provide medicine name and dosage.');
      return;
    }

    if (editingMedicine) {
      editRoutineMedicine(editingMedicine.id, formData);
    } else {
      addRoutineMedicine(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from your routine medicines?`)) {
      deleteRoutineMedicine(id);
    }
  };

  // Filter pipeline
  const filteredMedicines = routineMedicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.category.toLowerCase().includes(q) ||
      med.dosage.toLowerCase().includes(q) ||
      med.timing.toLowerCase().includes(q);

    let matchesFilter = true;
    if (selectedFilter === 'PENDING') matchesFilter = !med.takenToday;
    else if (selectedFilter === 'TAKEN') matchesFilter = med.takenToday;
    else if (selectedFilter === 'DIABETES') matchesFilter = med.category.toLowerCase().includes('sugar') || med.category.toLowerCase().includes('diabetes');
    else if (selectedFilter === 'BP') matchesFilter = med.category.toLowerCase().includes('bp') || med.category.toLowerCase().includes('pressure');

    return matchesSearch && matchesFilter;
  });

  const takenCount = routineMedicines.filter((m) => m.takenToday).length;
  const pendingCount = routineMedicines.filter((m) => !m.takenToday).length;

  return (
    <div className="routine-medicines-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Routine Medicines</h1>
          <p className="page-subtitle">
            Manage long-term daily medications (diabetes, blood pressure, thyroid, routine supplements) with reminders
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Add Routine Medicine
        </Button>
      </div>

      {/* Routine Daily Overview Tracker Card */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #059669 60%, #10b981 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginBottom: '0.6rem'
          }}>
            <Activity size={14} /> DAILY ADHERENCE TRACKER
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
            {takenCount} of {routineMedicines.length} Doses Taken Today
          </h2>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '0.95rem' }}>
            {pendingCount === 0
              ? '🎉 All your routine medications for today have been taken!'
              : `You have ${pendingCount} routine dose${pendingCount > 1 ? 's' : ''} remaining today.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            minWidth: '110px'
          }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700', display: 'block' }}>COMPLETED</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: '900' }}>{takenCount}</strong>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            minWidth: '110px'
          }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700', display: 'block' }}>PENDING</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: '900' }}>{pendingCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Routine (${routineMedicines.length})` },
            { id: 'PENDING', label: `Pending Today (${pendingCount})` },
            { id: 'TAKEN', label: `Taken Today (${takenCount})` },
            { id: 'DIABETES', label: 'Sugar / Diabetes' },
            { id: 'BP', label: 'Blood Pressure (BP)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                background: selectedFilter === tab.id ? 'var(--primary-600)' : 'var(--surface-card)',
                color: selectedFilter === tab.id ? 'white' : 'var(--neutral-700)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search routine medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Routine Medicines Grid */}
      {filteredMedicines.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {filteredMedicines.map((med) => (
            <Card
              key={med.id}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft: med.takenToday ? '5px solid #10b981' : '5px solid #d97706',
                position: 'relative'
              }}
            >
              {/* Category Badge & Status Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-info" style={{ fontWeight: '800' }}>
                  {med.category}
                </span>

                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {med.takenToday ? (
                    <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '800' }}>
                      ✓ Taken Today
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '800' }}>
                      ⏳ Pending Dose
                    </span>
                  )}
                </div>
              </div>

              {/* Medicine Name & Dosage */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                  {med.name}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-700)', fontWeight: '700' }}>
                  Dosage: {med.dosage}
                </span>
              </div>

              {/* Schedule Info Box */}
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>FREQUENCY</span>
                  <strong>{med.frequency}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>TIMING</span>
                  <strong>{med.timing}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>START DATE</span>
                  <span>{med.startDate}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>END DATE</span>
                  <span>{med.endDate || 'Ongoing / Long-Term'}</span>
                </div>
              </div>

              {med.notes && (
                <div style={{ fontSize: '0.825rem', color: 'var(--neutral-700)', fontStyle: 'italic', backgroundColor: 'var(--surface-card)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                  💡 {med.notes}
                </div>
              )}

              {/* Status / Last Taken Time */}
              <div style={{ fontSize: '0.825rem', color: med.takenToday ? '#15803d' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Status: <strong>{med.lastTakenAt}</strong></span>
                <button
                  onClick={() => toggleRoutineMedicineReminder(med.id)}
                  title={med.reminderEnabled ? 'Reminder notifications active' : 'Reminder notifications paused'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: med.reminderEnabled ? 'var(--primary-600)' : 'var(--neutral-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}
                >
                  {med.reminderEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                  <span>{med.reminderEnabled ? 'Notif On' : 'Notif Off'}</span>
                </button>
              </div>

              {/* Action Buttons: Mark Taken + Edit + Delete */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                <Button
                  variant={med.takenToday ? 'secondary' : 'primary'}
                  size="sm"
                  icon={med.takenToday ? RotateCcw : CheckCircle2}
                  onClick={() => markRoutineMedicineTaken(med.id, !med.takenToday)}
                  style={{
                    flex: 1,
                    backgroundColor: med.takenToday ? '#dcfce7' : '',
                    color: med.takenToday ? '#15803d' : '',
                    borderColor: med.takenToday ? '#bbf7d0' : ''
                  }}
                >
                  {med.takenToday ? 'Mark as Not Taken' : 'Mark as Taken'}
                </Button>

                <button
                  onClick={() => handleOpenEdit(med)}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-card)',
                    color: 'var(--neutral-700)',
                    cursor: 'pointer'
                  }}
                  title="Edit medicine details"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDelete(med.id, med.name)}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fecdd3',
                    background: '#fff1f2',
                    color: '#e11d48',
                    cursor: 'pointer'
                  }}
                  title="Delete routine medicine"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)', marginBottom: '2.5rem' }}>
          <Pill size={44} style={{ color: 'var(--neutral-400)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--neutral-800)' }}>
            No Routine Medicines Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Add your regular medicines such as diabetes, BP, thyroid or daily vitamins dynamically.
          </p>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Add Your First Routine Medicine
          </Button>
        </div>
      )}

      {/* Modal: Add / Edit Routine Medicine */}
      {(isAddModalOpen || editingMedicine) && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={editingMedicine ? `Edit Routine Medicine: ${editingMedicine.name}` : 'Add New Routine Medicine'}
          subtitle="Configure daily dosage schedule, long-term frequency & reminders"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            {/* Medicine Name */}
            <div className="form-group">
              <label htmlFor="med-name">Medicine Name *</label>
              <input
                id="med-name"
                type="text"
                className="form-input"
                placeholder="e.g., Metformin 500mg, Telmisartan 40mg, Thyronorm 50mcg..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Category & Dosage Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="med-category">Condition / Category *</label>
                <select
                  id="med-category"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Sugar / Diabetes">Sugar / Diabetes</option>
                  <option value="Blood Pressure (BP)">Blood Pressure (BP)</option>
                  <option value="Thyroid Disorder">Thyroid Disorder</option>
                  <option value="Cardiology / Heart">Cardiology / Heart</option>
                  <option value="Cholesterol">Cholesterol</option>
                  <option value="Daily Supplement">Daily Supplement</option>
                  <option value="Other Long-Term">Other Long-Term</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="med-dosage">Dosage *</label>
                <input
                  id="med-dosage"
                  type="text"
                  className="form-input"
                  placeholder="e.g., 500mg (1 Tablet), 10ml, 1 Capsule..."
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Frequency & Timing Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="med-freq">Frequency *</label>
                <select
                  id="med-freq"
                  className="form-input"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="Once Daily">Once Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Thrice Daily">Thrice Daily</option>
                  <option value="Alternate Days">Alternate Days</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As Needed (SOS)">As Needed (SOS)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="med-timing">Daily Timing *</label>
                <select
                  id="med-timing"
                  className="form-input"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                >
                  <option value="Morning (After Breakfast)">Morning (After Breakfast)</option>
                  <option value="Morning (Before Breakfast - Empty Stomach)">Morning (Before Breakfast - Empty Stomach)</option>
                  <option value="Afternoon (After Lunch)">Afternoon (After Lunch)</option>
                  <option value="Evening (5:00 PM)">Evening (5:00 PM)</option>
                  <option value="Night (After Dinner)">Night (After Dinner)</option>
                  <option value="Night (Before Bed)">Night (Before Bed)</option>
                  <option value="Morning + Night (Twice Daily)">Morning + Night (Twice Daily)</option>
                </select>
              </div>
            </div>

            {/* Start & End Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="med-start">Start Date *</label>
                <input
                  id="med-start"
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="med-end">End Date (Leave blank if ongoing)</label>
                <input
                  id="med-end"
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Reminder Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <input
                id="reminder-toggle"
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="reminder-toggle" style={{ cursor: 'pointer', margin: 0, fontSize: '0.875rem', fontWeight: '700', color: 'var(--neutral-800)' }}>
                Enable daily pill reminders & centralized dashboard notifications
              </label>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="med-notes">Physician Instructions / Notes</label>
              <textarea
                id="med-notes"
                className="form-input"
                rows={2}
                placeholder="e.g., Take with a full glass of water. Monitor blood pressure weekly..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingMedicine ? 'Save Changes' : 'Add Routine Medicine'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

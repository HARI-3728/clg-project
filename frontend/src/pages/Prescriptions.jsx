import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Building2,
  User,
  Pill,
  Printer,
  Download,
  ShieldCheck,
  Search,
  Bookmark,
  BookmarkCheck,
  Bell,
  Utensils,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

export const Prescriptions = () => {
  const { user } = useAuth();
  const patientDisplayName = user?.name || 'Patient';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ACTIVE';
  const [activeTab, setActiveTab] = useState(initialTab.toUpperCase());
  const [selectedRx, setSelectedRx] = useState(null);
  const [modalType, setModalType] = useState(null); // 'prescription' | 'report'
  const [searchQuery, setSearchQuery] = useState('');

  const {
    prescriptions,
    savePrescription,
    togglePrescriptionReminder
  } = usePatientData();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Filter prescriptions by Active / Inactive and search query
  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesTab = rx.status.toUpperCase() === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rx.doctorName.toLowerCase().includes(q) ||
      rx.hospitalName.toLowerCase().includes(q) ||
      rx.diagnosis.toLowerCase().includes(q) ||
      rx.medicineName.toLowerCase().includes(q) ||
      rx.code.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const activeCount = prescriptions.filter((r) => r.status.toUpperCase() === 'ACTIVE').length;
  const inactiveCount = prescriptions.filter((r) => r.status.toUpperCase() === 'INACTIVE').length;

  const handleSaveRx = (rx) => {
    savePrescription(rx.id);
  };

  const handleOpenPrescriptionModal = (rx) => {
    setSelectedRx(rx);
    setModalType('prescription');
  };

  const handleCloseModal = () => {
    setSelectedRx(null);
    setModalType(null);
  };

  return (
    <div className="prescriptions-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">
            Manage your doctor-prescribed medications, dosage frequencies, pill notifications & diet recommendations
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Section Tabs: ACTIVE vs INACTIVE */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => handleTabChange('ACTIVE')}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'ACTIVE' ? 'var(--primary-600)' : 'transparent',
              color: activeTab === 'ACTIVE' ? 'white' : 'var(--neutral-700)',
              boxShadow: activeTab === 'ACTIVE' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>ACTIVE PRESCRIPTIONS</span>
            <span style={{
              background: activeTab === 'ACTIVE' ? 'rgba(255,255,255,0.25)' : 'var(--neutral-200)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem'
            }}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('INACTIVE')}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'INACTIVE' ? 'var(--neutral-800)' : 'transparent',
              color: activeTab === 'INACTIVE' ? 'white' : 'var(--neutral-700)',
              boxShadow: activeTab === 'INACTIVE' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>INACTIVE PRESCRIPTIONS</span>
            <span style={{
              background: activeTab === 'INACTIVE' ? 'rgba(255,255,255,0.25)' : 'var(--neutral-200)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem'
            }}>
              {inactiveCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by medicine, doctor, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Prescriptions List Grid */}
      {filteredPrescriptions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {filteredPrescriptions.map((rx) => {
            const isActive = rx.status.toUpperCase() === 'ACTIVE';

            return (
              <Card
                key={rx.id}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: isActive ? '1.5px solid var(--primary-200)' : '1.5px solid var(--border-subtle)',
                  backgroundColor: isActive ? 'var(--surface-card)' : 'var(--neutral-50)'
                }}
              >
                {/* Header: Code & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontWeight: '800' }}>{rx.code}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {isActive ? (
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                        ● ACTIVE
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '800', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid #cbd5e1' }}>
                        ● INACTIVE (Expired / Completed)
                      </span>
                    )}

                    {rx.saved && (
                      <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '800', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <BookmarkCheck size={12} /> Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Doctor & Hospital Details */}
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <User size={16} color="var(--primary-600)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Doctor:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--neutral-900)' }}>{rx.doctorName}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <Building2 size={16} color="var(--primary-600)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hospital:</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--neutral-800)' }}>{rx.hospitalName}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--primary-600)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Diagnosis:</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary-700)' }}>{rx.diagnosis}</strong>
                  </div>
                </div>

                {/* Medicine & Dosage Details */}
                <div style={{ backgroundColor: isActive ? 'var(--primary-50)' : '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: isActive ? '1px solid var(--primary-200)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <Pill size={18} color="var(--primary-600)" />
                    <span style={{ fontWeight: '900', fontSize: '1.05rem', color: 'var(--neutral-900)' }}>
                      {rx.medicineName}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--neutral-800)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>DOSAGE</span>
                      <strong>{rx.dosage}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>FREQUENCY</span>
                      <strong>{rx.frequency}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>PRESCRIBED DATE</span>
                      <span>{rx.prescriptionDate}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700' }}>EXPIRY / END DATE</span>
                      <strong style={{ color: isActive ? 'var(--neutral-800)' : '#64748b' }}>{rx.expiryDate || 'N/A'}</strong>
                    </div>
                  </div>

                  {rx.instructions && (
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.825rem', color: 'var(--neutral-700)' }}>
                      <strong>Instructions:</strong> {rx.instructions}
                    </div>
                  )}
                </div>

                {/* Section A Feature: Medicine & Diet Reminders for Active Prescriptions */}
                {isActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Medicine Reminder Notification */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.85rem',
                      backgroundColor: rx.reminderEnabled ? '#eff6ff' : 'var(--neutral-100)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.825rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: rx.reminderEnabled ? '#1e40af' : 'var(--neutral-600)' }}>
                        <Bell size={14} />
                        <span><strong>Medicine Reminder:</strong> {rx.reminderEnabled ? 'Enabled (Daily notifications)' : 'Disabled'}</span>
                      </div>
                      <button
                        onClick={() => togglePrescriptionReminder(rx.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-600)',
                          fontWeight: '800',
                          fontSize: '0.775rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {rx.reminderEnabled ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>

                    {/* Diet Plan Associated Reminders / Notifications */}
                    {rx.dietPlanCondition && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: '#f3e8ff',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.825rem',
                        border: '1px solid #e9d5ff'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b21a8' }}>
                          <Utensils size={14} />
                          <span><strong>Diet Reminder:</strong> {rx.dietPlanName}</span>
                        </div>
                        <Link
                          to="/diet-plan"
                          style={{
                            color: '#7c3aed',
                            fontWeight: '800',
                            fontSize: '0.775rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          View Diet <ChevronRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Section B Notice for Inactive Prescriptions */}
                {!isActive && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    color: '#64748b'
                  }}>
                    ℹ️ <strong>Inactive Record:</strong> Completed or expired prescription preserved for your historical medical records.
                  </div>
                )}

                {/* Actions: Save Prescription & View Documents */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant={rx.saved ? 'secondary' : 'outline'}
                    size="sm"
                    icon={rx.saved ? BookmarkCheck : Bookmark}
                    onClick={() => handleSaveRx(rx)}
                    style={{ flex: 1 }}
                  >
                    {rx.saved ? 'Prescription Saved' : 'Save Prescription'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleOpenPrescriptionModal(rx)}
                    style={{ flex: 1 }}
                  >
                    View Prescription
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)', marginBottom: '2.5rem' }}>
          <FileText size={44} style={{ color: 'var(--neutral-400)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--neutral-800)' }}>
            No {activeTab} Prescriptions Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            There are currently no prescription records matching this filter.
          </p>
        </div>
      )}

      {/* Modal: View Digital Prescription Document */}
      {modalType === 'prescription' && selectedRx && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={`Digital Prescription Document — ${selectedRx.code}`}
          subtitle={`Issued by ${selectedRx.doctorName} (${selectedRx.hospitalName})`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ border: '2px solid var(--primary-600)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: '#ffffff', position: 'relative' }}>
              {/* Doctor & Hospital Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--neutral-200)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary-700)', margin: 0 }}>{selectedRx.doctorName}</h3>
                  <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--neutral-800)', margin: '0.2rem 0' }}>{selectedRx.hospitalName}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Medical Reg. No: TNMC-48821 • Super-Specialty Healthcare</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${selectedRx.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`} style={{ fontWeight: '800' }}>
                    ● {selectedRx.status}
                  </span>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                    Prescribed: <strong>{selectedRx.prescriptionDate}</strong>
                  </p>
                  {selectedRx.expiryDate && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      End Date: <strong>{selectedRx.expiryDate}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Info */}
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', border: '1px solid var(--border-subtle)' }}>
                <strong>Patient Name:</strong> {patientDisplayName} &nbsp;|&nbsp; <strong>Age:</strong> {user?.age || 28} &nbsp;|&nbsp; <strong>Gender:</strong> {user?.gender || 'Male'} &nbsp;|&nbsp; <strong>Diagnosis:</strong> {selectedRx.diagnosis}
              </div>

              {/* Prescribed Medicine Box */}
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-700)', marginBottom: '0.5rem' }}>
                ℞ Prescribed Medication
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary-200)', backgroundColor: 'var(--primary-50)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--primary-900)', margin: '0 0 0.5rem 0' }}>
                  {selectedRx.medicineName}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Dosage:</strong> {selectedRx.dosage}</div>
                  <div><strong>Frequency:</strong> {selectedRx.frequency}</div>
                  <div><strong>Duration:</strong> {selectedRx.duration || 'As directed'}</div>
                  <div><strong>Expiry/End:</strong> {selectedRx.expiryDate || 'N/A'}</div>
                </div>
                {selectedRx.instructions && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--neutral-800)', borderTop: '1px dashed var(--primary-300)', paddingTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                    <strong>Instructions:</strong> {selectedRx.instructions}
                  </p>
                )}
              </div>

              {/* Diet Plan Notice if linked */}
              {selectedRx.dietPlanCondition && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f3e8ff', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#6b21a8' }}>
                  🥗 <strong>Associated Diet Plan:</strong> {selectedRx.dietPlanName}. Access the diet chart from the Diet Plan section for detailed meal guidance.
                </div>
              )}

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--neutral-200)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Certified digital prescription under the Healthcare Tele-consultation Regulations.
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid var(--neutral-900)', width: '150px', paddingBottom: '0.25rem', fontWeight: '800', fontSize: '0.95rem', color: 'var(--neutral-900)' }}>
                    {selectedRx.doctorName}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Medical Signatory</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <Button
                variant={selectedRx.saved ? 'secondary' : 'outline'}
                icon={selectedRx.saved ? BookmarkCheck : Bookmark}
                onClick={() => handleSaveRx(selectedRx)}
              >
                {selectedRx.saved ? 'Saved in Records' : 'Save Prescription'}
              </Button>
              <Button
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Prescription
              </Button>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => {
                  savePrescription(selectedRx.id);
                  alert(`Downloading digital prescription ${selectedRx.code}.pdf...`);
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Activity,
  Scan,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Plus,
  Heart,
  Droplets,
  Microscope,
  Check
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import './pages.css';

const defaultPackages = [
  {
    id: 'pkg-1',
    category: 'packages',
    name: 'Comprehensive Master Health Checkup',
    tagline: 'Complete whole-body screening for all age groups',
    testsCount: '68 Parameters',
    fastingRequired: '10-12 Hours Overnight Fasting Required',
    price: '₹2,499',
    originalPrice: '₹5,500',
    discount: '55% OFF',
    popular: true,
    testsIncluded: [
      'Complete Hemogram (24 tests)',
      'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)',
      'Liver Function Test (LFT - 11 parameters)',
      'Kidney Function Test (KFT - Urea, Creatinine, Uric Acid)',
      'Fasting Blood Sugar & HbA1c',
      'Thyroid Profile (T3, T4, TSH)',
      'Urine Routine Examination',
      'ECG & Chest X-Ray Digital'
    ],
    centers: ['KMCH Diagnostic Wing', 'Ganga Medical Center', 'Royal Care Lab']
  },
  {
    id: 'pkg-2',
    category: 'packages',
    name: 'Advanced Cardiac Health Screening',
    tagline: 'Specialized heart function & cardiovascular risk evaluation',
    testsCount: '42 Parameters',
    fastingRequired: '8-10 Hours Fasting',
    price: '₹3,199',
    originalPrice: '₹6,800',
    discount: '53% OFF',
    popular: true,
    testsIncluded: [
      '2D Echocardiogram with Doppler',
      'Treadmill Stress Test (TMT)',
      'High-Sensitivity C-Reactive Protein (hs-CRP)',
      'Complete Lipid Profile & Apolipoproteins',
      'Serum Electrolytes & Homocysteine',
      'Cardiologist Clinical Review'
    ],
    centers: ['KMCH Heart Foundation', 'Royal Care Cardiology Lab']
  },
  {
    id: 'pkg-3',
    category: 'packages',
    name: 'Executive Diabetic & Metabolic Care Package',
    tagline: 'Comprehensive diabetes management and organ monitoring',
    testsCount: '36 Parameters',
    fastingRequired: 'Fasting + Post-Prandial Blood Samples',
    price: '₹1,899',
    originalPrice: '₹3,900',
    discount: '51% OFF',
    popular: false,
    testsIncluded: [
      'Fasting & 2-Hour PP Blood Sugar',
      'HbA1c Glycated Hemoglobin',
      'Serum Creatinine & eGFR Calculation',
      'Microalbuminuria (Urine Albumin/Creatinine Ratio)',
      'Dilated Diabetic Retinal Fundus Photography',
      'Peripheral Neuropathy Vibration Perception Test'
    ],
    centers: ['KMCH Diabetology Wing', 'ABC Hospital Clinic', 'PSG Diagnostic Lab']
  },
  {
    id: 'pkg-4',
    category: 'scans',
    name: '3.0 Tesla High-Resolution Brain MRI',
    tagline: 'Ultra-crisp neuro-imaging with contrast & stroke protocol',
    testsCount: 'Imaging Protocol',
    fastingRequired: '4 Hours Fasting for Contrast',
    price: '₹5,500',
    originalPrice: '₹9,000',
    discount: '39% OFF',
    popular: true,
    testsIncluded: [
      '3T Silent MRI System Scan',
      'T1, T2, FLAIR, DWI and ADC sequences',
      'Diffusion Tensor Imaging (if advised)',
      'Digital DICOM Imaging Film + Online Portal CD/Cloud Link',
      'Radiologist Expert Reporting within 4 Hours'
    ],
    centers: ['KMCH Super-Specialty Imaging', 'Ganga Scan Center']
  },
  {
    id: 'pkg-5',
    category: 'scans',
    name: 'High-Resolution Computed Tomography (HRCT) Chest',
    tagline: 'Detailed lung parenchyma & respiratory diagnostic scan',
    testsCount: 'Radiology Scan',
    fastingRequired: 'No Fasting Required (Non-Contrast)',
    price: '₹3,200',
    originalPrice: '₹5,500',
    discount: '42% OFF',
    popular: false,
    testsIncluded: [
      '128-Slice Low Radiation Ultra-Fast CT',
      'Inspiratory and Expiratory Thin Sections',
      'Sub-millimeter 3D Volumetric Reconstruction',
      'Instant Pulmonary Radiologist Assessment'
    ],
    centers: ['KMCH Advanced Radiology', 'Royal Care Scans']
  },
  {
    id: 'pkg-6',
    category: 'scans',
    name: 'Whole Abdomen & Pelvis Ultrasound 4D',
    tagline: 'High-frequency sonography of liver, kidneys, pancreas & pelvic organs',
    testsCount: 'Ultrasound Scan',
    fastingRequired: 'Fasting 6 Hours & Full Bladder Required',
    price: '₹1,450',
    originalPrice: '₹2,600',
    discount: '44% OFF',
    popular: false,
    testsIncluded: [
      'Color Doppler Flow Ultrasound',
      'Hepato-biliary system & Gallbladder examination',
      'Kidney, Ureter, Bladder (KUB) assessment',
      'High-Definition Printable Thermal Plates'
    ],
    centers: ['KMCH Diagnostic Wing', 'PSG Hospitals Imaging', 'Ganga Scan Center']
  },
  {
    id: 'pkg-7',
    category: 'tests',
    name: 'Complete Thyroid & Vitamin Deficiency Profile',
    tagline: 'Detect Vitamin D3, B12 deficiencies and thyroid imbalances',
    testsCount: '7 Blood Parameters',
    fastingRequired: 'Overnight Fasting Preferred',
    price: '₹1,299',
    originalPrice: '₹2,800',
    discount: '54% OFF',
    popular: true,
    testsIncluded: [
      'Vitamin D (25-OH) Total by CLIA',
      'Vitamin B12 Active Cobalamin',
      'TSH - Ultrasensitive 3rd Gen',
      'Total Triiodothyronine (T3)',
      'Total Thyroxine (T4)',
      'Serum Calcium & Inorganic Phosphorus'
    ],
    centers: ['Home Sample Collection Available', 'KMCH Central Lab', 'Metropolis']
  },
  {
    id: 'pkg-8',
    category: 'tests',
    name: 'Comprehensive Liver & Kidney Safety Profile',
    tagline: 'Monitor medication impact, liver enzymes & renal filtration',
    testsCount: '19 Parameters',
    fastingRequired: '8 Hours Fasting',
    price: '₹950',
    originalPrice: '₹2,100',
    discount: '55% OFF',
    popular: false,
    testsIncluded: [
      'SGOT (AST), SGPT (ALT), Alkaline Phosphatase',
      'Bilirubin Total, Direct & Indirect',
      'Total Proteins, Albumin, Globulin & A:G Ratio',
      'Serum Creatinine, Blood Urea Nitrogen (BUN)',
      'Uric Acid & Serum Electrolytes (Na+, K+, Cl-)'
    ],
    centers: ['Home Sample Collection Available', 'KMCH Central Lab']
  }
];

const initialUserBookings = [
  {
    id: 'SCN-8841-01',
    packageName: 'Comprehensive Master Health Checkup',
    center: 'KMCH Diagnostic Wing (Peelamedu, Coimbatore)',
    date: '2026-10-24',
    time: '08:00 AM',
    patientName: '',
    mode: 'Hospital Visit',
    status: 'Scheduled',
    fasting: '10-12 Hours Overnight Fasting Required',
    amount: '₹2,499'
  }
];

export const CheckupsScans = () => {
  const { user } = useAuth();
  const { addNotification } = usePatientData();
  const patientDisplayName = user?.name || 'Patient';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'packages' | 'scans' | 'tests' | 'my-bookings'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('medicare_scans_bookings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialUserBookings.map(b => ({ ...b, patientName: patientDisplayName }));
  });

  const [bookingForm, setBookingForm] = useState({
    date: '2026-10-25',
    time: '08:30 AM',
    center: 'KMCH Diagnostic Wing',
    mode: 'Hospital Center Visit',
    fastingConfirmed: true,
    notes: ''
  });

  const handleOpenBooking = (item) => {
    setSelectedItem(item);
    setBookingForm({
      date: '2026-10-25',
      time: '08:30 AM',
      center: item.centers[0] || 'KMCH Diagnostic Wing',
      mode: 'Hospital Center Visit',
      fastingConfirmed: true,
      notes: ''
    });
    setIsBookModalOpen(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newBooking = {
      id: `SCN-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-2)}`,
      packageName: selectedItem.name,
      center: `${bookingForm.center} (${bookingForm.mode})`,
      date: bookingForm.date,
      time: bookingForm.time,
      patientName: patientDisplayName,
      mode: bookingForm.mode,
      status: 'Confirmed & Scheduled',
      fasting: selectedItem.fastingRequired,
      amount: selectedItem.price
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem('medicare_scans_bookings', JSON.stringify(updated));
    } catch {}

    if (addNotification) {
      addNotification({
        title: `Appointment Confirmed: ${selectedItem.name}`,
        message: `Scheduled for ${bookingForm.date} at ${bookingForm.time} at ${bookingForm.center}. Prepare as advised (${selectedItem.fastingRequired}).`,
        type: 'offline_appointment',
        link: '/checkups-scans'
      });
    }

    setIsBookModalOpen(false);
    setActiveTab('my-bookings');
  };

  const filteredItems = defaultPackages.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.testsIncluded.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  return (
    <div className="checkups-scans-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity className="text-primary" size={28} />
            Book Check-ups & Scans
          </h1>
          <p className="page-subtitle">
            Book certified master health checkups, 3T MRI, 128-Slice CT scans, 4D ultrasounds and clinical lab panels
          </p>
        </div>

        <Button
          variant={activeTab === 'my-bookings' ? 'primary' : 'outline'}
          size="md"
          icon={Calendar}
          onClick={() => setActiveTab(activeTab === 'my-bookings' ? 'all' : 'my-bookings')}
        >
          My Booked Tests ({bookings.length})
        </Button>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap', backgroundColor: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'all' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'all' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s'
          }}
        >
          All Diagnostic Services ({defaultPackages.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'packages' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'packages' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s'
          }}
        >
          Full Body Checkup Packages
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'scans' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'scans' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s'
          }}
        >
          Scans & Radiology (MRI/CT/USG)
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'tests' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'tests' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s'
          }}
        >
          Pathology & Blood Profiles
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'my-bookings' ? '#059669' : 'transparent',
            color: activeTab === 'my-bookings' ? 'white' : 'var(--neutral-700)',
            transition: 'all 0.2s'
          }}
        >
          My Scheduled Bookings ({bookings.length})
        </button>
      </div>

      {/* VIEW: MY BOOKINGS */}
      {activeTab === 'my-bookings' ? (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neutral-900)', margin: 0 }}>
                My Scheduled Diagnostic Tests & Scans
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Confirmed appointments for {patientDisplayName}. Show this booking slip at hospital diagnostic desk.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>
              + Book Another Test
            </Button>
          </div>

          {bookings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {bookings.map((booking) => (
                <Card key={booking.id} style={{ padding: '1.5rem', borderLeft: '5px solid #059669', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-neutral" style={{ fontWeight: '800' }}>{booking.id}</span>
                    <span className="badge badge-success" style={{ fontWeight: '800' }}>● {booking.status}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                      {booking.packageName}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: '700', margin: 0 }}>
                      Patient: {booking.patientName || patientDisplayName}
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Calendar size={15} color="var(--primary-600)" />
                      <span>Date & Time: <strong>{booking.date} at {booking.time}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                      <MapPin size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>Location: <strong>{booking.center}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <AlertCircle size={15} color="#d97706" />
                      <span>Prep: <strong style={{ color: '#b45309' }}>{booking.fasting}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Payable / Paid</span>
                      <p style={{ margin: 0, fontWeight: '900', fontSize: '1.1rem', color: '#059669' }}>{booking.amount}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Showing Booking Pass for Token ${booking.id}. Please present at the Diagnostic Reception Desk.`)}
                    >
                      View Booking Slip
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
              <Activity size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>No Bookings Yet</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                You have not scheduled any check-ups or diagnostic scans yet.
              </p>
              <Button variant="primary" size="md" onClick={() => setActiveTab('all')}>
                Explore Health Packages
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* VIEW: PACKAGES / SCANS / TESTS CATALOG */
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: '1.75rem', maxWidth: '550px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search packages, MRI scans, CT scans, blood tests (e.g. Lipid, Thyroid)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                hoverable
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderTop: item.category === 'packages' ? '4px solid #059669' : item.category === 'scans' ? '4px solid #0284c7' : '4px solid #7c3aed',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="badge" style={{
                    backgroundColor: item.category === 'packages' ? '#ecfdf5' : item.category === 'scans' ? '#e0f2fe' : '#f5f3ff',
                    color: item.category === 'packages' ? '#065f46' : item.category === 'scans' ? '#0369a1' : '#6d28d9',
                    fontWeight: '800'
                  }}>
                    {item.category === 'packages' ? 'Package' : item.category === 'scans' ? 'Advanced Scan' : 'Blood Profile'} • {item.testsCount}
                  </span>

                  {item.popular && (
                    <span className="badge badge-warning" style={{ fontWeight: '800' }}>
                      ★ Most Popular
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.35rem 0' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {item.tagline}
                  </p>
                </div>

                {/* Fasting note */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.785rem', color: '#92400e', fontWeight: '700' }}>
                  <Clock size={14} style={{ flexShrink: 0 }} />
                  <span>{item.fastingRequired}</span>
                </div>

                {/* Tests included preview */}
                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Key Inclusions:
                  </span>
                  <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--neutral-800)', lineHeight: 1.6 }}>
                    {item.testsIncluded.slice(0, 4).map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                    {item.testsIncluded.length > 4 && (
                      <li style={{ color: 'var(--primary-600)', fontWeight: '700' }}>
                        + {item.testsIncluded.length - 4} more specialized parameters
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price and CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--neutral-900)' }}>{item.price}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>{item.originalPrice}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>{item.discount}</span>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Includes Radiologist / Pathologist Report</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Calendar}
                    onClick={() => handleOpenBooking(item)}
                  >
                    Book Slot
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedItem && (
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          title={`Schedule: ${selectedItem.name}`}
        >
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#065f46' }}>{selectedItem.name}</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669' }}>{selectedItem.price}</span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#047857' }}>
                Patient: <strong>{patientDisplayName}</strong> (ID: {user?.medicalID || 'MC-8942-021'})
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Select Diagnostic Hospital / Scan Center *
              </label>
              <select
                value={bookingForm.center}
                onChange={(e) => setBookingForm({ ...bookingForm, center: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
                required
              >
                {selectedItem.centers.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Preferred Slot *
                </label>
                <select
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  required
                >
                  <option value="07:30 AM">07:30 AM (Fasting Slot)</option>
                  <option value="08:30 AM">08:30 AM (Fasting Slot)</option>
                  <option value="09:30 AM">09:30 AM (Fasting Slot)</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Service Mode
              </label>
              <select
                value={bookingForm.mode}
                onChange={(e) => setBookingForm({ ...bookingForm, mode: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
              >
                <option value="Hospital Center Visit">Hospital Center Visit (State-of-art Facilities)</option>
                <option value="Home Sample Collection">Home Sample Collection (Certified Phlebotomist)</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.825rem', color: '#92400e' }}>
              <strong>Preparation Guideline:</strong> {selectedItem.fastingRequired}. Please carry previous prescription or doctor recommendation if available.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Confirm Booking ({selectedItem.price})
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

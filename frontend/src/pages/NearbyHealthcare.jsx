import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  Star,
  Eye,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { coimbatoreHospitals, coimbatoreDoctors } from '../data/mockData';
import './pages.css';

export const NearbyHealthcare = () => {
  const [activeTab, setActiveTab] = useState('hospitals'); // 'hospitals' | 'doctors'

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('ALL');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('ALL');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');

  // Modals & Booking Flow
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilityModalDoctor, setAvailabilityModalDoctor] = useState(null);

  // Booking Flow States
  const [bookingMode, setBookingMode] = useState('Online'); // 'Online' | 'Offline'
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDate, setBookingDate] = useState('2026-09-28');
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Filtered Doctors
  const filteredDoctors = coimbatoreDoctors.filter(doc => {
    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.diseaseTreated.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDisease = true;
    if (selectedDiseaseFilter !== 'ALL') {
      matchesDisease = doc.diseaseTreated.some(d => d.toLowerCase() === selectedDiseaseFilter.toLowerCase());
    }

    const matchesSpecialty = selectedSpecialtyFilter === 'ALL' || doc.specialty.toLowerCase() === selectedSpecialtyFilter.toLowerCase();
    const matchesHospital = selectedHospitalFilter === 'ALL' || doc.hospital.toLowerCase().includes(selectedHospitalFilter.toLowerCase());

    return matchesSearch && matchesDisease && matchesSpecialty && matchesHospital;
  });

  // Filtered Hospitals
  const filteredHospitals = coimbatoreHospitals.filter(hosp => {
    const matchesSearch =
      searchQuery === '' ||
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.departments.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHospitalFilter = selectedHospitalFilter === 'ALL' || hosp.name.toLowerCase().includes(selectedHospitalFilter.toLowerCase());

    return matchesSearch && matchesHospitalFilter;
  });

  const handleDiseaseClick = (disease, targetSpecialty) => {
    setSelectedDiseaseFilter(disease);
    setSelectedSpecialtyFilter(targetSpecialty);
    setActiveTab('doctors');
  };

  const handleStartBooking = (doctor, defaultMode = 'Online', hospital = null) => {
    setSelectedDoctor(doctor || coimbatoreDoctors[0]);
    if (hospital) setSelectedHospital(hospital);
    else {
      const foundHosp = coimbatoreHospitals.find(h => doctor?.hospital.includes(h.name)) || coimbatoreHospitals[0];
      setSelectedHospital(foundHosp);
    }
    setBookingMode(defaultMode);
    setBookingStep(1);
    setCreatedAppointment(null);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    const aptId = `APT-COIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt = {
      id: aptId,
      doctor: selectedDoctor.name,
      hospital: selectedDoctor.hospital || selectedHospital?.name || 'KMCH',
      date: bookingDate,
      time: bookingTime,
      mode: bookingMode,
      status: 'Confirmed'
    };
    setCreatedAppointment(newApt);
    setBookingStep(2);
  };

  return (
    <div className="hospitals-doctors-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 🚨 Emergency Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #10b981',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🏥</span>
          <div>
            <h4 style={{ margin: 0, color: '#047857', fontWeight: '800', fontSize: '0.95rem' }}>COIMBATORE SUPER-SPECIALTY HEALTHCARE & DOCTORS DIRECTORY</h4>
            <p style={{ margin: 0, color: '#065f46', fontSize: '0.825rem' }}>Find specialist doctors, inspect OPD availability & book consultations</p>
          </div>
        </div>
        <a href="tel:108" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" icon={PhoneCall}>
            Call 108 Emergency
          </Button>
        </a>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Hospitals & Doctors</h1>
          <p className="page-subtitle">Coimbatore super-specialty medical centers & specialist doctors list</p>
        </div>
      </div>

      {/* Disease Shortcut Chips */}
      <div style={{ backgroundColor: 'var(--primary-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-200)', marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-800)', display: 'block', marginBottom: '0.5rem' }}>
          💡 Quick Disease to Specialist Finder:
        </span>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleDiseaseClick('Fever', 'General Physician')} className="badge badge-info" style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Fever → General Physician
          </button>
          <button onClick={() => handleDiseaseClick('Diabetes', 'Diabetologist')} className="badge badge-success" style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Diabetes → Diabetologist
          </button>
          <button onClick={() => handleDiseaseClick('Heart', 'Cardiologist')} className="badge badge-danger" style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Heart → Cardiologist
          </button>
          <button onClick={() => handleDiseaseClick('Skin', 'Dermatologist')} className="badge badge-warning" style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Skin → Dermatologist
          </button>
        </div>
      </div>

      {/* Doctor & Hospital Search & Filter Bar */}
      <Card style={{ padding: '1.25rem', marginBottom: '2rem', backgroundColor: 'var(--surface-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Search doctor, disease or specialty
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search doctor, disease or specialty (e.g. Fever, KMCH, Dr. Kumar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Disease</label>
            <select className="form-input" value={selectedDiseaseFilter} onChange={(e) => { setSelectedDiseaseFilter(e.target.value); setActiveTab('doctors'); }}>
              <option value="ALL">All Diseases</option>
              <option value="Fever">Fever</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Heart">Heart</option>
              <option value="Skin">Skin</option>
              <option value="Joint Pain">Joint Pain</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Specialty</label>
            <select className="form-input" value={selectedSpecialtyFilter} onChange={(e) => { setSelectedSpecialtyFilter(e.target.value); setActiveTab('doctors'); }}>
              <option value="ALL">All Specialties</option>
              <option value="General Physician">General Physician</option>
              <option value="Diabetologist">Diabetologist</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurologist">Neurologist</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Hospital</label>
            <select className="form-input" value={selectedHospitalFilter} onChange={(e) => setSelectedHospitalFilter(e.target.value)}>
              <option value="ALL">All Hospitals</option>
              <option value="KMCH">KMCH</option>
              <option value="GKNM">GKNM Hospital</option>
              <option value="PSG">PSG Hospitals</option>
              <option value="Ganga">Ganga Hospital</option>
              <option value="Sri Ramakrishna">Sri Ramakrishna</option>
              <option value="Royal Care">Royal Care</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabs between Hospitals & Doctors */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: 'var(--neutral-100)', padding: '0.3rem', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('hospitals')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'hospitals' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'hospitals' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          Coimbatore Hospitals ({filteredHospitals.length})
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'doctors' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'doctors' ? 'white' : 'var(--neutral-600)',
            transition: 'all 0.2s'
          }}
        >
          Doctors List ({filteredDoctors.length})
        </button>
      </div>

      {/* HOSPITALS GRID */}
      {activeTab === 'hospitals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {filteredHospitals.map((hosp) => (
            <Card key={hosp.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--primary-600)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={hosp.image} alt={hosp.name} style={{ width: '75px', height: '75px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{hosp.rating}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({hosp.reviews} reviews)</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neutral-900)' }}>{hosp.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {hosp.location}</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: 0 }}><strong>Contact:</strong> {hosp.contact}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  {hosp.departments.slice(0, 3).map((dept, i) => (
                    <span key={i} className="badge badge-info" style={{ fontSize: '0.75rem' }}>{dept}</span>
                  ))}
                  {hosp.departments.length > 3 && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>+{hosp.departments.length - 3} more</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setSelectedHospital(hosp)}>
                  View Hospital
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedHospitalFilter(hosp.name); setActiveTab('doctors'); }}>
                  View Doctors
                </Button>
                <Button variant="primary" size="sm" style={{ gridColumn: 'span 2' }} onClick={() => handleStartBooking(coimbatoreDoctors[0], 'Offline', hosp)}>
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DOCTORS IN LIST FORMAT (REQUIREMENT 2) */}
      {activeTab === 'doctors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {filteredDoctors.map((doc) => (
            <Card key={doc.id} style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-600)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                
                {/* Doctor Avatar & Basic Info */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <img src={doc.avatar} alt={doc.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '3px solid var(--primary-200)' }} />
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-success" style={{ fontWeight: '800' }}>{doc.specialty}</span>
                      <span className="badge badge-neutral">{doc.experience}</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--neutral-900)', marginTop: '0.25rem' }}>
                      {doc.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary-700)', fontWeight: '700', margin: '0.1rem 0' }}>
                      🏥 Hospital: {doc.hospital}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Treated Diseases: {doc.diseaseTreated.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Schedule & Consultation Badges */}
                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <Calendar size={15} color="var(--primary-600)" />
                    <span><strong>Available Days:</strong> {doc.availableDays}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                    <Clock size={15} color="var(--primary-600)" />
                    <span><strong>Available Time:</strong> {doc.availableTime}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <Video size={13} /> Online Availability: Available for Video Call
                    </span>
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <User size={13} /> Offline Availability: Available for Hospital OPD
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement 2 Buttons: View Availability & Book Appointment */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <Button variant="outline" size="md" icon={Eye} onClick={() => setAvailabilityModalDoctor(doc)}>
                  View Availability
                </Button>
                <Button variant="primary" size="md" icon={ChevronRight} iconPosition="right" onClick={() => handleStartBooking(doc, 'Online')}>
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Doctor Schedule Availability Modal */}
      {availabilityModalDoctor && (
        <Modal
          isOpen={Boolean(availabilityModalDoctor)}
          onClose={() => setAvailabilityModalDoctor(null)}
          title={`Doctor Availability Schedule — ${availabilityModalDoctor.name}`}
          subtitle={`${availabilityModalDoctor.specialty} • ${availabilityModalDoctor.hospital}`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', backgroundColor: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
              <img src={availabilityModalDoctor.avatar} alt={availabilityModalDoctor.name} style={{ width: '65px', height: '65px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{availabilityModalDoctor.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: '700' }}>{availabilityModalDoctor.specialty} • Consultation Fee: {availabilityModalDoctor.fee}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem' }}>Available Time Slots & OPD Schedule:</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--neutral-900)' }}>Morning Session (Mon - Sat)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>10:00 AM – 01:00 PM (15 Min slots)</p>
                </div>
                <span className="badge badge-success">Available</span>
              </div>

              <div style={{ padding: '0.85rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--neutral-900)' }}>Evening Session (Mon - Sat)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>05:00 PM – 08:00 PM (15 Min slots)</p>
                </div>
                <span className="badge badge-success">Available</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setAvailabilityModalDoctor(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => { const d = availabilityModalDoctor; setAvailabilityModalDoctor(null); handleStartBooking(d, 'Online'); }}>
                Book Appointment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hospital Details Modal */}
      {selectedHospital && !selectedDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedHospital(null)}
          title={`Hospital Details — ${selectedHospital.name}`}
          subtitle={`Location: ${selectedHospital.location}`}
        >
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <img src={selectedHospital.image} alt={selectedHospital.name} style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neutral-900)' }}>{selectedHospital.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {selectedHospital.location}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: '700' }}>📞 {selectedHospital.contact}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Departments & Specialties:</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {selectedHospital.departments.map((dept, i) => (
                <span key={i} className="badge badge-info">{dept}</span>
              ))}
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem' }}>Doctors at {selectedHospital.name}:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {coimbatoreDoctors.filter(d => d.hospital.includes(selectedHospital.name) || selectedHospital.name.includes(d.hospital)).map(doc => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: '800' }}>{doc.name}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.specialty} • {doc.experience}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => { setSelectedHospital(null); handleStartBooking(doc, 'Online'); }}>
                    Book Doctor
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Requirement 3: APPOINTMENT BOOKING MODAL (SEPARATE ONLINE & OFFLINE FLOWS) */}
      {selectedDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDoctor(null)}
          title={bookingStep === 1 ? (bookingMode === 'Online' ? 'ONLINE APPOINTMENT FLOW' : 'OFFLINE APPOINTMENT FLOW') : 'Appointment Confirmed!'}
          subtitle={bookingMode === 'Online' ? `Doctor → Available Date → Available Time → Confirm` : `Hospital → Doctor → Available Date → Available Time → Confirm`}
        >
          {bookingStep === 1 ? (
            <form onSubmit={handleConfirmBooking} className="auth-form" style={{ padding: '0.5rem 0' }}>
              
              {/* Consultation Mode Selection Bar */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-800)', display: 'block', marginBottom: '0.4rem' }}>
                  Select Consultation Type:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setBookingMode('Online')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      background: bookingMode === 'Online' ? 'var(--primary-600)' : 'var(--neutral-100)',
                      color: bookingMode === 'Online' ? 'white' : 'var(--neutral-700)'
                    }}
                  >
                    📹 ONLINE APPOINTMENT
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('Offline')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      background: bookingMode === 'Offline' ? '#059669' : 'var(--neutral-100)',
                      color: bookingMode === 'Offline' ? 'white' : 'var(--neutral-700)'
                    }}
                  >
                    🏥 OFFLINE APPOINTMENT
                  </button>
                </div>
              </div>

              {/* Requirement 3 Flow Preview Step Tracker */}
              <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--primary-200)', fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-800)' }}>
                {bookingMode === 'Online' ? (
                  <span>Flow: Doctor ({selectedDoctor.name}) → Available Date → Available Time → Confirm</span>
                ) : (
                  <span>Flow: Hospital ({selectedDoctor.hospital}) → Doctor ({selectedDoctor.name}) → Available Date → Available Time → Confirm</span>
                )}
              </div>

              {/* Flow Step Inputs */}
              {bookingMode === 'Offline' && (
                <div className="form-group">
                  <label>Step 1: Hospital</label>
                  <input type="text" className="form-input" value={selectedDoctor.hospital} disabled />
                </div>
              )}

              <div className="form-group">
                <label>{bookingMode === 'Online' ? 'Step 1: Doctor' : 'Step 2: Doctor'}</label>
                <input type="text" className="form-input" value={`${selectedDoctor.name} (${selectedDoctor.specialty})`} disabled />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>{bookingMode === 'Online' ? 'Step 2: Available Date' : 'Step 3: Available Date'}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{bookingMode === 'Online' ? 'Step 3: Available Time' : 'Step 4: Available Time'}</label>
                  <select
                    className="form-input"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="05:15 PM">05:15 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
                <Button type="button" variant="outline" onClick={() => setSelectedDoctor(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm Appointment ({bookingMode})
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)' }}>Appointment Confirmed!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Your {createdAppointment.mode} appointment has been booked.
              </p>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border-subtle)' }}>
                <div><strong>Appointment ID:</strong> <span className="badge badge-neutral">{createdAppointment.id}</span></div>
                <div><strong>Doctor:</strong> {createdAppointment.doctor}</div>
                <div><strong>Hospital:</strong> {createdAppointment.hospital}</div>
                <div><strong>Date & Time:</strong> {createdAppointment.date} at {createdAppointment.time}</div>
                <div><strong>Consultation Mode:</strong> <span className={`badge ${createdAppointment.mode === 'Online' ? 'badge-info' : 'badge-success'}`}>{createdAppointment.mode}</span></div>
                <div><strong>Status:</strong> <span className="badge badge-success">{createdAppointment.status}</span></div>
              </div>

              <Button variant="primary" style={{ width: '100%' }} onClick={() => setSelectedDoctor(null)}>
                Done & Return to List
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

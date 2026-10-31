import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Video,
  User,
  Building2,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Send,
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Stethoscope,
  Info,
  CalendarDays,
  Check,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { usePatientData } from '../context/PatientContext';
import { coimbatoreHospitals, coimbatoreDoctors, APPOINTMENT_CATEGORIES } from '../data/mockData';
import './pages.css';

export const Appointments = () => {
  const { user } = useAuth();
  const patientDisplayName = user?.name || 'Patient';
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab'); // 'book' | 'scheduled'

  const [activeMainTab, setActiveMainTab] = useState(urlTab || 'book'); // 'book' | 'scheduled'

  const {
    appointments,
    bookOfflineAppointment,
    requestOnlineAppointment,
    rescheduleAppointment,
    doctorAcceptOnlineAppointment,
    doctorRejectOnlineAppointment,
    cancelAppointment
  } = usePatientData();

  // Workflow State for Booking (Select Category → Condition → Relevant Doctors → Select Doctor → Slot → Confirm → View)
  const [currentStep, setCurrentStep] = useState(1); // 1: Category, 2: Condition, 3: Relevant Doctors, 4: Slot, 5: Confirm
  const [selectedCategory, setSelectedCategory] = useState(null); // Category object A/B/C/D
  const [selectedCondition, setSelectedCondition] = useState(null); // Condition object
  const [conditionSearchQuery, setConditionSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Doctor object
  const [appointmentType, setAppointmentType] = useState('Offline'); // 'Offline' | 'Online'
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [bookingSuccessModal, setBookingSuccessModal] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Reschedule Modal State
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

  // Active Online Consultation Modal State (Encrypted Video Room)
  const [activeConsultationApt, setActiveConsultationApt] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: `Hello ${patientDisplayName}, Dr. Kumar here. How are you feeling today?`, time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Sync state if URL searchParams change
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveMainTab(tabParam);
    }
  }, [searchParams]);

  // Flatten all 60 conditions for global search
  const allConditions = useMemo(() => {
    return APPOINTMENT_CATEGORIES.flatMap(cat =>
      cat.conditions.map(cond => ({ ...cond, categoryId: cat.id, categoryName: cat.name }))
    );
  }, []);

  // Filter conditions based on search
  const filteredConditions = useMemo(() => {
    if (!conditionSearchQuery.trim()) {
      return selectedCategory ? selectedCategory.conditions : [];
    }
    const q = conditionSearchQuery.toLowerCase().trim();
    if (selectedCategory) {
      return selectedCategory.conditions.filter(c => c.name.toLowerCase().includes(q) || c.specialty.toLowerCase().includes(q));
    }
    return allConditions.filter(c => c.name.toLowerCase().includes(q) || c.specialty.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q));
  }, [selectedCategory, conditionSearchQuery, allConditions]);

  // Find relevant doctors based on condition and specialty without inventing assignments
  const relevantDoctors = useMemo(() => {
    if (!selectedCondition) return [];
    return coimbatoreDoctors.filter(doc => {
      // 1. Check if specialty matches
      const specialtyMatches = doc.specialty.toLowerCase() === selectedCondition.specialty.toLowerCase();
      // 2. Check if disease treated list contains condition
      const diseaseMatches = (doc.diseaseTreated || []).some(
        d => d.toLowerCase() === selectedCondition.name.toLowerCase()
      );
      // 3. Category match
      const categoryMatches = (doc.consultationCategories || []).some(
        cat => selectedCategory && cat.toLowerCase() === selectedCategory.name.toLowerCase()
      );
      return specialtyMatches || diseaseMatches || (categoryMatches && specialtyMatches);
    });
  }, [selectedCondition, selectedCategory]);

  // Helper to check if doctor and time slot is already booked (double-booking prevention)
  const isSlotBooked = (doctorName, date, time, excludeId = null) => {
    return appointments.some(a =>
      a.id !== excludeId &&
      a.doctor === doctorName &&
      a.date === date &&
      a.time === time &&
      a.status !== 'Cancelled' &&
      a.status !== 'Declined'
    );
  };

  // Step 1: Category selection
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setConditionSearchQuery('');
    setCurrentStep(2);
  };

  // Step 2: Condition selection
  const handleSelectCondition = (cond) => {
    setSelectedCondition(cond);
    if (!selectedCategory && cond.categoryId) {
      const parentCat = APPOINTMENT_CATEGORIES.find(c => c.id === cond.categoryId);
      if (parentCat) setSelectedCategory(parentCat);
    }
    setCurrentStep(3);
  };

  // Step 3: Doctor selection
  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    // Auto select first available slot
    const slots = doc.availableSlots || ["10:00 AM", "11:30 AM", "04:30 PM", "05:30 PM"];
    setSelectedTimeSlot(slots[0] || '10:00 AM');
    setCurrentStep(4);
  };

  // Step 5: Confirm Booking
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDoctor || !selectedCondition || !selectedDate || !selectedTimeSlot) {
      setBookingError('Please complete all booking selections.');
      return;
    }

    // Double-booking check
    if (isSlotBooked(selectedDoctor.name, selectedDate, selectedTimeSlot)) {
      setBookingError(`Double-booking prevented: ${selectedDoctor.name} is already booked on ${selectedDate} at ${selectedTimeSlot}. Please select another slot.`);
      return;
    }

    try {
      const hosp = coimbatoreHospitals.find(h => h.id === selectedDoctor.hospitalId) || {
        name: selectedDoctor.hospital || 'KMCH Hospital',
        location: 'Avinashi Road, Peelamedu, Coimbatore',
        contact: '+91 422 432 3800'
      };

      let newApt;
      if (appointmentType === 'Offline') {
        newApt = bookOfflineAppointment({
          hospital: hosp.name,
          clinicAddress: hosp.location,
          contact: hosp.contact,
          doctorId: selectedDoctor.id,
          doctor: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          condition: selectedCondition.name,
          category: selectedCategory ? selectedCategory.name : 'General',
          date: selectedDate,
          time: selectedTimeSlot,
          notes: symptomDescription.trim() || `Consultation for ${selectedCondition.name}`
        });
      } else {
        newApt = requestOnlineAppointment({
          hospital: hosp.name,
          doctorId: selectedDoctor.id,
          doctor: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          condition: selectedCondition.name,
          category: selectedCategory ? selectedCategory.name : 'General',
          date: selectedDate,
          time: selectedTimeSlot,
          notes: symptomDescription.trim() || `Online consultation for ${selectedCondition.name}`
        });
      }

      setBookingSuccessModal(newApt);
    } catch (err) {
      setBookingError(err.message || 'Failed to complete appointment booking.');
    }
  };

  // Reschedule handler
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    setRescheduleError('');

    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both date and time slot.');
      return;
    }

    try {
      rescheduleAppointment(rescheduleModalApt.id, rescheduleDate, rescheduleTime);
      setRescheduleModalApt(null);
    } catch (err) {
      setRescheduleError(err.message || 'Rescheduling conflict.');
    }
  };

  // Consultation Chat Send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'patient', text: chatInput, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'doctor',
          text: `Thank you for sharing your symptoms, ${patientDisplayName}. I have reviewed your medical file. Let us begin the consultation.`,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  const resetBookingWorkflow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedCondition(null);
    setSelectedDoctor(null);
    setSelectedTimeSlot('');
    setSymptomDescription('');
    setBookingError('');
  };

  return (
    <div className="appointments-page fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Educational Non-Diagnostic Notice */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1.5px solid #3b82f6',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Info size={22} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.45' }}>
          <strong>Clinical Routing Notice:</strong> MediCare+ connects you with licensed doctors based on your chosen consultation category. <em>This portal does not diagnose patients based on symptoms.</em> Always consult a healthcare professional.
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Appointment Booking System</h1>
          <p className="page-subtitle">
            Seamless multi-step doctor consultation booking with slot conflict prevention & schedule tracking
          </p>
        </div>

        {/* Tab Switcher: Book Appointment vs Scheduled Appointments */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--neutral-100)', padding: '0.35rem', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => {
              setActiveMainTab('book');
              setSearchParams({ tab: 'book' });
            }}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMainTab === 'book' ? 'var(--primary-600)' : 'transparent',
              color: activeMainTab === 'book' ? 'white' : 'var(--neutral-700)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <CalendarCheck size={16} /> Book Appointment
          </button>
          <button
            onClick={() => {
              setActiveMainTab('scheduled');
              setSearchParams({ tab: 'scheduled' });
            }}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMainTab === 'scheduled' ? '#059669' : 'transparent',
              color: activeMainTab === 'scheduled' ? 'white' : 'var(--neutral-700)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Clock size={16} /> Scheduled Appointments ({appointments.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BOOK APPOINTMENT (GUIDED 7-STEP WORKFLOW)                           */}
      {/* ========================================================================= */}
      {activeMainTab === 'book' && (
        <div className="booking-workflow-section fade-in">
          {/* Step Indicator Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            overflowX: 'auto',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Condition' },
              { num: 3, label: 'Relevant Doctors' },
              { num: 4, label: 'Select Slot' },
              { num: 5, label: 'Confirm' }
            ].map((step, idx) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div
                    onClick={() => {
                      if (isPassed) setCurrentStep(step.num);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: isPassed ? 'pointer' : 'default',
                      opacity: isCurrent ? 1 : isPassed ? 0.85 : 0.45
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? 'var(--primary-600)' : isPassed ? '#10b981' : 'var(--neutral-300)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.8rem'
                    }}>
                      {isPassed ? '✓' : step.num}
                    </div>
                    <span style={{
                      fontWeight: isCurrent ? '800' : '600',
                      fontSize: '0.875rem',
                      color: isCurrent ? 'var(--neutral-900)' : 'var(--neutral-600)',
                      whiteSpace: 'nowrap'
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 4 && (
                    <ChevronRight size={16} style={{ color: 'var(--neutral-400)', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* STEP 1: SELECT CATEGORY */}
          {currentStep === 1 && (
            <div className="step-category fade-in">
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.35rem 0' }}>
                  Step 1: Select Consultation Category
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Choose from the 4 primary consultation categories covering all 60 medical options.
                </p>
              </div>

              {/* Global search within all 60 conditions */}
              <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
                <input
                  type="text"
                  placeholder="Or search directly among 60 conditions (e.g. Fever, Diabetes, Skin Allergy, Sinusitis)..."
                  value={conditionSearchQuery}
                  onChange={(e) => setConditionSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              {/* If search query entered, show matching conditions directly */}
              {conditionSearchQuery ? (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Matching Conditions ({filteredConditions.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {filteredConditions.map(cond => (
                      <Card
                        key={cond.id}
                        hoverable
                        onClick={() => handleSelectCondition(cond)}
                        style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: '4px solid var(--primary-600)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>#{cond.id}</span>
                          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{cond.specialty}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>{cond.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category {cond.categoryId}: {cond.categoryName}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                /* 4 Primary Categories Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  {APPOINTMENT_CATEGORIES.map(cat => (
                    <Card
                      key={cat.id}
                      hoverable
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        padding: '1.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        borderTop: cat.id === 'A' ? '4px solid #059669' : cat.id === 'B' ? '4px solid #2563eb' : cat.id === 'C' ? '4px solid #7c3aed' : '4px solid #d97706'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', fontWeight: '800', fontSize: '0.85rem' }}>
                          Category {cat.id}
                        </span>
                        <span className="badge badge-success">15 Options</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--neutral-900)', margin: 0 }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                        {cat.description}
                      </p>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '800', fontSize: '0.85rem', color: 'var(--primary-600)' }}>
                        Browse 15 Conditions <ChevronRight size={16} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT CONDITION (EXACTLY 15 PER CATEGORY / 60 TOTAL) */}
          {currentStep === 2 && selectedCategory && (
            <div className="step-condition fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-info">Category {selectedCategory.id}</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)', margin: 0 }}>
                      {selectedCategory.name}
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    Select one of the 15 conditions below to display relevant doctors.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                  ← Change Category
                </Button>
              </div>

              {/* Conditions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {selectedCategory.conditions.map(cond => (
                  <Card
                    key={cond.id}
                    hoverable
                    onClick={() => handleSelectCondition(cond)}
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      borderLeft: '4px solid var(--primary-600)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Option {cond.id}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>{cond.specialty}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0.25rem 0' }}>
                      {cond.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: '700', marginTop: 'auto' }}>
                      Find Available Doctors →
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: VIEW RELEVANT DOCTORS */}
          {currentStep === 3 && selectedCondition && (
            <div className="step-doctors fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-success">Selected: {selectedCondition.name}</span>
                    <span className="badge badge-info">Specialty: {selectedCondition.specialty}</span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)', margin: 0 }}>
                    Relevant Doctors ({relevantDoctors.length})
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Doctors displayed strictly according to configured specialties and consultation categories.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                  ← Change Condition
                </Button>
              </div>

              {relevantDoctors.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                  {relevantDoctors.map(doc => (
                    <Card
                      key={doc.id}
                      hoverable
                      onClick={() => handleSelectDoctor(doc)}
                      style={{
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        border: selectedDoctor?.id === doc.id ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
                        />
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.2rem 0' }}>
                            {doc.name}
                          </h3>
                          <span className="badge badge-info" style={{ fontWeight: '700' }}>{doc.specialty}</span>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                            {doc.experience} • {doc.hospital}
                          </p>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Consultation Hours:</span>
                          <strong>{doc.availableTime}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Available Days:</span>
                          <strong>{doc.availableDays}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Consultation Fee:</span>
                          <strong style={{ color: '#059669' }}>{doc.fee}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#b45309' }}>
                          ⭐ {doc.rating} Rating
                        </span>
                        <Button variant="primary" size="sm" icon={CalendarCheck}>
                          Select Doctor & Pick Slot
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card style={{ padding: '3rem', textAlign: 'center' }}>
                  <AlertCircle size={36} style={{ color: '#d97706', margin: '0 auto 0.75rem' }} />
                  <h3>No configured doctor matches this exact condition</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Consulting our Chief General Physician (Dr. Kumar) is recommended.</p>
                  <Button variant="primary" onClick={() => handleSelectDoctor(coimbatoreDoctors[0])}>
                    Consult Dr. Kumar (General Physician)
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* STEP 4: SELECT AVAILABLE SLOT & APPOINTMENT TYPE */}
          {currentStep === 4 && selectedDoctor && selectedCondition && (
            <div className="step-slot fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                    Step 4: Select Appointment Date, Time & Consultation Type
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Consulting with <strong>{selectedDoctor.name}</strong> ({selectedDoctor.specialty}) for <strong>{selectedCondition.name}</strong>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                  ← Change Doctor
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Left Card: Type & Date Picker */}
                <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      Consultation Mode:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setAppointmentType('Offline')}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: appointmentType === 'Offline' ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                          backgroundColor: appointmentType === 'Offline' ? 'var(--primary-50)' : 'white',
                          color: appointmentType === 'Offline' ? 'var(--primary-700)' : 'var(--neutral-700)',
                          fontWeight: '800',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Building2 size={16} /> Physical Hospital OPD
                      </button>

                      <button
                        type="button"
                        onClick={() => setAppointmentType('Online')}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: appointmentType === 'Online' ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                          backgroundColor: appointmentType === 'Online' ? 'var(--primary-50)' : 'white',
                          color: appointmentType === 'Online' ? 'var(--primary-700)' : 'var(--neutral-700)',
                          fontWeight: '800',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Video size={16} /> Online Teleconsultation
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      Select Consultation Date:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '0.95rem',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      Optional Symptom Notes (Non-diagnostic):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Briefly state your concern or past medical context for the doctor..."
                      value={symptomDescription}
                      onChange={(e) => setSymptomDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </Card>

                {/* Right Card: Available Time Slots with Conflict Detection */}
                <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
                      Available Slots for {selectedDate}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Real-time conflict detection prevents double-booking of doctors and slots.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {(selectedDoctor.availableSlots || ["09:30 AM", "10:30 AM", "11:30 AM", "04:30 PM", "05:30 PM", "06:30 PM"]).map(slot => {
                      const booked = isSlotBooked(selectedDoctor.name, selectedDate, slot);
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={booked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          style={{
                            padding: '0.75rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2.5px solid var(--primary-600)' : booked ? '1px dashed #fca5a5' : '1.5px solid var(--border-subtle)',
                            backgroundColor: booked ? '#fef2f2' : isSelected ? 'var(--primary-50)' : 'white',
                            color: booked ? '#991b1b' : isSelected ? 'var(--primary-800)' : 'var(--neutral-800)',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            cursor: booked ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.2rem',
                            opacity: booked ? 0.6 : 1
                          }}
                        >
                          <Clock size={14} />
                          <span>{slot}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>
                            {booked ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {bookingError && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '700' }}>
                      {bookingError}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentStep(5)}
                      disabled={!selectedTimeSlot || isSlotBooked(selectedDoctor.name, selectedDate, selectedTimeSlot)}
                      style={{ width: '100%' }}
                    >
                      Review & Confirm Booking →
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRM BOOKING FORM */}
          {currentStep === 5 && selectedDoctor && selectedCondition && (
            <div className="step-confirm fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                  Step 5: Review & Confirm Consultation
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Please verify your consultation details before finalizing your slot.
                </p>
              </div>

              <Card style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto', borderTop: '5px solid var(--primary-600)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>SELECTED CONDITION</span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0.2rem 0' }}>
                      {selectedCondition.name}
                    </h4>
                    <span className="badge badge-info">{selectedCategory?.name || 'General Consultation'}</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DOCTOR & SPECIALTY</span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0.2rem 0' }}>
                      {selectedDoctor.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: '700', margin: 0 }}>
                      {selectedDoctor.specialty} • {selectedDoctor.fee} Fee
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>HOSPITAL / CLINIC</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0.2rem 0' }}>
                      {selectedDoctor.hospital}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avinashi Road, Coimbatore</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>CONSULTATION SLOT & MODE</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669', margin: '0.2rem 0' }}>
                      {selectedDate} at {selectedTimeSlot}
                    </h4>
                    <span className="badge badge-success">Mode: {appointmentType} Visit</span>
                  </div>
                </div>

                {symptomDescription && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--neutral-700)' }}>Patient Notes:</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--neutral-800)' }}>
                      "{symptomDescription}"
                    </p>
                  </div>
                )}

                {bookingError && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: '700', fontSize: '0.875rem' }}>
                    {bookingError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    ← Back to Slots
                  </Button>
                  <Button variant="primary" size="lg" icon={Check} onClick={handleConfirmBooking}>
                    Confirm & Reserve Appointment
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULED APPOINTMENTS VIEW (WITH RESCHEDULE & CANCEL)             */}
      {/* ========================================================================= */}
      {activeMainTab === 'scheduled' && (
        <div className="scheduled-appointments-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                Your Scheduled Appointments ({appointments.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Chronological schedule of in-person OPD tokens and verified teleconsultations.
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => { setActiveMainTab('book'); resetBookingWorkflow(); }}>
              Book Another Appointment
            </Button>
          </div>

          {appointments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {appointments.map(apt => (
                <Card
                  key={apt.id}
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderLeft: apt.status === 'Confirmed' || apt.status === 'Accepted' ? '5px solid #059669' : apt.status === 'Cancelled' ? '5px solid #e11d48' : '5px solid #d97706'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-neutral" style={{ fontWeight: '800' }}>{apt.id}</span>
                    <span className={`badge ${
                      apt.status === 'Confirmed' || apt.status === 'Accepted' ? 'badge-success' :
                      apt.status === 'Cancelled' ? 'badge-neutral' : 'badge-warning'
                    }`} style={{ fontWeight: '800' }}>
                      ● {apt.status}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>
                      {apt.doctor}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: '700', margin: 0 }}>
                      {apt.specialty} • Condition: <strong>{apt.condition || apt.reason || 'General'}</strong>
                    </p>
                  </div>

                  {/* Hospital, Clinic, Date & Time Details */}
                  <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Building2 size={16} color="var(--primary-600)" />
                      <span>Hospital / Clinic: <strong>{apt.hospital}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CalendarDays size={16} color="#059669" />
                      <span>Date & Time: <strong>{apt.date} at {apt.time}</strong></span>
                    </div>

                    {apt.type === 'Offline' && apt.tokenNo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Clock size={16} color="var(--text-muted)" />
                        <span>OPD Token: <strong style={{ color: '#047857' }}>{apt.tokenNo}</strong></span>
                      </div>
                    )}

                    {apt.type === 'Online' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Video size={16} color="#0284c7" />
                        <span>Room Code: <strong>{apt.roomCode || 'MEDICARE-DR-PRIYA-7741'}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Doctor consultation notes if added */}
                  {apt.consultationNotes && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                      <strong style={{ color: '#166534' }}>Doctor's Advice:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#14532d' }}>{apt.consultationNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons: Join (if online & accepted), Reschedule, Cancel */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                    {apt.type === 'Online' && (apt.status === 'Accepted' || apt.consultationAvailable) && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Video}
                        onClick={() => setActiveConsultationApt(apt)}
                        style={{ width: '100%', backgroundColor: '#059669', borderColor: '#059669' }}
                      >
                        Join Video Consultation Room
                      </Button>
                    )}

                    {apt.status !== 'Cancelled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Calendar}
                          onClick={() => {
                            setRescheduleModalApt(apt);
                            setRescheduleDate(apt.date);
                            setRescheduleTime(apt.time);
                            setRescheduleError('');
                          }}
                          style={{ flex: 1 }}
                        >
                          Reschedule Slot
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={X}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel appointment ${apt.id} with ${apt.doctor}?`)) {
                              cancelAppointment(apt.id);
                            }
                          }}
                          style={{ color: '#e11d48', borderColor: '#fecdd3' }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <Clock size={40} style={{ color: 'var(--neutral-400)', margin: '0 auto 1rem' }} />
              <h3>No scheduled appointments found</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't scheduled any doctor consultations yet.</p>
              <Button variant="primary" onClick={() => { setActiveMainTab('book'); resetBookingWorkflow(); }}>
                Book Your First Consultation
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BOOKING CONFIRMATION & REDIRECTION MODAL                         */}
      {/* ========================================================================= */}
      {bookingSuccessModal && (
        <Modal
          isOpen={!!bookingSuccessModal}
          onClose={() => setBookingSuccessModal(null)}
          title="Appointment Confirmed Successfully!"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="badge badge-success" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Reference ID: {bookingSuccessModal.id}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--neutral-900)', margin: '0.35rem 0' }}>
              {bookingSuccessModal.doctor}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary-700)', fontWeight: '700', margin: 0 }}>
              {bookingSuccessModal.specialty} • {bookingSuccessModal.hospital}
            </p>

            <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', margin: '1.5rem 0', textAlign: 'left', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time Slot:</span>
                <strong>{bookingSuccessModal.date} at {bookingSuccessModal.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Condition Reason:</span>
                <strong>{bookingSuccessModal.condition || 'General Consultation'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Consultation Mode:</span>
                <strong style={{ color: '#059669' }}>{bookingSuccessModal.type} Visit</strong>
              </div>
              {bookingSuccessModal.tokenNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>OPD Token:</span>
                  <strong style={{ color: '#047857', fontSize: '1.1rem' }}>{bookingSuccessModal.tokenNo}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button
                variant="primary"
                size="lg"
                icon={Clock}
                onClick={() => {
                  setBookingSuccessModal(null);
                  setActiveMainTab('scheduled');
                  resetBookingWorkflow();
                }}
              >
                View Scheduled Appointment →
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESCHEDULE APPOINTMENT                                           */}
      {/* ========================================================================= */}
      {rescheduleModalApt && (
        <Modal
          isOpen={!!rescheduleModalApt}
          onClose={() => setRescheduleModalApt(null)}
          title={`Reschedule Appointment: ${rescheduleModalApt.doctor}`}
        >
          <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Current slot: <strong>{rescheduleModalApt.date} at {rescheduleModalApt.time}</strong>
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                Choose New Date:
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                Choose New Time Slot:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {["09:30 AM", "10:30 AM", "11:30 AM", "04:30 PM", "05:30 PM", "06:30 PM"].map(slot => {
                  const booked = isSlotBooked(rescheduleModalApt.doctor, rescheduleDate, slot, rescheduleModalApt.id);
                  const isSel = rescheduleTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => setRescheduleTime(slot)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSel ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                        backgroundColor: booked ? '#fef2f2' : isSel ? 'var(--primary-50)' : 'white',
                        color: booked ? '#991b1b' : isSel ? 'var(--primary-700)' : 'var(--neutral-800)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: booked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {rescheduleError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '700' }}>
                {rescheduleError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setRescheduleModalApt(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm Rescheduling
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ENCRYPTED TELECONSULTATION VIDEO ROOM                           */}
      {/* ========================================================================= */}
      {activeConsultationApt && (
        <Modal
          isOpen={!!activeConsultationApt}
          onClose={() => setActiveConsultationApt(null)}
          title={`Live Teleconsultation: ${activeConsultationApt.doctor}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Mock Encrypted Video Feed */}
            <div style={{
              height: '240px',
              backgroundColor: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              position: 'relative'
            }}>
              <Stethoscope size={48} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{activeConsultationApt.doctor}</h4>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Encrypted Peer-to-Peer Medical Channel • HD Audio & Video</span>

              {/* Call Control Buttons */}
              <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsMicOn(!isMicOn)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: isMicOn ? 'rgba(255,255,255,0.2)' : '#e11d48', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: isVideoOn ? 'rgba(255,255,255,0.2)' : '#e11d48', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConsultationApt(null)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#e11d48', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>

            {/* In-Call Consultation Chat */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
              <div style={{ height: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'patient' ? 'var(--primary-600)' : 'var(--neutral-100)',
                      color: msg.sender === 'patient' ? 'white' : 'var(--neutral-900)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.825rem',
                      maxWidth: '85%'
                    }}
                  >
                    <strong>{msg.sender === 'patient' ? 'You' : activeConsultationApt.doctor}:</strong> {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type a clinical query or symptom update..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                />
                <Button variant="primary" size="sm" icon={Send} type="submit">
                  Send
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

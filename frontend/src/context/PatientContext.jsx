import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  mockPrescriptions as initialPrescriptionsData,
  mockMedicalHistory as initialMedicalHistoryData,
  mockHealthRecords as initialHealthRecordsData,
  coimbatoreHospitals,
  coimbatoreDoctors
} from '../data/mockData';
import { sampleMedicines } from '../data/medicinesData';

const PatientContext = createContext(null);

const STORAGE_KEYS = {
  PRESCRIPTIONS: 'medicare_patient_prescriptions',
  ROUTINE_MEDICINES: 'medicare_patient_routine_medicines',
  REPORTS: 'medicare_patient_reports',
  APPOINTMENTS: 'medicare_patient_appointments',
  NOTIFICATIONS: 'medicare_patient_notifications',
  ORDERS: 'medicare_patient_orders',
  HOSPITAL_BILLS: 'medicare_hospital_bills',
  DIAGNOSTIC_BOOKINGS: 'medicare_diagnostic_bookings',
  VACCINATIONS: 'medicare_vaccinations',
  MEDICINE_REMINDERS: 'medicare_medicine_reminders',
  CATALOGUE_MEDICINES: 'medicare_catalogue_medicines',
  MEDICAL_HISTORY: 'medicare_patient_medical_history'
};

const defaultOrders = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2026-1001',
    patientId: 'usr_101',
    patientName: 'Patient',
    patientContact: '+91 98765 43210',
    items: [
      { medicineId: 'med_1', name: 'Paracetamol', quantity: 2, unitPrice: 40, lineTotal: 80, prescriptionRequired: false },
      { medicineId: 'med_3', name: 'ORS', quantity: 1, unitPrice: 30, lineTotal: 30, prescriptionRequired: false }
    ],
    subtotal: 110,
    tax: 6,
    total: 116,
    status: 'Confirmed',
    prescriptionRequired: false,
    prescriptionAttached: false,
    prescriptionVerified: true,
    orderDate: '2026-10-18',
    orderTime: '10:30 AM',
    billed: true,
    billId: 'KMCH-PHARM-2026-8021'
  }
];

const defaultHospitalBills = [
  {
    id: 'hosp_bill_1',
    billNo: 'KMCH-HOSP-2026-4412',
    type: 'Hospital',
    patientName: 'Patient',
    patientId: 'MC-8942-021',
    hospital: 'KMCH Super-Specialty Hospital',
    serviceCategory: 'OPD Consultation & Clinical Examination',
    doctorName: 'Dr. Kumar',
    roomNo: 'OPD Room 4',
    date: '2026-10-15',
    subtotal: 1000,
    taxAmount: 50,
    amount: '₹1,050',
    numericAmount: 1050,
    status: 'Paid',
    paymentMode: 'UPI / Cash',
    items: [{ description: 'OPD General Consultation Fee', quantity: 1, unitPrice: 1000, lineTotal: 1000 }]
  },
  {
    id: 'pharm_bill_1',
    billNo: 'KMCH-PHARM-2026-8021',
    type: 'Pharmacy',
    patientName: 'Patient',
    patientId: 'MC-8942-021',
    hospital: 'KMCH Hospital Pharmacy Counter',
    date: '2026-10-18',
    orderId: 'ORD-2026-1001',
    items: [
      { id: 'med_1', medicine: 'Paracetamol', quantity: 2, unitPrice: 40, lineTotal: 80 },
      { id: 'med_3', medicine: 'ORS', quantity: 1, unitPrice: 30, lineTotal: 30 }
    ],
    subtotal: 110,
    discountAmount: 0,
    taxAmount: 6,
    amount: '₹116',
    numericAmount: 116,
    status: 'Paid',
    paymentMode: 'Cash / UPI Counter',
    prescriptionVerified: true
  }
];

const defaultDiagnosticBookings = [
  {
    id: 'DIAG-2026-3011',
    packageId: 'pkg-1',
    packageName: 'Comprehensive Master Health Checkup',
    type: 'Health Checkup',
    center: 'KMCH Diagnostic Wing',
    date: '2026-10-24',
    time: '08:30 AM',
    patientName: 'Patient',
    patientContact: '+91 98765 43210',
    fastingRequired: '10-12 Hours Overnight Fasting Required',
    price: '₹2,499',
    numericPrice: 2499,
    status: 'Confirmed',
    notes: 'Whole-body parameters checkup. Overnight fasting advised.'
  }
];

const defaultVaccinations = [
  {
    id: 'vac_1',
    name: 'COVID-19 Bivalent Booster',
    date: '15 Jan 2026',
    administeredBy: 'KMCH Immunization Hub',
    status: 'Completed',
    dose: 'Booster Dose',
    batchNo: 'COV-BN-8821',
    certificateAvailable: true,
    reminderEnabled: false
  },
  {
    id: 'vac_2',
    name: 'Influenza (Flu) Shot 2026',
    date: '2026-10-28',
    administeredBy: 'MetroCare Health Hub',
    status: 'Due Soon',
    dose: 'Annual Dose',
    batchNo: 'FLU-2026-Q4',
    certificateAvailable: false,
    reminderEnabled: true
  },
  {
    id: 'vac_3',
    name: 'Hepatitis B (Recombinant)',
    date: '2026-11-15',
    administeredBy: 'KMCH Immunization Hub',
    status: 'Scheduled',
    dose: 'Booster Shot',
    batchNo: 'Pending',
    certificateAvailable: false,
    reminderEnabled: true
  }
];

const defaultMedicineReminders = [
  {
    id: 'rem_1',
    medicineName: 'Paracetamol 650mg',
    instructions: 'Take after meals with warm water',
    time: '08:00 AM',
    frequency: 'Twice Daily (Morning + Night)',
    startDate: '2026-10-18',
    endDate: '2026-10-25',
    active: true,
    prescriptionId: 'rx_101',
    category: 'today',
    taken: true,
    statusText: 'Taken at 08:15 AM'
  },
  {
    id: 'rem_2',
    medicineName: 'Paracetamol 650mg',
    instructions: 'Take after dinner',
    time: '08:30 PM',
    frequency: 'Twice Daily (Morning + Night)',
    startDate: '2026-10-18',
    endDate: '2026-10-25',
    active: true,
    prescriptionId: 'rx_101',
    category: 'today',
    taken: false,
    statusText: 'Due Tonight'
  },
  {
    id: 'rem_3',
    medicineName: 'Metformin 500mg',
    instructions: 'Take immediately after dinner',
    time: '09:00 PM',
    frequency: 'Once Daily (Night)',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    active: true,
    prescriptionId: 'rx_102',
    category: 'today',
    taken: false,
    statusText: 'Due Tonight'
  }
];

// Initial Routine Medicines (Dynamic long-term / daily medications)
const defaultRoutineMedicines = [
  {
    id: 'rtm_1',
    name: 'Metformin 500mg',
    category: 'Sugar / Diabetes',
    dosage: '500 mg (1 Tablet)',
    frequency: 'Once Daily',
    timing: 'Night (After Dinner)',
    startDate: '2026-01-10',
    endDate: '2026-12-31',
    reminderEnabled: true,
    takenToday: true,
    lastTakenAt: 'Today at 08:30 PM',
    notes: 'Prescribed for blood glucose control. Take with or after food.'
  },
  {
    id: 'rtm_2',
    name: 'Telmisartan 40mg',
    category: 'Blood Pressure (BP)',
    dosage: '40 mg (1 Tablet)',
    frequency: 'Once Daily',
    timing: 'Morning (After Breakfast)',
    startDate: '2026-02-01',
    endDate: '',
    reminderEnabled: true,
    takenToday: false,
    lastTakenAt: 'Yesterday at 08:15 AM',
    notes: 'Long-term hypertension management. Keep monitoring BP.'
  },
  {
    id: 'rtm_3',
    name: 'Vitamin D3 60K IU',
    category: 'Weekly Supplement',
    dosage: '1 Softgel Capsule',
    frequency: 'Weekly',
    timing: 'Sunday Morning (With Milk)',
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    reminderEnabled: true,
    takenToday: false,
    lastTakenAt: 'Last Sunday at 09:00 AM',
    notes: 'Supports bone health and vitamin D deficiency recovery.'
  }
];

// Initial Enhanced Prescriptions
const defaultPrescriptions = [
  {
    id: 'rx_101',
    code: 'RX-2026-9021',
    doctorName: 'Dr. Kumar',
    hospitalName: 'KMCH (Kovai Medical Center)',
    diagnosis: 'Viral Fever & Body Ache',
    prescriptionDate: '20 Sep 2026',
    expiryDate: '26 Sep 2026',
    duration: '5 Days',
    medicineName: 'Paracetamol 650mg',
    dosage: '1 Tablet',
    frequency: 'Twice Daily (Morning + Night)',
    instructions: 'Take after meals with warm water. Stay well-hydrated.',
    status: 'ACTIVE',
    saved: false,
    reminderEnabled: true,
    dietPlanCondition: 'fever',
    dietPlanName: 'Fever Recovery & Hydration Diet Plan'
  },
  {
    id: 'rx_102',
    code: 'RX-2026-8812',
    doctorName: 'Dr. Priya',
    hospitalName: 'ABC Hospital',
    diagnosis: 'Type-2 Glycemic Evaluation',
    prescriptionDate: '10 Feb 2026',
    expiryDate: '10 Nov 2026',
    duration: '90 Days',
    medicineName: 'Metformin 500mg',
    dosage: '1 Tablet',
    frequency: 'Once Daily (Night)',
    instructions: 'Take immediately after dinner. Avoid skipped doses.',
    status: 'ACTIVE',
    saved: true,
    reminderEnabled: true,
    dietPlanCondition: 'diabetes',
    dietPlanName: 'Diabetic & Low Glycemic Diet Plan'
  },
  {
    id: 'rx_103',
    code: 'RX-2025-4402',
    doctorName: 'Dr. Kumar',
    hospitalName: 'KMCH (Kovai Medical Center)',
    diagnosis: 'Upper Respiratory Infection',
    prescriptionDate: '20 Aug 2025',
    expiryDate: '27 Aug 2025',
    duration: '7 Days',
    medicineName: 'Amoxicillin 500mg',
    dosage: '1 Capsule',
    frequency: 'Twice Daily (Morning + Night)',
    instructions: 'Complete antibiotic course as directed. Course ended.',
    status: 'INACTIVE',
    saved: true,
    reminderEnabled: false,
    dietPlanCondition: null,
    dietPlanName: null
  },
  {
    id: 'rx_104',
    code: 'RX-2025-1104',
    doctorName: 'Dr. Sarah Jenkins',
    hospitalName: 'MetroCare Hospital',
    diagnosis: 'Acute Throat Congestion',
    prescriptionDate: '15 Dec 2025',
    expiryDate: '18 Dec 2025',
    duration: '3 Days',
    medicineName: 'Azithromycin 500mg',
    dosage: '1 Tablet',
    frequency: 'Once Daily (Morning)',
    instructions: 'Take 1 hour before breakfast. Course completed.',
    status: 'INACTIVE',
    saved: false,
    reminderEnabled: false,
    dietPlanCondition: null,
    dietPlanName: null
  }
];

// Initial Reports (Private to logged-in patient)
const defaultReports = [
  {
    id: 'rep_1',
    name: 'Complete Blood Count (CBC) Panel',
    reportType: 'Blood Test Report',
    uploadDate: '2026-09-20',
    hospital: 'KMCH (Kovai Medical Center)',
    doctor: 'Dr. Kumar',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    fileName: 'CBC_Report_KMCH_Sep2026.pdf',
    status: 'Verified / Normal',
    isPrivate: true,
    patientName: 'Patient',
    summary: 'WBC: 7,200/mcL (Normal). Platelets: 240,000/mcL. Hemoglobin: 14.5 g/dL. No acute abnormality.'
  },
  {
    id: 'rep_2',
    name: 'HbA1c & Fasting Glucose Profile',
    reportType: 'Lab Report',
    uploadDate: '2026-02-10',
    hospital: 'ABC Hospital',
    doctor: 'Dr. Priya',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    fileName: 'HbA1c_Glucose_Feb2026.pdf',
    status: 'Controlled',
    isPrivate: true,
    patientName: 'Patient',
    summary: 'HbA1c: 6.8%. Fasting Blood Glucose: 110 mg/dL. Postprandial Glucose: 145 mg/dL.'
  },
  {
    id: 'rep_3',
    name: 'Digital Chest X-Ray (PA View)',
    reportType: 'Radiology Scan',
    uploadDate: '2025-12-15',
    hospital: 'MetroCare Hospital',
    doctor: 'Dr. Sarah Jenkins',
    fileSize: '4.2 MB',
    fileType: 'image/jpeg',
    fileName: 'Chest_XRay_Dec2025.jpg',
    status: 'Clear',
    isPrivate: true,
    patientName: 'Patient',
    summary: 'Clear bilateral lung fields, normal cardiothoracic ratio, costophrenic angles sharp.'
  }
];

// Initial Offline & Online Appointments
const defaultAppointments = [
  {
    id: 'APT-OFF-9012',
    type: 'Offline',
    hospital: 'KMCH (Kovai Medical Center)',
    clinicAddress: 'Avinashi Road, Peelamedu, Coimbatore',
    contact: '+91 422 432 3800',
    doctor: 'Dr. Kumar',
    specialty: 'General Physician',
    date: '2026-10-15',
    time: '10:30 AM',
    tokenNo: 'TK-OPD-18',
    status: 'Confirmed',
    condition: 'Fever',
    notes: 'Physical hospital consultation for viral recovery follow-up.'
  },
  {
    id: 'APT-ONL-7741',
    type: 'Online',
    hospital: 'ABC Hospital',
    doctor: 'Dr. Priya',
    specialty: 'Diabetologist',
    date: '2026-10-18',
    time: '05:00 PM',
    status: 'Accepted',
    doctorAccepted: true,
    consultationAvailable: true,
    roomCode: 'MEDICARE-DR-PRIYA-7741',
    condition: 'Diabetes',
    notes: 'Routine blood sugar & HbA1c review online consultation.'
  },
  {
    id: 'APT-ONL-8830',
    type: 'Online',
    hospital: 'Ganga Hospital',
    doctor: 'Dr. M. Karthik',
    specialty: 'Orthopedics',
    date: '2026-10-22',
    time: '11:00 AM',
    status: 'Pending Doctor Acceptance',
    doctorAccepted: false,
    consultationAvailable: false,
    condition: 'Joint Pain',
    notes: 'Inquiry regarding occasional knee strain after exercise.'
  }
];

// Initial Centralized Notifications
const defaultNotifications = [
  {
    id: 'notif_1',
    title: 'Routine Medicine Due: Telmisartan 40mg',
    message: 'Your morning BP dose is due. Please remember to take it after breakfast.',
    type: 'medicine_reminder',
    time: '10 mins ago',
    unread: true,
    link: '/reminders'
  },
  {
    id: 'notif_2',
    title: 'Online Consultation Accepted by Dr. Priya',
    message: 'Dr. Priya has accepted your Online Appointment for Oct 18, 5:00 PM. Consultation feature is now available.',
    type: 'online_appointment',
    time: '45 mins ago',
    unread: true,
    link: '/appointments?tab=scheduled'
  },
  {
    id: 'notif_3',
    title: 'Prescription Expiry Reminder',
    message: 'Prescription RX-2026-9021 (Paracetamol 650mg) will end in 2 days. Consult doctor if fever recurs.',
    type: 'prescription_reminder',
    time: '3 hours ago',
    unread: true,
    link: '/prescriptions?tab=ACTIVE'
  },
  {
    id: 'notif_4',
    title: 'Diet-Plan Notification: Fever Recovery',
    message: 'Reminder from Dr. Kumar: Take warm clear vegetable soup and tender coconut water today.',
    type: 'diet_reminder',
    time: '5 hours ago',
    unread: false,
    link: '/diet-plan'
  },
  {
    id: 'notif_5',
    title: 'Upcoming Offline Hospital Appointment',
    message: 'Your in-person OPD visit at KMCH with Dr. Kumar is on Oct 15 at 10:30 AM. Token #TK-OPD-18.',
    type: 'offline_appointment',
    time: 'Yesterday',
    unread: false,
    link: '/appointments?tab=scheduled'
  },
  {
    id: 'notif_6',
    title: 'Medical Report Verified & Stored',
    message: 'CBC Blood Panel from KMCH is safely uploaded to your private health documents.',
    type: 'medical_report',
    time: '2 days ago',
    unread: false,
    link: '/medical-history-reports?tab=reports'
  },
  {
    id: 'notif_7',
    title: 'Vaccination Due: Influenza (Flu) Shot 2026',
    message: 'Your annual influenza vaccine is scheduled for Sep 25 at MetroCare Health Hub. Tap to view or reschedule.',
    type: 'vaccination_reminder',
    time: '4 hours ago',
    unread: true,
    link: '/vaccinations'
  },
  {
    id: 'notif_8',
    title: 'Vaccination Booster: Hepatitis B',
    message: 'Booster immunization dose is due next month. Ensure your immunization card is up to date.',
    type: 'vaccination_reminder',
    time: '3 days ago',
    unread: false,
    link: '/vaccinations'
  }
];

export const PatientDataProvider = ({ children }) => {
  // 1. Prescriptions
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      return saved ? JSON.parse(saved) : defaultPrescriptions;
    } catch {
      return defaultPrescriptions;
    }
  });

  // 2. Routine Medicines
  const [routineMedicines, setRoutineMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINE_MEDICINES);
      return saved ? JSON.parse(saved) : defaultRoutineMedicines;
    } catch {
      return defaultRoutineMedicines;
    }
  });

  // 3. Medical Reports
  const [medicalReports, setMedicalReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : defaultReports;
    } catch {
      return defaultReports;
    }
  });

  // 4. Appointments
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : defaultAppointments;
    } catch {
      return defaultAppointments;
    }
  });

  // 5. Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : defaultNotifications;
    } catch {
      return defaultNotifications;
    }
  });

  // 6. Catalogue Medicines (Exact 10 Medicines with prices & stock)
  const [catalogueMedicines, setCatalogueMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATALOGUE_MEDICINES);
      return saved ? JSON.parse(saved) : sampleMedicines;
    } catch {
      return sampleMedicines;
    }
  });

  // 7. Orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : defaultOrders;
    } catch {
      return defaultOrders;
    }
  });

  // 8. Hospital & Pharmacy Bills
  const [hospitalBills, setHospitalBills] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITAL_BILLS);
      return saved ? JSON.parse(saved) : defaultHospitalBills;
    } catch {
      return defaultHospitalBills;
    }
  });

  // 9. Diagnostic Bookings (Checkups & Scans)
  const [diagnosticBookings, setDiagnosticBookings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIAGNOSTIC_BOOKINGS);
      return saved ? JSON.parse(saved) : defaultDiagnosticBookings;
    } catch {
      return defaultDiagnosticBookings;
    }
  });

  // 10. Vaccinations
  const [vaccinations, setVaccinations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VACCINATIONS);
      return saved ? JSON.parse(saved) : defaultVaccinations;
    } catch {
      return defaultVaccinations;
    }
  });

  // 11. Medicine Reminders
  const [medicineReminders, setMedicineReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDICINE_REMINDERS);
      return saved ? JSON.parse(saved) : defaultMedicineReminders;
    } catch {
      return defaultMedicineReminders;
    }
  });

  // 12. Combined Medical History Across Hospitals
  const [medicalHistory, setMedicalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDICAL_HISTORY);
      return saved ? JSON.parse(saved) : initialMedicalHistoryData;
    } catch {
      return initialMedicalHistoryData;
    }
  });

  const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5000}/api`;

  const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('medicare_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders
    };
  };

  // Initial Sync from Backend if running
  useEffect(() => {
    let isMounted = true;
    const syncFromBackend = async () => {
      try {
        const token = localStorage.getItem('medicare_auth_token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const [rxRes, medRes, repRes, aptRes, notifRes, ordRes, billRes, pharmBillRes, diagRes, vacRes, remRes, catRes, histRes] = await Promise.allSettled([
          fetch(`${API_BASE}/patient/prescriptions`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/routine-medicines`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/reports`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/appointments`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/notifications`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/orders`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/hospital/bills`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/hospital/pharmacy-bills`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/diagnostic-bookings`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/vaccinations`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/patient/reminders`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/medicines`),
          fetch(`${API_BASE}/patient/medical-history`, { headers: { ...authHeader } })
        ]);

        if (!isMounted) return;

        if (rxRes.status === 'fulfilled' && rxRes.value.ok) {
          const json = await rxRes.value.json();
          if (json.data && json.data.length > 0) setPrescriptions(json.data);
          else if (Array.isArray(json) && json.length > 0) setPrescriptions(json);
        }
        if (medRes.status === 'fulfilled' && medRes.value.ok) {
          const json = await medRes.value.json();
          if (json.data && json.data.length > 0) setRoutineMedicines(json.data);
          else if (Array.isArray(json) && json.length > 0) setRoutineMedicines(json);
        }
        if (repRes.status === 'fulfilled' && repRes.value.ok) {
          const json = await repRes.value.json();
          if (json.data && json.data.length > 0) setMedicalReports(json.data);
          else if (Array.isArray(json) && json.length > 0) setMedicalReports(json);
        }
        if (aptRes.status === 'fulfilled' && aptRes.value.ok) {
          const json = await aptRes.value.json();
          if (json.data && json.data.length > 0) setAppointments(json.data);
          else if (Array.isArray(json) && json.length > 0) setAppointments(json);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
          const json = await notifRes.value.json();
          if (json.data && json.data.length > 0) setNotifications(json.data);
          else if (Array.isArray(json) && json.length > 0) setNotifications(json);
        }
        if (ordRes.status === 'fulfilled' && ordRes.value.ok) {
          const json = await ordRes.value.json();
          if (json.data && json.data.length > 0) setOrders(json.data);
          else if (Array.isArray(json) && json.length > 0) setOrders(json);
        }
        let mergedBills = [];
        if (billRes.status === 'fulfilled' && billRes.value.ok) {
          const json = await billRes.value.json();
          if (json.bills && json.bills.length > 0) mergedBills = [...json.bills];
          else if (json.data && json.data.length > 0) mergedBills = [...json.data];
        }
        if (pharmBillRes.status === 'fulfilled' && pharmBillRes.value.ok) {
          const json = await pharmBillRes.value.json();
          const pBills = (json.bills || json.data || []).map((b) => ({ ...b, type: 'Pharmacy' }));
          if (pBills.length > 0) mergedBills = [...mergedBills, ...pBills];
        }
        if (mergedBills.length > 0) {
          setHospitalBills(mergedBills);
        }
        if (diagRes.status === 'fulfilled' && diagRes.value.ok) {
          const json = await diagRes.value.json();
          if (json.data && json.data.length > 0) setDiagnosticBookings(json.data);
          else if (Array.isArray(json) && json.length > 0) setDiagnosticBookings(json);
        }
        if (vacRes.status === 'fulfilled' && vacRes.value.ok) {
          const json = await vacRes.value.json();
          if (json.data && json.data.length > 0) setVaccinations(json.data);
          else if (Array.isArray(json) && json.length > 0) setVaccinations(json);
        }
        if (remRes.status === 'fulfilled' && remRes.value.ok) {
          const json = await remRes.value.json();
          if (json.data && json.data.length > 0) setMedicineReminders(json.data);
          else if (Array.isArray(json) && json.length > 0) setMedicineReminders(json);
        }
        if (catRes.status === 'fulfilled' && catRes.value.ok) {
          const json = await catRes.value.json();
          if (json.data && json.data.length > 0) setCatalogueMedicines(json.data);
          else if (Array.isArray(json) && json.length > 0) setCatalogueMedicines(json);
        }
        if (histRes.status === 'fulfilled' && histRes.value.ok) {
          const json = await histRes.value.json();
          if (Array.isArray(json) && json.length > 0) setMedicalHistory(json);
          else if (json.data && json.data.length > 0) setMedicalHistory(json.data);
        }
      } catch (err) {
        // Backend not currently reachable - local state and localStorage are fully active
      }
    };
    syncFromBackend();
    return () => { isMounted = false; };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
    } catch (e) { console.warn(e); }
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINE_MEDICINES, JSON.stringify(routineMedicines));
    } catch (e) { console.warn(e); }
  }, [routineMedicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(medicalReports));
    } catch (e) { console.warn(e); }
  }, [medicalReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) { console.warn(e); }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) { console.warn(e); }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) { console.warn(e); }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOSPITAL_BILLS, JSON.stringify(hospitalBills));
    } catch (e) { console.warn(e); }
  }, [hospitalBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTIC_BOOKINGS, JSON.stringify(diagnosticBookings));
    } catch (e) { console.warn(e); }
  }, [diagnosticBookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(vaccinations));
    } catch (e) { console.warn(e); }
  }, [vaccinations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINE_REMINDERS, JSON.stringify(medicineReminders));
    } catch (e) { console.warn(e); }
  }, [medicineReminders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATALOGUE_MEDICINES, JSON.stringify(catalogueMedicines));
    } catch (e) { console.warn(e); }
  }, [catalogueMedicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICAL_HISTORY, JSON.stringify(medicalHistory));
    } catch (e) { console.warn(e); }
  }, [medicalHistory]);

  // ==================== NOTIFICATIONS ====================
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      time: 'Just now',
      unread: true,
      ...notif
    };
    setNotifications((prev) => [newNotif, ...prev]);
    fetch(`${API_BASE}/patient/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch(() => {});
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    fetch(`${API_BASE}/patient/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const toggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    fetch(`${API_BASE}/patient/notifications/read-all`, { method: 'PUT' }).catch(() => {});
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`${API_BASE}/patient/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    fetch(`${API_BASE}/patient/notifications`, { method: 'DELETE' }).catch(() => {});
  };

  // ==================== PRESCRIPTIONS ====================
  const savePrescription = (id) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === id) {
          const updated = { ...rx, saved: true };
          addNotification({
            title: `Prescription Saved: ${rx.code}`,
            message: `Prescription for ${rx.medicineName} by ${rx.doctorName} saved to records.`,
            type: 'prescription_reminder',
            link: `/prescriptions?tab=${rx.status}`
          });
          return updated;
        }
        return rx;
      })
    );
    fetch(`${API_BASE}/patient/prescriptions/${id}/save`, { method: 'POST', headers: getAuthHeaders() }).catch(() => {});
  };

  const togglePrescriptionReminder = (id) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === id) {
          const newState = !rx.reminderEnabled;
          addNotification({
            title: newState ? 'Reminder Activated' : 'Reminder Paused',
            message: `${rx.medicineName} reminder is now ${newState ? 'enabled' : 'disabled'}.`,
            type: 'prescription_reminder',
            link: `/prescriptions?tab=${rx.status}`
          });
          return { ...rx, reminderEnabled: newState };
        }
        return rx;
      })
    );
    fetch(`${API_BASE}/patient/prescriptions/${id}/toggle-reminder`, { method: 'PUT', headers: getAuthHeaders() }).catch(() => {});
  };

  // ==================== ROUTINE MEDICINES ====================
  const addRoutineMedicine = (medData) => {
    const newMed = {
      id: `rtm_${Date.now()}`,
      takenToday: false,
      lastTakenAt: 'Not taken yet today',
      ...medData
    };
    setRoutineMedicines((prev) => [newMed, ...prev]);
    addNotification({
      title: `Routine Medicine Added: ${newMed.name}`,
      message: `${newMed.name} scheduled for ${newMed.timing}.`,
      type: 'medicine_reminder',
      link: '/reminders'
    });
    fetch(`${API_BASE}/patient/routine-medicines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newMed)
    }).catch(() => {});
    return newMed;
  };

  const editRoutineMedicine = (id, updatedData) => {
    setRoutineMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedData } : med))
    );
    fetch(`${API_BASE}/patient/routine-medicines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData)
    }).catch(() => {});
  };

  const deleteRoutineMedicine = (id) => {
    setRoutineMedicines((prev) => prev.filter((med) => med.id !== id));
    fetch(`${API_BASE}/patient/routine-medicines/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => {});
  };

  const markRoutineMedicineTaken = (id, isTaken) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoutineMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = {
            ...med,
            takenToday: isTaken,
            lastTakenAt: isTaken ? `Today at ${timeStr}` : 'Marked pending'
          };
          fetch(`${API_BASE}/patient/routine-medicines/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updated)
          }).catch(() => {});
          return updated;
        }
        return med;
      })
    );
  };

  const toggleRoutineMedicineReminder = (id) => {
    setRoutineMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = { ...med, reminderEnabled: !med.reminderEnabled };
          fetch(`${API_BASE}/patient/routine-medicines/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updated)
          }).catch(() => {});
          return updated;
        }
        return med;
      })
    );
  };

  // ==================== MEDICINE REMINDERS (SECTION 9) ====================
  const addMedicineReminder = (reminderData) => {
    const newRem = {
      id: `rem_${Date.now()}`,
      active: true,
      category: 'today',
      taken: false,
      statusText: 'Due Soon',
      ...reminderData
    };
    setMedicineReminders((prev) => [newRem, ...prev]);
    addNotification({
      title: `Medicine Reminder Created: ${newRem.medicineName}`,
      message: `Dose reminder set for ${newRem.time} (${newRem.frequency || 'Daily'}).`,
      type: 'medicine_reminder',
      link: '/reminders'
    });
    fetch(`${API_BASE}/patient/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newRem)
    }).catch(() => {});
    return newRem;
  };

  const editMedicineReminder = (id, updates) => {
    setMedicineReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    fetch(`${API_BASE}/patient/reminders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const deleteMedicineReminder = (id) => {
    setMedicineReminders((prev) => prev.filter((r) => r.id !== id));
    fetch(`${API_BASE}/patient/reminders/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => {});
  };

  const toggleMedicineReminder = (id) => {
    setMedicineReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, active: !r.active };
          fetch(`${API_BASE}/patient/reminders/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updated)
          }).catch(() => {});
          return updated;
        }
        return r;
      })
    );
  };

  // ==================== VACCINATIONS (SECTION 10) ====================
  const scheduleVaccination = (vacData) => {
    const newVac = {
      id: `vac_${Date.now()}`,
      administeredBy: vacData.administeredBy || 'KMCH Immunization Hub',
      status: 'Scheduled',
      dose: vacData.dose || 'Standard Dose',
      batchNo: 'Pending',
      certificateAvailable: false,
      reminderEnabled: true,
      ...vacData
    };
    setVaccinations((prev) => [newVac, ...prev]);
    addNotification({
      title: `Vaccination Scheduled: ${newVac.name}`,
      message: `Slot reserved for ${newVac.date} at ${newVac.administeredBy}.`,
      type: 'vaccination_reminder',
      link: '/vaccinations'
    });
    fetch(`${API_BASE}/patient/vaccinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVac)
    }).catch(() => {});
    return newVac;
  };

  const toggleVaccinationReminder = (id) => {
    setVaccinations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, reminderEnabled: !v.reminderEnabled };
          fetch(`${API_BASE}/patient/vaccinations/${id}/toggle-reminder`, { method: 'PUT' }).catch(() => {});
          return updated;
        }
        return v;
      })
    );
  };

  // ==================== MEDICAL REPORTS ====================
  const uploadMedicalReport = (reportData) => {
    const newReport = {
      id: `rep_${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      isPrivate: true,
      patientName: reportData.patientName || 'Patient',
      status: 'Uploaded / Ready',
      ...reportData
    };
    setMedicalReports((prev) => [newReport, ...prev]);
    addNotification({
      title: 'Medical Report Uploaded Securely',
      message: `${newReport.name} (${newReport.reportType}) has been saved in your private records.`,
      type: 'medical_report',
      link: '/medical-history-reports?tab=reports'
    });
    fetch(`${API_BASE}/patient/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newReport)
    }).catch(() => {});
    return newReport;
  };

  const deleteMedicalReport = (id) => {
    setMedicalReports((prev) => prev.filter((r) => r.id !== id));
    fetch(`${API_BASE}/patient/reports/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => {});
  };

  // ==================== APPOINTMENTS (SECTION 3) ====================
  const checkAppointmentDoubleBooking = (doctor, date, time, excludeId = null) => {
    return appointments.some((a) =>
      a.id !== excludeId &&
      a.doctor === doctor &&
      a.date === date &&
      a.time === time &&
      a.status !== 'Cancelled' &&
      a.status !== 'Declined'
    );
  };

  const bookOfflineAppointment = (bookingData) => {
    if (checkAppointmentDoubleBooking(bookingData.doctor, bookingData.date, bookingData.time)) {
      throw new Error(`Double-booking prevented: ${bookingData.doctor} is already booked on ${bookingData.date} at ${bookingData.time}. Please select an alternate slot.`);
    }

    const token = `TK-OPD-${Math.floor(10 + Math.random() * 90)}`;
    const newApt = {
      id: `APT-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Offline',
      status: 'Confirmed',
      tokenNo: token,
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    setAppointments((prev) => [newApt, ...prev]);
    addNotification({
      title: 'Offline OPD Appointment Confirmed',
      message: `Consultation booked with ${newApt.doctor} at ${newApt.hospital} for ${newApt.date} at ${newApt.time}. Token: ${token}`,
      type: 'offline_appointment',
      link: '/appointments?tab=scheduled'
    });
    fetch(`${API_BASE}/patient/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newApt)
    }).catch(() => {});
    return newApt;
  };

  const requestOnlineAppointment = (requestData) => {
    if (checkAppointmentDoubleBooking(requestData.doctor, requestData.date, requestData.time)) {
      throw new Error(`Double-booking prevented: ${requestData.doctor} is already booked on ${requestData.date} at ${requestData.time}. Please select an alternate slot.`);
    }

    const newApt = {
      id: `APT-ONL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Online',
      status: 'Pending Doctor Acceptance',
      doctorAccepted: false,
      consultationAvailable: false,
      roomCode: `MEDICARE-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      ...requestData
    };
    setAppointments((prev) => [newApt, ...prev]);
    addNotification({
      title: 'Online Appointment Requested',
      message: `Request sent to ${newApt.doctor} for ${newApt.date} at ${newApt.time}.`,
      type: 'online_appointment',
      link: '/appointments?tab=scheduled'
    });
    fetch(`${API_BASE}/patient/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newApt)
    }).catch(() => {});
    return newApt;
  };

  const rescheduleAppointment = (id, newDate, newTime) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) throw new Error('Appointment not found');

    if (checkAppointmentDoubleBooking(apt.doctor, newDate, newTime, id)) {
      throw new Error(`Conflict: ${apt.doctor} is already booked on ${newDate} at ${newTime}. Please choose another time.`);
    }

    const updated = {
      ...apt,
      date: newDate,
      time: newTime,
      status: apt.type === 'Offline' ? 'Confirmed' : 'Pending Doctor Acceptance'
    };

    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    addNotification({
      title: `Appointment Rescheduled: ${apt.doctor}`,
      message: `Consultation moved to ${newDate} at ${newTime}.`,
      type: apt.type === 'Offline' ? 'offline_appointment' : 'online_appointment',
      link: '/appointments?tab=scheduled'
    });
    fetch(`${API_BASE}/patient/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date: newDate, time: newTime })
    }).catch(() => {});
    return updated;
  };

  const doctorAcceptOnlineAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated = {
            ...apt,
            status: 'Accepted',
            doctorAccepted: true,
            consultationAvailable: true
          };
          addNotification({
            title: `Doctor Accepted: Online Consultation Ready!`,
            message: `${apt.doctor} accepted your consultation request. Video room unlocked.`,
            type: 'online_appointment',
            link: '/appointments?tab=scheduled'
          });
          return updated;
        }
        return apt;
      })
    );
    fetch(`${API_BASE}/doctor/appointments/${id}/doctor-accept`, { method: 'PUT', headers: getAuthHeaders() }).catch(() => {});
  };

  const doctorRejectOnlineAppointment = (id, reason = 'Doctor unavailable during requested slot') => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated = {
            ...apt,
            status: 'Declined',
            doctorAccepted: false,
            consultationAvailable: false,
            declineReason: reason
          };
          addNotification({
            title: `Appointment Request Declined`,
            message: `${apt.doctor} was unable to accept: ${reason}.`,
            type: 'online_appointment',
            link: '/appointments?tab=scheduled'
          });
          return updated;
        }
        return apt;
      })
    );
    fetch(`${API_BASE}/doctor/appointments/${id}/doctor-reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    }).catch(() => {});
  };

  const doctorUpdateAppointmentStatus = (id, status, consultationNotes = '', prescriptionNotes = '') => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status: status || apt.status,
            consultationNotes: consultationNotes || apt.consultationNotes,
            prescriptionNotes: prescriptionNotes || apt.prescriptionNotes
          };
        }
        return apt;
      })
    );
    fetch(`${API_BASE}/doctor/appointments/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, consultationNotes, prescriptionNotes })
    }).catch(() => {});
  };

  const doctorAddPrescription = (rxData) => {
    const newRx = {
      id: `rx_${Date.now()}`,
      code: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: rxData.doctorName || 'Dr. Kumar',
      hospitalName: rxData.hospitalName || 'KMCH Hospital',
      diagnosis: rxData.diagnosis || 'Clinical Follow-up Consultation',
      prescriptionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: rxData.expiryDate || '30 Days',
      duration: rxData.duration || '7 Days',
      medicineName: rxData.medicineName,
      dosage: rxData.dosage || '1 Tablet',
      frequency: rxData.frequency || 'Twice Daily',
      instructions: rxData.instructions || 'Take after meals as directed.',
      status: 'ACTIVE',
      saved: true,
      reminderEnabled: true,
      appointmentId: rxData.appointmentId || null,
      ...rxData
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    addNotification({
      title: `New Prescription Added by ${newRx.doctorName}`,
      message: `${newRx.medicineName} (${newRx.dosage}) prescribed for ${newRx.diagnosis}.`,
      type: 'prescription_reminder',
      link: '/prescriptions?tab=ACTIVE'
    });
    fetch(`${API_BASE}/doctor/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newRx)
    }).catch(() => {});
    return newRx;
  };

  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
    );
    fetch(`${API_BASE}/patient/appointments/${id}/cancel`, { method: 'PUT', headers: getAuthHeaders() }).catch(() => {});
  };

  // ==================== CHECK-UPS & SCANS (SECTION 4) ====================
  const bookDiagnosticService = (bookingData) => {
    const newBooking = {
      id: `DIAG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
      ...bookingData
    };
    setDiagnosticBookings((prev) => [newBooking, ...prev]);
    addNotification({
      title: `Diagnostic Service Booked: ${newBooking.packageName}`,
      message: `Scheduled at ${newBooking.center} on ${newBooking.date} at ${newBooking.time}.`,
      type: 'medical_report',
      link: '/checkups-scans'
    });
    fetch(`${API_BASE}/patient/diagnostic-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch(() => {});
    return newBooking;
  };

  const cancelDiagnosticBooking = (id) => {
    setDiagnosticBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
    );
    fetch(`${API_BASE}/patient/diagnostic-bookings/${id}/cancel`, { method: 'PUT' }).catch(() => {});
  };

  // ==================== PATIENT MEDICINE ORDERING (SECTION 5 & 7) ====================
  const placeOrder = (orderData) => {
    const { items, patientName, patientContact, prescriptionAttached, prescriptionFileName } = orderData;
    if (!items || items.length === 0) {
      throw new Error('Cart cannot be empty');
    }

    let subtotal = 0;
    let hasRx = false;
    const validatedItems = [];

    for (const item of items) {
      const med = catalogueMedicines.find((m) => m.id === item.medicineId || m.name.toLowerCase() === item.name.toLowerCase());
      if (!med) {
        throw new Error(`Medicine "${item.name}" is not in the authorized 10-item catalogue.`);
      }
      if (med.price === undefined || med.price === null || med.price <= 0) {
        throw new Error(`Price not configured for ${med.name}. Checkout prevented.`);
      }
      if (med.stock === undefined || med.stock === null || med.stock < item.quantity) {
        throw new Error(`Insufficient inventory for ${med.name}. Available: ${med.stock || 0}`);
      }
      if (med.prescriptionRequired) {
        hasRx = true;
      }
      const lineTotal = med.price * Number(item.quantity);
      subtotal += lineTotal;
      validatedItems.push({
        medicineId: med.id,
        name: med.name,
        quantity: Number(item.quantity),
        unitPrice: med.price,
        lineTotal,
        prescriptionRequired: med.prescriptionRequired
      });
    }

    if (hasRx && !prescriptionAttached) {
      throw new Error('Prescription required for Amoxicillin. Please attach a valid prescription before placing the order.');
    }

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      patientId: 'usr_101',
      patientName: patientName || 'Patient',
      patientContact: patientContact || '+91 98765 43210',
      items: validatedItems,
      subtotal,
      tax,
      total,
      status: 'Pending',
      prescriptionRequired: hasRx,
      prescriptionAttached: !!prescriptionAttached,
      prescriptionFileName: prescriptionFileName || (hasRx ? 'Verified_Prescription.pdf' : null),
      prescriptionVerified: !hasRx,
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      billed: false
    };

    setOrders((prev) => [newOrder, ...prev]);

    addNotification({
      title: `Order Placed: ${orderNumber}`,
      message: `Your medicine order for ₹${total} has been placed. Status: Pending hospital approval.`,
      type: 'medicine_order',
      link: '/medicines'
    });

    fetch(`${API_BASE}/patient/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(() => {});

    return newOrder;
  };

  // Hospital updates order status
  const hospitalUpdateOrderStatus = (orderId, newStatus, prescriptionVerified) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          const updated = {
            ...order,
            status: newStatus || order.status,
            prescriptionVerified: prescriptionVerified !== undefined ? prescriptionVerified : order.prescriptionVerified
          };
          addNotification({
            title: `Order Status: ${order.orderNumber} is ${updated.status}`,
            message: `Hospital Pharmacy updated order status to "${updated.status}".`,
            type: 'medicine_order',
            link: '/medicines'
          });
          return updated;
        }
        return order;
      })
    );

    fetch(`${API_BASE}/hospital/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, prescriptionVerified })
    }).catch(() => {});
  };

  // Hospital generates bill from approved order
  const hospitalGenerateBillFromOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');
    if (order.billed) throw new Error(`Order ${order.orderNumber} is already billed! Duplicate billing prevented.`);

    // Deduct stock safely
    setCatalogueMedicines((prev) =>
      prev.map((med) => {
        const item = order.items.find((it) => it.medicineId === med.id || it.name === med.name);
        if (item) {
          return { ...med, stock: Math.max(0, (med.stock || 0) - item.quantity) };
        }
        return med;
      })
    );

    const billNo = `KMCH-PHARM-2026-${Math.floor(8000 + Math.random() * 1000)}`;
    const newBill = {
      id: `pharm_bill_${Date.now()}`,
      billNo,
      type: 'Pharmacy',
      patientName: order.patientName,
      patientId: order.patientId,
      hospital: 'KMCH Hospital Pharmacy Counter',
      date: new Date().toISOString().split('T')[0],
      orderId: order.orderNumber,
      items: order.items.map((it) => ({
        id: it.medicineId,
        medicine: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal
      })),
      subtotal: order.subtotal,
      discountAmount: 0,
      taxAmount: order.tax,
      amount: `₹${order.total.toLocaleString()}`,
      numericAmount: order.total,
      status: 'Paid',
      paymentMode: 'Cash / Counter',
      prescriptionVerified: order.prescriptionVerified
    };

    setHospitalBills((prev) => [newBill, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, billed: true, billId: billNo, status: 'Ready' } : o
      )
    );

    addNotification({
      title: `Bill Generated: ${billNo}`,
      message: `Pharmacy bill for order ${order.orderNumber} is generated. Status: Ready for pickup.`,
      type: 'medicine_order',
      link: '/pharmacy-bills'
    });

    const token = localStorage.getItem('medicare_auth_token');
    fetch(`${API_BASE}/hospital/orders/${orderId}/generate-bill`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => {});
    return newBill;
  };

  // Hospital issues new bill directly
  const issueHospitalBill = (billData) => {
    const isPharm = billData.type === 'Pharmacy';

    if (isPharm && billData.items) {
      // Validate stock
      for (const it of billData.items) {
        const med = catalogueMedicines.find((m) => m.id === it.id || m.name === it.medicine);
        if (med) {
          if ((med.stock || 0) < it.quantity) {
            throw new Error(`Insufficient stock for ${med.name}. Available: ${med.stock || 0}`);
          }
          if (med.prescriptionRequired && !billData.prescriptionVerified) {
            throw new Error(`Prescription verification required for ${med.name}`);
          }
        }
      }

      // Deduct stock
      setCatalogueMedicines((prev) =>
        prev.map((m) => {
          const it = billData.items.find((item) => item.id === m.id || item.medicine === m.name);
          if (it) {
            return { ...m, stock: Math.max(0, (m.stock || 0) - Number(it.quantity)) };
          }
          return m;
        })
      );
    }

    const billNo = isPharm
      ? `KMCH-PHARM-2026-${Math.floor(8000 + Math.random() * 1000)}`
      : `KMCH-HOSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill = {
      id: `${isPharm ? 'pharm' : 'hosp'}_bill_${Date.now()}`,
      billNo,
      type: billData.type || 'Hospital',
      patientName: billData.patientName || 'Patient',
      patientId: billData.patientId || 'MC-8942-021',
      hospital: isPharm ? 'KMCH Hospital Pharmacy Counter' : 'KMCH Super-Specialty Hospital',
      serviceCategory: billData.serviceCategory || (isPharm ? 'Pharmacy Dispensation' : 'OPD Consultation'),
      doctorName: billData.doctorName || 'Dr. Kumar',
      roomNo: billData.roomNo || 'OPD Room 4',
      date: new Date().toISOString().split('T')[0],
      items: billData.items || [],
      subtotal: Number(billData.subtotal || 0),
      discountAmount: Number(billData.discountAmount || 0),
      taxAmount: Number(billData.taxAmount || 0),
      amount: `₹${Number(billData.numericAmount || 0).toLocaleString()}`,
      numericAmount: Number(billData.numericAmount || 0),
      status: billData.status || 'Paid',
      paymentMode: billData.paymentMode || 'Cash / UPI Counter',
      prescriptionVerified: !!billData.prescriptionVerified
    };

    setHospitalBills((prev) => [newBill, ...prev]);

    const token = localStorage.getItem('medicare_auth_token');
    const endpoint = isPharm ? `${API_BASE}/hospital/pharmacy-bills` : `${API_BASE}/hospital/bills`;
    const payload = isPharm
      ? {
          patientName: newBill.patientName,
          patientId: newBill.patientId,
          medicines: (newBill.items || []).map((it) => ({
            medicineId: it.id,
            medicineName: it.medicine || it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice
          })),
          discount: newBill.discountAmount,
          tax: newBill.taxAmount,
          paymentStatus: (newBill.status || 'PAID').toUpperCase(),
          paymentMode: newBill.paymentMode,
          prescriptionVerified: newBill.prescriptionVerified
        }
      : {
          patientName: newBill.patientName,
          patientId: newBill.patientId,
          doctorName: newBill.doctorName,
          consultationCharges: newBill.subtotal || 500,
          treatmentCharges: 0,
          testCharges: newBill.taxAmount || 0,
          roomCharges: 0,
          otherCharges: 0,
          paymentStatus: (newBill.status || 'PAID').toUpperCase(),
          paymentMode: newBill.paymentMode,
          serviceCategory: newBill.serviceCategory,
          roomNo: newBill.roomNo
        };

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    }).catch(() => {});

    return newBill;
  };

  // Hospital updates medicine price & stock
  const updateCatalogueMedicine = (id, updates) => {
    setCatalogueMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            price: updates.price !== undefined ? Number(updates.price) : m.price,
            stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : m.stock,
            stockCount: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : m.stockCount,
            stockStatus: (updates.stock !== undefined ? Number(updates.stock) : m.stock) > 0 ? 'In Stock' : 'Out of Stock'
          };
        }
        return m;
      })
    );

    fetch(`${API_BASE}/hospital/medicines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  // Emergency Call
  const triggerEmergencyCall = () => {
    addNotification({
      title: '🚨 Emergency Assistance Triggered',
      message: 'Ambulance 108 dispatch requested & KMCH trauma center alerted.',
      type: 'medicine_reminder',
      link: '/emergency'
    });
    fetch(`${API_BASE}/patient/emergency-call`, { method: 'POST' }).catch(() => {});
  };

  return (
    <PatientContext.Provider
      value={{
        // Prescriptions
        prescriptions,
        savePrescription,
        togglePrescriptionReminder,
        doctorAddPrescription,

        // Routine Medicines
        routineMedicines,
        addRoutineMedicine,
        editRoutineMedicine,
        deleteRoutineMedicine,
        markRoutineMedicineTaken,
        toggleRoutineMedicineReminder,

        // Medical History & Reports
        medicalHistory,
        setMedicalHistory,
        medicalReports,
        uploadMedicalReport,
        deleteMedicalReport,

        // Appointments
        appointments,
        bookOfflineAppointment,
        requestOnlineAppointment,
        rescheduleAppointment,
        doctorAcceptOnlineAppointment,
        doctorRejectOnlineAppointment,
        doctorUpdateAppointmentStatus,
        doctorAddPrescription,
        cancelAppointment,

        // Diagnostic Bookings
        diagnosticBookings,
        bookDiagnosticService,
        cancelDiagnosticBooking,

        // Medicine Reminders
        medicineReminders,
        addMedicineReminder,
        editMedicineReminder,
        deleteMedicineReminder,
        toggleMedicineReminder,

        // Vaccinations
        vaccinations,
        scheduleVaccination,
        toggleVaccinationReminder,

        // Catalogue Medicines & Orders
        catalogueMedicines,
        updateCatalogueMedicine,
        orders,
        placeOrder,
        hospitalUpdateOrderStatus,
        hospitalGenerateBillFromOrder,

        // Hospital & Pharmacy Bills
        hospitalBills,
        issueHospitalBill,

        // Emergency
        triggerEmergencyCall,

        // Notifications
        notifications,
        unreadNotificationsCount: notifications.filter((n) => n.unread).length,
        addNotification,
        markNotificationAsRead,
        toggleNotificationRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientData = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientData must be used within a PatientDataProvider');
  }
  return context;
};

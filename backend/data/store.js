const fs = require('fs');
const path = require('path');
const { initialPatient } = require('./seedData');

const DATA_FILE = path.join(__dirname, '..', 'patient-data-store.json');

// Default initial state matching the frontend expectations
let dataStore = {
  profile: initialPatient,
  prescriptions: [
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
    }
  ],
  routineMedicines: [
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
  ],
  reports: [
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
      patientName: 'Thamizh',
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
      patientName: 'Thamizh',
      summary: 'HbA1c: 6.8%. Fasting Blood Glucose: 110 mg/dL. Postprandial Glucose: 145 mg/dL.'
    }
  ],
  appointments: [
    {
      id: 'APT-OFF-9012',
      type: 'Offline',
      hospital: 'KMCH (Kovai Medical Center)',
      hospitalId: 'hosp_1',
      clinicAddress: 'Avinashi Road, Peelamedu, Coimbatore',
      contact: '+91 422 432 3800',
      doctor: 'Dr. Kumar',
      specialty: 'General Physician',
      date: '2026-10-15',
      time: '10:30 AM',
      tokenNo: 'TK-OPD-18',
      status: 'Confirmed',
      patientName: 'Thamizh',
      notes: 'Physical hospital consultation for viral recovery follow-up.'
    },
    {
      id: 'APT-ONL-7741',
      type: 'Online',
      hospital: 'KMCH (Kovai Medical Center)',
      hospitalId: 'hosp_1',
      doctor: 'Dr. Priya',
      specialty: 'Diabetologist',
      date: '2026-10-18',
      time: '05:00 PM',
      status: 'Accepted',
      doctorAccepted: true,
      consultationAvailable: true,
      patientName: 'Thamizh',
      roomCode: 'MEDICARE-DR-PRIYA-7741',
      notes: 'Routine blood sugar & HbA1c review online consultation.'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'Routine Medicine Due: Telmisartan 40mg',
      message: 'Your morning BP dose is due. Please remember to take it after breakfast.',
      type: 'medicine_reminder',
      time: '10 mins ago',
      unread: true,
      link: '/routine-medicines'
    },
    {
      id: 'notif_2',
      title: 'Online Consultation Accepted by Dr. Priya',
      message: 'Dr. Priya has accepted your Online Appointment for Oct 18, 5:00 PM.',
      type: 'online_appointment',
      time: '45 mins ago',
      unread: true,
      link: '/appointments?type=online'
    }
  ],
  orders: [
    {
      id: 'ord_1',
      orderNumber: 'ORD-2026-1001',
      patientId: 'usr_101',
      patientName: 'Thamizh',
      patientContact: '+91 98765 43210',
      hospitalId: 'hosp_1',
      hospitalName: 'KMCH Hospital Pharmacy Counter',
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
  ],
  hospitalBills: [
    {
      id: 'hosp_bill_1',
      billNo: 'KMCH-HOSP-2026-4412',
      type: 'Hospital',
      patientName: 'Thamizh',
      patientId: 'MC-8942-021',
      hospital: 'KMCH Super-Specialty Hospital',
      hospitalId: 'hosp_1',
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
      patientName: 'Thamizh',
      patientId: 'MC-8942-021',
      hospital: 'KMCH Hospital Pharmacy Counter',
      hospitalId: 'hosp_1',
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
  ],
  diagnosticBookings: [
    {
      id: 'DIAG-2026-3011',
      packageId: 'pkg-1',
      packageName: 'Comprehensive Master Health Checkup',
      type: 'Health Checkup',
      center: 'KMCH Diagnostic Wing',
      hospitalId: 'hosp_1',
      date: '2026-10-24',
      time: '08:30 AM',
      patientName: 'Thamizh',
      patientContact: '+91 98765 43210',
      fastingRequired: '10-12 Hours Overnight Fasting Required',
      price: '₹2,499',
      numericPrice: 2499,
      status: 'Confirmed',
      notes: 'Whole-body parameters checkup. Overnight fasting advised.'
    }
  ],
  vaccinations: [
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
    }
  ],
  reminders: [
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
  ]
};

// Restore from file if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    dataStore = { ...dataStore, ...parsed };
  } catch (err) {
    console.warn('Could not restore from patient-data-store.json:', err.message);
  }
}

const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2));
  } catch (err) {
    console.error('Failed to save dataStore:', err.message);
  }
};

module.exports = {
  dataStore,
  saveStore
};


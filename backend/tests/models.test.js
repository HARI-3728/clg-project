const {
  Patient,
  Hospital,
  Doctor,
  Medicine,
  Appointment,
  Prescription,
  MedicineReminder,
  MedicalHistory,
  MedicalReport,
  HospitalBill,
  PharmacyBill
} = require('../models');

const runModelTests = async () => {
  console.log('====================================================');
  console.log('📊 MEDICARE+ MONGODB MODELS & RELATIONSHIPS VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      failed++;
    }
  };

  // 1. PATIENTS MODEL
  console.log('--- 1. PATIENTS MODEL VERIFICATION ---');
  const validPatient = new Patient({
    patientId: 'MC-8942-021',
    name: 'Thamizh',
    mobileNumber: '+91 98765 43210',
    email: 'thamizh@example.com',
    dateOfBirth: new Date('1998-05-15'),
    gender: 'Male',
    address: {
      street: '12 Trichy Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641018',
      fullAddress: '12 Trichy Road, Coimbatore, Tamil Nadu 641018'
    },
    profileDetails: {
      bloodGroup: 'O+',
      age: 28,
      height: '172 cm',
      weight: '68 kg',
      emergencyContact: '+91 98765 43210',
      allergies: ['Penicillin'],
      chronicConditions: ['Mild Asthma']
    }
  });

  const patientValErr = validPatient.validateSync();
  assert(!patientValErr, 'Patient model validates successfully with all required fields');
  assert(validPatient.patientId === 'MC-8942-021', 'Patient has patientId');
  assert(validPatient.mobileNumber === '+91 98765 43210', 'Patient has mobileNumber');
  assert(validPatient.profileDetails.bloodGroup === 'O+', 'Patient has profileDetails.bloodGroup');

  const invalidPatient = new Patient({});
  const invPatErr = invalidPatient.validateSync();
  assert(invPatErr && invPatErr.errors.patientId && invPatErr.errors.name && invPatErr.errors.mobileNumber, 'Patient rejects document missing patientId, name, or mobileNumber');

  // 2. HOSPITALS MODEL
  console.log('\n--- 2. HOSPITALS MODEL VERIFICATION ---');
  const validHospital = new Hospital({
    hospitalId: 'HOSP-KMCH-01',
    hospitalName: 'KMCH (Kovai Medical Center and Hospital)',
    email: 'kmch@hospital.com',
    address: {
      street: 'Avinashi Road, Peelamedu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641014',
      fullAddress: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu'
    },
    departments: ['General Medicine', 'Cardiology', 'Diabetology', 'Orthopedics'],
    contactNumber: '+91 422 432 3800'
  });
  const hospValErr = validHospital.validateSync();
  assert(!hospValErr, 'Hospital model validates successfully with all required fields');
  assert(validHospital.hospitalId === 'HOSP-KMCH-01', 'Hospital has hospitalId');
  assert(validHospital.departments.length === 4, 'Hospital has departments array');

  const invalidHosp = new Hospital({});
  const invHospErr = invalidHosp.validateSync();
  assert(invHospErr && invHospErr.errors.hospitalId && invHospErr.errors.hospitalName && invHospErr.errors.email, 'Hospital rejects document missing hospitalId, hospitalName, or email');

  // 3. DOCTORS MODEL
  console.log('\n--- 3. DOCTORS MODEL VERIFICATION ---');
  const validDoctor = new Doctor({
    doctorId: 'DOC-1001',
    doctorName: 'Dr. Kumar',
    email: 'dr.kumar@medicare.com',
    specialization: 'General Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '14 Years Exp',
    hospitalId: validHospital.hospitalId,
    consultationFee: 400,
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timing: '10:00 AM - 01:00 PM',
      availableSlots: ['10:00 AM', '11:00 AM']
    }
  });
  const docValErr = validDoctor.validateSync();
  assert(!docValErr, 'Doctor model validates successfully with all required fields');
  assert(validDoctor.doctorId === 'DOC-1001', 'Doctor has doctorId');
  assert(validDoctor.hospitalId === validHospital.hospitalId, 'Doctor is associated with hospitalId');
  assert(validDoctor.consultationFee === 400, 'Doctor has consultationFee in INR');

  // 4. MEDICINES MODEL
  console.log('\n--- 4. MEDICINES MODEL VERIFICATION ---');
  const validMedicine = new Medicine({
    medicineId: 'MED-1001',
    medicineName: 'Paracetamol 650mg',
    brand: 'Dolo 650',
    manufacturer: 'Micro Labs Ltd',
    priceInINR: 40,
    medicineCategory: 'Antipyretic / Analgesic',
    prescriptionRequired: false
  });
  const medValErr = validMedicine.validateSync();
  assert(!medValErr, 'Medicine model validates successfully with all required fields');
  assert(validMedicine.priceInINR === 40, 'Medicine price is stored as priceInINR');
  assert(validMedicine.medicineCategory === 'Antipyretic / Analgesic', 'Medicine has medicineCategory');

  // 5. APPOINTMENTS MODEL
  console.log('\n--- 5. APPOINTMENTS MODEL VERIFICATION ---');
  const validAppointment = new Appointment({
    appointmentId: 'APT-ONL-7741',
    patientId: validPatient.patientId,
    doctorId: validDoctor.doctorId,
    hospitalId: validHospital.hospitalId,
    appointmentDate: new Date('2026-10-18'),
    appointmentTime: '05:00 PM',
    appointmentType: 'ONLINE',
    status: 'ACCEPTED'
  });
  const aptValErr = validAppointment.validateSync();
  assert(!aptValErr, 'Appointment model validates successfully with ONLINE/OFFLINE enum');
  assert(validAppointment.patientId === validPatient.patientId, 'Appointment links to patientId');
  assert(validAppointment.doctorId === validDoctor.doctorId, 'Appointment links to doctorId');
  assert(validAppointment.hospitalId === validHospital.hospitalId, 'Appointment links to hospitalId');

  const invalidAptType = new Appointment({
    appointmentId: 'APT-BAD',
    patientId: 'P1',
    doctorId: 'D1',
    hospitalId: 'H1',
    appointmentDate: new Date(),
    appointmentTime: '10:00 AM',
    appointmentType: 'IN_PERSON_INVALID',
    status: 'CONFIRMED'
  });
  const invAptErr = invalidAptType.validateSync();
  assert(invAptErr && invAptErr.errors.appointmentType, 'Appointment validation rejects invalid appointmentType');

  // 6. PRESCRIPTIONS MODEL
  console.log('\n--- 6. PRESCRIPTIONS MODEL VERIFICATION ---');
  const validPrescription = new Prescription({
    prescriptionId: 'RX-2026-9021',
    patientId: validPatient.patientId,
    doctorId: validDoctor.doctorId,
    hospitalId: validHospital.hospitalId,
    diagnosis: 'Viral Fever & Body Ache',
    medicines: [
      {
        medicineId: validMedicine.medicineId,
        medicineName: 'Paracetamol 650mg',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (Morning + Night)',
        duration: '5 Days',
        instructions: 'Take after meals with warm water'
      }
    ],
    dosage: '1 Tablet',
    frequency: 'Twice Daily (Morning + Night)',
    duration: '5 Days',
    instructions: 'Take after meals with warm water',
    prescriptionDate: new Date('2026-09-20'),
    status: 'ACTIVE'
  });
  const rxValErr = validPrescription.validateSync();
  assert(!rxValErr, 'Prescription model validates successfully with ACTIVE/INACTIVE status');
  assert(validPrescription.patientId === validPatient.patientId, 'Prescription links to patientId');
  assert(validPrescription.status === 'ACTIVE', 'Prescription status is ACTIVE');

  // 7. MEDICINE REMINDERS MODEL
  console.log('\n--- 7. MEDICINE REMINDERS MODEL VERIFICATION ---');
  const validReminder = new MedicineReminder({
    reminderId: 'REM-1001',
    patientId: validPatient.patientId,
    prescriptionId: validPrescription.prescriptionId,
    medicineName: 'Paracetamol 650mg',
    reminderTime: '08:00 AM',
    startDate: new Date('2026-10-18'),
    endDate: new Date('2026-10-25'),
    status: 'ACTIVE'
  });
  const remValErr = validReminder.validateSync();
  assert(!remValErr, 'MedicineReminder model validates successfully with timing and dates');
  assert(validReminder.prescriptionId === validPrescription.prescriptionId, 'Reminder correctly references prescriptionId');

  // 8. MEDICAL HISTORY MODEL
  console.log('\n--- 8. MEDICAL HISTORY MODEL VERIFICATION ---');
  const validHistory = new MedicalHistory({
    patientId: validPatient.patientId,
    hospitalId: validHospital.hospitalId,
    doctorId: validDoctor.doctorId,
    diagnosis: 'Acute Viral Fever & Myalgia',
    treatmentDate: new Date('2026-09-20'),
    prescriptionId: validPrescription.prescriptionId,
    treatment: '5-day antipyretic course with hydration.'
  });
  const histValErr = validHistory.validateSync();
  assert(!histValErr, 'MedicalHistory model validates successfully');
  assert(validHistory.patientId === validPatient.patientId, 'MedicalHistory links correctly to patientId');
  assert(validHistory.hospitalId === validHospital.hospitalId, 'MedicalHistory links correctly to hospitalId');

  // 9. MEDICAL REPORTS MODEL
  console.log('\n--- 9. MEDICAL REPORTS MODEL VERIFICATION ---');
  const validReport = new MedicalReport({
    reportId: 'REP-1001',
    patientId: validPatient.patientId,
    hospitalId: validHospital.hospitalId,
    doctorId: validDoctor.doctorId,
    reportType: 'Blood Test Report',
    fileReference: 'CBC_Report_KMCH_Sep2026.pdf',
    reportDate: new Date('2026-09-20'),
    summary: 'Platelets and WBC count within normal reference ranges.'
  });
  const repValErr = validReport.validateSync();
  assert(!repValErr, 'MedicalReport model validates successfully');
  assert(validReport.reportType === 'Blood Test Report', 'MedicalReport has reportType');
  assert(validReport.fileReference === 'CBC_Report_KMCH_Sep2026.pdf', 'MedicalReport has fileReference');

  // 10. HOSPITAL BILLS MODEL
  console.log('\n--- 10. HOSPITAL BILLS MODEL VERIFICATION ---');
  const validHospitalBill = new HospitalBill({
    billId: 'BILL-HOSP-2026-4412',
    patientId: validPatient.patientId,
    hospitalId: validHospital.hospitalId,
    doctorId: validDoctor.doctorId,
    consultationCharges: 500,
    treatmentCharges: 300,
    testCharges: 250,
    roomCharges: 0,
    otherCharges: 0,
    totalAmount: 1050,
    paymentStatus: 'PAID'
  });
  const hospBillValErr = validHospitalBill.validateSync();
  assert(!hospBillValErr, 'HospitalBill model validates successfully');
  assert(validHospitalBill.currency === 'INR', 'HospitalBill stores currency as INR');
  assert(validHospitalBill.hospitalId === validHospital.hospitalId, 'HospitalBill strictly belongs to hospitalId');
  assert(validHospitalBill.totalAmount === 1050, 'HospitalBill totalAmount is correctly stored in INR');

  // 11. PHARMACY BILLS MODEL
  console.log('\n--- 11. PHARMACY BILLS MODEL VERIFICATION ---');
  const validPharmacyBill = new PharmacyBill({
    billId: 'BILL-PHARM-2026-8021',
    patientId: validPatient.patientId,
    hospitalId: validHospital.hospitalId,
    medicines: [
      {
        medicineId: validMedicine.medicineId,
        medicineName: 'Paracetamol 650mg',
        quantity: 2,
        unitPrice: 40,
        lineTotal: 80
      },
      {
        medicineName: 'ORS Sachet',
        quantity: 1,
        unitPrice: 30,
        lineTotal: 30
      }
    ],
    quantity: 3,
    price: 110,
    discount: 0,
    tax: 6,
    totalAmount: 116,
    paymentStatus: 'PAID'
  });
  const pharmBillValErr = validPharmacyBill.validateSync();
  assert(!pharmBillValErr, 'PharmacyBill model validates successfully');
  assert(validPharmacyBill.currency === 'INR', 'PharmacyBill stores currency as INR');
  assert(validPharmacyBill.hospitalId === validHospital.hospitalId, 'PharmacyBill strictly belongs to hospitalId');
  assert(validPharmacyBill.totalAmount === 116, 'PharmacyBill totalAmount is correctly stored in INR');

  // MULTI-HOSPITAL & ISOLATION RULE CHECKS
  console.log('\n--- MULTI-HOSPITAL & SEPARATION VERIFICATION ---');
  assert(HospitalBill !== PharmacyBill, 'HospitalBills and PharmacyBills are distinct separate models/collections');

  const secondHospital = new Hospital({
    hospitalId: 'HOSP-GKNM-02',
    hospitalName: 'GKNM Hospital',
    email: 'gknm@hospital.com',
    address: { fullAddress: 'P.N. Palayam, Coimbatore' },
    departments: ['Cardiology', 'Pediatrics'],
    contactNumber: '+91 422 224 5000'
  });

  const secondTreatment = new MedicalHistory({
    patientId: validPatient.patientId,
    hospitalId: secondHospital.hospitalId,
    doctorId: 'DOC-2002',
    diagnosis: 'Cardio Follow-up',
    treatmentDate: new Date()
  });
  assert(
    validHistory.patientId === secondTreatment.patientId &&
    validHistory.hospitalId !== secondTreatment.hospitalId,
    'One patient can have medical records and treatments from multiple distinct hospitals'
  );

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runModelTests();


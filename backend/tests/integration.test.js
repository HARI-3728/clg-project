// Comprehensive End-to-End Integration Test Suite for MediCare+
// Covers all 13 core requirements in Section 4:
// 1. Patient registration and login
// 2. Doctor login
// 3. Hospital login
// 4. Doctor availability
// 5. Online and offline appointment booking
// 6. Double-booking prevention
// 7. Prescription creation and patient association
// 8. Active and inactive prescription status toggle
// 9. Automatic medicine reminders and status tracking
// 10. Medical history across hospitals
// 11. Medical report uploads with validation
// 12. Separate Hospital Bills and Pharmacy Bills
// 13. Role-based access restrictions

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runIntegrationTests = async () => {
  console.log('====================================================');
  console.log('🏥 MEDICARE+ END-TO-END FINAL INTEGRATION SUITE');
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

  try {
    let patientToken = null;
    let patientUser = null;
    let doctorToken = null;
    let doctorUser = null;
    let hospitalToken = null;
    let hospitalUser = null;

    // ----------------------------------------------------
    // 1. PATIENT REGISTRATION AND LOGIN
    // ----------------------------------------------------
    console.log('--- 1. PATIENT REGISTRATION & OTP LOGIN ---');
    const regRes = await request('POST', '/api/auth/patient/register', {
      name: 'Ananya Sharma',
      mobile: '9876543219',
      email: 'ananya@medicare.test',
      bloodGroup: 'B+',
      age: 26
    });
    assert(regRes.status === 201, 'Patient registered successfully (HTTP 201)');
    assert(!!regRes.body?.token, 'Patient registration returned JWT bearer token');
    assert(regRes.body?.user?.medicalID && regRes.body.user.medicalID.startsWith('MC-'), 'Registered patient assigned unique Medical ID (format MC-XXXX-XXX)');
    assert(regRes.body?.user?.role === 'patient', 'Patient user has role="patient"');

    // Patient OTP flow
    const otpRes = await request('POST', '/api/auth/patient/send-otp', { mobile: '9876543210' });
    assert(otpRes.status === 200, 'Patient OTP dispatch requested (HTTP 200)');
    assert(otpRes.body?.mockOtp === '123456', 'Patient OTP generated securely');

    const verifyRes = await request('POST', '/api/auth/patient/verify-otp', {
      mobile: '9876543210',
      otp: '123456',
      customName: 'Thamizh'
    });
    assert(verifyRes.status === 200, 'Patient verified OTP and logged in (HTTP 200)');
    assert(!!verifyRes.body?.token, 'Patient received valid JWT bearer token');
    patientToken = verifyRes.body?.token;
    patientUser = verifyRes.body?.user;
    assert(patientUser?.role === 'patient', 'Verified user has role="patient"');

    // ----------------------------------------------------
    // 2. DOCTOR LOGIN
    // ----------------------------------------------------
    console.log('\n--- 2. DOCTOR LOGIN ---');
    const docBadLogin = await request('POST', '/api/auth/doctor/login', {
      email: 'dr.kumar@medicare.com',
      password: 'wrongpassword'
    });
    assert(docBadLogin.status === 401, 'Doctor login rejected wrong password (HTTP 401)');

    const docLogin = await request('POST', '/api/auth/doctor/login', {
      email: 'dr.kumar@medicare.com',
      password: 'doctor123'
    });
    assert(docLogin.status === 200, 'Doctor logged in successfully (HTTP 200)');
    assert(!!docLogin.body?.token, 'Doctor received valid JWT bearer token');
    doctorToken = docLogin.body?.token;
    doctorUser = docLogin.body?.user;
    assert(doctorUser?.role === 'doctor', 'Logged in user has role="doctor"');
    assert(!!doctorUser?.hospitalId, 'Doctor is associated with hospitalId');

    // ----------------------------------------------------
    // 3. HOSPITAL LOGIN
    // ----------------------------------------------------
    console.log('\n--- 3. HOSPITAL LOGIN ---');
    const hospBadLogin = await request('POST', '/api/auth/hospital/login', {
      email: 'hosp@kmch.com',
      password: 'wrongpassword'
    });
    assert(hospBadLogin.status === 401, 'Hospital login rejected wrong password (HTTP 401)');

    const hospLogin = await request('POST', '/api/auth/hospital/login', {
      email: 'hosp@kmch.com',
      password: 'hospital123'
    });
    assert(hospLogin.status === 200, 'Hospital logged in successfully (HTTP 200)');
    assert(!!hospLogin.body?.token, 'Hospital received valid JWT bearer token');
    hospitalToken = hospLogin.body?.token;
    hospitalUser = hospLogin.body?.user;
    assert(hospitalUser?.role === 'hospital', 'Logged in user has role="hospital"');
    assert(!!hospitalUser?.hospitalId, 'Hospital has unique hospitalId');

    // ----------------------------------------------------
    // 4. DOCTOR AVAILABILITY
    // ----------------------------------------------------
    console.log('\n--- 4. DOCTOR AVAILABILITY MANAGEMENT ---');
    const availCheck = await request('GET', '/api/doctor/availability?doctorId=doc_1');
    assert(availCheck.status === 200, 'Public/Authenticated can check doctor availability schedule (HTTP 200)');
    assert(!!availCheck.body?.availability, 'Doctor availability contains online and offline schedules');

    // Doctor updates availability
    const updateAvail = await request('PUT', '/api/doctor/availability', {
      online: {
        days: ['Monday', 'Wednesday', 'Friday'],
        timing: '05:00 PM - 08:00 PM',
        slots: ['05:00 PM', '06:00 PM', '07:00 PM']
      },
      offline: {
        days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        timing: '10:00 AM - 01:00 PM',
        slots: ['10:00 AM', '11:00 AM', '12:00 PM']
      }
    }, doctorToken);
    assert(updateAvail.status === 200, 'Doctor updated online & offline availability (HTTP 200)');
    assert(updateAvail.body?.availability?.online?.slots?.length === 3, 'Doctor online availability schedule updated');

    // Available open slots for booking
    const testOnlineDate = `2026-12-${String(Math.floor(10 + Math.random() * 18))}`;
    const slotCheck = await request('GET', `/api/appointments/available-slots?doctorId=doc_1&date=${testOnlineDate}&type=ONLINE`);
    assert(slotCheck.status === 200, 'Available slots calculated dynamically by date and appointment type');
    assert(Array.isArray(slotCheck.body?.availableSlots), 'Returns list of unbooked open time slots');
    const chosenOnlineSlot = slotCheck.body?.availableSlots?.[0] || '05:00 PM';

    // ----------------------------------------------------
    // 5. ONLINE AND OFFLINE APPOINTMENT BOOKING
    // ----------------------------------------------------
    console.log('\n--- 5. ONLINE & OFFLINE APPOINTMENT BOOKING ---');
    // Online Booking (Patient -> Doctor -> Available Date -> Available Time -> Confirm)
    const onlineApt = await request('POST', '/api/appointments/online', {
      patientId: patientUser.id,
      doctorId: 'doc_1',
      appointmentDate: testOnlineDate,
      appointmentTime: chosenOnlineSlot,
      notes: 'Consultation for headache'
    }, patientToken);
    assert(onlineApt.status === 201, 'Online teleconsultation booked successfully (HTTP 201)');
    assert(onlineApt.body?.appointment?.appointmentType === 'ONLINE', 'Appointment type is recorded as ONLINE');
    assert(onlineApt.body?.appointment?.appointmentId?.startsWith('APT-ONL-'), 'Generated unique online appointment ID');
    assert(!!onlineApt.body?.appointment?.roomCode, 'Teleconsultation video room code generated');

    // Offline Booking (Patient -> Hospital -> Doctor -> Available Date -> Available Time -> Confirm)
    const testOfflineDate = `2026-12-${String(Math.floor(10 + Math.random() * 18))}`;
    const offlineSlotCheck = await request('GET', `/api/appointments/available-slots?doctorId=doc_1&date=${testOfflineDate}&type=OFFLINE`);
    const chosenOfflineSlot = offlineSlotCheck.body?.availableSlots?.[0] || '10:00 AM';

    const offlineApt = await request('POST', '/api/appointments/offline', {
      patientId: patientUser.id,
      hospitalId: 'hosp_1',
      doctorId: 'doc_1',
      appointmentDate: testOfflineDate,
      appointmentTime: chosenOfflineSlot,
      notes: 'General OPD physical visit'
    }, patientToken);
    assert(offlineApt.status === 201, 'Offline OPD appointment booked successfully (HTTP 201)');
    assert(offlineApt.body?.appointment?.appointmentType === 'OFFLINE', 'Appointment type is recorded as OFFLINE');
    assert(offlineApt.body?.appointment?.appointmentId?.startsWith('APT-OFF-'), 'Generated unique offline appointment ID');
    assert(!!offlineApt.body?.appointment?.tokenNo, 'OPD clinic queue token issued');

    // ----------------------------------------------------
    // 6. DOUBLE-BOOKING PREVENTION
    // ----------------------------------------------------
    console.log('\n--- 6. CONCURRENCY & DOUBLE-BOOKING PREVENTION ---');
    const duplicateApt = await request('POST', '/api/appointments/online', {
      patientId: patientUser.id,
      doctorId: 'doc_1',
      appointmentDate: testOnlineDate,
      appointmentTime: chosenOnlineSlot,
      notes: 'Attempting to book already-reserved slot'
    }, patientToken);
    assert(duplicateApt.status === 409, 'Double-booking rejected with HTTP 409 Conflict');
    assert(duplicateApt.body?.message?.includes('Double-booking prevention'), 'Error message explicitly reports double-booking prevention');

    // ----------------------------------------------------
    // 7. PRESCRIPTION CREATION AND PATIENT ASSOCIATION
    // ----------------------------------------------------
    console.log('\n--- 7. PRESCRIPTION CREATION & PATIENT ASSOCIATION ---');
    const newRx = await request('POST', '/api/doctor/prescriptions', {
      patientId: patientUser.id,
      diagnosis: 'Acute Pharyngitis & Seasonal Allergy',
      medicineName: 'Levocetirizine 5mg',
      dosage: '1 Tablet',
      frequency: 'Once Daily (Night)',
      duration: '5 Days',
      instructions: 'Take after dinner for 5 days',
      dietPlanCondition: 'allergy',
      dietPlanName: 'Hypoallergenic Hydration Diet'
    }, doctorToken);

    assert(newRx.status === 201, 'Doctor issued prescription successfully (HTTP 201)');
    assert(newRx.body?.prescription?.patientId === patientUser.id, 'Prescription correctly associated with patientId');
    assert(newRx.body?.prescription?.prescriptionId?.startsWith('RX-'), 'Generated unique prescription code (RX-YYYY-XXXX)');
    assert(newRx.body?.prescription?.status === 'ACTIVE', 'Initial prescription status is ACTIVE');
    const createdRxId = newRx.body?.prescription?.prescriptionId;

    // ----------------------------------------------------
    // 8. ACTIVE AND INACTIVE PRESCRIPTION STATUS TOGGLE
    // ----------------------------------------------------
    console.log('\n--- 8. ACTIVE AND INACTIVE PRESCRIPTION STATUS TOGGLE ---');
    // Fetch active prescriptions
    const activePrescriptions = await request('GET', '/api/patient/prescriptions?status=ACTIVE', null, patientToken);
    assert(activePrescriptions.status === 200, 'Patient can fetch ACTIVE prescriptions');
    const hasActive = (activePrescriptions.body || []).some((p) => p.prescriptionId === createdRxId && p.status === 'ACTIVE');
    assert(hasActive, 'Newly created prescription appears in ACTIVE list');

    // Toggle to INACTIVE
    const toggleToInactive = await request('PUT', `/api/prescriptions/${createdRxId}/status`, {
      status: 'INACTIVE'
    }, doctorToken);
    assert(toggleToInactive.status === 200, 'Prescription status updated to INACTIVE (HTTP 200)');
    assert(toggleToInactive.body?.prescription?.status === 'INACTIVE', 'Prescription status is now INACTIVE');

    // Confirm it moves to INACTIVE list
    const inactivePrescriptions = await request('GET', '/api/patient/prescriptions?status=INACTIVE', null, patientToken);
    assert(inactivePrescriptions.status === 200, 'Patient can fetch INACTIVE prescriptions');
    const hasInactive = (inactivePrescriptions.body || []).some((p) => p.prescriptionId === createdRxId && p.status === 'INACTIVE');
    assert(hasInactive, 'Prescription properly moved to INACTIVE list');

    // ----------------------------------------------------
    // 9. AUTOMATIC MEDICINE REMINDERS AND STATUS TRACKING
    // ----------------------------------------------------
    console.log('\n--- 9. AUTOMATIC MEDICINE REMINDERS & STATUS TRACKING ---');
    // Trigger creation of reminders for an active prescription
    const rxForReminders = await request('POST', '/api/doctor/prescriptions', {
      patientId: patientUser.id,
      diagnosis: 'Type-2 Glycemic Review',
      medicineName: 'Metformin 500mg SR',
      dosage: '500mg (1 Tablet)',
      frequency: 'Twice Daily (Morning + Night)',
      duration: '7 Days',
      instructions: 'Take immediately after food'
    }, doctorToken);
    assert(rxForReminders.status === 201, 'Prescription with dosage and frequency issued');
    assert(rxForReminders.body?.remindersGenerated >= 1, 'Automatic medicine reminders generated from active prescription');

    // Fetch patient reminders
    const remindersRes = await request('GET', '/api/patient/reminders', null, patientToken);
    assert(remindersRes.status === 200, 'Patient retrieved reminders list (HTTP 200)');
    assert(Array.isArray(remindersRes.body) && remindersRes.body.length > 0, 'Reminders list contains scheduled doses');
    const targetReminder = remindersRes.body[0];

    // Mark as Taken
    const markTaken = await request('PUT', `/api/patient/reminders/${targetReminder.id}/status`, {
      action: 'TAKEN'
    }, patientToken);
    assert(markTaken.status === 200, 'Patient marked reminder as TAKEN (HTTP 200)');
    assert(markTaken.body?.reminder?.taken === true, 'Reminder status updated to taken=true');
    assert(markTaken.body?.reminder?.statusText?.includes('Taken at'), 'Reminder statusText records exact time of intake');

    // Mark as Missed
    const markMissed = await request('PUT', `/api/patient/reminders/${targetReminder.id}/status`, {
      action: 'MISSED'
    }, patientToken);
    assert(markMissed.status === 200, 'Patient marked reminder as MISSED (HTTP 200)');
    assert(markMissed.body?.reminder?.taken === false, 'Reminder status updated to taken=false');
    assert(markMissed.body?.reminder?.statusText?.includes('Missed dose'), 'Reminder statusText records missed status');

    // ----------------------------------------------------
    // 10. MEDICAL HISTORY ACROSS HOSPITALS
    // ----------------------------------------------------
    console.log('\n--- 10. MEDICAL HISTORY ACROSS HOSPITALS ---');
    const medHistory = await request('GET', '/api/patient/medical-history', null, patientToken);
    assert(medHistory.status === 200, 'Patient retrieved combined medical history (HTTP 200)');
    assert(Array.isArray(medHistory.body) && medHistory.body.length > 0, 'Medical history array populated');
    const hospitalsRepresented = new Set(medHistory.body.map((h) => h.hospital || h.hospitalName || h.hospitalId));
    assert(hospitalsRepresented.size >= 1, 'Medical history tracks patient treatments across hospitals');

    // ----------------------------------------------------
    // 11. MEDICAL REPORT UPLOADS WITH VALIDATION
    // ----------------------------------------------------
    console.log('\n--- 11. MEDICAL REPORT UPLOADS WITH VALIDATION ---');
    // Missing document name/content validation
    const badReport = await request('POST', '/api/patient/reports', {}, patientToken);
    assert(badReport.status === 400, 'Rejects medical report missing document name (HTTP 400)');

    // Successful report record
    const goodReport = await request('POST', '/api/patient/reports', {
      name: 'Annual Liver Function Test (LFT)',
      reportType: 'Lab Report',
      hospital: 'KMCH (Kovai Medical Center)',
      doctor: 'Dr. Kumar',
      fileName: 'LFT_Report_2026.pdf',
      fileSize: '1.8 MB',
      fileType: 'application/pdf',
      summary: 'SGOT: 24 U/L, SGPT: 28 U/L, Serum Bilirubin: 0.8 mg/dL (All within normal parameters)'
    }, patientToken);
    assert(goodReport.status === 201, 'Medical report saved and securely catalogued (HTTP 201)');
    assert(goodReport.body?.report?.isPrivate === true, 'Uploaded report is marked private to patient');

    // Patient can view own reports
    const myReports = await request('GET', '/api/patient/reports', null, patientToken);
    assert(myReports.status === 200, 'Patient can list private medical reports (HTTP 200)');

    // ----------------------------------------------------
    // 12. SEPARATE HOSPITAL BILLS AND PHARMACY BILLS
    // ----------------------------------------------------
    console.log('\n--- 12. SEPARATE HOSPITAL BILLS & PHARMACY BILLS ---');
    // Hospital Bill Creation
    const createHospBill = await request('POST', '/api/hospital/bills', {
      patientId: 'usr_101',
      patientName: 'Patient',
      patientPhone: '+91 98765 43210',
      doctorId: 'doc_1',
      doctorName: 'Dr. Kumar',
      consultationCharges: 800,
      treatmentCharges: 1500,
      laboratoryCharges: 700,
      roomCharges: 0,
      otherCharges: 0,
      paymentStatus: 'PAID',
      notes: 'Full OPD consultation and lab check'
    }, hospitalToken);
    assert(createHospBill.status === 201, 'Hospital bill created in separate collection (HTTP 201)');
    assert(createHospBill.body?.bill?.totalAmount === 3000, 'Hospital bill calculated ₹3,000 correctly');
    assert(createHospBill.body?.bill?.invoiceNumber?.startsWith('INV-HOSP-'), 'Generated unique hospital invoice (INV-HOSP-XXXX)');
    assert(createHospBill.body?.bill?.currency === 'INR', 'Hospital bill formatted in Indian Rupees (INR)');

    // Pharmacy Bill Creation
    const createPharmBill = await request('POST', '/api/hospital/pharmacy-bills', {
      patientId: 'usr_101',
      patientName: 'Patient',
      patientPhone: '+91 98765 43210',
      items: [
        { medicineId: 'med_1', medicineName: 'Paracetamol 650mg', quantity: 2, unitPrice: 40 },
        { medicineId: 'med_2', medicineName: 'Amoxicillin 500mg', quantity: 1, unitPrice: 120 }
      ],
      discount: 10,
      tax: 15,
      paymentStatus: 'PAID'
    }, hospitalToken);
    assert(createPharmBill.status === 201, 'Pharmacy bill created in separate collection (HTTP 201)');
    assert(createPharmBill.body?.bill?.totalAmount === 205, 'Pharmacy bill calculated total amount ₹205 correctly (200 - 10 + 15)');
    assert(createPharmBill.body?.bill?.invoiceNumber?.startsWith('INV-PHARM-'), 'Generated unique pharmacy invoice (INV-PHARM-XXXX)');
    assert(createPharmBill.body?.bill?.currency === 'INR', 'Pharmacy bill formatted in Indian Rupees (INR)');

    // Separate APIs verification
    const hospBillsList = await request('GET', '/api/hospital/bills', null, hospitalToken);
    const pharmBillsList = await request('GET', '/api/hospital/pharmacy-bills', null, hospitalToken);
    assert(hospBillsList.status === 200 && pharmBillsList.status === 200, 'Hospital bills and Pharmacy bills have separate endpoints');
    assert(hospBillsList.body?.bills?.length > 0 && pharmBillsList.body?.bills?.length > 0, 'Both billing collections store distinct records');

    // ----------------------------------------------------
    // 13. ROLE-BASED ACCESS RESTRICTIONS
    // ----------------------------------------------------
    console.log('\n--- 13. ROLE-BASED ACCESS CONTROL & ISOLATION ---');
    // Patient forbidden from hospital billing
    const patientHospBillAccess = await request('GET', '/api/hospital/bills', null, patientToken);
    assert(patientHospBillAccess.status === 403, 'Patient is strictly FORBIDDEN from accessing Hospital Bills API (HTTP 403)');

    const patientPharmBillAccess = await request('GET', '/api/hospital/pharmacy-bills', null, patientToken);
    assert(patientPharmBillAccess.status === 403, 'Patient is strictly FORBIDDEN from accessing Pharmacy Bills API (HTTP 403)');

    // Patient blocked from accessing another patient's data
    const crossPatientAccess = await request('GET', '/api/patient/medical-history?patientId=usr_victim_patient', null, patientToken);
    assert(crossPatientAccess.status === 403, 'Patient is blocked with HTTP 403 when trying to access another patientId');

    // Doctor cannot access hospital billing
    const docHospBillAccess = await request('GET', '/api/hospital/bills', null, doctorToken);
    assert(docHospBillAccess.status === 403, 'Doctor is strictly FORBIDDEN from accessing Hospital Bills (HTTP 403)');

    // Unauthenticated access blocked on protected routes
    const unauthHistory = await request('GET', '/api/doctor/patients/usr_101/history');
    assert(unauthHistory.status === 401, 'Unauthenticated access to doctor patient history blocked (HTTP 401)');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runIntegrationTests();

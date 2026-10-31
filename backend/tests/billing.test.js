// Automated verification test suite for MediCare+ Hospital & Pharmacy Billing Systems
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
      res.on('data', (chunk) => {
        data += chunk;
      });
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

const runBillingTests = async () => {
  console.log('====================================================');
  console.log('💳 MEDICARE+ HOSPITAL & PHARMACY BILLING TEST SUITE');
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
    // 0. AUTHENTICATION SETUP
    console.log('--- 0. AUTHENTICATION TOKENS ---');
    // Hospital login
    const hospLogin = await request('POST', '/api/auth/hospital/login', {
      email: 'hosp@kmch.com',
      password: 'hospital123'
    });
    const hospitalToken = hospLogin.body?.token;
    assert(hospLogin.status === 200 && !!hospitalToken, 'Hospital staff logged in and received auth token');

    // Patient login (OTP flow)
    await request('POST', '/api/auth/patient/send-otp', { mobile: '+91 98765 43210' });
    const patLogin = await request('POST', '/api/auth/patient/verify-otp', {
      mobile: '+91 98765 43210',
      otp: '123456'
    });
    const patientToken = patLogin.body?.token;
    assert(patLogin.status === 200 && !!patientToken, 'Patient logged in and received auth token');

    // ==========================================
    // 1. HOSPITAL BILLS (OPD & INPATIENT)
    // ==========================================
    console.log('\n--- 1. HOSPITAL BILLS MANAGEMENT ---');

    // Create Hospital Bill with charges breakdown
    const newHospBillPayload = {
      patientName: 'Karthik Subramanian',
      patientId: 'MC-8942-021',
      patientContact: '+91 98765 43210',
      patientAge: 32,
      patientGender: 'Male',
      doctorName: 'Dr. Kumar (Cardiologist)',
      doctorId: 'doc_1',
      doctorSpecialization: 'Cardiology',
      consultationCharges: 600,
      treatmentCharges: 450,
      testCharges: 350,
      roomCharges: 500,
      otherCharges: 100,
      paymentStatus: 'PENDING',
      paymentMode: 'UPI / NetBanking',
      serviceCategory: 'Cardiology OPD Consultation & ECG Diagnostics',
      roomNo: 'OPD Room 12'
    };

    const createHospRes = await request('POST', '/api/hospital/bills', newHospBillPayload, hospitalToken);
    assert(createHospRes.status === 201, 'Hospital bill created successfully by hospital staff (HTTP 201)');
    const createdHospBill = createHospRes.body?.bill;

    // Backend calculation verification: 600 + 450 + 350 + 500 + 100 = 2000
    assert(createdHospBill?.totalAmount === 2000, 'Backend correctly calculated totalAmount (₹2,000)');
    assert(createdHospBill?.currency === 'INR', 'Hospital bill currency is Indian Rupees (INR / ₹)');
    assert(/^INV-HOSP-\d{4}-\d{4}$/.test(createdHospBill?.invoiceNumber), `Generated unique hospital invoice number format: ${createdHospBill?.invoiceNumber}`);
    assert(createdHospBill?.paymentStatus === 'PENDING', 'Payment status is correctly set to PENDING');
    assert(createdHospBill?.patientDetails?.name === 'Karthik Subramanian', 'Patient details are accurately stored');
    assert(createdHospBill?.doctorDetails?.name === 'Dr. Kumar (Cardiologist)', 'Doctor details are accurately stored');

    // Price validation: negative charges should be rejected
    const invalidPriceRes = await request('POST', '/api/hospital/bills', {
      patientName: 'Test Patient',
      consultationCharges: -500
    }, hospitalToken);
    assert(invalidPriceRes.status === 400, 'Validation rejects negative hospital billing charges (HTTP 400)');

    // Fetch hospital bills list scoped to hospital
    const getHospBillsRes = await request('GET', '/api/hospital/bills', null, hospitalToken);
    assert(getHospBillsRes.status === 200, 'Hospital bills list retrieved successfully (HTTP 200)');
    assert(Array.isArray(getHospBillsRes.body?.bills) && getHospBillsRes.body?.bills.length > 0, 'Hospital bills list contains issued bills');
    assert(getHospBillsRes.body?.currency === 'INR', 'Hospital bills API reports INR currency');

    // Printable Invoice endpoint
    const hospInvoiceId = createdHospBill.invoiceNumber || createdHospBill.id;
    const printHospRes = await request('GET', `/api/hospital/bills/${hospInvoiceId}/invoice`, null, hospitalToken);
    assert(printHospRes.status === 200, 'Printable hospital invoice endpoint returns HTTP 200');
    const hospInvoice = printHospRes.body?.invoice;
    assert(!!hospInvoice?.hospital?.name && !!hospInvoice?.hospital?.gstNumber, 'Printable hospital invoice contains hospital header, address & GST');
    assert(hospInvoice?.invoice?.invoiceNumber === hospInvoiceId, 'Printable invoice references correct invoiceNumber');
    assert(Array.isArray(hospInvoice?.itemizedCharges) && hospInvoice?.itemizedCharges.length === 5, 'Printable invoice includes all 5 itemized service charges');
    assert(typeof hospInvoice?.amountInWords === 'string' && hospInvoice?.amountInWords.includes('Rupees'), `Printable invoice includes amount in words: "${hospInvoice?.amountInWords}"`);
    assert(!!hospInvoice?.authorizedSignatory, 'Printable invoice includes authorized hospital signatory');

    // Update Hospital Bill payment status
    const updateHospStatusRes = await request('PUT', `/api/hospital/bills/${hospInvoiceId}/status`, {
      paymentStatus: 'PAID'
    }, hospitalToken);
    assert(updateHospStatusRes.status === 200, 'Hospital bill status updated from PENDING to PAID (HTTP 200)');
    assert(updateHospStatusRes.body?.bill?.paymentStatus === 'PAID', 'Updated bill reflects PAID status');

    // ==========================================
    // 2. PHARMACY BILLS (SEPARATE SYSTEM)
    // ==========================================
    console.log('\n--- 2. PHARMACY BILLS MANAGEMENT (SEPARATE SYSTEM) ---');

    // Create Pharmacy Bill with itemized medicines
    const newPharmBillPayload = {
      patientName: 'Ananya Ramesh',
      patientId: 'MC-7201-904',
      patientContact: '+91 94433 22110',
      medicines: [
        { medicineName: 'Amoxicillin 500mg', quantity: 2, unitPrice: 85 },
        { medicineName: 'Paracetamol 650mg', quantity: 3, unitPrice: 30 },
        { medicineName: 'Cetirizine 10mg', quantity: 1, unitPrice: 40 }
      ],
      discount: 20,
      tax: 15,
      paymentStatus: 'PAID',
      paymentMode: 'Cash Counter',
      prescriptionVerified: true
    };

    const createPharmRes = await request('POST', '/api/hospital/pharmacy-bills', newPharmBillPayload, hospitalToken);
    assert(createPharmRes.status === 201, 'Pharmacy bill created successfully by pharmacy staff (HTTP 201)');
    const createdPharmBill = createPharmRes.body?.bill;

    // Subtotal = (2*85) + (3*30) + (1*40) = 170 + 90 + 40 = 300
    // Total = subtotal (300) - discount (20) + tax (15) = 295
    assert(createdPharmBill?.subtotal === 300, 'Backend correctly calculated pharmacy subtotal (₹300)');
    assert(createdPharmBill?.discount === 20, 'Pharmacy discount is stored correctly (₹20)');
    assert(createdPharmBill?.tax === 15, 'Pharmacy tax is stored correctly (₹15)');
    assert(createdPharmBill?.totalAmount === 295, 'Backend correctly calculated final totalAmount (₹295)');
    assert(createdPharmBill?.currency === 'INR', 'Pharmacy bill currency is Indian Rupees (INR / ₹)');
    assert(/^INV-PHARM-\d{4}-\d{4}$/.test(createdPharmBill?.invoiceNumber), `Generated unique pharmacy invoice number format: ${createdPharmBill?.invoiceNumber}`);
    assert(createdPharmBill?.prescriptionVerified === true, 'Prescription verification status recorded');

    // Quantity & Price validation: reject invalid quantities
    const invalidQtyRes = await request('POST', '/api/hospital/pharmacy-bills', {
      patientName: 'Invalid Qty Test',
      medicines: [{ medicineName: 'Aspirin', quantity: 0, unitPrice: 50 }]
    }, hospitalToken);
    assert(invalidQtyRes.status === 400 || invalidQtyRes.status === 500, 'Validation rejects quantity < 1');

    const invalidPharmPriceRes = await request('POST', '/api/hospital/pharmacy-bills', {
      patientName: 'Invalid Price Test',
      medicines: [{ medicineName: 'Aspirin', quantity: 1, unitPrice: -25 }]
    }, hospitalToken);
    assert(invalidPharmPriceRes.status === 400 || invalidPharmPriceRes.status === 500, 'Validation rejects negative medicine unit price');

    // Fetch pharmacy bills list scoped to hospital
    const getPharmBillsRes = await request('GET', '/api/hospital/pharmacy-bills', null, hospitalToken);
    assert(getPharmBillsRes.status === 200, 'Pharmacy bills list retrieved successfully (HTTP 200)');
    assert(Array.isArray(getPharmBillsRes.body?.bills) && getPharmBillsRes.body?.bills.length > 0, 'Pharmacy bills list contains issued bills');
    assert(getPharmBillsRes.body?.currency === 'INR', 'Pharmacy bills API reports INR currency');

    // Printable Pharmacy Counter Receipt
    const pharmInvoiceId = createdPharmBill.invoiceNumber || createdPharmBill.id;
    const printPharmRes = await request('GET', `/api/hospital/pharmacy-bills/${pharmInvoiceId}/invoice`, null, hospitalToken);
    assert(printPharmRes.status === 200, 'Printable pharmacy counter receipt endpoint returns HTTP 200');
    const pharmInvoice = printPharmRes.body?.invoice;
    assert(!!pharmInvoice?.pharmacy?.drugLicenseNo && !!pharmInvoice?.pharmacy?.gstin, 'Printable receipt contains pharmacy Drug License & GSTIN');
    assert(pharmInvoice?.invoice?.invoiceNumber === pharmInvoiceId, 'Printable pharmacy receipt references correct invoiceNumber');
    assert(Array.isArray(pharmInvoice?.items) && pharmInvoice?.items.length === 3, 'Printable pharmacy receipt contains all 3 dispensed medicine items');
    assert(!!pharmInvoice?.pricingBreakdown?.grandTotal, `Printable receipt displays grand total in INR: ${pharmInvoice?.pricingBreakdown?.grandTotal}`);
    assert(!!pharmInvoice?.authorizedPharmacist, 'Printable receipt includes authorized dispensing pharmacist');

    // Update Pharmacy Bill status
    const updatePharmStatusRes = await request('PUT', `/api/hospital/pharmacy-bills/${pharmInvoiceId}/status`, {
      paymentStatus: 'PAID'
    }, hospitalToken);
    assert(updatePharmStatusRes.status === 200, 'Pharmacy bill status updated successfully (HTTP 200)');

    // ==========================================
    // 3. ACCESS CONTROL & PATIENT DASHBOARD RULES
    // ==========================================
    console.log('\n--- 3. ACCESS CONTROL & ROLE PERMISSION ENFORCEMENT ---');

    // 1. Patient MUST NOT access Hospital Bills endpoint
    const patientHospBillsRes = await request('GET', '/api/hospital/bills', null, patientToken);
    assert(patientHospBillsRes.status === 403, 'Patient token is strictly FORBIDDEN from accessing Hospital Bills API (HTTP 403)');

    // 2. Patient MUST NOT create Hospital Bills
    const patientCreateHospRes = await request('POST', '/api/hospital/bills', newHospBillPayload, patientToken);
    assert(patientCreateHospRes.status === 403, 'Patient token is strictly FORBIDDEN from creating Hospital Bills (HTTP 403)');

    // 3. Patient MUST NOT access Pharmacy Bills endpoint
    const patientPharmBillsRes = await request('GET', '/api/hospital/pharmacy-bills', null, patientToken);
    assert(patientPharmBillsRes.status === 403, 'Patient token is strictly FORBIDDEN from accessing Pharmacy Bills API (HTTP 403)');

    // 4. Patient MUST NOT create Pharmacy Bills
    const patientCreatePharmRes = await request('POST', '/api/hospital/pharmacy-bills', newPharmBillPayload, patientToken);
    assert(patientCreatePharmRes.status === 403, 'Patient token is strictly FORBIDDEN from creating Pharmacy Bills (HTTP 403)');

    // 5. Patient MUST NOT access Printable Invoices
    const patientPrintRes = await request('GET', `/api/hospital/bills/${hospInvoiceId}/invoice`, null, patientToken);
    assert(patientPrintRes.status === 403, 'Patient token is strictly FORBIDDEN from accessing printable billing invoices (HTTP 403)');

    // 6. Unauthenticated requests are rejected
    const unauthHospRes = await request('GET', '/api/hospital/bills');
    assert(unauthHospRes.status === 401, 'Unauthenticated access to Hospital Bills rejected (HTTP 401)');

    const unauthPharmRes = await request('GET', '/api/hospital/pharmacy-bills');
    assert(unauthPharmRes.status === 401, 'Unauthenticated access to Pharmacy Bills rejected (HTTP 401)');

    // ==========================================
    // 4. SYSTEM SEPARATION VERIFICATION
    // ==========================================
    console.log('\n--- 4. SYSTEM SEPARATION & DATABASE VERIFICATION ---');
    assert(
      getHospBillsRes.body?.bills.every((b) => b.serviceCategory !== 'Pharmacy Dispensation Counter' && !b.medicines?.length),
      'Hospital bills contain clinical/OPD services and are separated from pharmacy counter sales'
    );
    assert(
      getPharmBillsRes.body?.bills.every((b) => Array.isArray(b.medicines) || b.medicineName),
      'Pharmacy bills contain dispensed medicines and are separated from hospital room/consultation charges'
    );

    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runBillingTests();


// Automated verification test script for MediCare+ Backend Authentication
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

const runTests = async () => {
  console.log('====================================================');
  console.log('🩺 MEDICARE+ AUTHENTICATION & ACCESS VERIFICATION SUITE');
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
    // 1. PUBLIC ACCESS VERIFICATION
    console.log('--- TEST GROUP 1: PUBLIC ACCESS (TASK 3) ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'ONLINE', 'System health API is publicly online');

    const meds = await request('GET', '/api/public/medicines');
    assert(meds.status === 200 && Array.isArray(meds.body) && meds.body.length > 0, 'Public users can browse medicines catalogue without authentication');

    const hosps = await request('GET', '/api/public/hospitals');
    assert(hosps.status === 200 && Array.isArray(hosps.body) && hosps.body.length > 0, 'Public users can browse hospital network without authentication');

    const docs = await request('GET', '/api/public/doctors');
    assert(docs.status === 200 && Array.isArray(docs.body) && docs.body.length > 0, 'Public users can browse doctor directory without authentication');

    const unauthorizedMe = await request('GET', '/api/auth/me');
    assert(unauthorizedMe.status === 401, 'Protected /api/auth/me denies access when no token is provided');

    // 2. PATIENT LOGIN FLOW (TASK 2 - ROLE 1)
    console.log('\n--- TEST GROUP 2: PATIENT LOGIN (ROLE 1) ---');
    const otpReq = await request('POST', '/api/auth/patient/send-otp', { mobile: '9876543210' });
    assert(otpReq.status === 200 && otpReq.body.success === true, 'Patient can request mobile OTP');

    const otpVerify = await request('POST', '/api/auth/patient/verify-otp', {
      mobile: '9876543210',
      otp: otpReq.body.mockOtp || '123456'
    });
    assert(otpVerify.status === 200 && otpVerify.body.success === true, 'Patient can verify OTP and log in');
    assert(otpVerify.body.token && typeof otpVerify.body.token === 'string', 'Patient receives valid JWT token');
    assert(otpVerify.body.user && otpVerify.body.user.role === 'patient', 'Patient profile has role="patient"');
    assert(otpVerify.body.user.medicalID && otpVerify.body.user.medicalID.startsWith('MC-'), `Patient has unique Medical ID: ${otpVerify.body.user.medicalID}`);

    const patientToken = otpVerify.body.token;
    const patientMe = await request('GET', '/api/auth/me', null, patientToken);
    assert(patientMe.status === 200 && patientMe.body.user.role === 'patient', 'Patient can access protected /api/auth/me with Bearer token');

    // 3. DOCTOR LOGIN FLOW (TASK 2 - ROLE 2)
    console.log('\n--- TEST GROUP 3: DOCTOR LOGIN (ROLE 2) ---');
    const docBadPass = await request('POST', '/api/auth/doctor/login', {
      email: 'dr.kumar@medicare.com',
      password: 'wrong_password_123'
    });
    assert(docBadPass.status === 401, 'Doctor login rejects incorrect password');

    const docLogin = await request('POST', '/api/auth/doctor/login', {
      email: 'dr.kumar@medicare.com',
      password: 'doctor123'
    });
    assert(docLogin.status === 200 && docLogin.body.success === true, 'Doctor logs in successfully with email and password');
    assert(docLogin.body.token && typeof docLogin.body.token === 'string', 'Doctor receives valid JWT token');
    assert(docLogin.body.user && docLogin.body.user.role === 'doctor', 'Doctor profile has role="doctor"');
    assert(docLogin.body.user.doctorId && docLogin.body.user.doctorId.length > 0, `Doctor has unique Doctor ID: ${docLogin.body.user.doctorId}`);
    assert(docLogin.body.user.hospitalId && docLogin.body.user.hospital, `Doctor is associated with hospital: ${docLogin.body.user.hospital} (ID: ${docLogin.body.user.hospitalId})`);

    const docToken = docLogin.body.token;
    const docMe = await request('GET', '/api/auth/me', null, docToken);
    assert(docMe.status === 200 && docMe.body.user.role === 'doctor', 'Doctor can access protected /api/auth/me with Bearer token');

    // 4. HOSPITAL LOGIN FLOW (TASK 2 - ROLE 3)
    console.log('\n--- TEST GROUP 4: HOSPITAL LOGIN (ROLE 3) ---');
    const hospBadPass = await request('POST', '/api/auth/hospital/login', {
      email: 'kmch@hospital.com',
      password: 'wrong_hospital_password'
    });
    assert(hospBadPass.status === 401, 'Hospital login rejects incorrect password');

    const hospLogin = await request('POST', '/api/auth/hospital/login', {
      email: 'kmch@hospital.com',
      password: 'kmch123'
    });
    assert(hospLogin.status === 200 && hospLogin.body.success === true, 'Hospital logs in successfully with email and password');
    assert(hospLogin.body.token && typeof hospLogin.body.token === 'string', 'Hospital receives valid JWT token');
    assert(hospLogin.body.user && hospLogin.body.user.role === 'hospital', 'Hospital profile has role="hospital"');
    assert(hospLogin.body.user.hospitalId && hospLogin.body.user.hospitalId.length > 0, `Hospital has unique Hospital ID: ${hospLogin.body.user.hospitalId}`);

    const hospToken = hospLogin.body.token;
    const hospMe = await request('GET', '/api/auth/me', null, hospToken);
    assert(hospMe.status === 200 && hospMe.body.user.role === 'hospital', 'Hospital can access protected /api/auth/me with Bearer token');

    // Hospital Scoped Data Access Verification
    const hospOrders = await request('GET', '/api/hospital/orders', null, hospToken);
    assert(hospOrders.status === 200 && Array.isArray(hospOrders.body), 'Hospital can access its scoped orders');

    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();


const express = require('express');
const router = express.Router();
const {
  requestPatientOtp,
  verifyPatientOtpAndLogin,
  patientLogin,
  doctorLogin,
  hospitalLogin,
  getMe,
  registerPatient
} = require('../controllers/authController');
const {
  validatePatientOtpRequest,
  validatePatientOtpVerify,
  validateDoctorLogin,
  validateHospitalLogin
} = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

// 1. PATIENT AUTHENTICATION ROUTES
// OTP dispatch
router.post('/patient/send-otp', validatePatientOtpRequest, requestPatientOtp);

// OTP verification & login
router.post('/patient/verify-otp', validatePatientOtpVerify, verifyPatientOtpAndLogin);

// Direct Patient Login (supports mobile + OTP or PIN)
router.post('/patient/login', patientLogin);

// Patient Registration
router.post('/patient/register', registerPatient);

// 2. DOCTOR AUTHENTICATION ROUTES
router.post('/doctor/login', validateDoctorLogin, doctorLogin);

// 3. HOSPITAL AUTHENTICATION ROUTES
router.post('/hospital/login', validateHospitalLogin, hospitalLogin);

// 4. CURRENT AUTHENTICATED USER
router.get('/me', protect, getMe);

module.exports = router;


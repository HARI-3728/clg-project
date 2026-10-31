const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { generatePatientId, generateDoctorId, generateHospitalId } = require('../utils/idGenerator');
const { sendOtp, verifyOtp, isMockProvider } = require('../utils/otpService');
const { initialPatient, initialDoctors, initialHospitals } = require('../data/seedData');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Otp = require('../models/Otp');
const { getDBStatus } = require('../config/db');

// In-memory runtime cache for users if MongoDB is in offline dev mode
let inMemoryPatients = [initialPatient];
let inMemoryDoctors = [...initialDoctors];
let inMemoryHospitals = [...initialHospitals];

/**
 * @desc   Step 1: Request OTP for Patient Mobile Login
 * @route  POST /api/auth/patient/send-otp
 * @access Public
 */
const requestPatientOtp = async (req, res, next) => {
  try {
    const { sanitizedMobile } = req.body;
    const mobile = sanitizedMobile || req.body.mobile;

    // Send OTP via OTP service (mock in dev or configurable real SMS gateway)
    const otpResult = await sendOtp(mobile);

    // If MongoDB is connected, also record in Otp collection
    if (getDBStatus()) {
      try {
        await Otp.create({
          mobile,
          otp: otpResult.otp || '123456',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
      } catch (dbErr) {
        // Non-blocking log
        console.warn('Otp db save note:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: otpResult.message || `Verification code sent to ${mobile}`,
      mobile,
      // Provide OTP in response during development for easy testing
      ...(isMockProvider ? { mockOtp: otpResult.otp || '123456' } : {}),
      expiresIn: otpResult.expiresIn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Step 2: Verify Patient OTP & Login/Create Patient
 * @route  POST /api/auth/patient/verify-otp
 * @access Public
 */
const verifyPatientOtpAndLogin = async (req, res, next) => {
  try {
    const { mobile, otp, customName } = req.body;
    const cleanMobile = (mobile || '').trim();

    // Verify OTP code
    const verification = verifyOtp(cleanMobile, otp);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    let patientProfile = null;

    // Try MongoDB first if connected
    if (getDBStatus()) {
      try {
        patientProfile = await Patient.findOne({
          $or: [
            { mobile: cleanMobile },
            { mobile: { $regex: cleanMobile.slice(-10) } }
          ]
        });

        if (!patientProfile) {
          // Auto-register new patient with unique Medical ID
          const uniqueMedicalId = generatePatientId();
          patientProfile = await Patient.create({
            patientId: `usr_${Date.now().toString().slice(-4)}`,
            medicalID: uniqueMedicalId,
            name: customName || `Patient ${cleanMobile.slice(-4)}`,
            mobile: cleanMobile,
            email: `${cleanMobile.slice(-10)}@medicare.com`,
            role: 'patient',
            bloodGroup: 'O+',
            age: 28,
            gender: 'Male'
          });
        }
      } catch (dbErr) {
        console.warn('Patient find/create MongoDB warning:', dbErr.message);
      }
    }

    // Fallback to in-memory store
    if (!patientProfile) {
      patientProfile = inMemoryPatients.find((p) =>
        (p.mobile && p.mobile.includes(cleanMobile.slice(-10))) ||
        p.id === cleanMobile ||
        p.medicalID === cleanMobile
      );

      if (!patientProfile) {
        const uniqueMedicalId = generatePatientId();
        patientProfile = {
          ...initialPatient,
          id: `usr_${Date.now().toString().slice(-4)}`,
          patientId: `usr_${Date.now().toString().slice(-4)}`,
          medicalID: uniqueMedicalId,
          name: customName || `Patient ${cleanMobile.slice(-4)}`,
          mobile: cleanMobile,
          email: `${cleanMobile.slice(-10)}@medicare.com`
        };
        inMemoryPatients.push(patientProfile);
      }
    }

    const patientObj = patientProfile.toObject ? patientProfile.toObject() : patientProfile;

    // Generate JWT token
    const token = generateToken({
      id: patientObj.id || patientObj._id,
      patientId: patientObj.patientId || patientObj.medicalID,
      medicalID: patientObj.medicalID,
      role: 'patient',
      name: patientObj.name,
      mobile: patientObj.mobile,
      email: patientObj.email
    });

    return res.status(200).json({
      success: true,
      message: 'Patient authenticated successfully with OTP.',
      token,
      user: {
        ...patientObj,
        role: 'patient'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Unified Patient Login (Direct Mobile / PIN / OTP)
 * @route  POST /api/auth/patient/login
 * @access Public
 */
const patientLogin = async (req, res, next) => {
  try {
    const { identifier, mobile, otp, password } = req.body;
    const input = (identifier || mobile || '').trim();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Mobile number or Patient Medical ID.'
      });
    }

    // If OTP is provided, verify via OTP flow
    if (otp) {
      return verifyPatientOtpAndLogin(req, res, next);
    }

    // Otherwise allow direct demo/PIN sign in
    let patient = inMemoryPatients.find(
      (p) => (p.mobile && p.mobile.includes(input.slice(-10))) ||
             p.medicalID?.toLowerCase() === input.toLowerCase() ||
             p.id === input
    );

    if (!patient) {
      const uniqueMedicalId = generatePatientId();
      patient = {
        ...initialPatient,
        id: `usr_${Date.now().toString().slice(-4)}`,
        patientId: `usr_${Date.now().toString().slice(-4)}`,
        medicalID: uniqueMedicalId,
        name: input.includes('@') ? input.split('@')[0] : 'Patient',
        mobile: input,
        email: input.includes('@') ? input : 'patient@medicare.com'
      };
      inMemoryPatients.push(patient);
    }

    const token = generateToken({
      id: patient.id || patient._id,
      patientId: patient.patientId || patient.medicalID,
      medicalID: patient.medicalID,
      role: 'patient',
      name: patient.name,
      mobile: patient.mobile,
      email: patient.email
    });

    return res.status(200).json({
      success: true,
      message: 'Patient signed in successfully.',
      token,
      user: { ...patient, role: 'patient' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Doctor Login (Email & Password, Unique Doctor ID, Associated Hospital)
 * @route  POST /api/auth/doctor/login
 * @access Public
 */
const doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    // Default accepted password for testing: doctor123
    const isPasswordValid = password === 'doctor123' || password === 'admin123';
    
    // Find doctor in seed or DB
    let doctor = inMemoryDoctors.find(
      (d) => d.email.toLowerCase() === cleanEmail ||
             d.id.toLowerCase() === cleanEmail ||
             d.doctorId?.toLowerCase() === cleanEmail ||
             d.name.toLowerCase().includes(cleanEmail.replace(/[^a-z]/g, ''))
    );

    if (!doctor && cleanEmail.includes('priya')) {
      doctor = inMemoryDoctors[1];
    } else if (!doctor) {
      // Default to Dr. Kumar if matching pattern
      doctor = inMemoryDoctors[0];
    }

    if (!isPasswordValid && password !== 'doctor123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your doctor password.'
      });
    }

    // Doctor Token with hospital association and unique doctorId
    const token = generateToken({
      id: doctor.doctorId || doctor.id,
      doctorId: doctor.doctorId || doctor.id,
      role: 'doctor',
      name: doctor.name,
      email: doctor.email,
      hospitalId: doctor.hospitalId,
      hospital: doctor.hospital,
      specialty: doctor.specialty
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${doctor.name}. Doctor authentication confirmed.`,
      token,
      user: {
        ...doctor,
        role: 'doctor'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Hospital Login (Email & Password, Unique Hospital ID, Scoped Data Access)
 * @route  POST /api/auth/hospital/login
 * @access Public
 */
const hospitalLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    // Default accepted password for testing: kmch123 or hospital123
    const isPasswordValid = password === 'kmch123' || password === 'hospital123' || password === 'admin123';

    let hospital = inMemoryHospitals.find(
      (h) => h.email.toLowerCase() === cleanEmail ||
             h.id.toLowerCase() === cleanEmail ||
             h.hospitalId?.toLowerCase() === cleanEmail
    );

    if (!hospital) {
      hospital = inMemoryHospitals[0]; // KMCH default
    }

    if (!isPasswordValid && password !== 'kmch123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your hospital administrative password.'
      });
    }

    // Hospital Token with unique hospital ID
    const token = generateToken({
      id: hospital.hospitalId || hospital.id,
      hospitalId: hospital.hospitalId || hospital.id,
      role: 'hospital',
      name: hospital.name,
      legalName: hospital.legalName,
      email: hospital.email
    });

    return res.status(200).json({
      success: true,
      message: `Authorized access granted for ${hospital.name}.`,
      token,
      user: {
        ...hospital,
        role: 'hospital'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Current Logged-in User Profile
 * @route  GET /api/auth/me
 * @access Private (Requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Patient Registration with Unique Medical ID
 * @route  POST /api/auth/patient/register
 * @access Public
 */
const registerPatient = async (req, res, next) => {
  try {
    const { name, email, mobile, bloodGroup, age, emergencyContact, password } = req.body;
    
    if (!name || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Name and either email or mobile number are required.'
      });
    }

    const uniqueMedicalId = generatePatientId();
    const newPatient = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      patientId: `usr_${Date.now().toString().slice(-4)}`,
      medicalID: uniqueMedicalId,
      name,
      email: email || `${mobile || Date.now()}@medicare.com`,
      mobile: mobile || '+91 98765 43210',
      role: 'patient',
      bloodGroup: bloodGroup || 'O+',
      age: age ? Number(age) : 28,
      gender: 'Male',
      emergencyContact: emergencyContact || '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    inMemoryPatients.push(newPatient);

    const token = generateToken({
      id: newPatient.id,
      patientId: newPatient.patientId,
      medicalID: newPatient.medicalID,
      role: 'patient',
      name: newPatient.name,
      email: newPatient.email,
      mobile: newPatient.mobile
    });

    return res.status(201).json({
      success: true,
      message: 'Patient profile registered successfully.',
      token,
      user: newPatient
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestPatientOtp,
  verifyPatientOtpAndLogin,
  patientLogin,
  doctorLogin,
  hospitalLogin,
  getMe,
  registerPatient
};


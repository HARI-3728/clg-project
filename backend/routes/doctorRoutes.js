const express = require('express');
const router = express.Router();
const {
  getAllDoctorsWithAvailability,
  getDoctorAvailability,
  updateDoctorProfile,
  updateDoctorAvailability
} = require('../controllers/doctorManagementController');
const {
  getDoctorAppointments
} = require('../controllers/appointmentController');
const {
  acceptAppointment,
  rejectAppointment,
  updateAppointmentStatus
} = require('../controllers/doctorController');
const { createPrescription } = require('../controllers/prescriptionController');
const {
  getDoctorPatientHistory,
  getDoctorPatientReports
} = require('../controllers/medicalHistoryReportController');
const { reviewDietPlanByDoctor } = require('../controllers/dietPlanController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// 1. Doctor Directory with Specialization & Availability (Public / Browsable)
router.get('/', getAllDoctorsWithAvailability);
router.get('/availability', getDoctorAvailability);
router.get('/availability/:id', getDoctorAvailability);

// 2. Doctor Self Profile & Availability Management (Private: Doctor only)
router.put('/profile', protect, authorizeRoles('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorizeRoles('doctor'), updateDoctorAvailability);

// 3. Doctor Appointments & Schedule (Private: Doctor only)
router.get('/appointments', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.put('/appointments/:id/status', protect, authorizeRoles('doctor'), updateAppointmentStatus);
router.put('/appointments/:id/doctor-accept', protect, authorizeRoles('doctor'), acceptAppointment);
router.put('/appointments/:id/doctor-reject', protect, authorizeRoles('doctor'), rejectAppointment);

// 4. Prescription Management (Private: Doctor / Hospital)
router.post('/prescriptions', protect, authorizeRoles('doctor', 'hospital'), createPrescription);

// 5. Patient Clinical History & Reports Access (Private: Doctor / Hospital)
router.get('/patients/:patientId/history', protect, authorizeRoles('doctor', 'hospital'), getDoctorPatientHistory);
router.get('/patients/:patientId/reports', protect, authorizeRoles('doctor', 'hospital'), getDoctorPatientReports);

// 6. Educational Diet Plan Professional Review (Private: Doctor only)
router.post('/diet-plans/review', protect, authorizeRoles('doctor'), reviewDietPlanByDoctor);

module.exports = router;

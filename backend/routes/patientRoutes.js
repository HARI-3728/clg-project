const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  savePrescription,
  togglePrescriptionReminder,
  getRoutineMedicines,
  addRoutineMedicine,
  updateRoutineMedicine,
  deleteRoutineMedicine,
  getReports,
  addReport,
  deleteReport,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getOrders,
  createOrder,
  getDiagnosticBookings,
  getVaccinations,
  emergencyCall
} = require('../controllers/patientController');
const {
  getPatientAppointments
} = require('../controllers/appointmentController');
const {
  getPatientPrescriptions
} = require('../controllers/prescriptionController');
const {
  getPatientReminders,
  recordReminderAction,
  triggerPrescriptionReminders
} = require('../controllers/reminderController');
const {
  getPatientCombinedMedicalHistory,
  getPatientReports,
  uploadMedicalReport
} = require('../controllers/medicalHistoryReportController');
const { getDietPlanByCondition } = require('../controllers/dietPlanController');
const { uploadReport } = require('../middleware/uploadMiddleware');
const { optionalProtect, patientDataOnly } = require('../middleware/authMiddleware');

// Enforce token extraction and patient isolation across all patient routes
router.use(optionalProtect);
router.use(patientDataOnly);

// 1. Profile & Multi-Hospital Health History
router.get('/profile', getPatientProfile);
router.get('/medical-history', getPatientCombinedMedicalHistory);

// 2. Multi-Hospital Prescriptions (ACTIVE / INACTIVE)
router.get('/prescriptions', getPatientPrescriptions);
router.post('/prescriptions/:id/save', savePrescription);
router.put('/prescriptions/:id/toggle-reminder', togglePrescriptionReminder);
router.post('/prescriptions/:id/generate-reminders', triggerPrescriptionReminders);

// 3. Appointments (Upcoming & Previous)
router.get('/appointments', getPatientAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// 4. Medicine Reminders & Action Tracking
router.get('/reminders', getPatientReminders);
router.put('/reminders/:id/status', recordReminderAction);
router.put('/reminders/:id/action', recordReminderAction);

// 5. Medical Reports Secure Storage & Upload
router.get('/reports', getPatientReports);
router.post('/reports/upload', uploadReport.single('reportFile'), uploadMedicalReport);
router.post('/reports', uploadMedicalReport);
router.delete('/reports/:id', deleteReport);

// 6. Routine Medicines
router.get('/routine-medicines', getRoutineMedicines);
router.post('/routine-medicines', addRoutineMedicine);
router.put('/routine-medicines/:id', updateRoutineMedicine);
router.delete('/routine-medicines/:id', deleteRoutineMedicine);

// 7. Educational Diet Plan by Diagnosis
router.get('/diet-plan', (req, res, next) => {
  req.params.condition = req.query.condition || 'fever';
  return getDietPlanByCondition(req, res, next);
});
router.get('/diet-plan/:condition', getDietPlanByCondition);

// 8. Notifications, Orders, Diagnostics, Vaccinations, Emergency
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);

router.get('/orders', getOrders);
router.post('/orders', createOrder);

router.get('/diagnostic-bookings', getDiagnosticBookings);
router.get('/vaccinations', getVaccinations);
router.post('/emergency-call', emergencyCall);

module.exports = router;

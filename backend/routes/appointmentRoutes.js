const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  bookOnlineAppointment,
  bookOfflineAppointment,
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const { optionalProtect, patientDataOnly } = require('../middleware/authMiddleware');

router.use(optionalProtect);
router.use(patientDataOnly);

// 1. Check open slots by date, type, and doctor
router.get('/available-slots', getAvailableSlots);

// 2. Separate Online and Offline Booking Endpoints
router.post('/online', bookOnlineAppointment);
router.post('/offline', bookOfflineAppointment);

// 3. Patient appointments list
router.get('/', getPatientAppointments);

// 4. Cancellation & Rescheduling
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

module.exports = router;


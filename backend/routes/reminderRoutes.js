const express = require('express');
const router = express.Router();
const {
  getPatientReminders,
  recordReminderAction,
  triggerPrescriptionReminders
} = require('../controllers/reminderController');
const { optionalProtect, patientDataOnly } = require('../middleware/authMiddleware');

router.use(optionalProtect);
router.use(patientDataOnly);

// Patient medicine reminders list
router.get('/', getPatientReminders);

// Mark dose as Taken or Missed
router.put('/:id/status', recordReminderAction);
router.put('/:id/action', recordReminderAction);

// Trigger automatic reminders from prescription
router.post('/prescriptions/:id/generate', triggerPrescriptionReminders);

module.exports = router;


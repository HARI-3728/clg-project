const { MedicineReminder, Prescription } = require('../models');
const { dataStore, saveStore } = require('../data/store');
const { getDBStatus } = require('../config/db');

/**
 * Determine daily scheduled times based on frequency text
 */
const getTimesFromFrequency = (frequencyStr = '') => {
  const f = frequencyStr.toLowerCase();
  if (f.includes('three') || f.includes('thrice') || f.includes('3 times')) {
    return ['08:00 AM', '02:00 PM', '08:30 PM'];
  }
  if (f.includes('twice') || f.includes('2 times') || f.includes('morning + night')) {
    return ['08:00 AM', '08:30 PM'];
  }
  if (f.includes('night') || f.includes('dinner')) {
    return ['09:00 PM'];
  }
  if (f.includes('weekly')) {
    return ['09:00 AM'];
  }
  // Default: Once daily morning
  return ['08:00 AM'];
};

/**
 * Helper to generate reminders from an active prescription
 */
const generateRemindersFromPrescription = (prescription) => {
  if (!prescription || prescription.status?.toUpperCase() !== 'ACTIVE') {
    return [];
  }

  const pId = prescription.prescriptionId || prescription.code || prescription.id;
  const patientId = prescription.patientId || 'usr_101';
  const medName = prescription.medicineName || (prescription.medicines?.[0]?.medicineName) || 'Prescribed Medicine';
  const frequency = prescription.frequency || (prescription.medicines?.[0]?.frequency) || 'Twice Daily';
  const instructions = prescription.instructions || (prescription.medicines?.[0]?.instructions) || 'Take after meals';

  const times = getTimesFromFrequency(frequency);
  const startDate = prescription.prescriptionDate ? new Date(prescription.prescriptionDate) : new Date();

  let endDate = null;
  if (prescription.expiryDate) {
    endDate = new Date(prescription.expiryDate);
  } else {
    // Default 5-7 days from duration
    const durMatch = (prescription.duration || '').match(/\d+/);
    const days = durMatch ? parseInt(durMatch[0], 10) : 7;
    endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  }

  const createdReminders = [];

  times.forEach((t) => {
    // Prevent duplicate reminders for same patient, prescription, medicine and time
    const exists = dataStore.reminders.some(
      (r) =>
        r.patientId === patientId &&
        r.prescriptionId === pId &&
        r.medicineName.toLowerCase() === medName.toLowerCase() &&
        r.time === t
    );

    if (!exists) {
      const newRem = {
        id: `rem_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        reminderId: `rem_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        patientId,
        prescriptionId: pId,
        medicineName: medName,
        instructions,
        time: t,
        reminderTime: t,
        frequency,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
        active: true,
        status: 'ACTIVE',
        taken: false,
        takenToday: false,
        statusText: `Due at ${t}`
      };
      dataStore.reminders.push(newRem);
      createdReminders.push(newRem);
    }
  });

  saveStore();
  return createdReminders;
};

/**
 * @desc   Fetch Patient Medicine Reminders (with auto-sync for expired / inactive prescriptions)
 * @route  GET /api/patient/reminders
 * @access Private (Patient)
 */
const getPatientReminders = async (req, res, next) => {
  try {
    const patientId = req.user?.patientId || req.user?.medicalID || req.query.patientId || 'usr_101';
    const now = new Date();

    // Auto-sync reminders: stop future reminders if prescription is inactive or end date reached
    dataStore.reminders.forEach((r) => {
      // Check linked prescription status if exists
      if (r.prescriptionId) {
        const parentRx = dataStore.prescriptions.find(
          (p) => (p.prescriptionId === r.prescriptionId || p.id === r.prescriptionId || p.code === r.prescriptionId)
        );
        if (parentRx && parentRx.status?.toUpperCase() === 'INACTIVE') {
          r.status = 'INACTIVE';
          r.active = false;
          r.statusText = 'Prescription course ended';
        }
      }

      // Check if end date has passed
      if (r.endDate) {
        const endD = new Date(r.endDate);
        if (now > endD) {
          r.status = 'COMPLETED';
          r.active = false;
          r.statusText = 'Schedule completed';
        }
      }
    });

    saveStore();

    const patientReminders = dataStore.reminders.filter(
      (r) => !r.patientId || r.patientId === patientId || r.patientId === 'usr_101'
    );

    return res.status(200).json(patientReminders);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Mark reminder as Taken or Missed
 * @route  PUT /api/patient/reminders/:id/status or /action
 * @access Private (Patient)
 */
const recordReminderAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, status } = req.body; // 'TAKEN' | 'MISSED'
    const finalAction = (action || status || 'TAKEN').toUpperCase();

    const reminder = dataStore.reminders.find((r) => r.id === id || r.reminderId === id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine reminder not found.' });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (finalAction === 'TAKEN') {
      reminder.taken = true;
      reminder.takenToday = true;
      reminder.lastTakenAt = `Today at ${timeStr}`;
      reminder.statusText = `Taken at ${timeStr}`;
    } else {
      reminder.taken = false;
      reminder.takenToday = false;
      reminder.lastTakenAt = `Missed today`;
      reminder.statusText = `Missed dose at ${reminder.time || reminder.reminderTime}`;
    }

    if (getDBStatus()) {
      try {
        await MedicineReminder.findOneAndUpdate(
          { $or: [{ reminderId: id }, { _id: id }] },
          {
            $set: {
              takenToday: reminder.takenToday,
              lastTakenAt: reminder.lastTakenAt
            }
          }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: `Medicine marked as ${finalAction.toLowerCase()}.`,
      reminder
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Manually trigger reminder generation for a prescription
 * @route  POST /api/patient/prescriptions/:id/generate-reminders
 * @access Private
 */
const triggerPrescriptionReminders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rx = dataStore.prescriptions.find((p) => p.id === id || p.prescriptionId === id || p.code === id);

    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const generated = generateRemindersFromPrescription(rx);

    return res.status(200).json({
      success: true,
      message: `Generated ${generated.length} automatic dose reminders.`,
      reminders: generated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatientReminders,
  recordReminderAction,
  triggerPrescriptionReminders,
  generateRemindersFromPrescription
};


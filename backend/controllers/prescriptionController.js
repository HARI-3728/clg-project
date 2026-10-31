const { Prescription, MedicalHistory, Doctor, Hospital } = require('../models');
const { dataStore, saveStore } = require('../data/store');
const { generateRemindersFromPrescription } = require('./reminderController');
const { getDBStatus } = require('../config/db');

/**
 * @desc   Doctor creates a digital prescription for a patient
 * @route  POST /api/doctor/prescriptions
 * @access Private (Doctor only)
 */
const createPrescription = async (req, res, next) => {
  try {
    const doctorId = req.user?.doctorId || req.user?.id || req.body.doctorId || 'doc_1';
    const doctorName = req.user?.name || req.body.doctorName || 'Dr. Kumar';
    const hospitalId = req.user?.hospitalId || req.body.hospitalId || 'hosp_1';
    const hospitalName = req.user?.hospital || req.body.hospitalName || 'KMCH (Kovai Medical Center)';

    const {
      patientId,
      diagnosis,
      medicines,
      medicineName,
      dosage,
      frequency,
      duration,
      instructions,
      expiryDate,
      dietPlanCondition,
      dietPlanName
    } = req.body;

    const finalPatientId = patientId || 'usr_101';
    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Clinical diagnosis is required to issue a prescription.'
      });
    }

    const uniqueRxId = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalMedName = medicineName || medicines?.[0]?.medicineName || 'Prescribed Medicine';
    const finalDosage = dosage || medicines?.[0]?.dosage || '1 Tablet';
    const finalFreq = frequency || medicines?.[0]?.frequency || 'Twice Daily (Morning + Night)';
    const finalDur = duration || medicines?.[0]?.duration || '5 Days';
    const finalInst = instructions || medicines?.[0]?.instructions || 'Take after meals with warm water';

    const newPrescription = {
      id: uniqueRxId,
      prescriptionId: uniqueRxId,
      code: uniqueRxId,
      patientId: finalPatientId,
      doctorId,
      doctorName,
      hospitalId,
      hospitalName,
      diagnosis,
      medicineName: finalMedName,
      dosage: finalDosage,
      frequency: finalFreq,
      duration: finalDur,
      instructions: finalInst,
      medicines: medicines || [
        {
          medicineName: finalMedName,
          dosage: finalDosage,
          frequency: finalFreq,
          duration: finalDur,
          instructions: finalInst
        }
      ],
      prescriptionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      date: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '',
      status: 'ACTIVE',
      saved: false,
      reminderEnabled: true,
      dietPlanCondition: dietPlanCondition || 'general',
      dietPlanName: dietPlanName || 'Balanced Recovery Nutrition Plan'
    };

    // 1. Save in Prescription DB
    if (getDBStatus()) {
      try {
        await Prescription.create({
          ...newPrescription,
          prescriptionDate: new Date()
        });
      } catch (dbErr) {
        console.warn('Prescription DB save notice:', dbErr.message);
      }
    }

    dataStore.prescriptions.unshift(newPrescription);

    // 2. Automatically record in patient's combined Medical History
    const historyEntry = {
      id: `hist_${Date.now()}`,
      historyId: `HIST-${Date.now().toString().slice(-6)}`,
      patientId: finalPatientId,
      hospitalId,
      hospital: hospitalName,
      hospitalName,
      doctorId,
      doctor: doctorName,
      doctorName,
      diagnosis,
      date: new Date().toISOString().split('T')[0],
      treatmentDate: new Date(),
      treatment: `Prescribed ${finalMedName} (${finalDosage}, ${finalFreq}) for ${finalDur}.`,
      prescriptionId: uniqueRxId,
      notes: finalInst
    };

    if (getDBStatus()) {
      try {
        await MedicalHistory.create(historyEntry);
      } catch (e) {}
    }

    if (!dataStore.medicalHistory) dataStore.medicalHistory = [];
    dataStore.medicalHistory.unshift(historyEntry);

    // 3. Automatically generate dosage reminders for active prescription
    const remindersCreated = generateRemindersFromPrescription(newPrescription);

    saveStore();

    return res.status(201).json({
      success: true,
      message: 'Prescription issued successfully, linked to patient history and reminders created.',
      prescription: newPrescription,
      remindersGenerated: remindersCreated.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Patient views prescriptions from multiple hospitals (separated into ACTIVE & INACTIVE)
 * @route  GET /api/patient/prescriptions
 * @access Private (Patient / Doctor)
 */
const getPatientPrescriptions = async (req, res, next) => {
  try {
    const patientId = req.user?.patientId || req.user?.medicalID || req.user?.id || req.query.patientId || 'usr_101';
    const { status, hospitalId } = req.query;

    let list = dataStore.prescriptions.filter(
      (p) => !p.patientId || p.patientId === patientId || p.patientId === req.user?.id || p.patientId === req.user?.medicalID || p.patientId === 'usr_101'
    );

    if (hospitalId) {
      list = list.filter((p) => p.hospitalId === hospitalId || p.hospitalName?.includes(hospitalId));
    }

    const activeList = list.filter((p) => p.status?.toUpperCase() === 'ACTIVE');
    const inactiveList = list.filter((p) => p.status?.toUpperCase() === 'INACTIVE');

    if (status) {
      const target = status.toUpperCase();
      return res.status(200).json(target === 'ACTIVE' ? activeList : inactiveList);
    }

    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update Prescription status (ACTIVE <-> INACTIVE)
 * @route  PUT /api/prescriptions/:id/status
 * @access Private (Doctor / Patient)
 */
const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = (status || 'INACTIVE').toUpperCase();

    const rx = dataStore.prescriptions.find((p) => p.id === id || p.prescriptionId === id || p.code === id);
    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    rx.status = newStatus;

    // If marked inactive, stop future reminders for this prescription
    if (newStatus === 'INACTIVE') {
      dataStore.reminders.forEach((r) => {
        if (r.prescriptionId === id || r.prescriptionId === rx.code) {
          r.status = 'INACTIVE';
          r.active = false;
          r.statusText = 'Prescription ended';
        }
      });
    }

    if (getDBStatus()) {
      try {
        await Prescription.findOneAndUpdate(
          { $or: [{ prescriptionId: id }, { _id: id }] },
          { $set: { status: newStatus } }
        );
      } catch (e) {}
    }

    saveStore();

    return res.status(200).json({
      success: true,
      message: `Prescription marked as ${newStatus}. Preserved in patient medical history.`,
      prescription: rx
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  updatePrescriptionStatus
};


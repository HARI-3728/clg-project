const express = require('express');
const router = express.Router();
const {
  getPatientPrescriptions,
  updatePrescriptionStatus,
  createPrescription
} = require('../controllers/prescriptionController');
const { protect, authorizeRoles, optionalProtect, patientDataOnly } = require('../middleware/authMiddleware');

router.use(optionalProtect);
router.use(patientDataOnly);

// Get prescriptions (supports ?status=ACTIVE or ?status=INACTIVE, and ?hospitalId=...)
router.get('/', getPatientPrescriptions);

// Update status (ACTIVE / INACTIVE)
router.put('/:id/status', protect, authorizeRoles('doctor', 'hospital', 'patient'), updatePrescriptionStatus);

// Create prescription (Doctor or Hospital only)
router.post('/', protect, authorizeRoles('doctor', 'hospital'), createPrescription);

module.exports = router;


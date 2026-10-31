const express = require('express');
const router = express.Router();
const {
  getPublicMedicines,
  getMedicineById,
  getPublicHospitals,
  getPublicDoctors
} = require('../controllers/publicController');

// Publicly accessible endpoints (No login required)
router.get('/medicines', getPublicMedicines);
router.get('/medicines/:id', getMedicineById);
router.get('/hospitals', getPublicHospitals);
router.get('/doctors', getPublicDoctors);

module.exports = router;


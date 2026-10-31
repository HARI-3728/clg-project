const express = require('express');
const router = express.Router();
const {
  createHospitalBill,
  getHospitalBills,
  getHospitalPrintableInvoice,
  updateHospitalBillStatus
} = require('../controllers/hospitalBillingController');
const {
  createPharmacyBill,
  getPharmacyBills,
  getPharmacyPrintableInvoice,
  updatePharmacyBillStatus
} = require('../controllers/pharmacyBillingController');
const {
  getHospitalOrders,
  updateOrderStatus,
  generateBillForOrder
} = require('../controllers/hospitalController');
const {
  addDoctorByHospital,
  getDoctorsByHospital,
  updateDoctorByHospital
} = require('../controllers/doctorManagementController');
const {
  getHospitalAppointments
} = require('../controllers/appointmentController');
const { protect, authorizeRoles, hospitalDataOnly } = require('../middleware/authMiddleware');

// 🔒 STRICT ACCESS CONTROL:
// Only Hospital Staff & Authorized Pharmacy personnel can access hospital billing and management.
// Patients are strictly forbidden from accessing billing routes.
router.use(protect);
router.use(authorizeRoles('hospital'));
router.use(hospitalDataOnly);

// ==========================================
// 1. HOSPITAL BILLS API (Inpatient & OPD)
// ==========================================
router.post('/bills', createHospitalBill);
router.get('/bills', getHospitalBills);
router.get('/bills/:id', getHospitalPrintableInvoice);
router.get('/bills/:id/invoice', getHospitalPrintableInvoice);
router.put('/bills/:id/status', updateHospitalBillStatus);

// ==========================================
// 2. PHARMACY BILLS API (Separate System)
// ==========================================
router.post('/pharmacy-bills', createPharmacyBill);
router.get('/pharmacy-bills', getPharmacyBills);
router.get('/pharmacy-bills/:id', getPharmacyPrintableInvoice);
router.get('/pharmacy-bills/:id/invoice', getPharmacyPrintableInvoice);
router.put('/pharmacy-bills/:id/status', updatePharmacyBillStatus);

// ==========================================
// 3. DOCTOR & APPOINTMENT MANAGEMENT
// ==========================================
router.post('/doctors', addDoctorByHospital);
router.get('/doctors', getDoctorsByHospital);
router.put('/doctors/:id', updateDoctorByHospital);
router.get('/appointments', getHospitalAppointments);

// ==========================================
// 4. PHARMACY ORDERS & BILL DISPATCH
// ==========================================
router.get('/orders', getHospitalOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/generate-bill', generateBillForOrder);

module.exports = router;

// Central Export for all MediCare+ MongoDB Models
const Patient = require('./Patient');
const Hospital = require('./Hospital');
const Doctor = require('./Doctor');
const Medicine = require('./Medicine');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const MedicineReminder = require('./MedicineReminder');
const MedicalHistory = require('./MedicalHistory');
const MedicalReport = require('./MedicalReport');
const HospitalBill = require('./HospitalBill');
const PharmacyBill = require('./PharmacyBill');
const User = require('./User');
const Otp = require('./Otp');

module.exports = {
  Patient,
  Hospital,
  Doctor,
  Medicine,
  Appointment,
  Prescription,
  MedicineReminder,
  MedicalHistory,
  MedicalReport,
  HospitalBill,
  PharmacyBill,
  User,
  Otp
};


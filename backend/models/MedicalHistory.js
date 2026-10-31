const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema(
  {
    historyId: {
      type: String,
      trim: true,
      index: true
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      trim: true,
      ref: 'Patient',
      index: true
    },
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID is required'],
      trim: true,
      ref: 'Hospital',
      index: true
    },
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      trim: true,
      ref: 'Doctor',
      index: true
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true
    },
    treatmentDate: {
      type: Date,
      required: [true, 'Treatment date is required'],
      default: Date.now,
      index: true
    },
    prescriptionId: {
      type: String,
      trim: true,
      ref: 'Prescription',
      index: true
    },
    // Clinical notes & records
    treatment: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    doctorName: {
      type: String,
      trim: true
    },
    hospitalName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Auto-assign historyId if omitted
medicalHistorySchema.pre('save', function (next) {
  if (!this.historyId) {
    this.historyId = `HIST-${Date.now().toString().slice(-6)}`;
  }
  next();
});

// Indexes allowing one patient to track multi-hospital medical history chronologically
medicalHistorySchema.index({ patientId: 1, treatmentDate: -1 });
medicalHistorySchema.index({ hospitalId: 1, treatmentDate: -1 });

const MedicalHistory = mongoose.models.MedicalHistory || mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;


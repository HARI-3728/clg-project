const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
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
    reportType: {
      type: String,
      required: [true, 'Report type is required'],
      trim: true,
      index: true
    },
    fileReference: {
      type: String,
      required: [true, 'File reference or storage key is required'],
      trim: true
    },
    reportDate: {
      type: Date,
      required: [true, 'Report date is required'],
      default: Date.now,
      index: true
    },
    // Lab & scan metadata
    name: {
      type: String,
      trim: true
    },
    summary: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      default: 'Verified / Normal'
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true,
      default: 'application/pdf'
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtual
medicalReportSchema.virtual('id').get(function () {
  return this.reportId;
});

// Auto-assign reportId if omitted
medicalReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    this.reportId = `REP-${Date.now().toString().slice(-6)}`;
  }
  next();
});

// Indexes for cross-hospital reports retrieval per patient
medicalReportSchema.index({ patientId: 1, reportDate: -1 });
medicalReportSchema.index({ hospitalId: 1, reportDate: -1 });

const MedicalReport = mongoose.models.MedicalReport || mongoose.model('MedicalReport', medicalReportSchema);

module.exports = MedicalReport;


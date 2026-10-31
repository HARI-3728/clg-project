const mongoose = require('mongoose');

const prescribedMedicineItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: String,
      ref: 'Medicine',
      trim: true
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    dosage: {
      type: String,
      trim: true,
      default: '1 Tablet'
    },
    frequency: {
      type: String,
      trim: true,
      default: 'Twice Daily (Morning + Night)'
    },
    duration: {
      type: String,
      trim: true,
      default: '5 Days'
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Take after meals with warm water'
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      required: [true, 'Prescription ID is required'],
      unique: true,
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
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      trim: true,
      ref: 'Doctor',
      index: true
    },
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID is required'],
      trim: true,
      ref: 'Hospital',
      index: true
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis is required'],
      trim: true
    },
    medicines: {
      type: [prescribedMedicineItemSchema],
      default: []
    },
    // Top-level prescription specification fields
    dosage: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    prescriptionDate: {
      type: Date,
      required: [true, 'Prescription date is required'],
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      required: [true, 'Prescription status is required'],
      enum: {
        values: ['ACTIVE', 'INACTIVE'],
        message: '{VALUE} is not a valid prescription status. Must be ACTIVE or INACTIVE.'
      },
      uppercase: true,
      default: 'ACTIVE',
      index: true
    },
    // Lifestyle and adherence tracking
    expiryDate: {
      type: Date
    },
    dietPlanName: {
      type: String,
      trim: true
    },
    dietPlanCondition: {
      type: String,
      trim: true
    },
    saved: {
      type: Boolean,
      default: false
    },
    reminderEnabled: {
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

// Backward compatibility virtuals
prescriptionSchema.virtual('id').get(function () {
  return this.prescriptionId;
});

prescriptionSchema.virtual('code').get(function () {
  return this.prescriptionId;
});

// Pre-validate hook to sync top-level fields into medicines array if needed
prescriptionSchema.pre('validate', function (next) {
  if (this.status) {
    this.status = this.status.toUpperCase();
  }
  if (!this.prescriptionId && this.code) {
    this.prescriptionId = this.code;
  }
  // If a single medicine was passed in medicines or as string, normalize
  if (typeof this.medicines === 'string') {
    this.medicines = [{
      medicineName: this.medicines,
      dosage: this.dosage || '1 Tablet',
      frequency: this.frequency || 'Once Daily',
      duration: this.duration || '5 Days',
      instructions: this.instructions || 'As advised'
    }];
  }
  next();
});

// Indexes
prescriptionSchema.index({ patientId: 1, status: 1 });
prescriptionSchema.index({ hospitalId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;


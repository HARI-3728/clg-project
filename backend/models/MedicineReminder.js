const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema(
  {
    reminderId: {
      type: String,
      required: [true, 'Reminder ID is required'],
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
    prescriptionId: {
      type: String,
      trim: true,
      ref: 'Prescription',
      index: true
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    reminderTime: {
      type: String,
      required: [true, 'Reminder time is required (e.g. 08:00 AM)'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Reminder start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      required: [true, 'Reminder status is required'],
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'COMPLETED', 'DISCONTINUED'],
        message: '{VALUE} is not a valid reminder status'
      },
      uppercase: true,
      default: 'ACTIVE',
      index: true
    },
    // Adherence monitoring
    frequency: {
      type: String,
      default: 'Once Daily'
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Take with warm water'
    },
    takenToday: {
      type: Boolean,
      default: false
    },
    lastTakenAt: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtual
medicineReminderSchema.virtual('id').get(function () {
  return this.reminderId;
});

// Pre-validate hook
medicineReminderSchema.pre('validate', function (next) {
  if (this.status) {
    this.status = this.status.toUpperCase();
  }
  if (!this.reminderId && this.id) {
    this.reminderId = this.id;
  }
  next();
});

// Indexes
medicineReminderSchema.index({ patientId: 1, status: 1 });
medicineReminderSchema.index({ patientId: 1, reminderTime: 1 });

const MedicineReminder = mongoose.models.MedicineReminder || mongoose.model('MedicineReminder', medicineReminderSchema);

module.exports = MedicineReminder;


const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: [true, 'Appointment ID is required'],
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
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true
    },
    appointmentType: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: {
        values: ['ONLINE', 'OFFLINE'],
        message: '{VALUE} is not a valid appointment type. Must be ONLINE or OFFLINE.'
      },
      uppercase: true,
      default: 'OFFLINE'
    },
    status: {
      type: String,
      required: [true, 'Appointment status is required'],
      enum: {
        values: ['PENDING', 'CONFIRMED', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
        message: '{VALUE} is not a valid appointment status'
      },
      uppercase: true,
      default: 'CONFIRMED',
      index: true
    },
    // Contextual metadata for teleconsultation & OPD visits
    tokenNo: {
      type: String,
      trim: true
    },
    roomCode: {
      type: String,
      trim: true
    },
    reasonForVisit: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    doctorNotes: {
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

// Shorthand virtuals
appointmentSchema.virtual('id').get(function () {
  return this.appointmentId;
});

appointmentSchema.virtual('type').get(function () {
  return this.appointmentType;
});

// Pre-validate hook for case conversions & aliases
appointmentSchema.pre('validate', function (next) {
  if (this.appointmentType) {
    this.appointmentType = this.appointmentType.toUpperCase();
  } else if (this.type) {
    this.appointmentType = this.type.toUpperCase();
  }
  if (this.status) {
    this.status = this.status.toUpperCase();
    if (this.status.includes('PENDING')) this.status = 'PENDING';
  }
  next();
});

// Compound indexes for optimal querying across patient history, doctor schedules, and hospital OPD
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ hospitalId: 1, appointmentDate: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;


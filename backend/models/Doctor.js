const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Doctor name must be at least 2 characters long'],
      maxlength: [100, 'Doctor name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Doctor email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    specialization: {
      type: String,
      required: [true, 'Doctor specialization is required'],
      trim: true,
      index: true
    },
    qualification: {
      type: String,
      required: [true, 'Doctor qualification is required'],
      trim: true,
      default: 'MBBS, MD'
    },
    experience: {
      type: String,
      required: [true, 'Years of experience is required'],
      trim: true,
      default: '10+ Years Exp'
    },
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID association is required'],
      trim: true,
      ref: 'Hospital',
      index: true
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee in INR is required'],
      min: [0, 'Fee cannot be negative'],
      default: 400
    },
    availability: {
      online: {
        days: {
          type: [String],
          default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        timing: {
          type: String,
          default: '04:00 PM - 08:00 PM'
        },
        slots: {
          type: [String],
          default: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']
        },
        isAvailable: {
          type: Boolean,
          default: true
        }
      },
      offline: {
        days: {
          type: [String],
          default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        timing: {
          type: String,
          default: '09:00 AM - 01:00 PM'
        },
        slots: {
          type: [String],
          default: ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM']
        },
        isAvailable: {
          type: Boolean,
          default: true
        }
      },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      availableDays: {
        type: String,
        default: 'Mon - Sat'
      },
      timing: {
        type: String,
        default: '10:00 AM - 01:00 PM & 05:00 PM - 08:00 PM'
      },
      availableSlots: {
        type: [String],
        default: ['09:30 AM', '10:30 AM', '11:30 AM', '04:30 PM', '05:30 PM', '06:30 PM']
      },
      isAvailableOnline: {
        type: Boolean,
        default: true
      }
    },
    // Hospital and regulatory metadata
    hospitalName: { type: String, trim: true },
    medicalRegNo: { type: String, trim: true, default: 'TNMC-44812' },
    rating: { type: Number, min: 1, max: 5, default: 4.8 },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
    },
    consultationCategories: [String],
    diseaseTreated: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtuals
doctorSchema.virtual('name').get(function () {
  return this.doctorName;
});

doctorSchema.virtual('specialty').get(function () {
  return this.specialization;
});

doctorSchema.virtual('hospital').get(function () {
  return this.hospitalName || 'KMCH';
});

doctorSchema.virtual('fee').get(function () {
  return `₹${this.consultationFee}`;
});

// Pre-validate hook for aliases
doctorSchema.pre('validate', function (next) {
  if (!this.doctorName && this.name) {
    this.doctorName = this.name;
  }
  if (!this.specialization && this.specialty) {
    this.specialization = this.specialty;
  }
  if (!this.consultationFee && this.fee) {
    const numeric = parseInt(this.fee.replace(/\D/g, ''), 10);
    this.consultationFee = isNaN(numeric) ? 400 : numeric;
  }
  next();
});

// Compound & text indexes
doctorSchema.index({ doctorName: 'text', specialization: 'text' });
doctorSchema.index({ hospitalId: 1, specialization: 1 });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;

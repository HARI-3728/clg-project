const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return /\d{10,15}/.test(v.replace(/\D/g, ''));
        },
        message: (props) => `${props.value} is not a valid mobile phone number!`
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other', 'Prefer not to say'],
        message: '{VALUE} is not a supported gender'
      },
      default: 'Male'
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true, default: 'Coimbatore' },
      state: { type: String, trim: true, default: 'Tamil Nadu' },
      pincode: { type: String, trim: true },
      fullAddress: { type: String, trim: true, default: 'Coimbatore, Tamil Nadu' }
    },
    profileDetails: {
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        default: 'O+'
      },
      age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [130, 'Age must be realistic'],
        default: 28
      },
      height: { type: String, default: '172 cm' },
      weight: { type: String, default: '68 kg' },
      emergencyContact: { type: String, default: '+91 98765 43210' },
      allergies: [{ type: String, trim: true }],
      chronicConditions: [{ type: String, trim: true }],
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtuals for existing frontend hooks
patientSchema.virtual('medicalID').get(function () {
  return this.patientId;
});

patientSchema.virtual('mobile').get(function () {
  return this.mobileNumber;
});

patientSchema.virtual('bloodGroup').get(function () {
  return this.profileDetails?.bloodGroup || 'O+';
});

patientSchema.virtual('age').get(function () {
  return this.profileDetails?.age || 28;
});

// Pre-validate hook to sync aliases if passed
patientSchema.pre('validate', function (next) {
  if (!this.patientId && this.medicalID) {
    this.patientId = this.medicalID;
  }
  if (!this.mobileNumber && this.mobile) {
    this.mobileNumber = this.mobile;
  }
  if (typeof this.address === 'string') {
    this.address = { fullAddress: this.address, city: 'Coimbatore', state: 'Tamil Nadu' };
  }
  next();
});

// Compound & text indexes
patientSchema.index({ name: 'text', patientId: 'text' });
patientSchema.index({ createdAt: -1 });

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

module.exports = Patient;

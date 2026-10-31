const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true
    },
    password: {
      type: String,
      select: false // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'hospital'],
      required: [true, 'Role is required'],
      default: 'patient'
    },
    // Patient-specific identifiers & profile fields
    patientId: {
      type: String,
      unique: true,
      sparse: true
    },
    medicalID: {
      type: String,
      sparse: true
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    age: {
      type: Number,
      default: 28
    },
    gender: {
      type: String,
      default: 'Male'
    },
    emergencyContact: {
      type: String
    },
    // Doctor-specific fields
    doctorId: {
      type: String,
      sparse: true
    },
    specialty: {
      type: String
    },
    hospitalId: {
      type: String
    },
    hospitalName: {
      type: String
    },
    experience: {
      type: String
    },
    rating: {
      type: Number,
      default: 4.8
    },
    fee: {
      type: String,
      default: '₹400'
    },
    availableDays: {
      type: String,
      default: 'Mon - Sat'
    },
    availableTime: {
      type: String,
      default: '10:00 AM - 01:00 PM'
    },
    medicalRegNo: {
      type: String
    },
    // Hospital-specific fields
    legalName: {
      type: String
    },
    location: {
      type: String
    },
    emergencyPhone: {
      type: String
    },
    registrationNo: {
      type: String
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;


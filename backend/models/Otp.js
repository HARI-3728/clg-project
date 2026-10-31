const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' } // Automatically clean up after expiration
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

module.exports = Otp;


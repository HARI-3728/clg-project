const mongoose = require('mongoose');

const hospitalBillSchema = new mongoose.Schema(
  {
    billId: {
      type: String,
      required: [true, 'Hospital Bill ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      trim: true,
      index: true,
      default: function () {
        return this.billId || `INV-HOSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    },
    billDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      trim: true,
      ref: 'Patient',
      index: true
    },
    patientName: {
      type: String,
      trim: true,
      default: 'Patient'
    },
    patientDetails: {
      name: {
        type: String,
        trim: true,
        default: 'Patient'
      },
      contact: { type: String, trim: true, default: '+91 98765 43210' },
      age: { type: Number, default: 28 },
      gender: { type: String, default: 'Male' },
      address: { type: String, default: '' }
    },
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID is required (all hospital billing belongs to the hospital)'],
      trim: true,
      ref: 'Hospital',
      index: true
    },
    doctorId: {
      type: String,
      trim: true,
      ref: 'Doctor',
      index: true
    },
    doctorDetails: {
      name: { type: String, trim: true },
      specialization: { type: String, trim: true },
      doctorId: { type: String, trim: true }
    },
    consultationCharges: {
      type: Number,
      required: [true, 'Consultation charges are required'],
      min: [0, 'Consultation charges cannot be negative'],
      default: 0
    },
    treatmentCharges: {
      type: Number,
      required: [true, 'Treatment charges are required'],
      min: [0, 'Treatment charges cannot be negative'],
      default: 0
    },
    testCharges: {
      type: Number,
      required: [true, 'Laboratory test charges are required'],
      min: [0, 'Test charges cannot be negative'],
      default: 0
    },
    roomCharges: {
      type: Number,
      required: [true, 'Room charges are required'],
      min: [0, 'Room charges cannot be negative'],
      default: 0
    },
    otherCharges: {
      type: Number,
      min: [0, 'Other charges cannot be negative'],
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount in INR is required'],
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      immutable: true,
      uppercase: true
    },
    paymentStatus: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: {
        values: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
        message: '{VALUE} is not a valid payment status'
      },
      uppercase: true,
      default: 'PAID',
      index: true
    },
    paymentMode: {
      type: String,
      default: 'UPI / Cash'
    },
    serviceCategory: {
      type: String,
      default: 'OPD Consultation & Clinical Examination'
    },
    roomNo: {
      type: String
    },
    notes: {
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

// Backward compatibility virtuals
hospitalBillSchema.virtual('billNo').get(function () {
  return this.invoiceNumber || this.billId;
});

hospitalBillSchema.virtual('doctorName').get(function () {
  return this.doctorDetails?.name;
});

hospitalBillSchema.virtual('date').get(function () {
  return this.billDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
});

hospitalBillSchema.virtual('formattedTotal').get(function () {
  return `₹${this.totalAmount.toLocaleString('en-IN')}`;
});

// Auto-calculate total amount on the backend and ensure invoiceNumber is set
hospitalBillSchema.pre('validate', function (next) {
  if (this.paymentStatus) {
    this.paymentStatus = this.paymentStatus.toUpperCase();
    if (this.paymentStatus === 'UNPAID') this.paymentStatus = 'PENDING';
  }
  if (!this.invoiceNumber && this.billNo) {
    this.invoiceNumber = this.billNo;
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-HOSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (!this.billId) {
    this.billId = this.invoiceNumber;
  }
  if (!this.patientName && this.patientDetails?.name) {
    this.patientName = this.patientDetails.name;
  }
  if (!this.patientDetails) {
    this.patientDetails = { name: this.patientName || 'Patient' };
  } else if (!this.patientDetails.name) {
    this.patientDetails.name = this.patientName || 'Patient';
  }

  // Calculate total on the backend
  this.totalAmount =
    Number(this.consultationCharges || 0) +
    Number(this.treatmentCharges || 0) +
    Number(this.testCharges || 0) +
    Number(this.roomCharges || 0) +
    Number(this.otherCharges || 0);

  next();
});

// Hospital ownership and patient-scoped indexes
hospitalBillSchema.index({ hospitalId: 1, createdAt: -1 });
hospitalBillSchema.index({ patientId: 1, createdAt: -1 });

const HospitalBill = mongoose.models.HospitalBill || mongoose.model('HospitalBill', hospitalBillSchema);

module.exports = HospitalBill;

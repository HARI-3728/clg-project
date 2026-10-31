const mongoose = require('mongoose');

const billedMedicineItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price in INR is required'],
      min: [0, 'Unit price cannot be negative']
    },
    lineTotal: {
      type: Number,
      required: [true, 'Line total in INR is required'],
      min: [0, 'Line total cannot be negative']
    }
  },
  { _id: false }
);

const pharmacyBillSchema = new mongoose.Schema(
  {
    billId: {
      type: String,
      required: [true, 'Pharmacy Bill ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      trim: true,
      index: true,
      default: function () {
        return this.billId || `INV-PHARM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
      patientId: { type: String, trim: true }
    },
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID is required (all pharmacy billing belongs to the hospital)'],
      trim: true,
      ref: 'Hospital',
      index: true
    },
    // Top-level medicine attributes
    medicineName: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      min: [1, 'Total quantity must be at least 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
      default: 0
    },
    medicines: {
      type: [billedMedicineItemSchema],
      default: []
    },
    price: {
      type: Number,
      required: [true, 'Subtotal price in INR is required'],
      min: [0, 'Price cannot be negative']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
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
        values: ['PENDING', 'PAID', 'CANCELLED'],
        message: '{VALUE} is not a valid payment status'
      },
      uppercase: true,
      default: 'PAID',
      index: true
    },
    paymentMode: {
      type: String,
      default: 'Cash / UPI Counter'
    },
    orderId: {
      type: String,
      trim: true
    },
    prescriptionVerified: {
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
pharmacyBillSchema.virtual('billNo').get(function () {
  return this.invoiceNumber || this.billId;
});

pharmacyBillSchema.virtual('date').get(function () {
  return this.billDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
});

pharmacyBillSchema.virtual('formattedTotal').get(function () {
  return `₹${this.totalAmount.toLocaleString('en-IN')}`;
});

// Auto-calculate on the backend: subtotal, discount, tax, totalAmount, invoiceNumber
pharmacyBillSchema.pre('validate', function (next) {
  if (this.paymentStatus) {
    this.paymentStatus = this.paymentStatus.toUpperCase();
    if (this.paymentStatus === 'UNPAID') this.paymentStatus = 'PENDING';
  }
  if (!this.invoiceNumber && this.billNo) {
    this.invoiceNumber = this.billNo;
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-PHARM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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

  // Calculate from itemized medicines if present
  if (Array.isArray(this.medicines) && this.medicines.length > 0) {
    const calculatedQty = this.medicines.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    this.quantity = calculatedQty;

    const calculatedSubtotal = this.medicines.reduce((sum, item) => {
      const line = Number(item.lineTotal) || (Number(item.quantity || 1) * Number(item.unitPrice || 0));
      return sum + line;
    }, 0);
    this.price = calculatedSubtotal;

    if (!this.medicineName) {
      this.medicineName = this.medicines[0].medicineName;
    }
    if (!this.unitPrice) {
      this.unitPrice = this.medicines[0].unitPrice;
    }
  } else if (this.medicineName && this.unitPrice) {
    // If single medicine specified
    const qty = Number(this.quantity) || 1;
    this.price = qty * Number(this.unitPrice);
    this.medicines = [
      {
        medicineName: this.medicineName,
        quantity: qty,
        unitPrice: Number(this.unitPrice),
        lineTotal: this.price
      }
    ];
  }

  // Calculate backend total: subtotal - discount + tax
  const subtotal = Number(this.price) || 0;
  const disc = Number(this.discount) || 0;
  const tx = Number(this.tax) || 0;
  this.totalAmount = Math.max(0, subtotal - disc + tx);

  next();
});

// Hospital ownership and patient-scoped indexes
pharmacyBillSchema.index({ hospitalId: 1, createdAt: -1 });
pharmacyBillSchema.index({ patientId: 1, createdAt: -1 });

const PharmacyBill = mongoose.models.PharmacyBill || mongoose.model('PharmacyBill', pharmacyBillSchema);

module.exports = PharmacyBill;

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: String,
      required: [true, 'Medicine ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true
    },
    brand: {
      type: String,
      trim: true,
      default: 'Standard Generic'
    },
    manufacturer: {
      type: String,
      trim: true,
      default: 'MediCare Pharma Labs'
    },
    priceInINR: {
      type: Number,
      required: [true, 'Medicine price in INR is required'],
      min: [0, 'Price in INR cannot be negative']
    },
    medicineCategory: {
      type: String,
      required: [true, 'Medicine category is required'],
      trim: true,
      index: true
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
      index: true
    },
    // Pharmacological attributes
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Oral Powder Sachet', 'Nasal Drops', 'Other'],
      default: 'Tablet'
    },
    strength: {
      type: String,
      trim: true,
      default: 'Standard Dose'
    },
    generalPurpose: {
      type: String,
      trim: true
    },
    stockQuantity: {
      type: Number,
      default: 100,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtuals
medicineSchema.virtual('name').get(function () {
  return this.medicineName;
});

medicineSchema.virtual('category').get(function () {
  return this.medicineCategory;
});

medicineSchema.virtual('price').get(function () {
  return this.priceInINR;
});

// Pre-validate hook for aliases
medicineSchema.pre('validate', function (next) {
  if (!this.medicineName && this.name) {
    this.medicineName = this.name;
  }
  if (!this.medicineCategory && this.category) {
    this.medicineCategory = this.category;
  }
  if (this.priceInINR === undefined && this.price !== undefined) {
    this.priceInINR = this.price;
  }
  next();
});

// Text and category indexes
medicineSchema.index({ medicineName: 'text', brand: 'text', generalPurpose: 'text' });
medicineSchema.index({ medicineCategory: 1, priceInINR: 1 });

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;


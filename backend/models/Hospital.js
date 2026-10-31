const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      required: [true, 'Hospital ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      minlength: [2, 'Hospital name must be at least 2 characters long'],
      maxlength: [150, 'Hospital name cannot exceed 150 characters']
    },
    email: {
      type: String,
      required: [true, 'Hospital administrative email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid hospital email!`
      }
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true, default: 'Coimbatore' },
      state: { type: String, trim: true, default: 'Tamil Nadu' },
      pincode: { type: String, trim: true },
      fullAddress: { type: String, trim: true, required: [true, 'Hospital address is required'] }
    },
    departments: {
      type: [String],
      required: [true, 'At least one medical department is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A hospital must offer at least one medical department.'
      }
    },
    contactNumber: {
      type: String,
      required: [true, 'Hospital contact number is required'],
      trim: true
    },
    // Institutional metadata
    legalName: { type: String, trim: true },
    registrationNo: { type: String, trim: true, default: 'CBE-HOSP-1990-08' },
    emergency24x7: { type: Boolean, default: true },
    emergencyPhone: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Backward compatibility virtuals
hospitalSchema.virtual('name').get(function () {
  return this.hospitalName;
});

hospitalSchema.virtual('location').get(function () {
  return this.address?.fullAddress || this.address;
});

hospitalSchema.virtual('contact').get(function () {
  return this.contactNumber;
});

// Pre-validate hook for aliases
hospitalSchema.pre('validate', function (next) {
  if (!this.hospitalName && this.name) {
    this.hospitalName = this.name;
  }
  if (!this.contactNumber && this.contact) {
    this.contactNumber = this.contact;
  }
  if (!this.emergencyPhone && this.contactNumber) {
    this.emergencyPhone = this.contactNumber;
  }
  if (typeof this.address === 'string') {
    this.address = {
      fullAddress: this.address,
      city: 'Coimbatore',
      state: 'Tamil Nadu'
    };
  } else if (!this.address && this.location) {
    this.address = {
      fullAddress: this.location,
      city: 'Coimbatore',
      state: 'Tamil Nadu'
    };
  }
  next();
});

// Indexes
hospitalSchema.index({ hospitalName: 'text', 'address.city': 'text' });
hospitalSchema.index({ departments: 1 });

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;

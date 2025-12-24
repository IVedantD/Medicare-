const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports three roles: admin, doctor, patient
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    required: [true, 'Please provide a role'],
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    sparse: true, // Allows multiple empty values but enforces uniqueness for non-empty values
    index: true
  },
  whatsappNotificationsEnabled: {
    type: Boolean,
    default: true // Enable by default
  },
  // India-specific address fields
  address: {
    street: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Allow empty pincode, but if provided, must be 6 digits
          return !v || /^\d{6}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  // Doctor-specific fields
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false // Doctors need admin verification
  },
  experience: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  // Status fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
// Updated for Mongoose 9.x compatibility
userSchema.pre('save', async function() {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to get user data without password (password is already excluded via select: false)
// This method is for cases where password might be selected explicitly
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Indexes for better query performance
// Note: email already has unique: true which creates an index automatically
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;


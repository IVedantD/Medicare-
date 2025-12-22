const mongoose = require('mongoose');

/**
 * Appointment Schema
 * Links patients and doctors for appointments
 */
const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value) {
        // Date should not be in the past
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM)$/i, 'Please provide time in format: HH:MM AM/PM']
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  // Prescription/Diagnosis (added after appointment completion)
  prescription: {
    diagnosis: {
      type: String,
      default: '',
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
    },
    medications: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    addedAt: {
      type: Date
    }
  },
  // Cancellation info
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date
  },
  // Status change history
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for patient
appointmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for doctor
appointmentSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ date: 1, time: 1 });

// Pre-save middleware to add status to history
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.doctorId, // Default to doctor, can be updated
      changedAt: new Date()
    });
  }
  next();
});

// Method to update status with history
appointmentSchema.methods.updateStatus = function(newStatus, changedBy, reason) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy,
    changedAt: new Date(),
    reason: reason
  });

  if (newStatus === 'cancelled') {
    this.cancelledBy = changedBy;
    this.cancelledAt = new Date();
    if (reason) this.cancellationReason = reason;
  }

  return this.save();
};

// Method to add prescription
appointmentSchema.methods.addPrescription = function(diagnosis, medications, notes) {
  this.prescription = {
    diagnosis: diagnosis,
    medications: medications || [],
    notes: notes || '',
    addedAt: new Date()
  };
  this.status = 'completed';
  return this.save();
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;


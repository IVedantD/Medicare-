const mongoose = require('mongoose');

/**
 * Medical Record Schema
 * Stores patient medical history and records
 */
const medicalRecordSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  prescription: [{
    medication: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      default: ''
    },
    frequency: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: ''
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },
  // Additional medical information
  symptoms: [{
    type: String,
    trim: true
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  labResults: [{
    testName: String,
    result: String,
    unit: String,
    normalRange: String,
    date: Date
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Record type/category
  recordType: {
    type: String,
    enum: ['consultation', 'checkup', 'follow-up', 'emergency', 'surgery', 'lab', 'other'],
    default: 'consultation'
  },
  // Privacy and access
  isPrivate: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for patient
medicalRecordSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for doctor
medicalRecordSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for appointment
medicalRecordSchema.virtual('appointment', {
  ref: 'Appointment',
  localField: 'appointmentId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
medicalRecordSchema.index({ appointmentId: 1 });
medicalRecordSchema.index({ recordType: 1 });

// Method to format prescription as array of strings (for frontend compatibility)
medicalRecordSchema.methods.getPrescriptionArray = function() {
  if (!this.prescription || this.prescription.length === 0) {
    return [];
  }
  
  return this.prescription.map(p => {
    let med = p.medication;
    if (p.dosage) med += ` - ${p.dosage}`;
    if (p.frequency) med += ` (${p.frequency})`;
    if (p.duration) med += ` for ${p.duration}`;
    return med;
  });
};

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;


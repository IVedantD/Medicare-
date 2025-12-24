const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schedule: {
    type: Map,
    of: [String], // Array of time slots for each day
    default: () => new Map()
  }
}, {
  timestamps: true
});

// Ensure schedule is always a Map
availabilitySchema.pre('save', function() {
  if (!this.schedule || !(this.schedule instanceof Map)) {
    this.schedule = new Map();
  }
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;


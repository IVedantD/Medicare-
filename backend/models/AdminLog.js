const mongoose = require('mongoose');

/**
 * AdminLog Schema
 * Tracks admin moderation actions
 */
const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  targetType: {
    type: String,
    enum: ['doctor', 'patient', 'appointment', 'user'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

adminLogSchema.index({ adminId: 1, createdAt: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;



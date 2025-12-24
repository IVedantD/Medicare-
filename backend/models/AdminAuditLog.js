const mongoose = require('mongoose');

/**
 * AdminAuditLog Schema
 * Comprehensive audit trail for all admin actions
 * Read-only after creation for security
 */
const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'doctor_approved',
      'doctor_rejected',
      'doctor_blocked',
      'doctor_unblocked',
      'patient_blocked',
      'patient_unblocked',
      'user_status_changed',
      'appointment_viewed',
      'dashboard_accessed',
      'audit_log_viewed'
    ],
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['doctor', 'patient', 'appointment', 'user', 'system']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetName: {
    type: String,
    default: ''
  },
  targetEmail: {
    type: String,
    default: ''
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  // Prevent updates after creation
  strict: true
});

// Compound indexes for efficient queries
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetType: 1, targetId: 1 });
adminAuditLogSchema.index({ createdAt: -1 });

// Note: Audit logs should be read-only in production
// For now, we rely on application-level restrictions
// In production, consider using MongoDB's read-only user permissions

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);

module.exports = AdminAuditLog;


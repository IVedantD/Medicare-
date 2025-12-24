const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Admin Audit Service
 * Handles all audit logging operations
 */
class AdminAuditService {
  /**
   * Log an admin action
   */
  static async logAction({
    adminId,
    adminName,
    adminEmail,
    action,
    targetType,
    targetId,
    targetName = '',
    targetEmail = '',
    previousState = null,
    newState = null,
    ipAddress = '',
    userAgent = '',
    notes = ''
  }) {
    try {
      await AdminAuditLog.create({
        adminId,
        adminName: adminName || 'Unknown',
        adminEmail: adminEmail || 'unknown@medicare.com',
        action,
        targetType,
        targetId,
        targetName,
        targetEmail,
        previousState,
        newState,
        ipAddress,
        userAgent,
        notes
      });
    } catch (error) {
      // Don't throw - audit logging should never break the main flow
      console.error('[AUDIT] Failed to log action:', error.message);
    }
  }

  /**
   * Get audit logs with pagination and filters
   */
  static async getAuditLogs({
    page = 1,
    limit = 20,
    adminId = null,
    action = null,
    targetType = null,
    startDate = null,
    endDate = null
  }) {
    try {
      const query = {};

      if (adminId) {
        query.adminId = adminId;
      }

      if (action) {
        query.action = action;
      }

      if (targetType) {
        query.targetType = targetType;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AdminAuditLog.find(query)
          .populate('adminId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AdminAuditLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('[AUDIT] Failed to get audit logs:', error.message);
      throw error;
    }
  }
}

module.exports = AdminAuditService;


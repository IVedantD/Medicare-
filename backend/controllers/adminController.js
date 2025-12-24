const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelpers');
const AdminAuditService = require('../services/adminAuditService');

/**
 * Get Dashboard Statistics (Optimized with Aggregation)
 * GET /api/admin/stats
 * Requires authentication (admin role)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Use aggregation pipeline for better performance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalPatients,
      totalDoctors,
      totalUnverifiedDoctors,
      appointmentsToday,
      pendingAppointments,
      completedAppointments,
      pendingDoctorApprovals,
      statsByStatus
    ] = await Promise.all([
      // Total active patients
      User.countDocuments({ role: 'patient', isActive: true }),
      
      // Total verified active doctors
      User.countDocuments({ role: 'doctor', isActive: true, verified: true }),
      
      // Pending doctor approvals
      User.countDocuments({ role: 'doctor', isActive: true, verified: false }),
      
      // Today's appointments
      Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['pending', 'approved'] }
      }),
      
      // Pending appointments
      Appointment.countDocuments({ status: 'pending' }),
      
      // Completed appointments
      Appointment.countDocuments({ status: 'completed' }),
      
      // Pending doctor approvals count
      User.countDocuments({
        role: 'doctor',
        isActive: true,
        verified: false
      }),
      
      // Appointment stats by status (using aggregation)
      Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format stats by status
    const statusStats = {};
    statsByStatus.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    return successResponse(res, {
      totalPatients,
      totalDoctors,
      totalUnverifiedDoctors,
      appointmentsToday,
      totalAppointments: pendingAppointments + completedAppointments + (statusStats.approved || 0) + (statusStats.cancelled || 0),
      pendingAppointments,
      completedAppointments,
      pendingDoctorApprovals,
      statusStats,
      revenue: '0.00' // Placeholder
    }, 'Dashboard statistics fetched successfully');
  } catch (error) {
    console.error('[ADMIN] Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
  }
};

/**
 * Get All Users with pagination
 * GET /api/admin/users
 * Requires authentication (admin role)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    // Filter by role
    if (role && ['admin', 'doctor', 'patient'].includes(role)) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    const formatted = users.map(user => ({
      id: user._id,
      name: user.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || '',
      specialization: user.specialization || '',
      department: user.department || '',
      verified: user.verified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    return paginatedResponse(res, formatted, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNext: parseInt(page) * parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    }, 'Users fetched successfully');
  } catch (error) {
    console.error('[ADMIN] Get all users error:', error);
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

/**
 * Get Audit Logs
 * GET /api/admin/audit-logs
 * Requires authentication (admin role)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, adminId, action, targetType, startDate, endDate } = req.query;

    const result = await AdminAuditService.getAuditLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      adminId,
      action,
      targetType,
      startDate,
      endDate
    });

    return paginatedResponse(res, result.logs, result.pagination, 'Audit logs fetched successfully');
  } catch (error) {
    console.error('[ADMIN] Get audit logs error:', error);
    return errorResponse(res, 'Failed to fetch audit logs', 500);
  }
};

/**
 * Update User Status (Soft action)
 * PUT /api/admin/users/:id/status
 * Requires authentication (admin role)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return errorResponse(res, 'Status must be either "active" or "suspended"', 400);
    }

    // Prevent admin from suspending themselves
    const adminId = req.user.id || req.user._id;
    if (req.params.id.toString() === adminId.toString() && status === 'suspended') {
      return errorResponse(res, 'You cannot suspend your own account', 403);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: status === 'active' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminId,
      adminName: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      adminEmail: req.user.email,
      action: 'user_status_changed',
      targetType: 'user',
      targetId: user._id,
      targetName: user.name || user.email,
      targetEmail: user.email,
      previousState: { isActive: !user.isActive },
      newState: { isActive: user.isActive },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `User status changed to ${status}`
    });

    return successResponse(res, {
      id: user._id,
      name: user.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }, `User ${status === 'active' ? 'activated' : 'suspended'} successfully`);
  } catch (error) {
    console.error('[ADMIN] Update user status error:', error);
    return errorResponse(res, 'Failed to update user status', 500);
  }
};

/**
 * Delete User (Soft delete)
 * DELETE /api/admin/users/:id
 * Requires authentication (admin role)
 */
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    const adminId = req.user.id || req.user._id;
    if (req.params.id.toString() === adminId.toString()) {
      return errorResponse(res, 'You cannot delete your own account', 403);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Soft delete: Set isActive to false instead of actually deleting
    const previousState = { isActive: user.isActive };
    user.isActive = false;
    await user.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminId,
      adminName: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      adminEmail: req.user.email,
      action: 'user_status_changed',
      targetType: 'user',
      targetId: user._id,
      targetName: user.name || user.email,
      targetEmail: user.email,
      previousState,
      newState: { isActive: false },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: 'User soft deleted (deactivated)'
    });

    return successResponse(res, null, 'User deleted successfully (soft delete)');
  } catch (error) {
    console.error('[ADMIN] Delete user error:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

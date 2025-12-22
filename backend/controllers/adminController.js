const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * Get Dashboard Statistics
 * GET /api/admin/stats
 * Requires authentication (admin role)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true, verified: true });

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const appointmentsToday = await Appointment.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['pending', 'approved'] }
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending'
    });

    // Get completed appointments
    const completedAppointments = await Appointment.countDocuments({
      status: 'completed'
    });

    res.json({
      totalPatients,
      totalDoctors,
      appointmentsToday,
      pendingAppointments,
      completedAppointments,
      revenue: '0.00' // Placeholder - can be calculated from appointments later
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * Get All Users
 * GET /api/admin/users
 * Requires authentication (admin role)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

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

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    const formatted = users.map(user => ({
      id: user._id,
      name: user.name,
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

    res.json(formatted);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Update User Status
 * PUT /api/admin/users/:id/status
 * Requires authentication (admin role)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "active" or "suspended"'
      });
    }

    // Prevent admin from suspending themselves
    if (req.params.id === req.user.id && status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: status === 'active' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

/**
 * Delete User
 * DELETE /api/admin/users/:id
 * Requires authentication (admin role)
 */
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete: Set isActive to false instead of actually deleting
    // This preserves data integrity for appointments and records
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};


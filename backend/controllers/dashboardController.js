const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * Patient Dashboard Controller
 */

/**
 * Get Patient Dashboard Data
 * GET /api/patient/dashboard
 * Requires authentication (patient role)
 */
exports.getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get patient profile
    const patient = await User.findById(patientId).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get upcoming appointments (limit 5)
    const upcomingAppointments = await Appointment.find({
      patientId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: new Date().setHours(0, 0, 0, 0) }
    })
      .populate('doctor', 'name specialization department avatar')
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Get appointment statistics
    const totalUpcoming = await Appointment.countDocuments({
      patientId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    const totalCompleted = await Appointment.countDocuments({
      patientId,
      status: 'completed'
    });

    // Get next appointment
    const nextAppointment = await Appointment.findOne({
      patientId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: new Date().setHours(0, 0, 0, 0) }
    })
      .populate('doctor', 'name')
      .sort({ date: 1, time: 1 });

    // Get medical records count
    const totalRecords = await Appointment.countDocuments({
      patientId,
      status: 'completed',
      'prescription.diagnosis': { $exists: true, $ne: '' }
    });

    // Format appointments
    const formattedAppointments = upcomingAppointments.map(apt => ({
      id: apt._id,
      doctorId: apt.doctorId,
      doctorName: apt.doctor?.name || 'Doctor',
      doctorSpecialization: apt.doctor?.specialization || '',
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      createdAt: apt.createdAt
    }));

    res.json({
      success: true,
      profile: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        avatar: patient.avatar
      },
      upcomingAppointments: formattedAppointments,
      stats: {
        totalUpcoming,
        totalCompleted,
        totalRecords,
        nextAppointment: nextAppointment ? {
          id: nextAppointment._id,
          doctorName: nextAppointment.doctor?.name || 'Doctor',
          date: nextAppointment.date,
          time: nextAppointment.time
        } : null
      }
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient dashboard data'
    });
  }
};

/**
 * Doctor Dashboard Controller
 */

/**
 * Get Doctor Dashboard Data
 * GET /api/doctor/dashboard
 * Requires authentication (doctor role)
 */
exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get doctor profile
    const doctor = await User.findById(doctorId).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('patient', 'name email phone avatar')
      .sort({ time: 1 });

    // Get appointment statistics
    const todayCount = todayAppointments.length;
    const pendingCount = todayAppointments.filter(apt => apt.status === 'pending').length;
    const approvedCount = todayAppointments.filter(apt => apt.status === 'approved').length;
    const completedCount = todayAppointments.filter(apt => apt.status === 'completed').length;

    // Get total pending requests (all time, not just today)
    const totalPendingRequests = await Appointment.countDocuments({
      doctorId,
      status: 'pending'
    });

    // Get total patients count
    const totalPatients = await Appointment.distinct('patientId', {
      doctorId,
      status: { $in: ['approved', 'completed'] }
    });

    // Format today's appointments
    const formattedAppointments = todayAppointments.map(apt => ({
      id: apt._id,
      patientId: apt.patientId,
      patientName: apt.patient?.name || 'Patient',
      patientEmail: apt.patient?.email || '',
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      createdAt: apt.createdAt
    }));

    res.json({
      success: true,
      profile: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        department: doctor.department,
        verified: doctor.verified,
        avatar: doctor.avatar
      },
      todayAppointments: formattedAppointments,
      stats: {
        todayCount,
        pendingCount,
        approvedCount,
        completedCount,
        totalPendingRequests,
        totalPatients: totalPatients.length
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor dashboard data'
    });
  }
};

/**
 * Admin Dashboard Controller
 * (Already exists in adminController, but we'll enhance it)
 */

/**
 * Get Admin Dashboard Data with Pending Doctor Approvals
 * GET /api/admin/dashboard
 * Requires authentication (admin role)
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true, verified: true });
    const totalUnverifiedDoctors = await User.countDocuments({ role: 'doctor', isActive: true, verified: false });

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

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({});

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending'
    });

    // Get pending doctor approvals
    const pendingDoctorApprovals = await User.find({
      role: 'doctor',
      isActive: true,
      verified: false
    })
      .select('name email specialization department createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format pending doctors
    const formattedPendingDoctors = pendingDoctorApprovals.map(doctor => ({
      id: doctor._id,
      name: doctor.name || doctor.email?.split('@')[0] || 'Doctor',
      email: doctor.email,
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      createdAt: doctor.createdAt
    }));

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalUnverifiedDoctors,
        appointmentsToday,
        totalAppointments,
        pendingAppointments
      },
      pendingDoctorApprovals: formattedPendingDoctors
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data'
    });
  }
};


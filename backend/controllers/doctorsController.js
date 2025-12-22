const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * Get All Doctors
 * GET /api/doctors
 * Public access (patients can view doctors)
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;

    // Build query
    const query = { 
      role: 'doctor',
      isActive: true,
      verified: true // Only show verified doctors
    };

    // Filter by specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Search by name or specialization
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('-password -email')
      .sort({ name: 1 });

    // Format doctors for frontend
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      rating: 4.5, // Default rating (can be calculated from reviews later)
      experience: doctor.experience || '',
      bio: doctor.bio || '',
      available: true, // Can be calculated based on appointments
      verified: doctor.verified,
      avatar: doctor.avatar || '',
      phone: doctor.phone || ''
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
};

/**
 * Get Doctor By ID
 * GET /api/doctors/:id
 * Public access
 */
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get appointment count for availability calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: { $gte: today },
      status: { $in: ['pending', 'approved'] }
    });

    res.json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      rating: 4.5,
      experience: doctor.experience || '',
      bio: doctor.bio || '',
      available: appointmentCount < 10, // Available if less than 10 upcoming appointments
      verified: doctor.verified,
      avatar: doctor.avatar || '',
      phone: doctor.phone || ''
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor'
    });
  }
};

/**
 * Get Doctor Availability
 * GET /api/doctors/:id/availability
 * Public access
 */
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get booked appointments for the date
    const appointmentDate = new Date(date);
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'approved'] }
    }).select('time');

    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        if (!bookedTimes.includes(timeString)) {
          allSlots.push(timeString);
        }
      }
    }

    res.json({
      slots: allSlots
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
};

/**
 * Update Doctor Availability (for doctors)
 * PUT /api/doctors/availability
 * Requires authentication (doctor role)
 */
exports.updateAvailability = async (req, res) => {
  try {
    // This is a placeholder - in a real system, you'd store availability slots
    // For now, we'll just return success
    // Future: Create an Availability model to store doctor schedules

    res.json({
      success: true,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
};

/**
 * Get Pending Doctor Approvals (for admin)
 * GET /api/doctors/pending
 * Requires authentication (admin role)
 */
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      verified: false,
      isActive: true
    }).select('-password').sort({ createdAt: -1 });

    const formatted = pendingDoctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      phone: doctor.phone || '',
      experience: doctor.experience || '',
      bio: doctor.bio || '',
      createdAt: doctor.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
    });
  }
};

/**
 * Approve Doctor (for admin)
 * PUT /api/doctors/:id/approve
 * Requires authentication (admin role)
 */
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        verified: doctor.verified
      }
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor'
    });
  }
};

/**
 * Reject Doctor (for admin)
 * PUT /api/doctors/:id/reject
 * Requires authentication (admin role)
 */
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor rejected successfully'
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor'
    });
  }
};


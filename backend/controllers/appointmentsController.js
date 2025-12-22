const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Create Appointment
 * POST /api/appointments
 * Requires authentication (patient role)
 */
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Validation
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, time, and reason'
      });
    }

    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments'
      });
    }

    // Check if doctor exists and is verified
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      verified: true,
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Check if date is in the future
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past'
      });
    }

    // Check if time slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date: appointmentDate,
      time,
      reason: reason.trim()
    });

    // Populate patient and doctor names
    await appointment.populate('patient', 'name');
    await appointment.populate('doctor', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        patientId: appointment.patientId,
        patientName: appointment.patient?.name,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor?.name,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
};

/**
 * Get My Appointments (for patients)
 * GET /api/appointments/my
 * Requires authentication
 */
exports.getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { patientId: req.user.id };

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization department avatar')
      .sort({ date: -1, time: -1 });

    const formatted = appointments.map(apt => ({
      id: apt._id,
      patientId: apt.patientId,
      patientName: req.user.name,
      doctorId: apt.doctorId,
      doctorName: apt.doctor?.name,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      prescription: apt.prescription || null,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

/**
 * Get Doctor Appointments (for doctors)
 * GET /api/appointments/doctor
 * Requires authentication (doctor role)
 */
exports.getDoctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this route'
      });
    }

    const { status, date } = req.query;
    const query = { doctorId: req.user.id };

    if (status) {
      query.status = status;
    }

    if (date) {
      const appointmentDate = new Date(date);
      query.date = {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .sort({ date: 1, time: 1 });

    const formatted = appointments.map(apt => ({
      id: apt._id,
      patientId: apt.patientId,
      patientName: apt.patient?.name,
      doctorId: apt.doctorId,
      doctorName: req.user.name,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      prescription: apt.prescription || null,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

/**
 * Get Appointment By ID
 * GET /api/appointments/:id
 * Requires authentication
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name specialization department avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access (patient, doctor, or admin)
    const hasAccess = 
      appointment.patientId.toString() === req.user.id ||
      appointment.doctorId.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this appointment'
      });
    }

    res.json({
      id: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patient?.name,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor?.name,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      prescription: appointment.prescription || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
};

/**
 * Update Appointment Status
 * PUT /api/appointments/:id/status
 * Requires authentication (doctor or admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const canUpdate = 
      (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this appointment'
      });
    }

    // Update status with history
    await appointment.updateStatus(status, req.user.id, req.body.reason || '');

    await appointment.populate('patient', 'name');
    await appointment.populate('doctor', 'name');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment: {
        id: appointment._id,
        patientId: appointment.patientId,
        patientName: appointment.patient?.name,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor?.name,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        prescription: appointment.prescription || null
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status'
    });
  }
};

/**
 * Cancel Appointment
 * PUT /api/appointments/:id/cancel
 * Requires authentication (patient or doctor)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const canCancel = 
      (req.user.role === 'patient' && appointment.patientId.toString() === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    // Cancel appointment
    await appointment.updateStatus('cancelled', req.user.id, req.body.reason || 'Cancelled by user');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
};

/**
 * Add Prescription to Appointment
 * PUT /api/appointments/:id/prescription
 * Requires authentication (doctor role)
 */
exports.addPrescription = async (req, res) => {
  try {
    const { diagnosis, medications, notes } = req.body;

    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Diagnosis is required'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add prescription to this appointment'
      });
    }

    // Add prescription and mark as completed
    await appointment.addPrescription(
      diagnosis,
      Array.isArray(medications) ? medications : [],
      notes || ''
    );

    await appointment.populate('patient', 'name');
    await appointment.populate('doctor', 'name');

    res.json({
      success: true,
      message: 'Prescription added successfully',
      appointment: {
        id: appointment._id,
        patientId: appointment.patientId,
        patientName: appointment.patient?.name,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor?.name,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        prescription: appointment.prescription
      }
    });
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add prescription'
    });
  }
};


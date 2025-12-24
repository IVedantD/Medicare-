const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendNotification } = require('../services/whatsapp.service');

/**
 * Create Appointment
 * POST /api/appointments
 * Requires authentication (patient role)
 */
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    console.log(`[CREATE APPOINTMENT] Request from user: ${req.user.id} (${req.user.role})`);
    console.log(`[CREATE APPOINTMENT] Data:`, { doctorId, date, time, reason: reason?.substring(0, 50) });

    // Validation
    if (!doctorId || !date || !time || !reason) {
      console.error('[CREATE APPOINTMENT] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, time, and reason'
      });
    }

    // Check if user is a patient
    if (req.user.role !== 'patient') {
      console.error(`[CREATE APPOINTMENT] Unauthorized role: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments'
      });
    }

    // Check if doctor exists and is active
    // Note: In development, we allow booking with unverified doctors
    // In production, you may want to add: verified: true
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      console.error(`[CREATE APPOINTMENT] Doctor not found: ${doctorId}`);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    console.log(`[CREATE APPOINTMENT] Doctor found: ${doctor.name} (ID: ${doctor._id})`);

    // Check if date is in the future
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      console.error(`[CREATE APPOINTMENT] Invalid date: ${date} (in the past)`);
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
      console.error(`[CREATE APPOINTMENT] Time slot already booked: ${date} at ${time}`);
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      department: doctor.department || '',
      specialty: doctor.specialization || '',
      date: appointmentDate,
      time,
      reason: reason.trim()
    });

    // Populate patient and doctor names
    await appointment.populate('patient', 'name phone whatsappNotificationsEnabled');
    await appointment.populate('doctor', 'name');

    // Send WhatsApp notification to patient (non-blocking)
    if (appointment.patient?.phone && appointment.patient?.whatsappNotificationsEnabled) {
      sendNotification(
        'appointmentBooked',
        appointment.patient.phone,
        [
          appointment.patient.name,
          appointment.doctor?.name || 'Doctor',
          appointment.date,
          appointment.time,
          process.env.CLINIC_NAME || 'MediCare Clinic'
        ],
        { disabled: !appointment.patient.whatsappNotificationsEnabled }
      ).catch(err => {
        console.error('[APPOINTMENT] WhatsApp notification error (non-blocking):', err.message);
      });
    }

    console.log(`[CREATE APPOINTMENT] Success! Appointment ID: ${appointment._id}`);
    
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
    console.error('[CREATE APPOINTMENT] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create appointment'
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

    await appointment.populate('patient', 'name phone whatsappNotificationsEnabled');
    await appointment.populate('doctor', 'name');

    // Send WhatsApp notification for status updates (approved/rejected) - non-blocking
    if ((status === 'approved' || status === 'rejected') && 
        appointment.patient?.phone && 
        appointment.patient?.whatsappNotificationsEnabled) {
      sendNotification(
        'appointmentStatusUpdate',
        appointment.patient.phone,
        [
          appointment.patient.name,
          appointment.doctor?.name || 'Doctor',
          appointment.date,
          appointment.time,
          status
        ],
        { disabled: !appointment.patient.whatsappNotificationsEnabled }
      ).catch(err => {
        console.error('[APPOINTMENT] WhatsApp notification error (non-blocking):', err.message);
      });
    }

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

    // Populate patient and doctor for notification
    await appointment.populate('patient', 'name phone whatsappNotificationsEnabled');
    await appointment.populate('doctor', 'name');

    // Send WhatsApp cancellation notification (non-blocking)
    if (appointment.patient?.phone && appointment.patient?.whatsappNotificationsEnabled) {
      sendNotification(
        'appointmentCancelled',
        appointment.patient.phone,
        [
          appointment.patient.name,
          appointment.doctor?.name || 'Doctor',
          appointment.date,
          appointment.time,
          appointment.cancellationReason || ''
        ],
        { disabled: !appointment.patient.whatsappNotificationsEnabled }
      ).catch(err => {
        console.error('[APPOINTMENT] WhatsApp notification error (non-blocking):', err.message);
      });
    }

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
 * Reschedule Appointment
 * PUT /api/appointments/:id/reschedule
 * Requires authentication (patient or doctor)
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new date and time'
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
    const canReschedule = 
      (req.user.role === 'patient' && appointment.patientId.toString() === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!canReschedule) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reschedule this appointment'
      });
    }

    // Cannot reschedule completed or cancelled appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule a completed appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule a cancelled appointment'
      });
    }

    // Validate new date is in the future
    const newAppointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    newAppointmentDate.setHours(0, 0, 0, 0);

    if (newAppointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date cannot be in the past'
      });
    }

    // Check if new time slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newAppointmentDate,
      time,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: appointment._id } // Exclude current appointment
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Store old date and time for notification
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    // Update appointment
    appointment.date = newAppointmentDate;
    appointment.time = time;
    await appointment.save();

    // Populate patient and doctor for notification
    await appointment.populate('patient', 'name phone whatsappNotificationsEnabled');
    await appointment.populate('doctor', 'name');

    // Send WhatsApp reschedule notification (non-blocking)
    if (appointment.patient?.phone && appointment.patient?.whatsappNotificationsEnabled) {
      sendNotification(
        'appointmentRescheduled',
        appointment.patient.phone,
        [
          appointment.patient.name,
          appointment.doctor?.name || 'Doctor',
          oldDate,
          oldTime,
          appointment.date,
          appointment.time
        ],
        { disabled: !appointment.patient.whatsappNotificationsEnabled }
      ).catch(err => {
        console.error('[APPOINTMENT] WhatsApp notification error (non-blocking):', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: appointment._id,
        patientId: appointment.patientId,
        patientName: appointment.patient?.name,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor?.name,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment'
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

/**
 * Get All Appointments (Admin)
 * GET /api/appointments/admin/all
 * Requires authentication (admin role)
 */
exports.getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this route'
      });
    }

    const { status, doctorId, patientId, date, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter by status
    if (status && ['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Filter by doctor
    if (doctorId) {
      query.doctorId = doctorId;
    }

    // Filter by patient
    if (patientId) {
      query.patientId = patientId;
    }

    // Filter by specific date
    if (date) {
      const appointmentDate = new Date(date);
      query.date = {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      };
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = {
        $gte: start,
        $lte: end
      };
    }

    // Search filter (will be applied after population)
    const searchQuery = search;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization department')
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Appointment.countDocuments(query)
    ]);

    let formatted = appointments.map(apt => ({
      id: apt._id,
      patientId: apt.patientId,
      patientName: apt.patient?.name || 'Unknown',
      patientEmail: apt.patient?.email || '',
      doctorId: apt.doctorId,
      doctorName: apt.doctor?.name || 'Unknown',
      doctorSpecialization: apt.doctor?.specialization || '',
      department: apt.department || apt.doctor?.department || '',
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      prescription: apt.prescription || null,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    }));

    // Apply search filter if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      formatted = formatted.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchLower) ||
        apt.doctorName?.toLowerCase().includes(searchLower) ||
        apt.patientEmail?.toLowerCase().includes(searchLower) ||
        apt.reason?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};


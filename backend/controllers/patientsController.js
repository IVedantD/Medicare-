const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * Get All Patients
 * GET /api/patients
 * Requires authentication (doctor or admin)
 */
exports.getAllPatients = async (req, res) => {
  try {
    // Only doctors and admins can view patients
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view patients'
      });
    }

    const { search } = req.query;
    const query = { 
      role: 'patient',
      isActive: true
    };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    const formatted = patients.map(patient => ({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      avatar: patient.avatar || '',
      role: patient.role,
      createdAt: patient.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
};

/**
 * Get Patient By ID
 * GET /api/patients/:id
 * Requires authentication (doctor or admin)
 */
exports.getPatientById = async (req, res) => {
  try {
    // Only doctors and admins can view patient details
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view patient details'
      });
    }

    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      isActive: true
    }).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get appointment count
    const appointmentCount = await Appointment.countDocuments({
      patientId: patient._id
    });

    res.json({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      avatar: patient.avatar || '',
      role: patient.role,
      appointmentCount,
      createdAt: patient.createdAt
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient'
    });
  }
};

/**
 * Get Patient Medical History
 * GET /api/patients/:id/history
 * Requires authentication (doctor or admin)
 */
exports.getPatientHistory = async (req, res) => {
  try {
    // Only doctors and admins can view patient history
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view patient history'
      });
    }

    // Check if patient exists
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical records
    const records = await MedicalRecord.find({ patientId: req.params.id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    const formatted = records.map(record => ({
      id: record._id,
      patientId: record.patientId,
      appointmentId: record.appointmentId || '',
      diagnosis: record.diagnosis,
      prescription: record.getPrescriptionArray(), // Use the model method
      notes: record.notes || '',
      createdAt: record.createdAt,
      doctorName: record.doctor?.name || ''
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient history'
    });
  }
};


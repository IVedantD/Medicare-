const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Get My Medical Records (for patients)
 * GET /api/medical-records/my
 * Requires authentication (patient role)
 */
exports.getMyRecords = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can view their own medical records'
      });
    }

    const records = await MedicalRecord.find({ patientId: req.user.id })
      .populate('doctor', 'name specialization department')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    const formatted = records.map(record => ({
      id: record._id,
      patientId: record.patientId,
      appointmentId: record.appointmentId || '',
      diagnosis: record.diagnosis,
      prescription: record.getPrescriptionArray(),
      notes: record.notes || '',
      createdAt: record.createdAt,
      doctorName: record.doctor?.name || ''
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get my records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records'
    });
  }
};

/**
 * Get Patient Medical Records (for doctors)
 * GET /api/medical-records/patient/:patientId
 * Requires authentication (doctor or admin role)
 */
exports.getPatientRecords = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and admins can view patient records'
      });
    }

    const { patientId } = req.params;

    // Check if patient exists
    const patient = await User.findOne({
      _id: patientId,
      role: 'patient',
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('doctor', 'name specialization department')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    const formatted = records.map(record => ({
      id: record._id,
      patientId: record.patientId,
      appointmentId: record.appointmentId || '',
      diagnosis: record.diagnosis,
      prescription: record.getPrescriptionArray(),
      notes: record.notes || '',
      createdAt: record.createdAt,
      doctorName: record.doctor?.name || ''
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get patient records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records'
    });
  }
};

/**
 * Create Medical Record
 * POST /api/medical-records
 * Requires authentication (doctor or admin role)
 */
exports.createMedicalRecord = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and admins can create medical records'
      });
    }

    const { patientId, appointmentId, diagnosis, prescription, notes } = req.body;

    // Validation
    if (!patientId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and diagnosis are required'
      });
    }

    // Check if patient exists
    const patient = await User.findOne({
      _id: patientId,
      role: 'patient',
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // If appointmentId is provided, verify it exists and belongs to the patient
    if (appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
        doctorId: req.user.id
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found or does not belong to this patient'
        });
      }
    }

    // Parse prescription array (can be array of strings or array of objects)
    let prescriptionArray = [];
    if (prescription && Array.isArray(prescription)) {
      prescriptionArray = prescription.map(med => {
        if (typeof med === 'string') {
          // Simple string format: "Medication Name - Dosage (Frequency) for Duration"
          return {
            medication: med,
            dosage: '',
            frequency: '',
            duration: ''
          };
        } else {
          // Object format
          return {
            medication: med.medication || med,
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || ''
          };
        }
      });
    }

    // Create medical record
    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user.id,
      appointmentId: appointmentId || null,
      diagnosis: diagnosis.trim(),
      prescription: prescriptionArray,
      notes: notes || ''
    });

    await record.populate('doctor', 'name specialization');
    await record.populate('appointment', 'date time');

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record: {
        id: record._id,
        patientId: record.patientId,
        appointmentId: record.appointmentId || '',
        diagnosis: record.diagnosis,
        prescription: record.getPrescriptionArray(),
        notes: record.notes || '',
        createdAt: record.createdAt,
        doctorName: record.doctor?.name || ''
      }
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record'
    });
  }
};


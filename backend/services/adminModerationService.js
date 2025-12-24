const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const AdminAuditService = require('./adminAuditService');

/**
 * Admin Moderation Service
 * Handles all admin moderation business logic
 */
class AdminModerationService {
  /**
   * Validate ObjectId
   */
  static validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    return true;
  }

  /**
   * Check if admin is trying to modify themselves
   */
  static preventSelfModification(adminId, targetId) {
    if (adminId.toString() === targetId.toString()) {
      throw new Error('You cannot modify your own account');
    }
  }

  /**
   * Check if doctor has active appointments
   */
  static async hasActiveAppointments(doctorId) {
    const activeAppointments = await Appointment.countDocuments({
      doctorId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: new Date() }
    });
    return activeAppointments > 0;
  }

  /**
   * Get doctor with validation
   */
  static async getDoctorById(doctorId) {
    this.validateObjectId(doctorId);
    
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor'
    }).select('-password');

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return doctor;
  }

  /**
   * Get patient with validation
   */
  static async getPatientById(patientId) {
    this.validateObjectId(patientId);
    
    const patient = await User.findOne({
      _id: patientId,
      role: 'patient'
    }).select('-password');

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patient;
  }

  /**
   * Approve doctor
   */
  static async approveDoctor(doctorId, adminInfo, req) {
    const doctor = await this.getDoctorById(doctorId);

    if (doctor.verified) {
      throw new Error('Doctor is already approved');
    }

    const previousState = {
      verified: doctor.verified,
      isActive: doctor.isActive
    };

    doctor.verified = true;
    doctor.isActive = true;
    await doctor.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'doctor_approved',
      targetType: 'doctor',
      targetId: doctor._id,
      targetName: doctor.name || doctor.email,
      targetEmail: doctor.email,
      previousState,
      newState: { verified: true, isActive: true },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Doctor ${doctor.name || doctor.email} approved by admin`
    });

    return {
      id: doctor._id,
      name: doctor.name || doctor.email?.split('@')[0] || 'Doctor',
      email: doctor.email,
      verified: doctor.verified,
      isActive: doctor.isActive
    };
  }

  /**
   * Reject doctor
   */
  static async rejectDoctor(doctorId, adminInfo, req) {
    const doctor = await this.getDoctorById(doctorId);

    const previousState = {
      verified: doctor.verified,
      isActive: doctor.isActive
    };

    doctor.verified = false;
    doctor.isActive = false;
    await doctor.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'doctor_rejected',
      targetType: 'doctor',
      targetId: doctor._id,
      targetName: doctor.name || doctor.email,
      targetEmail: doctor.email,
      previousState,
      newState: { verified: false, isActive: false },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Doctor ${doctor.name || doctor.email} rejected by admin`
    });

    return {
      id: doctor._id,
      name: doctor.name || doctor.email?.split('@')[0] || 'Doctor',
      email: doctor.email,
      verified: doctor.verified,
      isActive: doctor.isActive
    };
  }

  /**
   * Block doctor
   */
  static async blockDoctor(doctorId, adminInfo, req) {
    const doctor = await this.getDoctorById(doctorId);

    if (!doctor.isActive) {
      throw new Error('Doctor is already blocked');
    }

    // Check for active appointments
    const hasActive = await this.hasActiveAppointments(doctorId);
    if (hasActive) {
      throw new Error('Cannot block doctor with active appointments. Please cancel or reschedule appointments first.');
    }

    const previousState = {
      isActive: doctor.isActive,
      verified: doctor.verified
    };

    doctor.isActive = false;
    await doctor.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'doctor_blocked',
      targetType: 'doctor',
      targetId: doctor._id,
      targetName: doctor.name || doctor.email,
      targetEmail: doctor.email,
      previousState,
      newState: { isActive: false },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Doctor ${doctor.name || doctor.email} blocked by admin`
    });

    return {
      id: doctor._id,
      name: doctor.name || doctor.email?.split('@')[0] || 'Doctor',
      email: doctor.email,
      verified: doctor.verified,
      isActive: doctor.isActive
    };
  }

  /**
   * Unblock doctor
   */
  static async unblockDoctor(doctorId, adminInfo, req) {
    const doctor = await this.getDoctorById(doctorId);

    if (doctor.isActive) {
      throw new Error('Doctor is already active');
    }

    const previousState = {
      isActive: doctor.isActive
    };

    doctor.isActive = true;
    await doctor.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'doctor_unblocked',
      targetType: 'doctor',
      targetId: doctor._id,
      targetName: doctor.name || doctor.email,
      targetEmail: doctor.email,
      previousState,
      newState: { isActive: true },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Doctor ${doctor.name || doctor.email} unblocked by admin`
    });

    return {
      id: doctor._id,
      name: doctor.name || doctor.email?.split('@')[0] || 'Doctor',
      email: doctor.email,
      verified: doctor.verified,
      isActive: doctor.isActive
    };
  }

  /**
   * Block patient
   */
  static async blockPatient(patientId, adminInfo, req) {
    const patient = await this.getPatientById(patientId);

    if (!patient.isActive) {
      throw new Error('Patient is already blocked');
    }

    const previousState = {
      isActive: patient.isActive
    };

    patient.isActive = false;
    await patient.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'patient_blocked',
      targetType: 'patient',
      targetId: patient._id,
      targetName: patient.name || patient.email,
      targetEmail: patient.email,
      previousState,
      newState: { isActive: false },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Patient ${patient.name || patient.email} blocked by admin`
    });

    return {
      id: patient._id,
      name: patient.name || patient.email?.split('@')[0] || 'Patient',
      email: patient.email,
      isActive: patient.isActive
    };
  }

  /**
   * Unblock patient
   */
  static async unblockPatient(patientId, adminInfo, req) {
    const patient = await this.getPatientById(patientId);

    if (patient.isActive) {
      throw new Error('Patient is already active');
    }

    const previousState = {
      isActive: patient.isActive
    };

    patient.isActive = true;
    await patient.save();

    // Log audit
    await AdminAuditService.logAction({
      adminId: adminInfo.id,
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
      action: 'patient_unblocked',
      targetType: 'patient',
      targetId: patient._id,
      targetName: patient.name || patient.email,
      targetEmail: patient.email,
      previousState,
      newState: { isActive: true },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      notes: `Patient ${patient.name || patient.email} unblocked by admin`
    });

    return {
      id: patient._id,
      name: patient.name || patient.email?.split('@')[0] || 'Patient',
      email: patient.email,
      isActive: patient.isActive
    };
  }

  /**
   * Get doctors with pagination and filters
   */
  static async getDoctors({ status, search, page = 1, limit = 20 }) {
    const query = { role: 'doctor' };

    if (status === 'pending') {
      query.verified = false;
      query.isActive = { $ne: false };
    } else if (status === 'approved') {
      query.verified = true;
      query.isActive = true;
    } else if (status === 'blocked') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const formatted = doctors.map(doc => ({
      id: doc._id,
      name: doc.name || doc.email?.split('@')[0] || 'Doctor',
      email: doc.email,
      phone: doc.phone || '',
      specialization: doc.specialization || '',
      department: doc.department || '',
      verified: doc.verified,
      isActive: doc.isActive,
      createdAt: doc.createdAt
    }));

    return {
      doctors: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get patients with pagination and filters
   */
  static async getPatients({ search, page = 1, limit = 20 }) {
    const query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const formatted = patients.map(p => ({
      id: p._id,
      name: p.name || p.email?.split('@')[0] || 'Patient',
      email: p.email,
      phone: p.phone || '',
      isActive: p.isActive,
      createdAt: p.createdAt
    }));

    return {
      patients: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = AdminModerationService;


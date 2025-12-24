const AdminModerationService = require('../services/adminModerationService');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelpers');

/**
 * Get Doctors with filters and pagination
 * GET /api/admin/doctors
 */
exports.getDoctors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const result = await AdminModerationService.getDoctors({
      status,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return paginatedResponse(res, result.doctors, result.pagination, 'Doctors fetched successfully');
  } catch (error) {
    console.error('[ADMIN] Get doctors error:', error);
    return errorResponse(res, error.message || 'Failed to fetch doctors', 500);
  }
};

/**
 * Approve doctor
 * PUT /api/admin/doctors/:id/approve
 */
exports.approveDoctor = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const doctor = await AdminModerationService.approveDoctor(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { doctor }, 'Doctor approved successfully');
  } catch (error) {
    console.error('[ADMIN] Approve doctor error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Doctor');
    }
    
    if (error.message.includes('already approved')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, error.message || 'Failed to approve doctor', 500);
  }
};

/**
 * Reject doctor
 * PUT /api/admin/doctors/:id/reject
 */
exports.rejectDoctor = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const doctor = await AdminModerationService.rejectDoctor(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { doctor }, 'Doctor rejected successfully');
  } catch (error) {
    console.error('[ADMIN] Reject doctor error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Doctor');
    }

    return errorResponse(res, error.message || 'Failed to reject doctor', 500);
  }
};

/**
 * Block doctor
 * PUT /api/admin/doctors/:id/block
 */
exports.blockDoctor = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const doctor = await AdminModerationService.blockDoctor(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { doctor }, 'Doctor blocked successfully');
  } catch (error) {
    console.error('[ADMIN] Block doctor error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Doctor');
    }
    
    if (error.message.includes('already blocked') || error.message.includes('active appointments')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, error.message || 'Failed to block doctor', 500);
  }
};

/**
 * Unblock doctor
 * PUT /api/admin/doctors/:id/unblock
 */
exports.unblockDoctor = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const doctor = await AdminModerationService.unblockDoctor(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { doctor }, 'Doctor unblocked successfully');
  } catch (error) {
    console.error('[ADMIN] Unblock doctor error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Doctor');
    }
    
    if (error.message.includes('already active')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, error.message || 'Failed to unblock doctor', 500);
  }
};

/**
 * Get Patients with pagination and filters
 * GET /api/admin/patients
 */
exports.getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const result = await AdminModerationService.getPatients({
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return paginatedResponse(res, result.patients, result.pagination, 'Patients fetched successfully');
  } catch (error) {
    console.error('[ADMIN] Get patients error:', error);
    return errorResponse(res, error.message || 'Failed to fetch patients', 500);
  }
};

/**
 * Block patient
 * PUT /api/admin/patients/:id/block
 */
exports.blockPatient = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const patient = await AdminModerationService.blockPatient(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { patient }, 'Patient blocked successfully');
  } catch (error) {
    console.error('[ADMIN] Block patient error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Patient');
    }
    
    if (error.message.includes('already blocked')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, error.message || 'Failed to block patient', 500);
  }
};

/**
 * Unblock patient
 * PUT /api/admin/patients/:id/unblock
 */
exports.unblockPatient = async (req, res) => {
  try {
    const adminInfo = {
      id: req.user.id || req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Admin',
      email: req.user.email
    };

    const patient = await AdminModerationService.unblockPatient(
      req.params.id,
      adminInfo,
      req
    );

    return successResponse(res, { patient }, 'Patient unblocked successfully');
  } catch (error) {
    console.error('[ADMIN] Unblock patient error:', error);
    
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Patient');
    }
    
    if (error.message.includes('already active')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, error.message || 'Failed to unblock patient', 500);
  }
};

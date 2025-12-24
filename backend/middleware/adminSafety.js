const mongoose = require('mongoose');
const { forbiddenResponse, validationErrorResponse } = require('../utils/responseHelpers');

/**
 * Admin Safety Middleware
 * Prevents admins from performing unsafe actions
 */

/**
 * Prevent admin from modifying themselves
 */
const preventSelfModification = (req, res, next) => {
  const adminId = req.user?.id || req.user?._id;
  const targetId = req.params.id;

  if (!adminId || !targetId) {
    return next();
  }

  // Convert to strings for comparison
  const adminIdStr = adminId.toString();
  const targetIdStr = targetId.toString();

  if (adminIdStr === targetIdStr) {
    return forbiddenResponse(res, 'You cannot modify your own account. Please contact another administrator.');
  }

  next();
};

/**
 * Validate ObjectId format
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return validationErrorResponse(res, { id: 'Invalid ID format' });
  }

  next();
};

/**
 * Prevent redundant actions (e.g., approving already approved doctor)
 * This is handled in the service layer, but we can add middleware checks too
 */
const checkActionRedundancy = async (req, res, next) => {
  // This is a placeholder - actual redundancy checks are in the service layer
  // We can add additional middleware-level checks here if needed
  next();
};

/**
 * Rate limiting for admin actions (basic implementation)
 * For production, use express-rate-limit
 */
const adminActionRateLimit = (req, res, next) => {
  // Basic rate limiting - in production, use express-rate-limit package
  // This is a placeholder for the concept
  next();
};

module.exports = {
  preventSelfModification,
  validateObjectId,
  checkActionRedundancy,
  adminActionRateLimit
};


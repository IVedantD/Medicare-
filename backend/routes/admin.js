const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAuditLogs
} = require('../controllers/adminController');
const {
  getDoctors,
  approveDoctor,
  rejectDoctor,
  blockDoctor,
  unblockDoctor,
  getPatients,
  blockPatient,
  unblockPatient
} = require('../controllers/adminModerationController');
const { getAdminDashboard } = require('../controllers/dashboardController');
const { getAllAppointments } = require('../controllers/appointmentsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { preventSelfModification, validateObjectId } = require('../middleware/adminSafety');
const { adminApiLimiter, adminActionLimiter, auditLogLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated);
router.use(authorizeRoles('admin'));

// Apply general rate limiting to all admin routes
router.use(adminApiLimiter);

// Dashboard routes
router.get('/dashboard', getAdminDashboard);
router.get('/stats', getDashboardStats);

// Audit Logs (read-only)
router.get('/audit-logs', auditLogLimiter, getAuditLogs);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', validateObjectId, preventSelfModification, adminActionLimiter, updateUserStatus);
router.delete('/users/:id', validateObjectId, preventSelfModification, adminActionLimiter, deleteUser);

// Doctors moderation
router.get('/doctors', getDoctors);
router.put('/doctors/:id/approve', validateObjectId, preventSelfModification, adminActionLimiter, approveDoctor);
router.put('/doctors/:id/reject', validateObjectId, preventSelfModification, adminActionLimiter, rejectDoctor);
router.put('/doctors/:id/block', validateObjectId, preventSelfModification, adminActionLimiter, blockDoctor);
router.put('/doctors/:id/unblock', validateObjectId, preventSelfModification, adminActionLimiter, unblockDoctor);

// Patients moderation
router.get('/patients', getPatients);
router.put('/patients/:id/block', validateObjectId, preventSelfModification, adminActionLimiter, blockPatient);
router.put('/patients/:id/unblock', validateObjectId, preventSelfModification, adminActionLimiter, unblockPatient);

// Appointments monitoring (read-only)
router.get('/appointments', getAllAppointments);

module.exports = router;

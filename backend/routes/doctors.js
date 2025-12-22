const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateAvailability,
  getPendingApprovals,
  approveDoctor,
  rejectDoctor
} = require('../controllers/doctorsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

// Doctor routes (authenticated)
router.put('/availability', isAuthenticated, authorizeRoles('doctor'), updateAvailability);

// Admin routes
router.get('/pending', isAuthenticated, authorizeRoles('admin'), getPendingApprovals);
router.put('/:id/approve', isAuthenticated, authorizeRoles('admin'), approveDoctor);
router.put('/:id/reject', isAuthenticated, authorizeRoles('admin'), rejectDoctor);

module.exports = router;


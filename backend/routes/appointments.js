const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateStatus,
  cancelAppointment,
  rescheduleAppointment,
  addPrescription,
  getAllAppointments
} = require('../controllers/appointmentsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Patient routes
router.post('/', authorizeRoles('patient'), createAppointment);
router.get('/my', getMyAppointments);

// Doctor routes
router.get('/doctor', authorizeRoles('doctor'), getDoctorAppointments);
router.put('/:id/status', authorizeRoles('doctor', 'admin'), updateStatus);
router.put('/:id/prescription', authorizeRoles('doctor', 'admin'), addPrescription);

// Admin routes
router.get('/admin/all', authorizeRoles('admin'), getAllAppointments);

// General routes (patient, doctor, admin)
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

module.exports = router;


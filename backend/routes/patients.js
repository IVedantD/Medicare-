const express = require('express');
const {
  getAllPatients,
  getPatientById,
  getPatientHistory
} = require('../controllers/patientsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// All routes require doctor or admin role
router.get('/', authorizeRoles('doctor', 'admin'), getAllPatients);
router.get('/:id', authorizeRoles('doctor', 'admin'), getPatientById);
router.get('/:id/history', authorizeRoles('doctor', 'admin'), getPatientHistory);

module.exports = router;


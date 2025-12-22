const express = require('express');
const {
  getMyRecords,
  getPatientRecords,
  createMedicalRecord
} = require('../controllers/medicalRecordsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Patient routes
router.get('/my', authorizeRoles('patient'), getMyRecords);

// Doctor/Admin routes
router.get('/patient/:patientId', authorizeRoles('doctor', 'admin'), getPatientRecords);
router.post('/', authorizeRoles('doctor', 'admin'), createMedicalRecord);

module.exports = router;


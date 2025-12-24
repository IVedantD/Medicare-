const express = require('express');
const { getPatientDashboard } = require('../controllers/dashboardController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and patient role
router.use(isAuthenticated);
router.use(authorizeRoles('patient'));

// Dashboard route
router.get('/dashboard', getPatientDashboard);

module.exports = router;


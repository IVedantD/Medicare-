const express = require('express');
const { getDoctorDashboard } = require('../controllers/dashboardController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and doctor role
router.use(isAuthenticated);
router.use(authorizeRoles('doctor'));

// Dashboard route
router.get('/dashboard', getDoctorDashboard);

module.exports = router;


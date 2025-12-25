const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  changePassword
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.post('/logout', isAuthenticated, logout);
router.post('/change-password', isAuthenticated, changePassword);

module.exports = router;


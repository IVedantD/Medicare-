const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated);
router.use(authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;


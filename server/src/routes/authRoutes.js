const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authenticated routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/users', authenticate, getUsers);

module.exports = router;

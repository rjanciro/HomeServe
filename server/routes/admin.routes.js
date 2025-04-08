const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  '/login',
  [
    check('username', 'Please include a valid username').not().isEmpty(),
    check('password', 'Password is required').exists()
  ],
  adminController.loginAdmin
);

// @route   GET api/admin/me
// @desc    Get current admin profile
// @access  Private/Admin
router.get('/me', adminAuth, adminController.getAdminProfile);

// @route   GET api/admin/service-providers
// @desc    Get all service providers
// @access  Private/Admin
router.get('/service-providers', adminAuth, adminController.getAllServiceProviders);

module.exports = router; 
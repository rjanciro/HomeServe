const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/admin.verification.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/pending-providers', adminAuth, verificationController.getPendingProviders);
router.get('/providers', adminAuth, verificationController.getAllProviders);
router.post('/verify-provider', adminAuth, verificationController.verifyProvider);
router.get('/provider-documents/:userId', adminAuth, verificationController.getProviderDocuments);
router.put('/provider-status/:providerId', adminAuth, verificationController.updateProviderStatus);

module.exports = router; 
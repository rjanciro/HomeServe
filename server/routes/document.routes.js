const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const auth = require('../middleware/auth');

// Upload document for verification
router.post('/upload/:docType', auth, documentController.uploadDocument);

// Get document verification status
router.get('/status', auth, documentController.getDocumentStatus);

// Resubmit documents after rejection
router.post('/resubmit', auth, documentController.resubmitDocuments);

// Delete a specific document
router.delete('/:docType/:fileId', auth, documentController.deleteDocument);

// Add this route to handle document submission
router.post('/submit', auth, documentController.submitDocumentsForVerification);

module.exports = router; 
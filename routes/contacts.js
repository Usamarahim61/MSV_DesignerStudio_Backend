const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/', contactController.createContact);

// Protected routes (Admin only)
router.get('/', verifyToken, contactController.getContacts);
router.get('/stats', verifyToken, contactController.getContactStats);
router.get('/:id', verifyToken, contactController.getContactById);
router.put('/:id', verifyToken, contactController.updateContact);
router.put('/:id/status', verifyToken, contactController.updateContactStatus);
router.delete('/:id', verifyToken, contactController.deleteContact);

module.exports = router;

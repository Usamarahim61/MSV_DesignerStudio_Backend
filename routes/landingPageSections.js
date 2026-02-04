const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {verifyToken} = require('../middleware/auth');
const {
  getLandingPageSections,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  updateSectionOrder
} = require('../controllers/landingPageSectionController');
const { storage } = require('../config/cloudinary');
// Configure multer for file uploads
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Public route - get sections for landing page
router.get('/', getLandingPageSections);

// Admin routes - require authentication
router.get('/admin', getAllSections);
router.post('/', verifyToken, upload.single('image'), createSection);
router.put('/:id', verifyToken, upload.single('image'), updateSection);
router.delete('/:id', verifyToken, deleteSection);
router.put('/order/update', verifyToken, updateSectionOrder);

module.exports = router;

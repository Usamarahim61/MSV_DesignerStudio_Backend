const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/auth');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Configure multer for category image upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', verifyToken, getCategoryById);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', verifyToken, upload.single('image'), createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', verifyToken, upload.single('image'), updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;

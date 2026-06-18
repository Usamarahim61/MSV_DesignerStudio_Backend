const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/auth');

const {
  getShopByCategories,
  getShopByCategoriesAdmin,
  createShopByCategory,
  updateShopByCategory,
  deleteShopByCategory,
} = require('../controllers/shopByCategoryController');

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed!'), false);
  },
});

// Public: list active shop-by categories
router.get('/', verifyToken,getShopByCategories);

// Admin: full list
router.get('/admin', verifyToken,getShopByCategoriesAdmin);

// Create
router.post('/', upload.single('image'), verifyToken,createShopByCategory);

// Update
router.put('/:id', upload.single('image'), verifyToken,updateShopByCategory);

// Delete
router.delete('/:id', deleteShopByCategory);

module.exports = router;


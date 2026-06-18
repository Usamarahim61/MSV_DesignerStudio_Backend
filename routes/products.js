const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

// Configure multer for Cloudinary image uploads
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 50MB
});

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post("/", (req, res, next) => {
  console.log("➡️ Request reached route");
  next();
}, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "sizeChartImage", maxCount: 1 } 
]), createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'hoverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'sizeChartImage', maxCount: 1 }
]), updateProduct);


// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', deleteProduct);

module.exports = router;

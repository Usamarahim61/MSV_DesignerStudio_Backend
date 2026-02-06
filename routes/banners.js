const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: 'dtmmpcurr',
//   api_key: process.env.CLOUDINARY_API_KEY || '983797242283474',
//   api_secret: process.env.CLOUDINARY_API_SECRET || 'yIjBRG-BX4bpWL02Ynx14Z1EfQ8',
// });

// // Configure multer for Cloudinary uploads
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: "banners",
//     format: file.mimetype.split("/")[1], // jpg, png, webp
//     public_id: `banner-${Date.now()}-${file.originalname.split(".")[0]}`,
//   }),
// });

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 10MB
});

// Public routes
router.get('/', bannerController.getAllBanners);

// Admin routes (protected)
router.get('/admin', bannerController.getAllBannersAdmin);
router.post('/', verifyToken, upload.fields([
  { name: "image", maxCount: 1 }]), bannerController.createBanner);
router.put('/:id', verifyToken, upload.single('image'), bannerController.updateBanner);
router.delete('/:id', verifyToken, bannerController.deleteBanner);

module.exports = router;

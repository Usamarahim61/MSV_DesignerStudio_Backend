const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

// Get all banners for public view
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all banners for admin
const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new banner
const createBanner = async (req, res) => {
  try {
    const bannerData = {};

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      bannerData.imageUrl = req.files.image[0].path;
    }

    const banner = new Banner(bannerData);
    await banner.save();

    res.status(201).json({ banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, altText, isActive, order } = req.body;
    const updateData = { title, altText, isActive, order };

    // Find the existing banner to get the current image
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      // If a new image is being uploaded, delete the old image from Cloudinary
      if (existingBanner.imageUrl) {
        try {
          const publicId = existingBanner.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
        }
      }
      updateData.imageUrl = req.files.image[0].path;
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete image from Cloudinary
    if (banner.imageUrl) {
      try {
        const publicId = banner.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await Banner.findByIdAndDelete(id);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner
};

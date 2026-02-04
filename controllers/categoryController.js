const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };

    // Handle image upload
    if (req.file) {
      categoryData.image = req.file.path;
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    // Find the existing category to get the current image
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const categoryData = { ...req.body };

    // Handle image upload
    if (req.file) {
      // If a new image is being uploaded, delete the old image from Cloudinary
      if (existingCategory.image) {
        try {
          const publicId = existingCategory.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
        }
      }
      categoryData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary
    if (category.image) {
      try {
        const publicId = category.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

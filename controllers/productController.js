const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const Category = require('../models/Category');

const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      fabric,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page,
      limit ,
      productType,
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (subcategory) {
      query.subcategory = { $regex: `^${subcategory}$`, $options: "i" };
    }

    if (fabric) {
      query.fabric = { $regex: `^${fabric}$`, $options: "i" };
    }

    if (productType) {
      query.productType = productType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { fabric: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } }
      ];
    }

    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
    }

    // Sort
    const sort = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    const totalCategory = await Category.countDocuments();

    res.json({
      products,
      totalCategory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({product: product});
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle image uploads
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        productData.image = req.files.image[0].path;
      }
      if (req.files.hoverImage && req.files.hoverImage[0]) {
        productData.hoverImage = req.files.hoverImage[0].path;
      }
      if (req.files.images) {
        productData.images = req.files.images.map(file => file.path);
      }
    }

    // Parse arrays if they come as strings
    if (typeof productData.details === 'string') {
      productData.details = JSON.parse(productData.details);
    }
    if (typeof productData.images === 'string') {
      productData.images = JSON.parse(productData.images);
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Get the existing product to compare images
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image deletions from Cloudinary
    if (productData.imagesToDelete) {
      const imagesToDelete = JSON.parse(productData.imagesToDelete);
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }
      delete productData.imagesToDelete; // Remove from productData as it's not a field in the model
    }

    // Handle image uploads
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        productData.image = req.files.image[0].path;
      }
      if (req.files.hoverImage && req.files.hoverImage[0]) {
        productData.hoverImage = req.files.hoverImage[0].path;
      }
      if (req.files.images) {
        productData.images = req.files.images.map(file => file.path);
      }
    }

    // Parse arrays if they come as strings
    if (typeof productData.details === 'string') {
      productData.details = JSON.parse(productData.details);
    }
    if (typeof productData.images === 'string') {
      productData.images = JSON.parse(productData.images);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    const imagesToDelete = [product.image, product.hoverImage, ...product.images].filter(Boolean);
    for (const imageUrl of imagesToDelete) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

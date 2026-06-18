const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const Category = require('../models/Category');

const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      fabric,
      brand,
      scentType,
      gender,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page,
      limit,
      productType,
    } = req.query;

    // Build query
    const query = {};
    const matchClauses = [];

    if (category) {
      const catRegex = { $regex: `^${category}$`, $options: 'i' };
      matchClauses.push({
        $or: [{ category: catRegex }, { subcategory: catRegex }],
      });
    }

    if (subcategory) {
      const subRegex = { $regex: `^${subcategory}$`, $options: 'i' };
      matchClauses.push({
        $or: [{ category: subRegex }, { subcategory: subRegex }],
      });
    }

    if (matchClauses.length) {
      query.$and = matchClauses;
    }

    if (fabric) {
      const fabrics = fabric.split(',').map((f) => f.trim()).filter(Boolean);
      if (fabrics.length > 1) {
        query.fabric = { $in: fabrics.map((f) => new RegExp(`^${f}$`, 'i')) };
      } else if (fabrics.length === 1) {
        query.fabric = { $regex: `^${fabrics[0]}$`, $options: 'i' };
      }
    }

    if (brand) {
      const brands = brand.split(',').map((b) => b.trim()).filter(Boolean);
      if (brands.length > 1) {
        query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
      } else if (brands.length === 1) {
        query.brand = { $regex: `^${brands[0]}$`, $options: 'i' };
      }
    }

    if (scentType) {
      const scentTypes = scentType.split(',').map((s) => s.trim()).filter(Boolean);
      if (scentTypes.length > 1) {
        query.scentType = { $in: scentTypes.map((s) => new RegExp(`^${s}$`, 'i')) };
      } else if (scentTypes.length === 1) {
        query.scentType = { $regex: `^${scentTypes[0]}$`, $options: 'i' };
      }
    }

    if (gender) {
      query.gender = { $in: gender.split(',').map((g) => g.trim()) };
    }

    if (productType) {
      query.productType = productType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
    }

    const sort = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };

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
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product: product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function normalizeMaybeJSON(value) {
  if (typeof value !== 'string') return value;
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getCloudinaryPublicIdFromUrl(imageUrl) {
  try {
    return imageUrl.split('/').pop().split('.')[0];
  } catch {
    return null;
  }
}

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        productData.image = req.files.image[0].path;
      }
      if (req.files.hoverImage && req.files.hoverImage[0]) {
        productData.hoverImage = req.files.hoverImage[0].path;
      }
      if (req.files.images) {
        let remainingImages = [];
        if (productData.images) {
          if (typeof productData.images === 'string') {
            remainingImages = JSON.parse(productData.images);
          } else if (Array.isArray(productData.images)) {
            remainingImages = productData.images;
          }
        }

        const newImages = req.files.images.map((file) => file.path);
        productData.images = [...remainingImages, ...newImages];
      }

      // Size chart image upload
      if (req.files.sizeChartImage && req.files.sizeChartImage[0]) {
        productData.sizeChartImage = req.files.sizeChartImage[0].path;
      }
    }

    if (typeof productData.details === 'string') {
      productData.details = JSON.parse(productData.details);
    }

    // Handle sizeOptions if sent as JSON string (e.g., from frontend without new files)
    if (typeof productData.sizeOptions === 'string') {
      productData.sizeOptions = JSON.parse(productData.sizeOptions);
    }

    // Ensure arrays are initialized if not present
    if (!productData.images) productData.images = [];
    if (!productData.details) productData.details = [];
    if (!productData.sizeOptions) productData.sizeOptions = [];

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

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete regular gallery images (existing behavior)
    if (productData.imagesToDelete) {
      const imagesToDelete = JSON.parse(productData.imagesToDelete);
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
          if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }
      // If the main image is being deleted, clear it from productData
      if (imagesToDelete.includes(existingProduct.image)) {
        productData.image = '';
      }
      delete productData.imagesToDelete;
    }

    // Delete old size chart if requested or replaced
    if (productData.sizeChartImageToDelete) {
      const imagesToDelete = JSON.parse(productData.sizeChartImageToDelete);
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
          if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting size image from Cloudinary:', cloudinaryError);
        }
      }
      productData.sizeChartImage = ''; // Explicitly clear the image field in the DB
      delete productData.sizeChartImageToDelete;
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        // If a new main image is uploaded, delete the old one from Cloudinary
        if (existingProduct.image) {
          try {
            const publicId = getCloudinaryPublicIdFromUrl(existingProduct.image);
            if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting old main image from Cloudinary:', cloudinaryError);
          }
        }
        productData.image = req.files.image[0].path;
      }
      if (req.files.hoverImage && req.files.hoverImage[0]) {
        productData.hoverImage = req.files.hoverImage[0].path;
      }
      if (req.files.images) {
        let remainingImages = [];
        if (typeof productData.images === 'string') {
          remainingImages = JSON.parse(productData.images);
        } else if (Array.isArray(productData.images)) {
          remainingImages = productData.images;
        }

        const newImages = req.files.images.map((file) => file.path);
        productData.images = [...remainingImages, ...newImages];
      }

      // Handle new size chart image upload
      if (req.files.sizeChartImage && req.files.sizeChartImage[0]) {
        // If a new size chart image is uploaded, delete the old one
        if (existingProduct.sizeChartImage) {
          try {
            const publicId = getCloudinaryPublicIdFromUrl(existingProduct.sizeChartImage);
            if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting old size chart image from Cloudinary:', cloudinaryError);
          }
        }
        productData.sizeChartImage = req.files.sizeChartImage[0].path;
      }
    }

    if (typeof productData.details === 'string') {
      productData.details = JSON.parse(productData.details);
    }

    if (typeof productData.sizeOptions === 'string') {
      productData.sizeOptions = JSON.parse(productData.sizeOptions);
    }
    if (typeof productData.images === 'string') {
      delete productData.images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });

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

    const regularImagesToDelete = [product.image, product.hoverImage, ...(product.images || [])].filter(Boolean);
    for (const imageUrl of regularImagesToDelete) {
      try {
        const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    const sizeImagesToDelete = (product.sizeImages || []).map((x) => x?.image).filter(Boolean);
    for (const imageUrl of sizeImagesToDelete) {
      try {
        const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting size image from Cloudinary:', cloudinaryError);
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
  deleteProduct,
};

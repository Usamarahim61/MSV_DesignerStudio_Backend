const ShopByCategory = require('../models/ShopByCategory');
const { cloudinary } = require('../config/cloudinary');

const normalizeKey = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const getShopByCategories = async (req, res) => {
  try {
    const categories = await ShopByCategory.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      // populate categoryRef (if present)
      .populate({
        path: 'categoryRef',
      });


    // Ensure response includes categoryRef data in a predictable shape
    const normalized = categories.map((c) => ({
      _id: c._id,
      label: c.label,
      key: c.key,
      image: c.image,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      categoryRef: c.categoryRef
    }));

    res.json(normalized);
  } catch (error) {
    console.error('Get shopByCategories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getShopByCategoriesAdmin = async (req, res) => {
  try {
    const categories = await ShopByCategory.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Get shopByCategories admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createShopByCategory = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.key) body.key = normalizeKey(body.key);
    if (body.categoryRef) body.categoryRef = normalizeKey(body.categoryRef);

    if (!body.key && body.label) body.key = normalizeKey(body.label);

    const imageUrl = req.file?.path || body.image || '';

    const created = await ShopByCategory.create({
      label: body.label,
      key: body.key,
      image: imageUrl,
      categoryRef: body.categoryRef || '',
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: body.isActive === 'false' ? false : Boolean(body.isActive ?? true),
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Create shopByCategory error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ShopByCategory key already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateShopByCategory = async (req, res) => {
  try {
    const existing = await ShopByCategory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'ShopByCategory not found' });

    const body = { ...req.body };

    if (body.key) body.key = normalizeKey(body.key);
    if (body.categoryRef) body.categoryRef = normalizeKey(body.categoryRef);

    const updateData = {
      label: body.label ?? existing.label,
      key: body.key ?? existing.key,
      categoryRef: body.categoryRef !== undefined ? body.categoryRef : existing.categoryRef,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
      isActive:
        body.isActive !== undefined
          ? body.isActive === 'false'
            ? false
            : Boolean(body.isActive)
          : existing.isActive,
    };

    if (req.file) {
      if (existing.image) {
        try {
          const publicId = existing.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting old shopByCategory image from Cloudinary:', cloudinaryError);
        }
      }
      updateData.image = req.file.path;
    } else if (body.image !== undefined) {
      updateData.image = body.image;
    }

    const updated = await ShopByCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update shopByCategory error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ShopByCategory key already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteShopByCategory = async (req, res) => {
  try {
    const existing = await ShopByCategory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'ShopByCategory not found' });

    if (existing.image) {
      try {
        const publicId = existing.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting shopByCategory image from Cloudinary:', cloudinaryError);
      }
    }

    await ShopByCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'ShopByCategory deleted successfully' });
  } catch (error) {
    console.error('Delete shopByCategory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getShopByCategories,
  getShopByCategoriesAdmin,
  createShopByCategory,
  updateShopByCategory,
  deleteShopByCategory,
};


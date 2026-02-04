const LandingPageSection = require('../models/LandingPageSection');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// Get all landing page sections for public display
// const getLandingPageSections = async (req, res) => {
//   try {
//     const sections = await LandingPageSection.find({ isActive: true })
//       .sort({ order: 1 })
//       .populate('manualProducts');

//     const sectionsWithProducts = await Promise.all(
//       sections.map(async (section) => {
//         let products = [];

//         if (section.productSelectionMode === 'manual') {
//           products = section.manualProducts;
//         } else {
//           // Category-based selection
//           const query = {};
//           if (section.category) query.category = section.category;
//           if (section.subcategory) query.subcategory = section.subcategory;
//           if (section.season) query.season = section.season;
//           if (section.fabricType) query.fabricType = section.fabricType;

//           products = await Product.find(query).limit(15);
//         }

//         return {
//           ...section.toObject(),
//           products
//         };
//       })
//     );

//     res.json(sectionsWithProducts);
//   } catch (error) {
//     console.error('Error fetching landing page sections:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const getLandingPageSections = async (req, res) => {
  try {
    const sections = await LandingPageSection.find()
      .sort({ order: 1 })
      .populate('manualProducts');

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        let products = [];

        if (section.productSelectionMode === 'manual') {
          products = section.manualProducts;
        } else {
          // Category-based selection
          const query = {};
          if (section.category) query.category = section.category;
          if (section.subcategory) query.subcategory = section.subcategory;
          if (section.season) query.season = section.season;
          if (section.fabricType) query.fabricType = section.fabricType;

          products = await Product.find(query).limit(10);
        }

        return {
          _id: section._id,
          banner: section.banner,
          products,
          category: section.category,
          subcategory: section.subcategory,
          productSelectionMode: section.productSelectionMode,
          manualProducts: section.manualProducts,
          order: section.order,
          isActive: section.isActive,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt
        };
      })
    );

    res.json(sectionsWithProducts);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sections for admin panel
const getAllSections = async (req, res) => {
  try {
    const sections = await LandingPageSection.find()
      .sort({ order: 1 })
      .populate('manualProducts');

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        let products = [];

        if (section.productSelectionMode === 'manual') {
          products = section.manualProducts;
        } else {
          // Category-based selection
          const query = {};
          if (section.category) query.category = section.category;
          if (section.subcategory) query.subcategory = section.subcategory;
          if (section.season) query.season = section.season;
          if (section.fabricType) query.fabricType = section.fabricType;

          products = await Product.find(query);
        }

        return {
          _id: section._id,
          banner: section.banner,
          products,
          category: section.category,
          subcategory: section.subcategory,
          productSelectionMode: section.productSelectionMode,
          manualProducts: section.manualProducts,
          order: section.order,
          isActive: section.isActive,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt
        };
      })
    );

    res.json(sectionsWithProducts);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new section
const createSection = async (req, res) => {
  try {
    const { banner, category, categoryName,  discount , fabricType, subcategory, isActive, mainTitle, subTitle , tagLine, season, productSelectionMode, manualProducts, order } = req.body;

    const newSection = new LandingPageSection({
      banner: {
        image: req.file ? req.file.path : banner.image,
        subTitle: subTitle,
        mainTitle: mainTitle,
        tagLine: tagLine,
        discount: discount,
        categoryName: categoryName,
        season: season,
        fabricType: fabricType
      },
      category,
      subcategory,
      productSelectionMode,
      manualProducts,
      order
    });

    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update section
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { subTitle, mainTitle, tagLine, discount, categoryName, season, fabricType, category, subcategory, productSelectionMode, manualProducts, order, isActive } = req.body;

    // Find the existing section to get the current image
    const existingSection = await LandingPageSection.findById(id);
    if (!existingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // If a new image is being uploaded, delete the old image from Cloudinary
    if (req.file && existingSection.banner.image) {
      try {
        const publicId = existingSection.banner.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting old image from Cloudinary:', cloudinaryError);
      }
    }

    const updateData = {
      banner: {
        image: req.file ? req.file.path : req.body.image,
        subTitle,
        mainTitle,
        tagLine,
        discount,
        categoryName,
        season,
        fabricType
      },
      category,
      subcategory,
      productSelectionMode,
      manualProducts,
      order,
      isActive
    };

    const updatedSection = await LandingPageSection.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete section
// const deleteSection = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedSection = await LandingPageSection.findByIdAndDelete(id);
//     if (!deletedSection) {
//       return res.status(404).json({ message: 'Section not found' });
//     }
//     res.json({ message: 'Section deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting section:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const deleteSection = async (req, res) => {
  try {
    const deletedSection = await LandingPageSection.findById(req.params.id);
    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete image from Cloudinary
    if (deletedSection.image) {
      try {
        const publicId = deletedSection.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await LandingPageSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete Section error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update section order
const updateSectionOrder = async (req, res) => {
  try {
    const { sections } = req.body;

    const updatePromises = sections.map((section, index) =>
      LandingPageSection.findByIdAndUpdate(section._id, { order: index })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Section order updated successfully' });
  } catch (error) {
    console.error('Error updating section order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLandingPageSections,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  updateSectionOrder
};

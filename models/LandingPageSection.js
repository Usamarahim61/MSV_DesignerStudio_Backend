const mongoose = require('mongoose');

const landingPageSectionSchema = new mongoose.Schema({
  banner: {
    image: {
      type: String,
      required: true
    },
    path: {
      type: String,
      default: ''
    },
    subTitle: {
      type: String,
      default: ''
    },
    mainTitle: {
      type: String,
      default: ''
    },
    tagLine: {
      type: String,
      default: ''
    },
    discount: {
      type: String,
      default: ''
    },
    categoryName: {
      type: String,
      default: ''
    },
    season: {
      type: String,
      default: ''
    },
    fabricType: {
      type: String,
      default: ''
    }
  },
  // Category-based product selection
  category: {
    type: String,
    default: ''
  },
  subcategory: {
    type: String,
    default: ''
  },
  // Product selection mode: 'category' or 'manual'
  productSelectionMode: {
    type: String,
    enum: ['category', 'manual'],
    default: 'category'
  },
  // Manual product selection (if not using category-based)
  manualProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
landingPageSectionSchema.index({ order: 1 });
landingPageSectionSchema.index({ isActive: 1 });

module.exports = mongoose.model('LandingPageSection', landingPageSectionSchema);

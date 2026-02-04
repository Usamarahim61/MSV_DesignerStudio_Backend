const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
    trim: true,
    maxlength: 200
  },
  barcode: {
    type: String
  },
  productType: {
    type: String,
    // required: true,
    enum: ['clothing', 'fragrance'],
    default: 'clothing'
  },
  // Clothing specific fields
  fabric: {
    type: String,
    // trim: true,
    maxlength: 100,
    // required: function() {
    //   return this.productType === 'clothing';
    // }
  },
  color: {
    type: String,
    default: 'N/A',
    trim: true,
    maxlength: 50
  },
  // Fragrance specific fields
  brand: {
    type: String,
    trim: true,
    maxlength: 100,
    // required: function() {
    //   return this.productType === 'fragrance';
    // }
  },
  scentType: {
    type: String,
    trim: true,
    maxlength: 100,
    // required: function() {
    //   return this.productType === 'fragrance';
    // }
  },
  volume: {
    type: String,
    trim: true,
    maxlength: 50,
    // required: function() {
    //   return this.productType === 'fragrance';
    // }
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    // required: function() {
    //   return this.productType === 'fragrance';
    // }
  },
  description: {
    type: String,
    // required: true,
    maxlength: 1000
  },
  originalPrice: {
    type: String,
    required: true
  },
  discountPrice: {
    type: String,
    required: true
  },
  discountTag: {
    type: String,
    default: '',
    maxlength: 20
  },
  image: {
    type: String,
    required: true
  },
  hoverImage: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  details: [{
    type: String
  }],
  category: {
    type: String,
    default: '',
    maxlength: 100
  },
  subcategory: {
    type: String,
    default: '',
    maxlength: 100
  },
  noPieces: {
    type: String,
    default: '',
    maxlength: 100
    
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// productSchema.index({ barcode: 1 });
// productSchema.index({ category: 1 });
// productSchema.index({ fabric: 1 });
// productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

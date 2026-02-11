const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    discountPrice: { type: String, required: true },
    image: { type: String },
    images: [{ type: String }]
  }],
  total: {
    type: Number,
    required: true
  },
  userDetails: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    email: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'cash_on_delivery'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

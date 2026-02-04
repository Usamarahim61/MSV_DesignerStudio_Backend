const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    subject: {
      type: String,
      required: true,
      enum: ['general', 'order', 'complaint', 'feedback', 'partnership', 'other'],
      default: 'general',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);

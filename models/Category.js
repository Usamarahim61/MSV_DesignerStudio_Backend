const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      // required: true
    },
    discount: {
      type: String,
      // required: true
    },
    subcategories: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],
    addToNavbar: {
      type: Boolean,
      default: false,
    },
    addToExplore: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for name
categorySchema.index({ name: 1 });

module.exports = mongoose.model("Category", categorySchema);

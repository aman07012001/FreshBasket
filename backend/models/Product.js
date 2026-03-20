const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
    },

    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
    },

    stock: {
      type: Number,
      required: [true, 'Stock is required.'],
      min: [0, 'Stock cannot be negative.'],
      default: 0,
    },

    img: {
      type: String,
      default: '',
    },

    unit: {
      type: String,
      default: 'kg',
    },

    reviews: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);

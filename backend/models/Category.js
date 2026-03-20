const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, 'Category name is required.'],
      trim: true,
    },

    bgColor: {
      type: String,
      default: '#ffffff',
    },

    imgUrl: {
      type: String,
      default: '',
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, default: 1, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cartItems: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);

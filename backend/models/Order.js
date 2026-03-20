const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    img: { type: String, trim: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [itemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Order must contain at least one item.',
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    emailDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },

    shippingAddress: {
      type: {
        full_name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);

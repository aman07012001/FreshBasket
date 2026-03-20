const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reserved: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  history: [{
    type: {
      type: String,
      enum: ['restock', 'sale', 'adjustment', 'reservation', 'release'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      maxlength: 200
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

inventorySchema.index({ productId: 1 }, { unique: true });

inventorySchema.statics.getProductInventory = function(productId) {
  return this.findOne({ productId });
};

inventorySchema.statics.isLowStock = function(productId) {
  return this.findOne({
    productId,
    quantity: { $lt: '$lowStockThreshold' }
  });
};

inventorySchema.statics.getLowStockProducts = function() {
  return this.find({
    quantity: { $lt: '$lowStockThreshold' }
  }).sort({ quantity: 1 });
};

inventorySchema.methods.updateQuantity = function(change, type, reason, adminId) {
  const previousQuantity = this.quantity;
  const newQuantity = Math.max(0, this.quantity + change);

  this.quantity = newQuantity;
  this.lastUpdated = new Date();

  this.history.push({
    type,
    quantity: change,
    previousQuantity,
    newQuantity,
    reason: reason || `${type} of ${change} units`,
    adminId
  });

  if (this.history.length > 50) {
    this.history = this.history.slice(-50);
  }

  return this;
};

inventorySchema.methods.reserveStock = function(quantity, adminId) {
  if (this.quantity - this.reserved < quantity) {
    throw new Error('Insufficient stock available for reservation');
  }

  this.reserved += quantity;
  this.lastUpdated = new Date();

  this.history.push({
    type: 'reservation',
    quantity,
    previousQuantity: this.quantity,
    newQuantity: this.quantity,
    reason: `Reserved ${quantity} units`,
    adminId
  });

  return this;
};

inventorySchema.methods.releaseStock = function(quantity, adminId) {
  if (this.reserved < quantity) {
    throw new Error('Cannot release more stock than reserved');
  }

  this.reserved -= quantity;
  this.lastUpdated = new Date();

  this.history.push({
    type: 'release',
    quantity: -quantity,
    previousQuantity: this.quantity,
    newQuantity: this.quantity,
    reason: `Released ${quantity} units`,
    adminId
  });

  return this;
};

inventorySchema.methods.isLowStock = function() {
  return this.quantity < this.lowStockThreshold;
};

module.exports = mongoose.model('Inventory', inventorySchema);
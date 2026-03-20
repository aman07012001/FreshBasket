const Inventory = require('../models/Inventory');
const { requireRole } = require('../middleware/roles');

const getProductInventory = async (req, res) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.getProductInventory(productId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
};

const updateProductInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const adminId = req.user.id;

    if (typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required and must be a number'
      });
    }

    let inventory = await Inventory.getProductInventory(productId);

    if (!inventory) {

      inventory = new Inventory({
        productId,
        quantity,
        lowStockThreshold: req.body.lowStockThreshold || 10
      });

      inventory.history.push({
        type: 'restock',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        reason: reason || `Initial stock setup: ${quantity} units`,
        adminId
      });
    } else {

      const change = quantity - inventory.quantity;
      inventory.updateQuantity(change, 'adjustment', reason, adminId);
    }

    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory'
    });
  }
};

const restockProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const adminId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    let inventory = await Inventory.getProductInventory(productId);

    if (!inventory) {

      inventory = new Inventory({
        productId,
        quantity,
        lowStockThreshold: req.body.lowStockThreshold || 10
      });

      inventory.history.push({
        type: 'restock',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        reason: reason || `Restock: ${quantity} units`,
        adminId
      });
    } else {

      inventory.updateQuantity(quantity, 'restock', reason, adminId);
    }

    await inventory.save();

    res.json({
      success: true,
      message: `Successfully restocked ${quantity} units`,
      data: inventory
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restock product'
    });
  }
};

const reserveStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const adminId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    let inventory = await Inventory.getProductInventory(productId);

    if (!inventory) {

      inventory = new Inventory({
        productId,
        quantity: 0,
        reserved: quantity
      });

      inventory.history.push({
        type: 'reservation',
        quantity,
        previousQuantity: 0,
        newQuantity: 0,
        reason: `Reserved ${quantity} units for order`,
        adminId
      });
    } else {

      inventory.reserveStock(quantity, adminId);
    }

    await inventory.save();

    res.json({
      success: true,
      message: `Successfully reserved ${quantity} units`,
      data: inventory
    });
  } catch (error) {
    console.error('Reserve stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reserve stock'
    });
  }
};

const releaseStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const adminId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const inventory = await Inventory.getProductInventory(productId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }

    inventory.releaseStock(quantity, adminId);
    await inventory.save();

    res.json({
      success: true,
      message: `Successfully released ${quantity} units`,
      data: inventory
    });
  } catch (error) {
    console.error('Release stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to release stock'
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Inventory.getLowStockProducts();

    res.json({
      success: true,
      data: lowStockProducts,
      count: lowStockProducts.length
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products'
    });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, lowStockOnly = false } = req.query;

    let query = {};
    if (lowStockOnly === 'true') {
      query = {
        quantity: { $lt: '$lowStockThreshold' }
      };
    }

    const inventory = await Inventory.find(query)
      .sort({ quantity: 1, lastUpdated: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
};

const updateLowStockThreshold = async (req, res) => {
  try {
    const { productId } = req.params;
    const { threshold } = req.body;

    if (!threshold || threshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Threshold must be a non-negative number'
      });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      { lowStockThreshold: threshold },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }

    res.json({
      success: true,
      message: 'Low stock threshold updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update low stock threshold'
    });
  }
};

module.exports = {
  getProductInventory,
  updateProductInventory,
  restockProduct,
  reserveStock,
  releaseStock,
  getLowStockProducts,
  getAllInventory,
  updateLowStockThreshold
};
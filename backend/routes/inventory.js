const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/product/:productId', auth, requireRole('admin'), inventoryController.getProductInventory);

router.put('/product/:productId', auth, requireRole('admin'), inventoryController.updateProductInventory);

router.post('/product/:productId/restock', auth, requireRole('admin'), inventoryController.restockProduct);

router.post('/product/:productId/reserve', auth, requireRole('admin'), inventoryController.reserveStock);

router.post('/product/:productId/release', auth, requireRole('admin'), inventoryController.releaseStock);

router.get('/low-stock', auth, requireRole('admin'), inventoryController.getLowStockProducts);

router.get('/', auth, requireRole('admin'), inventoryController.getAllInventory);

router.put('/product/:productId/threshold', auth, requireRole('admin'), inventoryController.updateLowStockThreshold);

module.exports = router;
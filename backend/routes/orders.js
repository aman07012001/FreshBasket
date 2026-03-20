const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', auth(), createOrderLimiter, createOrder);

router.get('/my', auth(), getMyOrders);

router.get('/', auth(), requireRole('admin'), getAllOrders);

router.get('/:id', auth(), getOrderById);

router.put('/:id', auth(), requireRole('admin'), updateOrderStatus);

router.post('/:id/cancel', auth(), cancelOrder);

module.exports = router;

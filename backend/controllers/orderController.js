const crypto = require('crypto');
const { z } = require('zod');
const Order = require('../models/Order');
const { sendOrderEmail } = require('../utils/sendEmail');
const { emitOrderStatusUpdate, emitNewOrder } = require('../services/websocketService');

const createOrderSchema = z.object({
  orderId: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
        img: z.string().optional(),
      })
    )
    .min(1),
  paymentMethod: z.enum(['COD', 'ONLINE']),
  totalAmount: z.number().nonnegative(),
  deliveryAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(7),
    pincode: z.string().min(3),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    email: z.string().email().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

function getUserId(req) {
  if (req.user && req.user.id) return String(req.user.id);
  if (req.user && req.user._id) return String(req.user._id);
  return null;
}

const LEGACY_STATUS_MAP = {
  created: 'pending',
  paid: 'processing',
  failed: 'cancelled',
};

function normalizeOrderStatus(order) {
  if (!order) return order;
  const legacy = order.status;
  const mapped = legacy && LEGACY_STATUS_MAP[legacy];
  if (!mapped) {
    return order;
  }
  return {
    ...order,
    status: mapped,
  };
}

function withCanUpdateStatus(order, req) {
  if (!order) return order;
  const isAdmin = req.user && req.user.role === 'admin';
  const base = order.toObject ? order.toObject() : order;
  const plainOrder = normalizeOrderStatus(base);
  return {
    ...plainOrder,
    canUpdateStatus: Boolean(isAdmin),
  };
}

function withCanUpdateStatusList(orders, req) {
  const isAdmin = req.user && req.user.role === 'admin';
  return (orders || []).map((order) => {
    const base = order.toObject ? order.toObject() : order;
    const plainOrder = normalizeOrderStatus(base);
    return {
      ...plainOrder,
      canUpdateStatus: Boolean(isAdmin),
    };
  });
}

function generateOrderId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
}

async function createOrder(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const parsed = createOrderSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.errors,
      });
    }

    const data = parsed.data;
    let { orderId } = data;

    if (orderId) {
      const existing = await Order.findOne({ orderId });
      if (existing) {
        const responseOrder = withCanUpdateStatus(existing, req);
        return res.status(200).json({ order: responseOrder });
      }
    } else {
      orderId = generateOrderId();
    }

    const order = await Order.create({
      orderId,
      userId,
      items: data.items,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      amount: data.totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: data.deliveryAddress,
      shippingAddress: {
        full_name: data.deliveryAddress.name,
        phone: data.deliveryAddress.phone,
        address: data.deliveryAddress.address,
        email: data.deliveryAddress.email || undefined,
      },
    });

    sendOrderEmail(order, order.status).catch(() => {});

    emitNewOrder(order);

    const responseOrder = withCanUpdateStatus(order, req);

    return res.status(201).json({ order: responseOrder });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ error: 'Failed to create order.' });
  }
}

async function getMyOrders(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const plainOrders = (orders || []).map((order) => {
      const base = order.toObject ? order.toObject() : order;
      return normalizeOrderStatus(base);
    });
    return res.json({ orders: plainOrders });
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ error: 'Failed to load orders.' });
  }
}

async function getAllOrders(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    const responseOrders = withCanUpdateStatusList(orders, req);
    return res.json({ orders: responseOrders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ error: 'Failed to load orders.' });
  }
}

async function getOrderById(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const isOwner = String(order.userId) === userId;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    const base = order.toObject ? order.toObject() : order;
    const plainOrder = normalizeOrderStatus(base);
    const responseOrder = {
      ...plainOrder,
      canUpdateStatus: Boolean(isAdmin),
    };

    return res.json({ order: responseOrder });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ error: 'Failed to load order.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const parsed = updateOrderStatusSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.errors,
      });
    }

    const { id } = req.params;
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const newStatus = parsed.data.status;
    const currentStatus = order.status;

    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from '${currentStatus}' to '${newStatus}'.`
      });
    }

    order.status = newStatus;
    if (order.status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    sendOrderEmail(order, order.status).catch(() => {});

    emitOrderStatusUpdate(order);

    const responseOrder = withCanUpdateStatus(order, req);

    return res.json({ order: responseOrder });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ error: 'Failed to update order.' });
  }
}

async function cancelOrder(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const isOwner = String(order.userId) === userId;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot cancel order with status '${order.status}'.`
      });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'failed'; 
    await order.save();

    sendOrderEmail(order, order.status).catch(() => {});

    emitOrderStatusUpdate(order);

    const responseOrder = withCanUpdateStatus(order, req);

    return res.json({
      message: 'Order cancelled successfully',
      order: responseOrder
    });
  } catch (error) {
    console.error('cancelOrder error:', error);
    return res.status(500).json({ error: 'Failed to cancel order.' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};

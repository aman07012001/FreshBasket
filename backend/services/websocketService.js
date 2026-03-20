const { Server } = require('socket.io');

let io;

function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      }
    });

    socket.on('join-admin-room', () => {
      socket.join('admin');
      console.log(`Client ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeWebSocket first.');
  }
  return io;
}

function emitOrderStatusUpdate(order) {
  if (!io) {
    console.warn('WebSocket not initialized, skipping order status update emit');
    return;
  }

  try {

    io.to(`user_${order.userId}`).emit('order_status_updated', {
      orderId: order.orderId,
      status: order.status,
      message: `Order ${order.orderId} status updated to ${order.status}`,
      timestamp: new Date().toISOString()
    });

    io.to('admin').emit('order_status_updated', {
      orderId: order.orderId,
      status: order.status,
      userId: order.userId,
      message: `Order ${order.orderId} status updated to ${order.status}`,
      timestamp: new Date().toISOString()
    });

    console.log(`Order status update emitted for order ${order.orderId}`);
  } catch (error) {
    console.error('Error emitting order status update:', error);
  }
}

function emitNewOrder(order) {
  if (!io) {
    console.warn('WebSocket not initialized, skipping new order emit');
    return;
  }

  try {

    io.to('admin').emit('new_order', {
      orderId: order.orderId,
      userId: order.userId,
      totalAmount: order.totalAmount,
      message: `New order ${order.orderId} received`,
      timestamp: new Date().toISOString()
    });

    console.log(`New order notification emitted for order ${order.orderId}`);
  } catch (error) {
    console.error('Error emitting new order:', error);
  }
}

module.exports = {
  initializeWebSocket,
  getIO,
  emitOrderStatusUpdate,
  emitNewOrder
};
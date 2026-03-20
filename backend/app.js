require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const emailStatusRoutes = require('./routes/emailStatus');
const reviewsRoutes = require('./routes/reviews');
const inventoryRoutes = require('./routes/inventory');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const { env } = require('./config');
const { checkTransport } = require('./utils/emailService');
const { getQueueHealth } = require('./queue/queueConfig');

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/orders', ordersRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/email', emailStatusRoutes);

app.use('/api/reviews', reviewsRoutes);

app.use('/api/inventory', inventoryRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/products', productRoutes);

app.get('/health', async (req, res) => {
  const emailHealth = await checkTransport();
  const queueHealth = await getQueueHealth();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PayPal Order Processor',
    email: {
      ok: Boolean(emailHealth && emailHealth.ok),
      error: emailHealth && emailHealth.error,
      queue: Boolean(queueHealth && queueHealth.ok),
      pendingJobs: (queueHealth && typeof queueHealth.pendingJobs === 'number')
        ? queueHealth.pendingJobs
        : 0,
      queueError: queueHealth && queueHealth.error,
    },
  });
});

module.exports = app;

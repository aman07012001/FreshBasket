require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const http = require('http');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const reviewsRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const emailStatusRoutes = require('./routes/emailStatus');
const { router: monitoringRouter, trackPerformance } = require('./routes/monitoring');
const { env } = require('./config');
const { initializeWebSocket } = require('./services/websocketService');
const requestProfiler = require('./middleware/requestProfiler');
const dbMonitor = require('./utils/dbMonitor');

const app = express();
const PORT = env.PORT || 5000;

const httpServer = http.createServer(app);

app.use(requestProfiler);

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
console.log('🌐 CORS Configuration:', {
  allowedOrigins: allowedOrigins,
  credentials: true
});

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('🌐 CORS Check:', {
        requestOrigin: origin,
        allowedOrigins: allowedOrigins,
        isOriginAllowed: origin ? allowedOrigins.includes(origin) : false
      });

      if (!origin) {
        console.log('🌐 No origin provided, allowing first allowed origin:', allowedOrigins[0]);
        return callback(null, allowedOrigins[0]);
      }
      if (allowedOrigins.includes(origin)) {
        console.log('🌐 Origin allowed:', origin);
        return callback(null, origin);
      }
      console.log('🌐 Origin NOT allowed:', origin);
      return callback(new Error('CORS origin not allowed'), false);
    },
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
    maxAge: 86400,
  })
);

app.use(cookieParser());
console.log('🍪 Cookie parser middleware loaded');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailStatusRoutes);
app.use('/api/monitoring', monitoringRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PayPal Order Processor'
  });
});

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 5,
  bufferCommands: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

console.log('🔍 MongoDB Connection Configuration:');
console.log('  MONGO_URL:', env.MONGO_URL ? env.MONGO_URL.substring(0, 20) + '...' : 'NOT SET');
console.log('  Options:', JSON.stringify(mongooseOptions, null, 2));
console.log('  Node.js version:', process.version);
console.log('  Mongoose version:', require('mongoose/package.json').version);
console.log('  MongoDB driver version:', require('mongodb/package.json').version);

mongoose
  .connect(env.MONGO_URL, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    dbMonitor.init();
    dbMonitor.testConnection();
    console.log('📊 MongoDB Stats:', dbMonitor.getConnectionStats());

    const io = initializeWebSocket(httpServer);

    const serverStart = Date.now();
    console.log(`Attempting to start server on port ${PORT}...`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node.js version: ${process.version}`);

    function startServer(port, retryCount = 0) {
      httpServer.listen(port, () => {
        const startupTime = Date.now() - serverStart;
        console.log(`✅ PayPal Order Server running on port ${port}`);
        console.log(`🚀 Server startup completed in ${startupTime}ms`);
        console.log('WebSocket server initialized');
      });

      httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retryCount < 3) {
          const nextPort = port + 1;
          console.error(`❌ Port ${port} is already in use!`);
          console.error(`🔄 Attempting to start on port ${nextPort} (retry ${retryCount + 1}/3)`);

          httpServer.close(() => {
            startServer(nextPort, retryCount + 1);
          });
        } else if (err.code === 'EADDRINUSE') {
          console.error(`❌ Failed to start server after 3 retries. All ports from ${PORT} to ${PORT + 2} are in use.`);

          const { exec } = require('child_process');
          const command = process.platform === 'win32'
            ? `netstat -ano | findstr :${PORT}`
            : `lsof -i :${PORT}`;

          exec(command, (error, stdout) => {
            if (stdout) {
              console.log(`Processes using port ${PORT}:`);
              console.log(stdout);
            }
          });

          process.exit(1);
        } else {
          console.error(`❌ Server error: ${err.message}`);
          process.exit(1);
        }
      });
    }

    startServer(PORT);
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });

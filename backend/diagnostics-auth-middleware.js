#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { env, JWT_SECRET } = require('./config');

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, allowedOrigins[0]);
    if (allowedOrigins.includes(origin)) return callback(null, origin);
    return callback(new Error('CORS origin not allowed'), false);
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
}));

app.use(cookieParser());
app.use(express.json());

function testAuthMiddleware(req, res, next) {
  console.log('🔍 [TEST] Auth Middleware START');
  console.log('   Method:', req.method);
  console.log('   URL:', req.originalUrl);
  console.log('   Headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'No auth header',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'origin': req.headers.origin
  });
  console.log('   Cookies:', req.cookies);

  let token = null;
  let tokenSource = 'none';

  if (req.cookies) {
    token = req.cookies['access-token'] || req.cookies['auth_token'] || req.cookies['access_token'] || null;
    if (token) tokenSource = 'cookie';
    console.log('   Cookie token found:', !!token);
  }

  if (!token) {
    const authHeader = req.get('Authorization') || req.headers.authorization || '';
    console.log('   Auth header:', authHeader ? 'Present' : 'Missing');
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
      tokenSource = 'header';
      console.log('   Bearer token extracted:', !!token);
    }
  }

  console.log('   Final token:', token ? 'Found' : 'Missing', '(' + tokenSource + ')');

  if (!token) {
    console.log('   ❌ No token found - authentication failed');
    return res.status(401).json({
      error: 'No access token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    console.log('   🔍 Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('   ✅ JWT verified successfully');
    console.log('   - Decoded payload:', {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
      emailVerified: decoded.emailVerified,
      iat: decoded.iat,
      exp: decoded.exp
    });

    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
      emailVerified: decoded.emailVerified,
    };

    console.log('   ✅ User attached to request:', req.user.id);
    return next();
  } catch (error) {
    console.error('   ❌ JWT verification failed:', {
      name: error.name,
      message: error.message,
      code: error.code
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      error: 'Invalid token. Please log in again.',
      code: 'INVALID_TOKEN'
    });
  }
}

app.get('/api/test/auth', testAuthMiddleware, (req, res) => {
  console.log('✅ [TEST] Authenticated route reached successfully');
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/public', (req, res) => {
  console.log('✅ [TEST] Public route reached successfully');
  res.json({
    success: true,
    message: 'Public route working',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Auth Diagnostic Server'
  });
});

const PORT = 5001;

console.log('🔍 Authentication Middleware Diagnostic Server');
console.log('==============================================');
console.log(`Server starting on port ${PORT}`);
console.log(`Test endpoints:`);
console.log(`  - Public: http://localhost:${PORT}/api/test/public`);
console.log(`  - Auth: http://localhost:${PORT}/api/test/auth`);
console.log('');

const testUser = {
  sub: 'test-user-id',
  email: 'test@example.com',
  role: 'user',
  emailVerified: true
};

const testToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
console.log('🧪 Test Token (valid for 1 hour):');
console.log(testToken);
console.log('');

app.listen(PORT, () => {
  console.log(`✅ Diagnostic server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Test commands:');
  console.log(`curl http://localhost:${PORT}/api/test/public`);
  console.log(`curl -H "Authorization: Bearer ${testToken}" http://localhost:${PORT}/api/test/auth`);
  console.log('');
  console.log('Or test with cookies:');
  console.log(`curl -b "access_token=${testToken}" http://localhost:${PORT}/api/test/auth`);
});
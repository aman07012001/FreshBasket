const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function auth(required = true) {
  return (req, res, next) => {
    const authStart = Date.now();
    const requestId = req._requestId || 'unknown';

    console.log(`🔐 [${requestId}] Auth Middleware START`);
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.originalUrl}`);
    console.log(`   Required: ${required}`);
    console.log(`   Cookies: ${Object.keys(req.cookies || {})}`);

    let token = null;
    let tokenSource = 'none';

    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken) {
        token = localStorageToken;
        tokenSource = 'localStorage';
        console.log(`   LocalStorage token found: ${!!token}`);
      }
    }

    if (!token && req.cookies) {
      console.log(`   All cookies received:`, Object.keys(req.cookies));
      console.log(`   Cookie values:`, req.cookies);

      token = req.cookies['access-token'] || req.cookies['auth_token'] || req.cookies['access_token'] || null;
      if (token) tokenSource = 'cookie';
      console.log(`   Cookie token found: ${!!token}`);

      const cookieKeys = Object.keys(req.cookies || {});
      const potentialTokenKeys = cookieKeys.filter(key =>
        key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')
      );
      console.log(`   Potential token cookie keys:`, potentialTokenKeys);
    }

    if (!token) {
      const authHeader = req.get('Authorization') || req.headers.authorization || '';
      console.log(`   Auth header: ${authHeader ? 'Present' : 'Missing'}`);
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
        tokenSource = 'header';
        console.log(`   Bearer token extracted: ${!!token}`);
      }
    }

    console.log(`   Final token: ${token ? 'Found' : 'Missing'} (${tokenSource})`);

    if (!token) {
      if (!required) {
        console.log(`   ✅ [${requestId}] Optional auth - proceeding without token`);
        return next();
      }
      console.log(`   ❌ [${requestId}] Required auth failed - no token`);
      return res.status(401).json({
        error: 'No access token provided.',
        code: 'NO_TOKEN',
        requestId
      });
    }

    try {
      console.log(`   🔍 [${requestId}] Verifying JWT token...`);
      const jwtStart = Date.now();

      const decoded = jwt.verify(token, JWT_SECRET);

      const jwtEnd = Date.now();
      console.log(`   ✅ [${requestId}] JWT verified successfully in ${jwtEnd - jwtStart}ms`);
      console.log(`   - Decoded payload:`, {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        emailVerified: decoded.emailVerified,
        iat: decoded.iat,
        exp: decoded.exp
      });

      if ((jwtEnd - jwtStart) > 100) {
        console.warn(`⚠️  [${requestId}] SLOW JWT VERIFICATION: ${jwtEnd - jwtStart}ms`);
      }

      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        emailVerified: decoded.emailVerified,
      };

      const authEnd = Date.now();
      console.log(`   ✅ [${requestId}] User attached to request: ${req.user.id} (Total: ${authEnd - authStart}ms)`);

      if ((authEnd - authStart) > 200) {
        console.warn(`⚠️  [${requestId}] SLOW AUTH MIDDLEWARE: ${authEnd - authStart}ms`);
      }

      return next();
    } catch (error) {
      const authEnd = Date.now();
      console.error(`   ❌ [${requestId}] JWT verification failed after ${authEnd - authStart}ms:`, {
        name: error.name,
        message: error.message,
        code: error.code
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
          requestId
        });
      }

      return res.status(401).json({
        error: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN',
        requestId
      });
    }
  };
}

module.exports = auth;

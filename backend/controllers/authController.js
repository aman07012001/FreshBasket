const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createClient } = require('redis');
const mongoose = require('mongoose');
const User = require('../models/User');
const EmailToken = require('../models/EmailToken');
const { env, JWT_SECRET, ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_DAYS } = require('../config');
const { queueEmail } = require('../queue/emailQueue');

const ACCESS_COOKIE_NAME = 'access_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const accessCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/',
  maxAge: ACCESS_TOKEN_TTL_MS,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/api/auth/refresh',
  maxAge: REFRESH_TOKEN_TTL_MS,
};

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000; 
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; 

let redisClient = null;

if (env.REDIS_URL) {
  redisClient = createClient({ url: env.REDIS_URL });
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message);
  });
  redisClient
    .connect()
    .then(() => console.log('✅ Connected to Redis'))
    .catch((err) => {
      console.error('❌ Failed to connect to Redis, falling back to DB-based session revocation:', err.message);
      redisClient = null;
    });
}

function sanitizeUser(user) {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : user;
  const { passwordHash, __v, ...rest } = plain;
  return rest;
}

function signAccessToken(user) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
  const expiresInSeconds = Math.floor(ACCESS_TOKEN_TTL_MS / 1000);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

function generateRefreshId() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshTtlSeconds(session) {
  if (!session) return 0;
  const createdAt = session.createdAt ? new Date(session.createdAt).getTime() : Date.now();
  const now = Date.now();
  const elapsed = now - createdAt;
  const remainingMs = REFRESH_TOKEN_TTL_MS - elapsed;
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 0;
  return Math.floor(remainingMs / 1000);
}

async function blacklistRefreshId(refreshId, ttlSeconds) {
  if (!redisClient) return;
  try {
    if (!refreshId || ttlSeconds <= 0) return;
    const key = `rtbl:${refreshId}`;
    await redisClient.setEx(key, ttlSeconds, '1');
  } catch (err) {
    console.error('Failed to blacklist refresh token in Redis:', err.message);
  }
}

async function isRefreshIdBlacklisted(refreshId) {
  if (!redisClient) return false;
  try {
    const key = `rtbl:${refreshId}`;
    const val = await redisClient.get(key);
    return Boolean(val);
  } catch (err) {
    console.error('Failed to check refresh token blacklist in Redis:', err.message);
    return false;
  }
}

async function sendMail({ to, subject, html, text, meta }) {
  try {
    const result = await queueEmail({
      to,
      subject,
      html,
      text,
      meta,
      priority: (meta && meta.priority) || undefined,
    });

    if (!result || !result.success) {
      const errorMessage = (result && result.error) || 'Unknown email error';
      console.error('Error queuing email:', errorMessage);
    }

    return result;
  } catch (err) {
    console.error('Error queuing email:', err.message || err);
    return { success: false, attempts: 0, error: err.message || String(err) };
  }
}

function setAuthCookies(res, accessToken, refreshId) {
  console.log('🍪 Setting auth cookies:', {
    ACCESS_COOKIE_NAME: ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME: REFRESH_COOKIE_NAME,
    accessTokenLength: accessToken ? accessToken.length : 0,
    refreshIdLength: refreshId ? refreshId.length : 0,
    accessCookieOptions: accessCookieOptions,
    refreshCookieOptions: refreshCookieOptions
  });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, refreshId, refreshCookieOptions);

  console.log('✅ Cookies set successfully');
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: accessCookieOptions.path, domain: accessCookieOptions.domain });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path, domain: refreshCookieOptions.domain });
}

function getClientInfo(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || '';
  const userAgent = req.get('User-Agent') || 'unknown';
  const device = req.body && req.body.device ? String(req.body.device) : 'unknown';
  return { ip, userAgent, device };
}

async function register(req, res) {
  try {
    let { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const passwordRegex = /^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long and contain at least one uppercase letter.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'user' });

    const refreshId = generateRefreshId();
    const { ip, userAgent, device } = getClientInfo(req);
    user.sessions.push({ refreshId, ip, userAgent, device });
    await user.save();

    const accessToken = signAccessToken(user);
    setAuthCookies(res, accessToken, refreshId);

    console.log('🔐 Register response:', {
      user: sanitizeUser(user),
      accessTokenLength: accessToken.length,
      refreshIdLength: refreshId.length
    });

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    let { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const refreshId = generateRefreshId();
    const { ip, userAgent, device } = getClientInfo(req);
    user.sessions.push({ refreshId, ip, userAgent, device });
    await user.save();

    const accessToken = signAccessToken(user);
    setAuthCookies(res, accessToken, refreshId);

    console.log('🔐 Login response:', {
      user: sanitizeUser(user),
      accessTokenLength: accessToken.length,
      refreshIdLength: refreshId.length
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const refreshId = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshId) {
      return res.status(401).json({ error: 'Missing refresh token.' });
    }

    const user = await User.findOne({ 'sessions.refreshId': refreshId });
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const session = user.sessions.find((s) => s.refreshId === refreshId);
    if (!session || session.revoked) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Session revoked.' });
    }

    if (await isRefreshIdBlacklisted(refreshId)) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh token has been revoked.' });
    }

    const newRefreshId = generateRefreshId();
    const ttlSeconds = getRefreshTtlSeconds(session);
    await blacklistRefreshId(refreshId, ttlSeconds);

    session.refreshId = newRefreshId;
    session.lastUsedAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    setAuthCookies(res, accessToken, newRefreshId);

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const refreshId = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshId) {
      clearAuthCookies(res);
      return res.status(204).send();
    }

    const user = await User.findOne({ 'sessions.refreshId': refreshId });
    if (user) {
      const session = user.sessions.find((s) => s.refreshId === refreshId);
      if (session) {
        session.revoked = true;
        await user.save();

        const ttlSeconds = getRefreshTtlSeconds(session);
        await blacklistRefreshId(refreshId, ttlSeconds);
      }
    }

    clearAuthCookies(res);
    return res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/request-password-reset
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    console.log('🔐 Password reset request for email:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('🔐 No user found for email:', normalizedEmail, '- returning success message for security');
      return res.status(200).json({ message: 'If that account exists, you will receive an email shortly.' });
    }

    console.log('🔐 User found:', {
      userId: user._id.toString(),
      email: user.email,
      emailVerified: user.emailVerified
    });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    console.log('🔐 Creating email token with hash:', tokenHash.substring(0, 10) + '...');

    await EmailToken.create({
      userId: user._id,
      tokenHash,
      type: 'reset',
      expiresAt,
      used: false,
    });

    console.log('🔐 Email token created successfully');

    const baseUrl = env.FRONTEND_URL.replace(/\/$/, '');
    const resetUrl = `${baseUrl}/reset?token=${token}&uid=${user._id.toString()}`;

    console.log('🔐 Reset URL generated:', resetUrl);

    const subject = 'Reset your Grocery account password';
    const html = `<p>You requested a password reset for your Grocery account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a>. This link is valid for 15 minutes.</p>`;
    const text = `You requested a password reset for your Grocery account. Reset your password using this link (valid for 15 minutes): ${resetUrl}`;

    console.log('🔐 Email content prepared:', {
      to: user.email,
      subject: subject,
      htmlLength: html.length,
      textLength: text.length
    });

    // Check Redis and queue configuration
    console.log('🔐 Email system configuration:', {
      REDIS_URL: env.REDIS_URL ? 'SET' : 'NOT SET',
      EMAIL_QUEUE_ENABLED: env.EMAIL_QUEUE_ENABLED,
      EMAIL_QUEUE_ENABLED_BOOL: env.EMAIL_QUEUE_ENABLED === 'true'
    });

    // DIAGNOSTIC: Check if Redis URL is properly configured
    if (!env.REDIS_URL) {
      console.warn('🔐 WARNING: REDIS_URL is not set - email queue will fall back to inline sending');
    }

    // DIAGNOSTIC: Check SMTP configuration
    console.log('🔐 SMTP Configuration Check:', {
      SMTP_HOST: env.SMTP_HOST ? 'SET' : 'NOT SET',
      SMTP_PORT: env.SMTP_PORT,
      SMTP_USER: env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: env.SMTP_PASS ? 'SET' : 'NOT SET',
      EMAIL_FROM: env.EMAIL_FROM ? 'SET' : 'NOT SET'
    });

    // DIAGNOSTIC: Check if email queue is enabled and Redis is available
    const queueEnabled = env.EMAIL_QUEUE_ENABLED === 'true' && env.REDIS_URL;
    console.log('🔐 Queue Status:', {
      queueEnabled: queueEnabled,
      willUseQueue: queueEnabled,
      willUseInline: !queueEnabled
    });

    // CRITICAL DIAGNOSTIC: Identify the exact problem
    if (env.EMAIL_QUEUE_ENABLED === 'true' && !env.REDIS_URL) {
      console.error('🔐 CRITICAL DIAGNOSIS: Email queue is enabled but Redis URL is missing!');
      console.error('🔐 This causes queueEmail to fail and fall back to inline sending.');
      console.error('🔐 The error "Redis is not configured for email queue" comes from this misconfiguration.');
    }

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM) {
      console.error('🔐 CRITICAL DIAGNOSIS: SMTP configuration is incomplete!');
      console.error('🔐 Missing required fields:', {
        SMTP_HOST: !env.SMTP_HOST,
        SMTP_USER: !env.SMTP_USER,
        SMTP_PASS: !env.SMTP_PASS,
        EMAIL_FROM: !env.EMAIL_FROM
      });
    }

    const emailResult = await sendMail({
      to: user.email,
      subject,
      html,
      text,
      meta: {
        type: 'forgot-password',
        userId: user._id.toString()
      }
    });

    console.log('🔐 Password reset email result:', {
      success: emailResult.success,
      jobId: emailResult.jobId,
      attempts: emailResult.attempts,
      error: emailResult.error,
      to: user.email,
      subject: subject
    });

    // Even if email sending fails, we still return success for security reasons
    // (to prevent email enumeration attacks)
    console.log('🔐 Returning success response regardless of email delivery status for security');

    return res.status(200).json({
      message: 'If that account exists, you will receive an email shortly.',
      emailJobId: emailResult.jobId
    });
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { uid, token, password } = req.body || {};

    if (!uid || !token || !password) {
      return res.status(400).json({ error: 'uid, token and password are required.' });
    }

    // Validate that uid is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const passwordRegex = /^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long and contain at least one uppercase letter.' });
    }

    const tokenHash = hashToken(token);
    const now = new Date();

    const emailToken = await EmailToken.findOne({
      userId: uid,
      type: 'reset',
      tokenHash,
      used: false,
      expiresAt: { $gt: now },
    });

    if (!emailToken) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;

    if (Array.isArray(user.sessions) && user.sessions.length > 0) {
      user.sessions = user.sessions.map((s) => {
        const plain = s.toObject ? s.toObject() : s;
        return { ...plain, revoked: true };
      });
    }

    await user.save();

    emailToken.used = true;
    await emailToken.save();

    return res.status(200).json({ message: 'Password has been reset.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/send-verify-email
async function sendVerifyEmail(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

    await EmailToken.create({
      userId: user._id,
      tokenHash,
      type: 'verify',
      expiresAt,
      used: false,
    });

    const baseUrl = env.FRONTEND_URL.replace(/\/$/, '');
    const verifyUrl = `${baseUrl}/verify-email?token=${token}&uid=${user._id.toString()}`;

    const subject = 'Verify your Grocery account email';
    const html = `<p>Welcome to Grocery!</p>
      <p><a href="${verifyUrl}">Click here to verify your email address</a>. This link is valid for 24 hours.</p>`;
    const text = `Verify your Grocery account email (valid for 24 hours): ${verifyUrl}`;

    const emailResult = await sendMail({
      to: user.email,
      subject,
      html,
      text,
      meta: {
        type: 'verify-email',
        userId: user._id.toString()
      }
    });

    console.log('🔐 Email verification result:', {
      success: emailResult.success,
      jobId: emailResult.jobId,
      attempts: emailResult.attempts,
      error: emailResult.error,
      to: user.email,
      subject: subject
    });

    if (!emailResult || !emailResult.success) {
      console.error('🔐 Email verification failed:', {
        error: emailResult.error,
        attempts: emailResult.attempts,
        to: user.email,
        subject: subject
      });
      return res.status(500).json({
        error: 'Failed to send verification email.',
        details: emailResult.error
      });
    }

    return res.status(200).json({
      message: 'Verification email sent.',
      emailJobId: emailResult.jobId
    });
  } catch (error) {
    console.error('sendVerifyEmail error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    const uid = (req.body && req.body.uid) || (req.query && req.query.uid);
    const token = (req.body && req.body.token) || (req.query && req.query.token);

    if (!uid || !token) {
      return res.status(400).json({ error: 'uid and token are required.' });
    }

    const tokenHash = hashToken(token);
    const now = new Date();

    const emailToken = await EmailToken.findOne({
      userId: uid,
      type: 'verify',
      tokenHash,
      used: false,
      expiresAt: { $gt: now },
    });

    if (!emailToken) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.emailVerified = true;
    await user.save();

    emailToken.used = true;
    await emailToken.save();

    return res.status(200).json({ message: 'Email verified.', user: sanitizeUser(user) });
  } catch (error) {
    console.error('verifyEmail error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// GET /api/auth/sessions
async function listSessions(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const sessions = (user.sessions || []).map((s) => ({
      id: s._id.toString(),
      device: s.device,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      revoked: s.revoked,
    }));

    return res.json({ sessions });
  } catch (error) {
    console.error('listSessions error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/sessions/:sessionId/revoke
async function revokeSession(req, res) {
  try {
    const userId = req.user && req.user.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const session = user.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.revoked) {
      return res.status(200).json({ message: 'Session already revoked.' });
    }

    const oldRefreshId = session.refreshId;
    session.revoked = true;
    await user.save();

    if (oldRefreshId) {
      const ttlSeconds = getRefreshTtlSeconds(session);
      await blacklistRefreshId(oldRefreshId, ttlSeconds);
    }

    const currentRefresh = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (currentRefresh && oldRefreshId && currentRefresh === oldRefreshId) {
      clearAuthCookies(res);
    }

    return res.status(200).json({ message: 'Session revoked.' });
  } catch (error) {
    console.error('revokeSession error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// PUT /api/auth/me
async function updateMe(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { name, phone, address, avatar } = req.body || {};

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('updateMe error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/logout-all
async function logoutAll(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Revoke all sessions
    const activeSessions = (user.sessions || []).filter(s => !s.revoked);

    for (const session of activeSessions) {
      session.revoked = true;
      const ttlSeconds = getRefreshTtlSeconds(session);
      await blacklistRefreshId(session.refreshId, ttlSeconds);
    }

    await user.save();
    clearAuthCookies(res);

    return res.status(200).json({ message: 'Logged out from all devices.' });
  } catch (error) {
    console.error('logoutAll error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// GET /api/auth/admin/users
async function getAdminUsers(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const users = await User.find()
      .select('-passwordHash -sessions')
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await User.countDocuments();

    return res.status(200).json({ users, total });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  sendVerifyEmail,
  verifyEmail,
  listSessions,
  revokeSession,
  updateMe,
  logoutAll,
  getAdminUsers,
};

module.exports.__testUtils = {
  signAccessToken,
  generateRefreshId,
  hashToken,
};

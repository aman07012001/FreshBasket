const express = require('express');
const rateLimit = require('express-rate-limit');
const {
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
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { requireVerified, requireRole } = require('../middleware/roles');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/request-password-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/me', auth(false), me);
router.put('/me', auth(), updateMe);
router.post('/logout-all', auth(), logoutAll);
router.post('/send-verify-email', auth(), sendVerifyEmail);
router.get('/sessions', auth(), listSessions);
router.post('/sessions/:sessionId/revoke', auth(), revokeSession);

router.get('/admin/users', auth(), requireRole('admin'), getAdminUsers);

module.exports = router;

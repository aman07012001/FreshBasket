 function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (req.user.emailVerified !== true) {
    return res.status(403).json({ error: 'Email not verified.' });
  }

  return next();
 }

 function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
 }

 module.exports = { requireVerified, requireRole };

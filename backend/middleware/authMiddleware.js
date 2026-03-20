const auth = require('./auth');

function requireAuth(req, res, next) {
  return auth(true)(req, res, next);
}

module.exports = { requireAuth };

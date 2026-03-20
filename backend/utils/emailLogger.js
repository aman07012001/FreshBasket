

const { env } = require('../config');

function shouldLog() {
  return String(env.EMAIL_ENABLE_LOGGING || 'true').toLowerCase() === 'true';
}

function formatPayload(payload) {
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

const emailLogger = {
  info(message, payload = {}) {
    if (!shouldLog()) return;

    console.info(`[email] ${message}`, formatPayload(payload));
  },
  warn(message, payload = {}) {
    if (!shouldLog()) return;

    console.warn(`[email] ${message}`, formatPayload(payload));
  },
  error(message, payload = {}) {
    if (!shouldLog()) return;

    console.error(`[email] ${message}`, formatPayload(payload));
  },
};

module.exports = { emailLogger };

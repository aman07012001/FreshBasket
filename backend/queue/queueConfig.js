const { Queue } = require('bullmq');
const { env } = require('../config');
const { emailLogger } = require('../utils/emailLogger');

const QUEUE_NAME = 'emails';

let emailQueueInstance = null;

function isQueueEnabled() {
  const redisUrlSet = !!env.REDIS_URL;
  const raw = env.EMAIL_QUEUE_ENABLED != null ? String(env.EMAIL_QUEUE_ENABLED) : 'true';
  const enabled = raw.toLowerCase() === 'true';

  console.log('🔧 Queue enabled check:', {
    REDIS_URL: redisUrlSet ? 'SET' : 'NOT SET',
    EMAIL_QUEUE_ENABLED: env.EMAIL_QUEUE_ENABLED,
    enabled: enabled,
    finalResult: redisUrlSet && enabled
  });

  if (!redisUrlSet) return false;
  return enabled;
}

function getConnection() {
  if (!env.REDIS_URL) {
    console.log('🔧 No Redis connection - REDIS_URL not set');
    return null;
  }

  console.log('🔧 Redis connection configured:', {
    REDIS_URL: env.REDIS_URL ? env.REDIS_URL.substring(0, 20) + '...' : 'NOT SET'
  });

  return {
    connection: {
      url: env.REDIS_URL,
    },
  };
}

function getEmailQueue() {
  if (!isQueueEnabled()) {
    console.log('🔧 Email queue disabled - returning null');
    return null;
  }

  if (!emailQueueInstance) {
    const base = getConnection();
    if (!base) {
      console.error('🔧 Email queue requested but connection is null');
      if (emailLogger && emailLogger.error) {
        emailLogger.error('Email queue requested but REDIS_URL is not configured');
      }
      return null;
    }

    console.log('🔧 Creating new Queue instance with connection:', !!base);
    try {
      emailQueueInstance = new Queue(QUEUE_NAME, base);
      console.log('🔧 Queue instance created successfully');
    } catch (error) {
      console.error('🔧 Failed to create Queue instance:', error.message);
      return null;
    }
  }

  return emailQueueInstance;
}

function getQueueJobOptions({ priority, delay, jobId } = {}) {
  const attempts = Number(env.EMAIL_QUEUE_ATTEMPTS || 5);
  const backoffMs = Number(env.EMAIL_QUEUE_BACKOFF_MS || 2000);
  const enablePriorityRaw = env.EMAIL_QUEUE_PRIORITY_ENABLED != null
    ? String(env.EMAIL_QUEUE_PRIORITY_ENABLED)
    : 'true';
  const priorityEnabled = enablePriorityRaw.toLowerCase() === 'true';

  const opts = {
    attempts,
    backoff: {
      type: 'exponential',
      delay: backoffMs,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  };

  if (priorityEnabled && priority != null) {
    opts.priority = priority;
  }
  if (delay != null) {
    opts.delay = delay;
  }
  if (jobId) {
    opts.jobId = jobId;
  }

  return opts;
}

async function getQueueHealth() {
  try {
    const queue = getEmailQueue();
    if (!queue) {
      return {
        ok: false,
        pendingJobs: 0,
        error: 'Email queue disabled or Redis not configured',
      };
    }

    const waiting = await queue.getWaitingCount();
    return {
      ok: true,
      pendingJobs: waiting,
    };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (emailLogger && emailLogger.error) {
      emailLogger.error('Email queue health check failed', { error: message });
    }
    return {
      ok: false,
      pendingJobs: 0,
      error: message,
    };
  }
}

module.exports = {
  QUEUE_NAME,
  isQueueEnabled,
  getConnection,
  getEmailQueue,
  getQueueJobOptions,
  getQueueHealth,
};

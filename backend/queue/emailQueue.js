const { getEmailQueue, getQueueJobOptions, isQueueEnabled } = require('./queueConfig');
const { emailLogger } = require('../utils/emailLogger');
const { sendEmail } = require('../utils/emailService');
const { env } = require('../config');

async function queueEmail({ to, subject, html, text, meta, priority, delay }) {
  const jobData = {
    to,
    subject,
    html,
    text,
    meta: meta || {},
  };

  console.log('📧 queueEmail called with:', {
    to,
    subject,
    hasHtml: !!html,
    hasText: !!text,
    meta: meta || {},
    priority,
    delay,
    queueEnabled: isQueueEnabled()
  });

  try {
    const enabled = isQueueEnabled();
    const queue = getEmailQueue();

    console.log('📧 Queue configuration check:', {
      enabled: enabled,
      queueInstance: !!queue,
      redisUrl: env.REDIS_URL ? 'SET' : 'NOT SET',
      redisUrlValue: env.REDIS_URL || 'NOT SET'
    });

    console.log('📧 Redis Configuration Diagnostic:', {
      REDIS_URL: env.REDIS_URL || 'NOT SET',
      EMAIL_QUEUE_ENABLED: env.EMAIL_QUEUE_ENABLED,
      queueEnabled: enabled,
      queueInstance: !!queue,
      isRedisConfigured: !!env.REDIS_URL,
      isQueueWorking: enabled && !!queue
    });

    if (env.EMAIL_QUEUE_ENABLED === 'true' && !env.REDIS_URL) {
      console.error('📧 CRITICAL DIAGNOSIS: Email queue is enabled but Redis URL is not configured!');
      console.error('📧 This is the root cause of the password reset failure.');
    }

    if (!enabled) {
      console.warn('📧 Queue is disabled - EMAIL_QUEUE_ENABLED:', env.EMAIL_QUEUE_ENABLED);
    }
    if (!queue) {
      console.warn('📧 Queue instance is null - this could indicate Redis connection issues');
    }

    if (enabled && queue) {
      console.log('📧 Using Redis queue for email delivery');
      const opts = getQueueJobOptions({ priority, delay, jobId: jobData.meta && jobData.meta.jobId });
      console.log('📧 Queue job options:', opts);

      try {
        const job = await queue.add('send-email', jobData, opts);

        console.log('📧 Email job enqueued successfully:', {
          jobId: job.id,
          to,
          subject,
          priority: opts.priority,
          delay: opts.delay || 0,
        });

        if (emailLogger && emailLogger.info) {
          emailLogger.info('Email job enqueued', {
            jobId: job.id,
            to,
            subject,
            priority: opts.priority,
            delay: opts.delay || 0,
          });
        }

        return { success: true, enqueued: true, jobId: job.id };
      } catch (queueError) {
        console.error('📧 Failed to enqueue email job:', {
          error: queueError.message,
          to,
          subject,
          stack: queueError.stack
        });

        console.log('📧 Falling back to inline sending due to queue error');
      }
    }

    console.log('📧 Email queue disabled or unavailable; falling back to inline sending');
    if (emailLogger && emailLogger.warn) {
      emailLogger.warn('Email queue disabled or unavailable; sending inline', { to, subject });
    }

    console.log('📧 Attempting inline email send...');
    const result = await sendEmail(jobData);
    console.log('📧 Inline email send result:', result);
    return result;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.error('📧 queueEmail error:', {
      error: message,
      to,
      subject,
      stack: err.stack
    });

    if (emailLogger && emailLogger.error) {
      emailLogger.error('Failed to enqueue or send email', {
        to,
        subject,
        error: message,
      });
    }

    return { success: false, attempts: 0, error: message };
  }
}

module.exports = {
  queueEmail,
};

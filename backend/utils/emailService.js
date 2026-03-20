const nodemailer = require('nodemailer');
const { env } = require('../config');
const EmailLog = require('../models/EmailLog');
const { emailLogger } = require('./emailLogger');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: Number(env.SMTP_PORT) === 465,
      auth: env.SMTP_USER
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    });
  }
  return transporter;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
  meta,
  maxRetries,
  backoffMs,
  jitterMax,
}) {
  console.log('📨 sendEmail called with:', {
    to,
    subject,
    hasHtml: !!html,
    hasText: !!text,
    meta: meta || {},
    maxRetries: maxRetries,
    backoffMs: backoffMs,
    jitterMax: jitterMax
  });

  const effectiveMaxRetries = Number(
    maxRetries != null ? maxRetries : env.EMAIL_MAX_RETRIES || 3,
  );
  const baseDelayMs = Number(
    backoffMs != null ? backoffMs : env.EMAIL_BACKOFF_MULTIPLIER || 1500,
  );
  const maxDelayMs = Number(env.EMAIL_BACKOFF_MAX || 5000);
  const jitterLimit = Number(
    jitterMax != null ? jitterMax : env.EMAIL_JITTER_MAX || 300,
  );

  console.log('📨 Email configuration:', {
      effectiveMaxRetries,
      baseDelayMs,
      maxDelayMs,
      jitterLimit,
      EMAIL_FROM: env.EMAIL_FROM,
      SMTP_HOST: env.SMTP_HOST,
      SMTP_PORT: env.SMTP_PORT,
      SMTP_USER: env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: env.SMTP_PASS ? 'SET' : 'NOT SET'
    });

    const requiredSettings = {
      SMTP_HOST: env.SMTP_HOST,
      SMTP_PORT: env.SMTP_PORT,
      EMAIL_FROM: env.EMAIL_FROM
    };

    const missingSettings = Object.entries(requiredSettings)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingSettings.length > 0) {
      console.error('📨 Missing required SMTP settings:', missingSettings);
      throw new Error(`Missing required SMTP settings: ${missingSettings.join(', ')}`);
    }

    const hasAuth = !!(env.SMTP_USER && env.SMTP_PASS);
    console.log('📨 SMTP Authentication:', {
      configured: hasAuth,
      user: env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: env.SMTP_PASS ? 'SET' : 'NOT SET'
    });

    const logEntry = new EmailLog({
    to,
    subject,
    status: 'pending',
    attemptCount: 0,
    meta,
  });

  console.log('📨 Creating EmailLog entry:', {
    to,
    subject,
    meta: meta || {}
  });

  let attempt = 0;
  let lastError = null;

  while (attempt < effectiveMaxRetries) {
    attempt += 1;
    logEntry.attemptCount = attempt;

    console.log(`📨 Email send attempt ${attempt}/${effectiveMaxRetries}`);

    try {
      emailLogger.info('Email send attempt', { to, subject, attempt });

      const mailer = getTransporter();
      console.log('📨 Transporter created, attempting to send email...');

      const result = await mailer.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });

      console.log('📨 Email sent successfully:', {
        messageId: result && result.messageId,
        accepted: result && result.accepted,
        rejected: result && result.rejected,
        pending: result && result.pending
      });

      logEntry.status = 'sent';
      logEntry.lastError = undefined;
      await logEntry.save().catch(() => {});

      const messageId = result && result.messageId ? result.messageId : undefined;
      emailLogger.info('Email delivered', { to, subject, attempt, messageId });

      return { success: true, attempts: attempt, messageId };
    } catch (err) {
      lastError = err;
      const message = err && err.message ? err.message : String(err);
      logEntry.lastError = message;

      console.error(`📨 Email send attempt ${attempt} failed:`, {
        error: message,
        stack: err.stack
      });

      emailLogger.error('Email send error', { to, subject, attempt, error: message });

      if (attempt >= effectiveMaxRetries) {
        console.error('📨 Max retries reached, marking as failed');
        logEntry.status = 'failed';
        await logEntry.save().catch(() => {});

        return {
          success: false,
          attempts: attempt,
          error: message,
        };
      }

      const jitter = jitterLimit > 0 ? Math.floor(Math.random() * jitterLimit) : 0;
      const rawDelay = Math.pow(2, attempt) * baseDelayMs + jitter;
      const delay = Math.min(rawDelay, maxDelayMs);

      console.log(`📨 Scheduling retry ${attempt + 1} in ${delay}ms`);

      emailLogger.warn('Email send retry scheduled', {
        to,
        subject,
        attempt,
        nextDelayMs: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const fallbackError = lastError && lastError.message ? lastError.message : 'Unknown email error';
  console.error('📨 Email send failed after all retries:', fallbackError);

  emailLogger.error('Email send failed after max retries', {
    to,
    subject,
    attempts: attempt,
    error: fallbackError,
  });

  return { success: false, attempts: attempt, error: fallbackError };
}

async function checkTransport() {
  try {
    const mailer = getTransporter();
    await mailer.verify();
    emailLogger.info('Email transport healthy');
    return { ok: true };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    emailLogger.error('Email transport check failed', { error: message });
    return { ok: false, error: message };
  }
}

module.exports = {
  sendEmail,
  checkTransport,
};

require('dotenv').config();

const mongoose = require('mongoose');
const { Worker, QueueEvents } = require('bullmq');
const { env } = require('../config');
const { emailLogger } = require('../utils/emailLogger');
const { sendEmail } = require('../utils/emailService');
const Order = require('../models/Order');
const { QUEUE_NAME, getConnection } = require('./queueConfig');

async function main() {
  const connection = getConnection();

  if (!connection) {

    console.error('Email worker cannot start: REDIS_URL is not configured.');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGO_URL);
    if (emailLogger && emailLogger.info) {
      emailLogger.info('Email worker connected to MongoDB');
    }
  } catch (err) {

    console.error('Email worker failed to connect to MongoDB:', err.message || err);
    process.exit(1);
  }

  const concurrency = Number(env.EMAIL_QUEUE_CONCURRENCY || 5);

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { to, subject, html, text, meta } = job.data || {};

      console.log('📧 Email worker processing job:', {
        jobId: job.id,
        to,
        subject,
        meta,
        queueName: QUEUE_NAME
      });

      if (emailLogger && emailLogger.info) {
        emailLogger.info('Processing email job', {
          jobId: job.id,
          to,
          subject,
          meta,
        });
      }

      console.log('📧 Calling sendEmail function...');
      const result = await sendEmail({
        to,
        subject,
        html,
        text,
        meta,
        maxRetries: 1, 
      });

      console.log('📧 Email worker sendEmail result:', result);

      if (meta && meta.type === 'order-status' && meta.orderId) {
        try {
          console.log('📧 Updating order status for orderId:', meta.orderId);
          const order = await Order.findOne({ orderId: meta.orderId });
          if (order && order.emailDeliveryStatus != null) {
            order.emailDeliveryStatus = result && result.success ? 'sent' : 'failed';
            if (order.markModified) {
              order.markModified('emailDeliveryStatus');
            }
            await order.save();
            console.log('📧 Order status updated:', {
              orderId: meta.orderId,
              newStatus: order.emailDeliveryStatus
            });
          }
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          console.error('📧 Failed to update order emailDeliveryStatus:', {
            orderId: meta.orderId,
            error: message
          });

          if (emailLogger && emailLogger.error) {
            emailLogger.error('Failed to update order emailDeliveryStatus from worker', {
              orderId: meta.orderId,
              error: message,
            });
          }
        }
      }

      console.log('📧 Email worker job completed:', {
        jobId: job.id,
        success: result.success,
        attempts: result.attempts
      });

      return result;
    },
    {
      ...connection,
      concurrency,
    },
  );

  const events = new QueueEvents(QUEUE_NAME, connection);

  worker.on('completed', (job, result) => {
    if (emailLogger && emailLogger.info) {
      emailLogger.info('Email job completed', {
        jobId: job.id,
        result,
      });
    }

  });

  worker.on('failed', (job, err) => {
    const message = err && err.message ? err.message : String(err);
    if (emailLogger && emailLogger.error) {
      emailLogger.error('Email job failed', {
        jobId: job && job.id,
        error: message,
      });
    }

  });

  worker.on('progress', (job, progress) => {
    if (emailLogger && emailLogger.info) {
      emailLogger.info('Email job progress', {
        jobId: job.id,
        progress,
      });
    }
  });

  const shutdown = async () => {
    try {
      await worker.close();
      await events.close();
      await mongoose.connection.close();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {

  console.error('Email worker fatal error:', err && err.message ? err.message : err);
  process.exit(1);
});

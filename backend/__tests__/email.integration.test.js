const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { connectTestDB, safeDropDatabase } = require('./setupTestDB');
const emailService = require('../utils/emailService');
const EmailLog = require('../models/EmailLog');
const { env } = require('../config');

jest.setTimeout(20000);

describe('emailService', () => {
  let realCreateTransport;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const uri = process.env.TEST_MONGO_URL || env.MONGO_URL;
    await connectTestDB(uri);

    realCreateTransport = nodemailer.createTransport;
  });

  afterAll(async () => {
    nodemailer.createTransport = realCreateTransport;
    await safeDropDatabase();
    await mongoose.disconnect();
  });

  test('checkTransport returns ok:false when transporter.verify throws', async () => {
    const fakeTransport = {
      verify: jest.fn().mockRejectedValue(new Error('SMTP down')),
    };
    nodemailer.createTransport = jest.fn(() => fakeTransport);

    const health = await emailService.checkTransport();

    expect(health.ok).toBe(false);
    expect(health.error).toBeDefined();
  });

  test('sendEmail retries and records log when sendMail fails then succeeds', async () => {
    const marker = `test-${Date.now()}`;
    const fakeTransport = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue({ messageId: 'abc123' }),
    };

    nodemailer.createTransport = jest.fn(() => fakeTransport);

    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Retry test',
      text: 'hello',
      maxRetries: 3,
      backoffMs: 10,
      meta: { marker },
    });

    expect(result.success).toBe(true);
    expect(result.attempts).toBeGreaterThanOrEqual(1);

    const log = await EmailLog.findOne({ 'meta.marker': marker }).lean();
    expect(log).toBeTruthy();
    expect(['sent', 'failed']).toContain(log.status);
    expect(log.attemptCount).toBeGreaterThanOrEqual(1);
  });
});

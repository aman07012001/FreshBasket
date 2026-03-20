const express = require('express');
const { body, param, query } = require('express-validator');
const EmailLog = require('../models/EmailLog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/status/:jobId', [
  param('jobId').notEmpty().withMessage('Job ID is required'),
], async (req, res) => {
  try {
    const { jobId } = req.params;

    const emailLog = await EmailLog.findOne({
      'meta.jobId': jobId
    }).sort({ createdAt: -1 });

    if (!emailLog) {
      return res.status(404).json({
        success: false,
        message: 'Email job not found'
      });
    }

    res.json({
      success: true,
      data: {
        jobId,
        to: emailLog.to,
        subject: emailLog.subject,
        status: emailLog.status,
        attemptCount: emailLog.attemptCount,
        lastError: emailLog.lastError,
        createdAt: emailLog.createdAt,
        updatedAt: emailLog.updatedAt
      }
    });
  } catch (error) {
    console.error('Get email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email status'
    });
  }
});

router.get('/status/user', [
  authMiddleware
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const filter = {
      'meta.userId': userId
    };

    if (status) {
      filter.status = status;
    }

    const emailLogs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await EmailLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs: emailLogs.map(log => ({
          id: log._id,
          to: log.to,
          subject: log.subject,
          status: log.status,
          attemptCount: log.attemptCount,
          lastError: log.lastError,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email status'
    });
  }
});

router.get('/recent', [
  authMiddleware
], async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const filter = {};

    if (type) {
      filter['meta.type'] = type;
    }

    if (status) {
      filter.status = status;
    }

    const emailLogs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs: emailLogs.map(log => ({
          id: log._id,
          to: log.to,
          subject: log.subject,
          status: log.status,
          attemptCount: log.attemptCount,
          lastError: log.lastError,
          meta: log.meta,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get recent email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email status'
    });
  }
});

module.exports = router;
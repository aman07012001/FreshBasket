const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const performanceMetrics = {
  authRequests: [],
  databaseQueries: []
};

const trackPerformance = (category) => (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const metric = {
      timestamp: new Date(),
      method: req.method,
      path: req.originalUrl,
      duration,
      statusCode: res.statusCode,
      requestId: req._requestId
    };

    if (performanceMetrics[category]) {
      performanceMetrics[category].push(metric);

      if (performanceMetrics[category].length > 1000) {
        performanceMetrics[category].shift();
      }
    }
  });

  next();
};

router.get('/performance', (req, res) => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  const filterByTime = (metrics) => metrics.filter(m => m.timestamp.getTime() > oneHourAgo);

  const authMetrics = filterByTime(performanceMetrics.authRequests);
  const dbMetrics = filterByTime(performanceMetrics.databaseQueries);

  const calculateStats = (metrics) => {
    if (metrics.length === 0) return { count: 0, avg: 0, min: 0, max: 0 };

    const durations = metrics.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: metrics.length,
      avg: Math.round(avg),
      min,
      max
    };
  };

  res.json({
    auth: calculateStats(authMetrics),
    database: calculateStats(dbMetrics),
    mongodb: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

router.get('/slow-requests', (req, res) => {
  const threshold = parseInt(req.query.threshold) || 1000;

  const slowRequests = [
    ...performanceMetrics.authRequests,
    ...performanceMetrics.databaseQueries
  ].filter(m => m.duration > threshold)
   .sort((a, b) => b.duration - a.duration)
   .slice(0, 50);

  res.json({
    threshold,
    slowRequests
  });
});

module.exports = { router, trackPerformance };
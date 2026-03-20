
const requestProfiler = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  req._requestStart = startTime;
  req._requestId = Math.random().toString(36).substr(2, 9);

  console.log(`🔍 [${req._requestId}] ${req.method} ${req.originalUrl} - START`);

  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endMemory = process.memoryUsage();

    console.log(`✅ [${req._requestId}] ${req.method} ${req.originalUrl} - COMPLETED in ${duration}ms`);
    console.log(`   Memory: ${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024)}KB`);

    if (duration > 1000) {
      console.warn(`⚠️  [${req._requestId}] SLOW REQUEST: ${duration}ms`);
    }

    originalEnd.apply(this, args);
  };

  next();
};

module.exports = requestProfiler;
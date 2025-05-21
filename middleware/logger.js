/**
 * Custom logger middleware
 * Logs information about each request
 */
const logger = (req, res, next) => {
  const start = new Date();
  
  // Log request details
  console.log(`[${start.toISOString()}] ${req.method} ${req.url}`);
  
  // Get original end function
  const originalEnd = res.end;
  
  // Override end function to log response time
  res.end = function(...args) {
    const end = new Date();
    const duration = end - start;
    console.log(`[${end.toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(res, args);
  };
  
  next();
};

module.exports = logger;
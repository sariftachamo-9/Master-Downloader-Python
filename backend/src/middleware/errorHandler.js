const logger = require('../utils/logger');

/**
 * Global Express Error Handling Middleware.
 * Catches all runtime errors, records logs to the database, and returns standard JSON responses.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  // Log error context
  logger.error(`Exception caught: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message
  });
}

module.exports = errorHandler;

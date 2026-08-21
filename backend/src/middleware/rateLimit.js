const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

// Rate limiting configurations to protect the download endpoints
const apiLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 429,
    message: `Too many requests from this IP. Please try again after ${windowMinutes} minutes.`
  }
});

module.exports = apiLimiter;

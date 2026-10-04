const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again later.'
    }
  }
});

/**
 * High-concurrency rate limiter for Authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // High throughput allowance for live launch
  keyGenerator: (req) => {
    if (req.body && typeof req.body.email === 'string' && req.body.email.trim()) {
      return req.body.email.trim().toLowerCase();
    }
    return req.ip;
  },
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts for this account. Please try again after 15 minutes.'
    }
  }
});

/**
 * OTP Request rate limiter - Keyed per email so 50+ users don't block each other
 */
const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Allows multiple resends per user without blocking concurrent users
  keyGenerator: (req) => {
    if (req.body && typeof req.body.email === 'string' && req.body.email.trim()) {
      return req.body.email.trim().toLowerCase();
    }
    return req.ip;
  },
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please wait a few minutes before trying again.'
    }
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  otpRequestLimiter
};

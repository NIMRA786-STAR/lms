const rateLimit = require('express-rate-limit');

// ═══════════════════════════════════════════════════════════
// GLOBAL API LIMITER
// 100 requests per 15 minutes per IP
// ═══════════════════════════════════════════════════════════
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false
});

// ═══════════════════════════════════════════════════════════
// AUTH LIMITER (brute-force protection for login/register)
// 5 attempts per 15 minutes per IP
// ═══════════════════════════════════════════════════════════
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

// ═══════════════════════════════════════════════════════════
// PASSWORD RESET LIMITER
// 3 requests per hour per IP
// ═══════════════════════════════════════════════════════════
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};
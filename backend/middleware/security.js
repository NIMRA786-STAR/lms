const rateLimit = require('express-rate-limit');

// ═══════════════════════════════════════════════════════════
// GLOBAL API LIMITER
// Bumped to 300 req/15min to allow PaymentSuccess polling
// ═══════════════════════════════════════════════════════════
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                  // ← was 100, now 300
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════
// AUTH LIMITER (brute-force protection)
// 5 failed attempts per 15 min per IP
// ═══════════════════════════════════════════════════════════
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // successful logins don't count
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
    message: 'Too many password reset requests. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════
// PAYMENT VERIFY LIMITER (allows polling without blocking)
// 20 req/min per IP — enough for 5 retries × 3 sessions
// ═══════════════════════════════════════════════════════════
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'Too many verification requests. Please try again shortly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════
// PUBLIC CERTIFICATE VERIFY LIMITER
// 30 req/min per IP — prevents enumeration attacks
// ═══════════════════════════════════════════════════════════
const publicVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many verification requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  verifyLimiter,
  publicVerifyLimiter,
};
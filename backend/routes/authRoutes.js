const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/security');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate
} = require('../validators/authValidator');

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES (rate-limited)
// ═══════════════════════════════════════════════════════════
router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);

// ═══════════════════════════════════════════════════════════
// PASSWORD RESET (separate stricter limit)
// ═══════════════════════════════════════════════════════════
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

// ═══════════════════════════════════════════════════════════
// PROTECTED
// ═══════════════════════════════════════════════════════════
router.get('/me', protect, getMe);

module.exports = router;
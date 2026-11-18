const express = require('express');
const router = express.Router();
const { verifySession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { verifyLimiter } = require('../middleware/security');

// ═══════════════════════════════════════════════════════════
// Verify a Stripe checkout session
// Rate-limited to prevent polling abuse
// ═══════════════════════════════════════════════════════════
router.get('/verify/:sessionId', protect, verifyLimiter, verifySession);

module.exports = router;
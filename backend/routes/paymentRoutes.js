const express = require('express');
const router = express.Router();
const { verifySession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════
// Verify a Stripe checkout session
// (webhook handles actual enrollment; this just confirms status)
// ═══════════════════════════════════════════════════════════
router.get('/verify/:sessionId', protect, verifySession);

module.exports = router;
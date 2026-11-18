const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { publicVerifyLimiter } = require('../middleware/security');

router.get('/my', protect, getMyCertificates);
router.get('/verify/:certificateId', publicVerifyLimiter, verifyCertificate); // public

module.exports = router;
const express = require('express');
const router = express.Router();
const { getMyCertificates, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);  // public

module.exports = router;
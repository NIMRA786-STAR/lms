const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');

// GET /api/certificates/my
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate({ path: 'course', select: 'title instructor category' })
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: certs.length, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/verify/:certificateId  (PUBLIC)
const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate({ path: 'course', select: 'title instructor' })
      .populate({ path: 'student', select: 'name' });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyCertificates, verifyCertificate };
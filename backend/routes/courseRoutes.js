const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  addLesson,
  getEnrolledStudents,
  getCourseAnalytics
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { createCheckoutSession } = require('../controllers/paymentController');
const { createCourseSchema, validate } = require('../validators/authValidator');

// ─── PUBLIC ───
router.get('/', getAllCourses);

// ─── PROTECTED (SPECIFIC ROUTES before /:id) ───
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/analytics', protect, authorize('instructor', 'admin'), getCourseAnalytics);

// Upload
router.post(
  '/upload-thumbnail',
  protect,
  authorize('instructor', 'admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      data: { url: req.file.path, publicId: req.file.filename }
    });
  }
);

// Mutations
router.post('/', protect, authorize('instructor', 'admin'), validate(createCourseSchema), createCourse);
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.get('/:id/students', protect, authorize('instructor', 'admin'), getEnrolledStudents);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Stripe checkout (when Stripe is enabled)
router.post('/:id/checkout', protect, authorize('student'), createCheckoutSession);

// ─── PUBLIC :id (LAST) ───
router.get('/:id', getCourseById);

module.exports = router;
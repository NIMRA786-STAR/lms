const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyCourses,
  getEnrollmentByCourse,
  toggleLessonComplete,
  updateProgress,
  dropCourse
} = require('../controllers/enrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

router.post('/', enrollCourse);
router.get('/my-courses', getMyCourses);
router.get('/course/:courseId', getEnrollmentByCourse);           // ← NEW
router.post('/:enrollmentId/lesson/:lessonId/toggle', toggleLessonComplete);  // ← NEW
router.put('/progress/:id', updateProgress);                       // legacy
router.delete('/:id', dropCourse);

module.exports = router;
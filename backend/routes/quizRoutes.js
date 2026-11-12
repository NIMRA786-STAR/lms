const express = require('express');
const router = express.Router();
const {
  upsertQuiz,
  getQuizByCourse,
  startQuiz,
  submitQuiz,
  getMyAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Instructor
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), upsertQuiz);
router.get('/course/:courseId', protect, getQuizByCourse);

// Student
router.get('/course/:courseId/start', protect, authorize('student'), startQuiz);
router.post('/course/:courseId/submit', protect, authorize('student'), submitQuiz);
router.get('/course/:courseId/attempts', protect, authorize('student'), getMyAttempts);

module.exports = router;
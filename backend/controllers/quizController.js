const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const crypto = require('crypto');

// ─── INSTRUCTOR: Create or update quiz ───
const upsertQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions, passingScore, duration } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    const quiz = await Quiz.findOneAndUpdate(
      { course: courseId },
      { course: courseId, title, description, questions, passingScore, duration },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: 'Quiz saved', data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INSTRUCTOR: Get quiz for a course ───
const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return res.status(404).json({ success: false, message: 'No quiz for this course' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT: Start attempt (returns quiz WITHOUT correct answers) ───
const startQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Must be enrolled + 100% progress
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You must be enrolled' });
    }
    if (enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'Complete all lessons before taking the quiz'
      });
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not available' });

    // Sanitize — hide correctAnswer
    const sanitized = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      duration: quiz.duration,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT: Submit answers ───
const submitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // [{questionId, selectedAnswer}]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Answers required' });
    }

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You must be enrolled' });
    }

    // Grade
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((q, idx) => {
      const submitted = answers.find(a => String(a.questionId) === String(q._id));
      const selected = submitted ? submitted.selectedAnswer : null;
      const isCorrect = selected === q.correctAnswer;

      totalPoints += q.points || 1;
      if (isCorrect) score += q.points || 1;

      gradedAnswers.push({
        questionId: q._id,
        selectedAnswer: selected,
        isCorrect
      });
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      course: courseId,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      completedAt: new Date()
    });

    // Issue certificate if passed
    if (passed) {
      const existing = await Certificate.findOne({
        student: req.user._id,
        course: courseId
      });
      if (!existing) {
        await Certificate.create({
          student: req.user._id,
          course: courseId,
          certificateId: crypto.randomBytes(8).toString('hex').toUpperCase(),
          score: percentage
        });
      }
    }

    res.json({
      success: true,
      message: passed ? '🎉 Passed!' : 'Try again',
      data: {
        attemptId: attempt._id,
        score,
        totalPoints,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        certificateIssued: passed
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT: Get my attempts for a course ───
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.user._id,
      course: req.params.courseId
    }).sort({ completedAt: -1 });

    const best = attempts.length
      ? Math.max(...attempts.map(a => a.percentage))
      : null;

    res.json({
      success: true,
      data: {
        attempts: attempts.length,
        bestScore: best,
        history: attempts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  upsertQuiz,
  getQuizByCourse,
  startQuiz,
  submitQuiz,
  getMyAttempts
};
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedAnswer: Number,
  isCorrect: Boolean
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

quizAttemptSchema.index({ student: 1, quiz: 1, completedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
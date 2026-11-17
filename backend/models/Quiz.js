const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'Exactly 4 options required']
  },
  correctAnswer: { type: String, required: true },  
  points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 },
  duration: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
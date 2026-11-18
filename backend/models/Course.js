const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required'],
    maxlength: [10000, 'Lesson content cannot exceed 10000 characters']
  },
  videoUrl: { type: String, default: '', trim: true },
  duration: { type: String, default: '00:00', trim: true }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Course description cannot exceed 5000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming',
      'Python',
      'Design',
      'Business',
      'Marketing',
      'SEO',
      'Data Science',
      'DevOps',
      'Cybersecurity',
      'Other'
    ],
    default: 'Programming'
  },
  price: { type: Number, default: 0, min: [0, 'Price cannot be negative'] },
  duration: { type: String, default: '4 weeks', trim: true, maxlength: 50 },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  lessons: [lessonSchema],
  thumbnail: { type: String, default: '', trim: true },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
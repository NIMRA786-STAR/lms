const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in course
// @route   POST /api/enroll
// @access  Private/Student
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      progress: 0,
      completedLessons: [],
      status: 'active'
    });

    if (!course.enrolledStudents.includes(req.user._id)) {
      course.enrolledStudents.push(req.user._id);
      await course.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Error in enrollCourse:', error);
    res.status(500).json({ success: false, message: 'Error enrolling in course', error: error.message });
  }
};

// @desc    Get my enrolled courses
// @route   GET /api/enroll/my-courses
// @access  Private/Student
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email' }
      });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ success: false, message: 'Error fetching enrolled courses', error: error.message });
  }
};

// @desc    Get single enrollment by course ID (for course detail page)
// @route   GET /api/enroll/course/:courseId
// @access  Private/Student
const getEnrollmentByCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle lesson completion (mark complete / unmark)
// @route   POST /api/enroll/:enrollmentId/lesson/:lessonId/toggle
// @access  Private/Student
// 🔑 PROGRESS IS AUTO-CALCULATED — client cannot manipulate it
const toggleLessonComplete = async (req, res) => {
  try {
    const { enrollmentId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: req.user._id
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const course = enrollment.course;
    if (!course || !course.lessons || course.lessons.length === 0) {
      return res.status(400).json({ success: false, message: 'Course has no lessons' });
    }

    // Verify lessonId belongs to this course
    const lessonExists = course.lessons.some(l => l._id.toString() === lessonId);
    if (!lessonExists) {
      return res.status(400).json({ success: false, message: 'Lesson does not belong to this course' });
    }

    // Toggle
    const idx = enrollment.completedLessons.findIndex(id => id.toString() === lessonId);
    let action;
    if (idx >= 0) {
      enrollment.completedLessons.splice(idx, 1);
      action = 'unmarked';
    } else {
      enrollment.completedLessons.push(lessonId);
      action = 'completed';
    }

    // 🔑 Auto-calculate progress
    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);

    // Auto-mark completed if 100%
    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
    } else if (enrollment.status === 'completed') {
      enrollment.status = 'active';
    }

    await enrollment.save();

    res.json({
      success: true,
      message: `Lesson ${action}`,
      data: {
        _id: enrollment._id,
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        status: enrollment.status,
        totalLessons
      }
    });
  } catch (error) {
    console.error('Error in toggleLessonComplete:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update progress (legacy — kept for backward compatibility)
// @route   PUT /api/enroll/progress/:id
// @access  Private/Student
// ⚠️ Progress is IGNORED from body; only completedLessons matters
const updateProgress = async (req, res) => {
  try {
    const { completedLessonId } = req.body;
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (completedLessonId && !enrollment.completedLessons.some(id => id.toString() === completedLessonId)) {
      enrollment.completedLessons.push(completedLessonId);
    }

    // Recalculate from lessons
    if (enrollment.course && enrollment.course.lessons?.length) {
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / enrollment.course.lessons.length) * 100
      );
    }

    await enrollment.save();
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Drop course
// @route   DELETE /api/enroll/:id
// @access  Private/Student
const dropCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    await Course.findByIdAndUpdate(enrollment.course, {
      $pull: { enrolledStudents: req.user._id }
    });

    await enrollment.deleteOne();
    res.json({ success: true, message: 'Course dropped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  enrollCourse,
  getMyCourses,
  getEnrollmentByCourse,
  toggleLessonComplete,
  updateProgress,
  dropCourse
};
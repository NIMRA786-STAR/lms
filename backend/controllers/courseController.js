const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getAllCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (level) query.level = level;

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email bio');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(500).json({ success: false, message: 'Error fetching course', error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, level, thumbnail } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      category: category || 'Programming',
      price: price || 0,
      duration: duration || '4 weeks',
      level: level || 'Beginner',
      thumbnail: thumbnail || ''
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating course', error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Course updated successfully', data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating course', error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    await Enrollment.deleteMany({ course: req.params.id });

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting course', error: error.message });
  }
};

const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching instructor courses', error: error.message });
  }
};

const addLesson = async (req, res) => {
  try {
    const { title, content, videoUrl, duration } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Lesson title and content are required' });
    }

    course.lessons.push({
      title: title.trim(),
      content: content.trim(),
      videoUrl: (videoUrl || '').trim(),
      duration: (duration || '00:00').trim()
    });
    await course.save();

    res.status(201).json({ success: true, message: 'Lesson added successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding lesson', error: error.message });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email profilePicture');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const studentsWithProgress = await Promise.all(
      course.enrolledStudents.map(async (student) => {
        const enrollment = await Enrollment.findOne({
          student: student._id,
          course: course._id
        });
        return {
          ...student.toObject(),
          progress: enrollment?.progress || 0,
          enrolledAt: enrollment?.enrolledAt,
          completedLessons: enrollment?.completedLessons?.length || 0,
          totalLessons: course.lessons?.length || 0
        };
      })
    );

    res.json({ success: true, count: studentsWithProgress.length, data: studentsWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .select('title price enrolledStudents lessons createdAt');

    const analytics = courses.map(course => ({
      _id: course._id,
      title: course.title,
      price: course.price,
      totalStudents: course.enrolledStudents?.length || 0,
      totalLessons: course.lessons?.length || 0,
      totalRevenue: (course.price || 0) * (course.enrolledStudents?.length || 0),
      createdAt: course.createdAt,
      completionRate: 0,
      averageProgress: 0
    }));

    for (let i = 0; i < analytics.length; i++) {
      const course = courses[i];
      if (course.enrolledStudents?.length > 0) {
        const enrollments = await Enrollment.find({ course: course._id, status: 'active' });
        const completedCount = enrollments.filter(e => e.progress === 100).length;
        analytics[i].completionRate = Math.round(
          (completedCount / course.enrolledStudents.length) * 100
        );
        analytics[i].averageProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0;
      }
    }

    const overallStats = {
      totalCourses: analytics.length,
      totalStudents: analytics.reduce((sum, c) => sum + c.totalStudents, 0),
      totalRevenue: analytics.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalLessons: analytics.reduce((sum, c) => sum + c.totalLessons, 0),
      averageCompletionRate: analytics.length > 0
        ? Math.round(analytics.reduce((sum, c) => sum + c.completionRate, 0) / analytics.length)
        : 0
    };

    res.json({ success: true, overall: overallStats, courses: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  addLesson,
  getEnrolledStudents,
  getCourseAnalytics
};
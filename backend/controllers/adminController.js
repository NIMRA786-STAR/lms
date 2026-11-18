const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    
    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Recent courses
    const newCourses = await Course.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Popular courses (most enrolled)
    const popularCourses = await Course.aggregate([
  {
    $addFields: { enrolledCount: { $size: { $ifNull: ['$enrolledStudents', []] } } }
  },
  { $sort: { enrolledCount: -1 } },
  { $limit: 5 },
  { $project: { title: 1, enrolledStudents: 1, enrolledCount: 1 } }
]);
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          admins: totalAdmins,
          newLast30Days: newUsers
        },
        courses: {
          total: totalCourses,
          newLast30Days: newCourses
        },
        enrollments: {
          total: totalEnrollments
        },
        popularCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getSystemStats };
import axios from 'axios';

const api = axios.create({
  // ⚠️ NO '/api' — calls already prepend '/api'
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me')
};

// Users
export const userService = {
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`)
};

// Courses
export const courseService = {
  getAllCourses: (params) => api.get('/api/courses', { params }),
  getCourseById: (id) => api.get(`/api/courses/${id}`),
  createCourse: (data) => api.post('/api/courses', data),
  updateCourse: (id, data) => api.put(`/api/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/api/courses/${id}`),
  getInstructorCourses: () => api.get('/api/courses/instructor/my-courses'),
  addLesson: (id, data) => api.post(`/api/courses/${id}/lessons`, data),
  getAnalytics: () => api.get('/api/courses/analytics'),
  getEnrolledStudents: (id) => api.get(`/api/courses/${id}/students`)
};

// Enrollments
export const enrollmentService = {
  enrollCourse: (courseId) => api.post('/api/enroll', { courseId }),
  getMyCourses: () => api.get('/api/enroll/my-courses'),
  getEnrollmentByCourse: (courseId) => api.get(`/api/enroll/course/${courseId}`),
  toggleLessonComplete: (enrollmentId, lessonId) =>
    api.post(`/api/enroll/${enrollmentId}/lesson/${lessonId}/toggle`),
  updateProgress: (id, progress) => api.put(`/api/enroll/progress/${id}`, { progress }),
  dropCourse: (id) => api.delete(`/api/enroll/${id}`)
};

// Admin
export const adminService = {
  getStats: () => api.get('/api/admin/stats')
};

export default api;
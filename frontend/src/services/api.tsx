import axios from 'axios';
import type { User, Course, Enrollment, Lesson, ApiResponse } from '../types';

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════
export const authService = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => axios.post<ApiResponse<{ token: string; _id: string }>>('/api/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    axios.post<ApiResponse<{ token: string; _id: string; role: string }>>(
      '/api/auth/login',
      credentials
    ),

  getMe: () => axios.get<ApiResponse<User>>('/api/auth/me'),
};

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════
export const userService = {
  getAllUsers: () => axios.get<ApiResponse<User[]>>('/api/users'),

  getUserById: (id: string) => axios.get<ApiResponse<User>>(`/api/users/${id}`),

  updateUser: (id: string, data: Partial<User>) =>
    axios.put<ApiResponse<User>>(`/api/users/${id}`, data),

  deleteUser: (id: string) => axios.delete<ApiResponse<void>>(`/api/users/${id}`),
};

// ═══════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════
export const courseService = {
  getAllCourses: (params?: {
    search?: string;
    category?: string;
    level?: string;
  }) => axios.get<ApiResponse<Course[]>>('/api/courses', { params }),

  getCourseById: (id: string) => axios.get<ApiResponse<Course>>(`/api/courses/${id}`),

  createCourse: (data: Partial<Course>) =>
    axios.post<ApiResponse<Course>>('/api/courses', data),

  updateCourse: (id: string, data: Partial<Course>) =>
    axios.put<ApiResponse<Course>>(`/api/courses/${id}`, data),

  deleteCourse: (id: string) => axios.delete<ApiResponse<void>>(`/api/courses/${id}`),

  getInstructorCourses: () =>
    axios.get<ApiResponse<Course[]>>('/api/courses/instructor/my-courses'),

  addLesson: (id: string, data: Partial<Lesson>) =>
    axios.post<ApiResponse<Course>>(`/api/courses/${id}/lessons`, data),

  getAnalytics: () => axios.get<ApiResponse<any>>('/api/courses/analytics'),

  getEnrolledStudents: (id: string) =>
    axios.get<ApiResponse<User[]>>(`/api/courses/${id}/students`),
};

// ═══════════════════════════════════════════════════════════
// ENROLLMENTS
// ═══════════════════════════════════════════════════════════
export const enrollmentService = {
  enrollCourse: (courseId: string) =>
    axios.post<ApiResponse<Enrollment>>('/api/enroll', { courseId }),

  getMyCourses: () => axios.get<ApiResponse<Enrollment[]>>('/api/enroll/my-courses'),

  getEnrollmentByCourse: (courseId: string) =>
    axios.get<ApiResponse<Enrollment>>(`/api/enroll/course/${courseId}`),

  toggleLessonComplete: (enrollmentId: string, lessonId: string) =>
    axios.post<ApiResponse<Enrollment>>(
      `/api/enroll/${enrollmentId}/lesson/${lessonId}/toggle`
    ),

  updateProgress: (id: string, progress: number) =>
    axios.put<ApiResponse<Enrollment>>(`/api/enroll/progress/${id}`, { progress }),

  dropCourse: (id: string) => axios.delete<ApiResponse<void>>(`/api/enroll/${id}`),
};

// ═══════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════
export const adminService = {
  getStats: () => axios.get<ApiResponse<any>>('/api/admin/stats'),
};

export default axios;
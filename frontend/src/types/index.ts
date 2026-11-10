export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  location?: string;
  occupation?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: User | string;
  category: string;
  price: number;
  duration: string;
  level: CourseLevel;
  lessons: Lesson[];
  thumbnail?: string;
  enrolledStudents: string[];
  createdAt: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  progress: number;
  completedLessons: string[];
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}
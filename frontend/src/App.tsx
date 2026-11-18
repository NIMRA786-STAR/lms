import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastProvider from './context/ToastProvider';
import PrivateRoute from './components/PrivateRoute';

// Layout
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';

// Public
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Payment
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import StudentProfile from './pages/student/StudentProfile';
import TakeQuiz from './pages/student/TakeQuiz';
import MyCertificates from './pages/student/MyCertificates';

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const NotFound: React.FC = () => (
  <div className="text-center py-5">
    <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)' }}>404</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Page not found.</p>
    <a href="/" className="btn-gradient mt-3">Go Home</a>
  </div>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app-bg d-flex flex-column min-vh-100">
            <NavigationBar />
            <main className="flex-grow-1">
              <Routes>
                {/* ─── Public ─── */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ─── Payment ─── */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* ─── Student ─── */}
                <Route
                  path="/courses/:courseId/quiz"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <TakeQuiz />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-courses"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <MyCourses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-certificates"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <MyCertificates />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <StudentProfile />
                    </PrivateRoute>
                  }
                />

                {/* ─── Instructor ─── */}
                <Route
                  path="/instructor/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['instructor']}>
                      <InstructorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/instructor/courses/create"
                  element={
                    <PrivateRoute allowedRoles={['instructor']}>
                      <CreateCourse />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/instructor/courses/:id/edit"
                  element={
                    <PrivateRoute allowedRoles={['instructor', 'admin']}>
                      <EditCourse />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/instructor/profile"
                  element={
                    <PrivateRoute allowedRoles={['instructor']}>
                      <StudentProfile />
                    </PrivateRoute>
                  }
                />

                {/* ─── Admin ─── */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <AdminAnalytics />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <ManageCourses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <StudentProfile />
                    </PrivateRoute>
                  }
                />

                {/* ─── Redirects & fallback ─── */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                {/* Backward-compat: purana /profile → admin profile */}
                <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
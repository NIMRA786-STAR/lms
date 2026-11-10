import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

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

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Payment */}
          <Route path="/payment/success" element={
            <PrivateRoute allowedRoles={['student']}>
              <PaymentSuccess />
            </PrivateRoute>
          } />
          <Route path="/payment/cancel" element={
            <PrivateRoute allowedRoles={['student']}>
              <PaymentCancel />
            </PrivateRoute>
          } />

          {/* Student */}
          <Route path="/dashboard" element={
            <PrivateRoute allowedRoles={['student', 'instructor', 'admin']}>
              <StudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/my-courses" element={
            <PrivateRoute allowedRoles={['student']}><MyCourses /></PrivateRoute>
          } />
          <Route path="/student/profile" element={
            <PrivateRoute allowedRoles={['student']}><StudentProfile /></PrivateRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}><InstructorDashboard /></PrivateRoute>
          } />
          <Route path="/instructor/courses/create" element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}><CreateCourse /></PrivateRoute>
          } />
          <Route path="/instructor/courses/:id/edit" element={
            <PrivateRoute allowedRoles={['instructor', 'admin']}><EditCourse /></PrivateRoute>
          } />
          <Route path="/instructor/profile" element={
            <PrivateRoute allowedRoles={['instructor']}><StudentProfile /></PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute allowedRoles={['admin']}><ManageUsers /></PrivateRoute>
          } />
          <Route path="/admin/courses" element={
            <PrivateRoute allowedRoles={['admin']}><ManageCourses /></PrivateRoute>
          } />
          <Route path="/admin/analytics" element={
            <PrivateRoute allowedRoles={['admin']}><AdminAnalytics /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute allowedRoles={['admin']}><StudentProfile /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCourseImage } from '../../hooks/useCourseImage';
import IconButton from '../../components/IconButton';
import {
  FaGraduationCap, FaCheckCircle, FaChartLine, FaPlay,
  FaArrowRight, FaBook
} from 'react-icons/fa';

// ─── Sub-components ───
const EnrolledCourseCard: React.FC<{ enrollment: any }> = ({ enrollment }) => {
  const { src, onError } = useCourseImage(enrollment.course);
  return (
    <Card className="course-card-modern">
      <div className="card-img-wrapper" style={{ height: 160 }}>
        <Card.Img src={src} onError={onError} alt={enrollment.course?.title} />
      </div>
      <Card.Body className="p-4">
        <Card.Title className="card-title">{enrollment.course?.title || 'Untitled'}</Card.Title>
        <div className="instructor-name">{enrollment.course?.instructor?.name || 'Unknown'}</div>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progress</small>
            <small className="fw-bold" style={{ color: '#667eea' }}>
              {enrollment.progress || 0}%
            </small>
          </div>
          <ProgressBar now={enrollment.progress || 0} className="progress-modern" />
        </div>
        <Link to={`/courses/${enrollment.course?._id}`} className="text-decoration-none">
          <IconButton
            icon={enrollment.progress === 100 ? FaCheckCircle : FaPlay}
            label={enrollment.progress === 100 ? 'Review' : 'Continue'}
            variant="primary" size="sm"
            style={{ width: '100%', justifyContent: 'center' }} />
        </Link>
      </Card.Body>
    </Card>
  );
};

const RecommendedCourseCard: React.FC<{ course: any }> = ({ course }) => {
  const { src, onError } = useCourseImage(course);
  return (
    <Card className="course-card-modern">
      <div className="card-img-wrapper" style={{ height: 150 }}>
        <span className="category-badge">{course.category}</span>
        <Card.Img src={src} onError={onError} alt={course.title} />
      </div>
      <Card.Body className="p-4">
        <Card.Title className="card-title">{course.title}</Card.Title>
        <Card.Text className="course-description">
          {course.description?.substring(0, 70)}…
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="price-tag" style={{ fontSize: '1.1rem' }}>${course.price || 0}</span>
          <span className="level-badge">{course.level}</span>
        </div>
        <Link to={`/courses/${course._id}`} className="text-decoration-none">
          <IconButton icon={FaArrowRight} label="View Course" outline size="sm"
            style={{ width: '100%', justifyContent: 'center' }} />
        </Link>
      </Card.Body>
    </Card>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrolled: 0, completedCourses: 0, inProgressCourses: 0, averageProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
    const handleVisibility = () => { if (!document.hidden) fetchDashboardData(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const enrolledRes = await axios.get('/api/enroll/my-courses');
      const enrollments = enrolledRes.data.data;
      setEnrolledCourses(enrollments);
      setStats({
        totalEnrolled: enrollments.length,
        completedCourses: enrollments.filter((e: any) => e.progress === 100).length,
        inProgressCourses: enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length)
          : 0
      });
      const coursesRes = await axios.get('/api/courses');
      const enrolledIds = enrollments.map((e: any) => e.course?._id);
      setRecommendedCourses(
        coursesRes.data.data
          .filter((c: any) => !enrolledIds.includes(c._id))
          .slice(0, 3)
      );
    } catch (error: any) {
      if (error.response?.status === 401) window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading dashboard…</p>
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontWeight: 700 }}>
        Welcome back, {user?.name}! 👋
      </h2>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="stat-card-modern gradient-primary">
            <h1><FaGraduationCap /> {stats.totalEnrolled}</h1>
            <p>Enrolled Courses</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-success">
            <h1><FaCheckCircle /> {stats.completedCourses}</h1>
            <p>Completed</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-info">
            <h1><FaChartLine /> {stats.averageProgress}%</h1>
            <p>Avg Progress</p>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="section-heading mb-0">My Enrolled Courses</h3>
        <Link to="/my-courses" className="text-decoration-none">
          <IconButton icon={FaArrowRight} label="View All" outline size="sm" />
        </Link>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="text-center p-5 bg-light" style={{ borderRadius: 20, border: 'none' }}>
          <div className="py-4">
            <FaBook size={48} color="#a0aec0" className="mb-3" />
            <h4>No courses enrolled yet</h4>
            <p className="text-muted">Browse our catalog and start learning today!</p>
            <Link to="/courses" className="text-decoration-none">
              <IconButton icon={FaArrowRight} label="Browse Courses" variant="primary" />
            </Link>
          </div>
        </Card>
      ) : (
        <Row>
          {enrolledCourses.slice(0, 3).map((enrollment) => (
            <Col key={enrollment._id} md={4} className="mb-4">
              <EnrolledCourseCard enrollment={enrollment} />
            </Col>
          ))}
        </Row>
      )}

      {recommendedCourses.length > 0 && (
        <>
          <h3 className="section-heading mb-3 mt-4">Recommended for You</h3>
          <Row>
            {recommendedCourses.map((course) => (
              <Col key={course._id} md={4} className="mb-4">
                <RecommendedCourseCard course={course} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default StudentDashboard;
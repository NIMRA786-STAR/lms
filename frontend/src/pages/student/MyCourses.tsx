import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, ProgressBar, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCourseImage } from '../../hooks/useCourseImage';
import IconButton from '../../components/IconButton';
import { FaPlay, FaTrash, FaBookOpen, FaSearch } from 'react-icons/fa';

// ─── Sub-component for hook usage ───
const MyCourseCard: React.FC<{
  enrollment: any;
  onDrop: (id: string, title: string) => void;
}> = ({ enrollment, onDrop }) => {
  const { src, onError } = useCourseImage(enrollment.course);

  return (
    <Card className="course-card-modern">
      <div className="card-img-wrapper" style={{ height: 160 }}>
        <Card.Img
          src={src}
          onError={onError}
          alt={enrollment.course?.title}
        />
      </div>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="card-title mb-0">
            {enrollment.course?.title || 'Untitled'}
          </Card.Title>
          <span className={`badge ${
            enrollment.progress === 100 ? 'bg-success' :
            enrollment.progress > 0 ? 'bg-info' : 'bg-secondary'
          }`}>
            {enrollment.progress === 100 ? '✓ Done' :
             enrollment.progress > 0 ? 'In Progress' : 'Not Started'}
          </span>
        </div>
        <div className="instructor-name">
          {enrollment.course?.instructor?.name || 'Unknown'}
        </div>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progress</small>
            <small className="fw-bold" style={{ color: '#667eea' }}>
              {enrollment.progress || 0}%
            </small>
          </div>
          <ProgressBar now={enrollment.progress || 0} className="progress-modern" />
        </div>
        <div className="d-flex gap-2">
          <Link to={`/courses/${enrollment.course?._id}`}
            className="text-decoration-none flex-grow-1">
            <IconButton
              icon={enrollment.progress === 100 ? FaBookOpen : FaPlay}
              label={enrollment.progress === 100 ? 'Review' : 'Continue'}
              variant="primary" size="sm"
              style={{ width: '100%', justifyContent: 'center' }} />
          </Link>
          <IconButton icon={FaTrash} variant="danger" size="sm"
            onClick={() => onDrop(enrollment._id, enrollment.course?.title)} />
        </div>
      </Card.Body>
    </Card>
  );
};

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchMyCourses(); }, []);

  const fetchMyCourses = async () => {
    setLoading(true); setError('');
    try {
      const response = await axios.get('/api/enroll/my-courses');
      setEnrollments(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (enrollmentId: string, courseTitle: string) => {
    if (!window.confirm(`Drop "${courseTitle}"? You will lose all progress.`)) return;
    try {
      await axios.delete(`/api/enroll/${enrollmentId}`);
      fetchMyCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to drop course');
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading your courses…</p>
    </Container>
  );

  if (error) return (
    <Container className="py-4">
      <Alert variant="danger">{error}</Alert>
      <IconButton icon={FaSearch} label="Try Again" variant="primary" onClick={fetchMyCourses} />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Courses</h2>

      {enrollments.length === 0 ? (
        <Card className="text-center p-5 bg-light" style={{ borderRadius: 20, border: 'none' }}>
          <div className="py-4">
            <FaBookOpen size={48} color="#a0aec0" className="mb-3" />
            <h4>No courses enrolled yet</h4>
            <p className="text-muted">Browse our catalog to get started!</p>
            <Link to="/courses" className="text-decoration-none">
              <IconButton icon={FaSearch} label="Browse Courses" variant="primary" />
            </Link>
          </div>
        </Card>
      ) : (
        <Row>
          {enrollments.map((enrollment) => (
            <Col key={enrollment._id} md={6} lg={4} className="mb-4">
              <MyCourseCard enrollment={enrollment} onDrop={handleDropCourse} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyCourses;
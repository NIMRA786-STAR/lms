import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Spinner, Alert, ListGroup,
  Modal, ProgressBar, Badge
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getCourseImage } from '../utils/courseImages';
import IconButton from '../components/IconButton';
import type { Course, Enrollment, Lesson } from '../types';
import {
  FaPlay, FaCheck, FaUndo, FaArrowLeft, FaVideo, FaClock,
  FaCheckCircle, FaCreditCard
} from 'react-icons/fa';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [togglingLesson, setTogglingLesson] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (user && user.role === 'student') fetchEnrollment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get<{ data: Course }>(`/api/courses/${id}`);
      setCourse(res.data.data);
    } catch {
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const res = await axios.get<{ data: Enrollment }>(`/api/enroll/course/${id}`);
      setEnrollment(res.data.data);
    } catch {
      setEnrollment(null);
    }
  };

  // ═══════ Enroll handler (paid → Stripe, free → direct) ═══════
  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return alert('Only students can enroll in courses');

    // PAID → Stripe Checkout
    if (course && course.price > 0) {
      setEnrolling(true);
      try {
        const res = await axios.post<{ url: string }>(
          `/api/courses/${id}/checkout`
        );
        // Redirect to Stripe-hosted checkout
        window.location.href = res.data.url;
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message
          : 'Failed to start checkout';
        alert(msg || 'Failed to start checkout');
        setEnrolling(false);
      }
      return;
    }

    // FREE → direct enroll
    setEnrolling(true);
    try {
      const res = await axios.post<{ data: Enrollment }>('/api/enroll', {
        courseId: id
      });
      setEnrollment(res.data.data);
      alert('Successfully enrolled!');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to enroll';
      alert(msg || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!enrollment?.completedLessons) return false;
    return enrollment.completedLessons.some((l: unknown) => {
      const lid = typeof l === 'object' && l !== null
        ? (l as { _id?: string })._id || String(l)
        : String(l);
      return lid === lessonId;
    });
  };

  const openVideo = (lesson: Lesson) => {
    if (!enrollment) return alert('Please enroll first to watch lessons');
    setActiveLesson(lesson);
    setShowVideo(true);
  };

  const toggleComplete = async (lesson: Lesson) => {
    if (!enrollment) return;
    setTogglingLesson(true);
    try {
      const res = await axios.post(
        `/api/enroll/${enrollment._id}/lesson/${lesson._id}/toggle`
      );
      setEnrollment({ ...enrollment, ...res.data.data });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to update progress';
      alert(msg || 'Failed to update progress');
    } finally {
      setTogglingLesson(false);
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const yt = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return url;
  };

  const isEmbeddable = (url: string): boolean => {
    if (!url) return false;
    const e = getEmbedUrl(url) || '';
    return e.includes('youtube') || e.includes('vimeo');
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading course details…</p>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Course not found'}</Alert>
        <IconButton icon={FaArrowLeft} label="Back to Courses" outline
          onClick={() => navigate('/courses')} />
      </Container>
    );
  }

  const instructorName =
    typeof course.instructor === 'object' && course.instructor !== null
      ? course.instructor.name
      : 'Unknown';
  const isPaid = course.price > 0;

  return (
    <Container className="py-4">
      <div className="course-hero">
        <img src={getCourseImage(course)} alt={course.title} />
        <div className="course-hero-overlay">
          <h1>{course.title}</h1>
          <div className="meta">
            By {instructorName} • {course.category} • {course.level}
          </div>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <h3 className="section-heading">Description</h3>
          <p style={{ color: '#4a5568', lineHeight: 1.7 }}>{course.description}</p>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h3 className="section-heading mb-0">Course Content</h3>
            {enrollment && (
              <Badge bg="primary"
                style={{ fontSize: '0.9rem', borderRadius: 10, padding: '8px 14px' }}>
                {enrollment.completedLessons?.length || 0} / {course.lessons?.length || 0} lessons done
              </Badge>
            )}
          </div>

          <ListGroup className="mb-4 mt-3">
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => {
                const done = isLessonCompleted(lesson._id);
                const hasVideo = !!lesson.videoUrl;
                return (
                  <ListGroup.Item key={lesson._id || index}
                    className={`lesson-item-modern ${done ? 'completed' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                          <Badge bg={done ? 'success' : 'secondary'}>
                            {done ? <FaCheck /> : index + 1}
                          </Badge>
                          <strong>{lesson.title}</strong>
                          {lesson.duration && lesson.duration !== '00:00' && (
                            <Badge bg="info"><FaClock /> {lesson.duration}</Badge>
                          )}
                          {hasVideo && (
                            <Badge bg="warning" text="dark"><FaVideo /> Video</Badge>
                          )}
                        </div>
                        {lesson.content && (
                          <small className="text-muted d-block">
                            {lesson.content.substring(0, 150)}
                            {lesson.content.length > 150 ? '…' : ''}
                          </small>
                        )}
                      </div>
                      {enrollment && (
                        <div className="d-flex gap-2 flex-wrap">
                          <IconButton icon={FaPlay} label="Watch" variant="info" size="sm"
                            disabled={!hasVideo}
                            onClick={() => openVideo(lesson)} />
                          <IconButton
                            icon={done ? FaUndo : FaCheck}
                            label={done ? 'Undo' : 'Mark Complete'}
                            variant={done ? 'warning' : 'success'}
                            size="sm"
                            disabled={togglingLesson}
                            onClick={() => toggleComplete(lesson)} />
                        </div>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })
            ) : (
              <ListGroup.Item>
                <Alert variant="warning" className="mb-0">
                  No lessons available yet.
                </Alert>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm sticky-top"
            style={{ top: '20px', borderRadius: 20, border: 'none' }}>
            <Card.Body className="p-4">
              <h3 style={{
                fontSize: '2rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {isPaid ? `$${course.price}` : 'Free'}
              </h3>
              <p className="text-muted mb-1">Duration: {course.duration || '4 weeks'}</p>
              <p className="text-muted mb-3">Level: {course.level || 'Beginner'}</p>
              <hr />

              {enrollment ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="fw-bold" style={{ color: '#667eea' }}>
                        {enrollment.progress || 0}%
                      </small>
                    </div>
                    <ProgressBar now={enrollment.progress || 0} className="progress-modern" />
                  </div>
                  <Badge bg={enrollment.progress === 100 ? 'success' : 'info'}
                    className="mb-3"
                    style={{ borderRadius: 10, padding: '8px 14px' }}>
                    <FaCheckCircle /> {enrollment.status || 'active'}
                  </Badge>
                  <IconButton icon={FaCheck} label="Enrolled" variant="success" disabled
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} />
                </>
              ) : (
                <IconButton
                  icon={isPaid ? FaCreditCard : FaCheckCircle}
                  label={
                    enrolling
                      ? 'Processing…'
                      : user?.role !== 'student'
                      ? 'Only students can enroll'
                      : isPaid
                      ? `Pay $${course.price} & Enroll`
                      : 'Enroll Now'
                  }
                  variant="primary"
                  onClick={handleEnroll}
                  disabled={enrolling || user?.role !== 'student'}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} />
              )}

              <IconButton icon={FaArrowLeft} label="Back to Courses" outline
                onClick={() => navigate('/courses')}
                style={{ width: '100%', justifyContent: 'center' }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showVideo} onHide={() => setShowVideo(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><FaPlay /> {activeLesson?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeLesson?.videoUrl ? (
            isEmbeddable(activeLesson.videoUrl) ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={getEmbedUrl(activeLesson.videoUrl) || ''}
                  title={activeLesson.title}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%', borderRadius: 12
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            ) : (
              <video
                controls
                style={{ width: '100%', maxHeight: 500, borderRadius: 12 }}
                src={activeLesson.videoUrl}
                onEnded={() => {
                  if (enrollment && activeLesson && !isLessonCompleted(activeLesson._id)) {
                    toggleComplete(activeLesson);
                  }
                }}>
                Your browser does not support video.
              </video>
            )
          ) : (
            <Alert variant="warning">No video URL for this lesson.</Alert>
          )}
          {activeLesson?.content && (
            <div className="mt-3">
              <h6>Lesson Notes:</h6>
              <p className="text-muted">{activeLesson.content}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {activeLesson && enrollment && (
            <IconButton
              icon={isLessonCompleted(activeLesson._id) ? FaUndo : FaCheck}
              label={isLessonCompleted(activeLesson._id) ? 'Undo Complete' : 'Mark Complete'}
              variant={isLessonCompleted(activeLesson._id) ? 'warning' : 'success'}
              onClick={() => toggleComplete(activeLesson)}
              disabled={togglingLesson} />
          )}
          <IconButton icon={FaArrowLeft} label="Close" variant="outline"
            onClick={() => setShowVideo(false)} />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CourseDetail;
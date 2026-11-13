import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Spinner, Alert,
  Modal, Badge, ProgressBar
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCourseImage } from '../hooks/useCourseImage';
import IconButton from '../components/IconButton';
import CourseContent from '../components/CourseContent';
import QuizSection from '../components/QuizSection';
import type { Course, Enrollment, Lesson } from '../types';
import {
  FaArrowLeft, FaCheck, FaCheckCircle, FaCreditCard, FaClock,
  FaGraduationCap, FaPlay, FaTrophy, FaLock, FaBookOpen,
  FaUserGraduate, FaStar
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

  const { src: courseImg, onError: onImgError } = useCourseImage(course || undefined);

  // ─── Helper: check if lesson is completed ───
  const isLessonDone = (lessonId: string): boolean => {
    if (!enrollment?.completedLessons) return false;
    return enrollment.completedLessons.some((l: unknown) => {
      const lid =
        typeof l === 'object' && l !== null
          ? (l as { _id?: string })._id || String(l)
          : String(l);
      return lid === lessonId;
    });
  };

  // ─── Data fetching ───
  const fetchCourse = useCallback(async () => {
    try {
      const res = await axios.get<{ data: Course }>(`/api/courses/${id}`);
      setCourse(res.data.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Course not found');
      } else {
        setError('Failed to load course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEnrollment = useCallback(async () => {
    try {
      const res = await axios.get<{ data: Enrollment }>(`/api/enroll/course/${id}`);
      setEnrollment(res.data.data);
    } catch {
      setEnrollment(null);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setCourse(null);
    setEnrollment(null);
    fetchCourse();
    if (user && user.role === 'student') fetchEnrollment();
  }, [fetchCourse, fetchEnrollment, user]);

  // ─── Enroll ───
  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    // Paid → Stripe
    if (course && course.price > 0) {
      setEnrolling(true);
      try {
        const res = await axios.post<{ url: string }>(`/api/courses/${id}/checkout`);
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

    // Free → direct
    setEnrolling(true);
    try {
      const res = await axios.post<{ data: Enrollment }>('/api/enroll', { courseId: id });
      setEnrollment(res.data.data);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to enroll';
      alert(msg || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  // ─── Lesson actions ───
  const openVideo = (lesson: Lesson) => {
    if (!enrollment) {
      alert('Please enroll first to watch lessons');
      return;
    }
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

  // ─── Video helpers ───
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

  // ─── Loading ───
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course details…</p>
        </div>
      </Container>
    );
  }

  // ─── Error ───
  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Course not found'}</Alert>
        <IconButton
          icon={FaArrowLeft}
          label="Back to Courses"
          outline
          onClick={() => navigate('/courses')}
        />
      </Container>
    );
  }

  // ─── Derived state ───
  const instructorName =
    typeof course.instructor === 'object' && course.instructor !== null
      ? course.instructor.name
      : 'Unknown';
  const isPaid = course.price > 0;
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const showQuiz = isEnrolled && progress === 100;
  const canEnroll = !isEnrolled && user?.role === 'student';

  return (
    <Container className="py-4">
      {/* ─── HERO ─── */}
      <div className="course-hero" style={{ borderRadius: 24, overflow: 'hidden' }}>
        <img src={courseImg} alt={course.title} onError={onImgError} />
        <div className="course-hero-overlay">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <Badge bg="warning" text="dark">{course.category}</Badge>
            <Badge bg="info">{course.level}</Badge>
          </div>
          <h1>{course.title}</h1>
          <div className="meta">
            <FaUserGraduate /> By {instructorName}
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* ─── MAIN CONTENT ─── */}
        <Col lg={8}>
          <h3 className="section-heading">About this course</h3>
          <p style={{ color: '#4a5568', lineHeight: 1.8, fontSize: '1.02rem' }}>
            {course.description}
          </p>

          {/* Course Content */}
          <CourseContent
            lessons={course.lessons || []}
            enrollment={enrollment}
            onOpenVideo={openVideo}
            onToggleComplete={toggleComplete}
            toggling={togglingLesson}
          />

          {/* Quiz — shows automatically after 100% progress */}
          {showQuiz && (
            <QuizSection courseId={course._id} courseTitle={course.title} />
          )}
        </Col>

        {/* ─── SIDEBAR ─── */}
        <Col lg={4}>
          <Card
            className="shadow-sm sticky-top border-0"
            style={{ top: '90px', borderRadius: 20 }}
          >
            <Card.Body className="p-4">
              {/* Price */}
              <h3
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}
              >
                {isPaid ? `$${course.price}` : 'Free'}
              </h3>

              {/* Meta */}
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <Badge bg="light" text="dark" style={{ padding: '8px 12px' }}>
                  <FaClock /> {course.duration || '4 weeks'}
                </Badge>
                <Badge bg="light" text="dark" style={{ padding: '8px 12px' }}>
                  <FaGraduationCap /> {course.level}
                </Badge>
                <Badge bg="light" text="dark" style={{ padding: '8px 12px' }}>
                  <FaBookOpen /> {course.lessons?.length || 0} lessons
                </Badge>
              </div>

              <hr />

              {/* Enroll block */}
              {isEnrolled ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Your Progress</small>
                      <small className="fw-bold" style={{ color: '#667eea' }}>
                        {progress}%
                      </small>
                    </div>
                    <ProgressBar
                      now={progress}
                      className="progress-modern"
                      style={{ height: 8, borderRadius: 8 }}
                    />
                  </div>

                  <Badge
                    bg={progress === 100 ? 'success' : 'info'}
                    className="mb-3"
                    style={{ borderRadius: 10, padding: '8px 14px' }}
                  >
                    <FaCheckCircle /> {enrollment.status || 'active'}
                  </Badge>

                  <IconButton
                    icon={FaCheck}
                    label="You're Enrolled"
                    variant="success"
                    disabled
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
                  />
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
                      : 'Enroll Now — Free'
                  }
                  variant="primary"
                  onClick={handleEnroll}
                  disabled={enrolling || !canEnroll}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
                />
              )}

              {/* What you get */}
              <div className="mt-3" style={{ fontSize: '0.85rem' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaCheckCircle color="#48bb78" />
                  <span>Full lifetime access</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaStar color="#f6ad55" />
                  <span>Certificate on completion</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaPlay color="#4299e1" />
                  <span>HD video lessons</span>
                </div>
                {!isEnrolled && (
                  <div className="d-flex align-items-center gap-2">
                    <FaLock color="#a0aec0" />
                    <span className="text-muted">Enroll to unlock content</span>
                  </div>
                )}
              </div>

              {/* Quiz CTA */}
              {showQuiz && (
                <div
                  className="mt-3 p-3"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    borderRadius: 12,
                    border: '1px solid #fbbf24'
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaTrophy color="#d97706" />
                    <strong style={{ color: '#92400e' }}>Course Completed! 🎉</strong>
                  </div>
                  <small style={{ color: '#92400e' }}>
                    Take the final quiz below to earn your certificate.
                  </small>
                </div>
              )}

              <IconButton
                icon={FaArrowLeft}
                label="Back to Courses"
                outline
                onClick={() => navigate('/courses')}
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ─── VIDEO MODAL ─── */}
      <Modal
        show={showVideo}
        onHide={() => setShowVideo(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaPlay color="#667eea" /> {activeLesson?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeLesson?.videoUrl ? (
            isEmbeddable(activeLesson.videoUrl) ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={getEmbedUrl(activeLesson.videoUrl) || ''}
                  title={activeLesson.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 12
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                controls
                style={{ width: '100%', maxHeight: 500, borderRadius: 12 }}
                src={activeLesson.videoUrl}
                onEnded={() => {
                  if (
                    enrollment &&
                    activeLesson &&
                    !togglingLesson &&
                    !isLessonDone(activeLesson._id)
                  ) {
                    toggleComplete(activeLesson);
                  }
                }}
              >
                Your browser does not support video.
              </video>
            )
          ) : (
            <Alert variant="warning">No video URL available for this lesson.</Alert>
          )}

          {activeLesson?.content && (
            <div className="mt-3">
              <h6 className="fw-bold">📝 Lesson Notes</h6>
              <p className="text-muted mb-0" style={{ lineHeight: 1.6 }}>
                {activeLesson.content}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaArrowLeft}
            label="Close"
            variant="outline"
            onClick={() => setShowVideo(false)}
          />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CourseDetail;
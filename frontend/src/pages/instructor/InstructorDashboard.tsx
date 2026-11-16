import React, { useState, useEffect, ChangeEvent } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import IconButton from '../../components/IconButton';
import {
  FaPlus, FaEdit, FaTrash, FaBookOpen, FaUsers, FaMoneyBillWave,
  FaLayerGroup, FaClock, FaVideo, FaSave, FaTimes, FaChalkboardTeacher,
  FaTrophy
} from 'react-icons/fa';
import type { Course, Lesson } from '../../types';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

const EMPTY_LESSON: Partial<Lesson> = {
  title: '',
  content: '',
  videoUrl: '',
  duration: ''
};

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  // ✅ Properly typed states
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>(EMPTY_LESSON);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchInstructorCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await axios.get<{ data: Course[] }>(
        '/api/courses/instructor/my-courses'
      );
      const data = response.data.data;
      setCourses(data);
      setStats({
        totalCourses: data.length,
        totalStudents: data.reduce(
          (s, c) => s + (c.enrolledStudents?.length || 0),
          0
        ),
        totalRevenue: data.reduce(
          (s, c) => s + (c.price || 0) * (c.enrolledStudents?.length || 0),
          0
        )
      });
    } catch {
      alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/courses/${courseId}`);
      fetchInstructorCourses();
    } catch {
      alert('Failed to delete course');
    }
  };

  const openLessonManager = (course: Course) => {
    setSelectedCourse(course);
    setLessons(course.lessons || []);
    setShowLessonModal(true);
  };

  const handleLessonChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLesson({ ...newLesson, [e.target.name]: e.target.value });
  };

  const addLesson = async () => {
    if (!selectedCourse) return;
    if (!newLesson.title || !newLesson.content) {
      alert('Title and content required');
      return;
    }
    try {
      const response = await axios.post<{ data: Course }>(
        `/api/courses/${selectedCourse._id}/lessons`,
        newLesson
      );
      const updated = response.data.data.lessons;
      setLessons(updated);
      setNewLesson(EMPTY_LESSON);
      setCourses(
        courses.map((c) =>
          c._id === selectedCourse._id ? { ...c, lessons: updated } : c
        )
      );
      setSelectedCourse({ ...selectedCourse, lessons: updated });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to add lesson';
      alert(msg || 'Failed to add lesson');
    }
  };

  const updateLesson = async () => {
    if (!selectedCourse || !editingLesson) return;
    try {
      const updated = lessons.map((l) =>
        l._id === editingLesson._id ? editingLesson : l
      );
      await axios.put(`/api/courses/${selectedCourse._id}`, {
        lessons: updated
      });
      setLessons(updated);
      setEditingLesson(null);
      setNewLesson(EMPTY_LESSON);
      setCourses(
        courses.map((c) =>
          c._id === selectedCourse._id ? { ...c, lessons: updated } : c
        )
      );
    } catch {
      alert('Failed to update');
    }
  };

  const deleteLesson = async (index: number, title: string) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Delete "${title}"?`)) return;
    const updated = lessons.filter((_, i) => i !== index);
    try {
      await axios.put(`/api/courses/${selectedCourse._id}`, {
        lessons: updated
      });
      setLessons(updated);
      setCourses(
        courses.map((c) =>
          c._id === selectedCourse._id ? { ...c, lessons: updated } : c
        )
      );
    } catch {
      alert('Failed to delete');
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || ''
    });
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setNewLesson(EMPTY_LESSON);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard…</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="d-flex align-items-center gap-2 mb-0">
          <FaChalkboardTeacher color="#667eea" /> Instructor Dashboard
        </h2>
        <Link to="/instructor/courses/create" className="text-decoration-none">
          <IconButton icon={FaPlus} label="New Course" variant="primary" />
        </Link>
      </div>

      {/* STATS */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="stat-card-modern gradient-primary">
            <h1>{stats.totalCourses}</h1>
            <p><FaBookOpen /> Total Courses</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-success">
            <h1>{stats.totalStudents}</h1>
            <p><FaUsers /> Enrolled Students</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-info">
            <h1>${stats.totalRevenue}</h1>
            <p><FaMoneyBillWave /> Revenue</p>
          </Card>
        </Col>
      </Row>

      <h3 className="section-heading">My Courses</h3>

      {courses.length === 0 ? (
        <Card className="text-center p-5 bg-light" style={{ borderRadius: 20, border: 'none' }}>
          <h4 className="mb-3">No courses yet</h4>
          <div className="d-flex justify-content-center">
            <Link to="/instructor/courses/create" className="text-decoration-none">
              <IconButton icon={FaPlus} label="Create Your First Course" variant="primary" />
            </Link>
          </div>
        </Card>
      ) : (
        <Table responsive hover>
          <thead style={{ background: '#f7fafc' }}>
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Category</th>
              <th>Price</th>
              <th>Students</th>
              <th>Lessons</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <tr key={course._id}>
                <td>{i + 1}</td>
                <td><strong>{course.title}</strong></td>
                <td><span className="level-badge">{course.category}</span></td>
                <td>${course.price || 0}</td>
                <td><FaUsers /> {course.enrolledStudents?.length || 0}</td>
                <td><FaLayerGroup /> {course.lessons?.length || 0}</td>
                <td className="d-flex gap-2 flex-wrap">
                  <Link
                    to={`/instructor/courses/${course._id}/edit`}
                    className="text-decoration-none"
                  >
                    <IconButton icon={FaEdit} label="Edit" variant="warning" size="sm" />
                  </Link>
                  <IconButton
                    icon={FaBookOpen}
                    label="Lessons"
                    variant="success"
                    size="sm"
                    onClick={() => openLessonManager(course)}
                  />
                  <Link
                    to={`/instructor/courses/${course._id}/quiz`}
                    className="text-decoration-none"
                  >
                    <IconButton icon={FaTrophy} label="Quiz" variant="info" size="sm" />
                  </Link>
                  <IconButton
                    icon={FaTrash}
                    label="Delete"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* LESSONS MODAL */}
      <Modal
        show={showLessonModal}
        size="lg"
        backdrop="static"
        onHide={() => {
          setShowLessonModal(false);
          cancelEdit();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBookOpen color="#667eea" /> Lessons — {selectedCourse?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="mb-3 bg-light" style={{ border: 'none', borderRadius: 16 }}>
            <Card.Body>
              <h6 className="mb-3">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h6>
              <Row className="g-2">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Title *</Form.Label>
                    <Form.Control
                      name="title"
                      value={newLesson.title || ''}
                      onChange={handleLessonChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label><FaClock /> Duration</Form.Label>
                    <Form.Control
                      name="duration"
                      value={newLesson.duration || ''}
                      onChange={handleLessonChange}
                      placeholder="15:30"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mt-2">
                <Form.Label>Content *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="content"
                  value={newLesson.content || ''}
                  onChange={handleLessonChange}
                />
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label><FaVideo /> Video URL</Form.Label>
                <Form.Control
                  name="videoUrl"
                  value={newLesson.videoUrl || ''}
                  onChange={handleLessonChange}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </Form.Group>
              <div className="d-flex gap-2 mt-3">
                {editingLesson ? (
                  <>
                    <IconButton icon={FaSave} label="Update" variant="primary" onClick={updateLesson} />
                    <IconButton icon={FaTimes} label="Cancel" outline onClick={cancelEdit} />
                  </>
                ) : (
                  <IconButton icon={FaPlus} label="Add Lesson" variant="success" onClick={addLesson} />
                )}
              </div>
            </Card.Body>
          </Card>

          <h6>Course Lessons ({lessons.length})</h6>
          {lessons.length === 0 ? (
            <div className="text-center py-4 text-muted border rounded">
              No lessons yet
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {lessons.map((lesson, i) => (
                <Card key={i} className="mb-2 lesson-item-modern">
                  <Card.Body className="p-3 d-flex justify-content-between">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <span className="badge bg-primary me-2">{i + 1}</span>
                        <strong>{lesson.title}</strong>
                        {lesson.duration && (
                          <span className="badge bg-secondary ms-2">
                            <FaClock /> {lesson.duration}
                          </span>
                        )}
                      </div>
                      <small className="text-muted">{lesson.content}</small>
                    </div>
                    <div className="d-flex gap-2">
                      <IconButton
                        icon={FaEdit}
                        variant="warning"
                        size="sm"
                        onClick={() => startEditLesson(lesson)}
                      />
                      <IconButton
                        icon={FaTrash}
                        variant="danger"
                        size="sm"
                        onClick={() => deleteLesson(i, lesson.title)}
                      />
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaTimes}
            label="Close"
            outline
            onClick={() => {
              setShowLessonModal(false);
              cancelEdit();
            }}
          />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InstructorDashboard;
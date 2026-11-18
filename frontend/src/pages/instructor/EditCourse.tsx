import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Container, Row, Col, Form, Card, Alert, Spinner, Modal, Table,
  ProgressBar, Badge,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import {
  FaEdit, FaTrash, FaPlus, FaSave, FaUsers, FaChartLine,
  FaTimes, FaClock, FaVideo, FaBookOpen, FaDollarSign,
  FaCheckCircle, FaLightbulb,
} from 'react-icons/fa';
import { notify } from '../../utils/notify';
import type { Course, Lesson } from '../../types';

interface CourseForm {
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  thumbnail: string;
}

interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  progress?: number;
  enrolledAt?: string;
  completedLessons?: number;
  totalLessons?: number;
}

const EMPTY_LESSON: Omit<Lesson, '_id'> = {
  title: '', content: '', videoUrl: '', duration: '',
};

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CourseForm>({
    title: '', description: '', category: '', price: 0,
    duration: '', level: '', thumbnail: '',
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState<Omit<Lesson, '_id'>>(EMPTY_LESSON);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchEnrolledStudents();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get<{ data: Course }>(`/api/courses/${id}`);
      const course = res.data.data;
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        duration: course.duration,
        level: course.level,
        thumbnail: course.thumbnail || '',
      });
      setLessons(course.lessons || []);
    } catch {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const res = await axios.get<{ data: EnrolledStudent[] }>(
        `/api/courses/${id}/students`
      );
      setEnrolledStudents(res.data.data || []);
    } catch {
      // Silent — non-critical
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleLessonChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLesson((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setNewLesson(EMPTY_LESSON);
  };

  const addLesson = async () => {
    if (!newLesson.title || !newLesson.content) {
      notify.warning('Please fill in lesson title and content');
      return;
    }
    try {
      const res = await axios.post<{ data: Course }>(
        `/api/courses/${id}/lessons`,
        newLesson
      );
      setLessons(res.data.data.lessons);
      resetLessonForm();
      setShowLessonModal(false);
      notify.success('Lesson added');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to add lesson';
      notify.error(msg || 'Failed to add lesson');
    }
  };

  const updateLesson = async () => {
    if (!editingLesson) return;
    const updated = lessons.map((l) =>
      l._id === editingLesson._id ? editingLesson : l
    );
    try {
      await axios.put(`/api/courses/${id}`, { lessons: updated });
      setLessons(updated);
      resetLessonForm();
      setShowLessonModal(false);
      notify.success('Lesson updated');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to update lesson';
      notify.error(msg || 'Failed to update lesson');
    }
  };

  const deleteLesson = async (index: number, title: string) => {
    const ok = await notify.confirm(`Delete "${title}"?`);
    if (!ok) return;
    const updated = lessons.filter((_, i) => i !== index);
    try {
      await axios.put(`/api/courses/${id}`, { lessons: updated });
      setLessons(updated);
      notify.success('Lesson deleted');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to delete lesson';
      notify.error(msg || 'Failed to delete lesson');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/courses/${id}`, formData);
      notify.success('Course updated');
      navigate('/instructor/dashboard');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to update course';
      setError(msg || 'Failed to update course');
      notify.error(msg || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const completionRate =
    enrolledStudents.length > 0
      ? Math.round(
          (enrolledStudents.filter((s) => s.progress === 100).length /
            enrolledStudents.length) *
            100
        )
      : 0;

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading course…</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={7}>
          <Card className="card-modern mb-4">
            <Card.Body className="p-4">
              <h2 className="mb-4 d-flex align-items-center gap-2">
                <FaEdit color="#667eea" /> Edit Course
              </h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option>Programming</option>
                        <option>Python</option>
                        <option>Design</option>
                        <option>Business</option>
                        <option>Marketing</option>
                        <option>SEO</option>
                        <option>Data Science</option>
                        <option>DevOps</option>
                        <option>Cybersecurity</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Level</Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min={0}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Duration</Form.Label>
                      <Form.Control
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3 mb-3">
                  <Form.Label>Thumbnail URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>

                <div className="d-flex gap-2 mt-4">
                  <IconButton
                    icon={FaSave}
                    label={saving ? 'Saving…' : 'Save Changes'}
                    variant="primary"
                    type="submit"
                    disabled={saving}
                  />
                  <IconButton
                    icon={FaTimes}
                    label="Cancel"
                    variant="outline"
                    onClick={() => navigate('/instructor/dashboard')}
                  />
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="card-modern">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 d-flex align-items-center gap-2">
                  <FaBookOpen color="#667eea" /> Lessons{' '}
                  <Badge bg="primary">{lessons.length}</Badge>
                </h3>
                <IconButton
                  icon={FaPlus}
                  label="Add Lesson"
                  variant="success"
                  size="sm"
                  onClick={() => {
                    resetLessonForm();
                    setShowLessonModal(true);
                  }}
                />
              </div>

              {lessons.length === 0 ? (
                <div
                  className="text-center py-5 text-muted"
                  style={{ border: '2px dashed #e2e8f0', borderRadius: 16 }}
                >
                  <FaBookOpen size={40} color="#cbd5e0" className="mb-2" />
                  <p className="mb-0">No lessons yet.</p>
                </div>
              ) : (
                lessons.map((lesson, index) => (
                  <Card key={lesson._id || index} className="mb-2 lesson-item-modern">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                            <Badge bg="primary">{index + 1}</Badge>
                            <strong>{lesson.title}</strong>
                            {lesson.duration && lesson.duration !== '00:00' && (
                              <Badge bg="info">
                                <FaClock /> {lesson.duration}
                              </Badge>
                            )}
                            {lesson.videoUrl && (
                              <Badge bg="warning" text="dark">
                                <FaVideo /> Video
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted d-block">
                            {lesson.content?.substring(0, 150)}
                            {lesson.content?.length > 150 ? '…' : ''}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <IconButton
                            icon={FaEdit}
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setEditingLesson(lesson);
                              setShowLessonModal(true);
                            }}
                          />
                          <IconButton
                            icon={FaTrash}
                            variant="danger"
                            size="sm"
                            onClick={() => deleteLesson(index, lesson.title)}
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="card-modern mb-4">
            <Card.Body className="p-4">
              <h4 className="mb-3 d-flex align-items-center gap-2">
                <FaChartLine color="#667eea" /> Course Statistics
              </h4>
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div
                    className="p-3 rounded-3 text-center"
                    style={{ background: 'rgba(102,126,234,0.08)' }}
                  >
                    <FaBookOpen color="#667eea" size={20} />
                    <h5 className="mt-2 mb-0">{lessons.length}</h5>
                    <small className="text-muted">Lessons</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div
                    className="p-3 rounded-3 text-center"
                    style={{ background: 'rgba(72,187,120,0.08)' }}
                  >
                    <FaUsers color="#48bb78" size={20} />
                    <h5 className="mt-2 mb-0">{enrolledStudents.length}</h5>
                    <small className="text-muted">Students</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div
                    className="p-3 rounded-3 text-center"
                    style={{ background: 'rgba(237,137,54,0.08)' }}
                  >
                    <FaDollarSign color="#ed8936" size={20} />
                    <h5 className="mt-2 mb-0">
                      ${(formData.price * enrolledStudents.length).toFixed(0)}
                    </h5>
                    <small className="text-muted">Revenue</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div
                    className="p-3 rounded-3 text-center"
                    style={{ background: 'rgba(72,187,120,0.08)' }}
                  >
                    <FaCheckCircle color="#48bb78" size={20} />
                    <h5 className="mt-2 mb-0">{completionRate}%</h5>
                    <small className="text-muted">Completion</small>
                  </div>
                </Col>
              </Row>

              <IconButton
                icon={FaUsers}
                label={`View Students (${enrolledStudents.length})`}
                variant="info"
                onClick={() => setShowStudentsModal(true)}
                style={{ width: '100%', justifyContent: 'center' }}
              />
            </Card.Body>
          </Card>

          <Card className="card-modern">
            <Card.Body className="p-4">
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FaLightbulb color="#ed8936" /> Quick Tips
              </h5>
              <ul className="small mb-0 ps-3">
                <li className="mb-1">Add engaging video content</li>
                <li className="mb-1">Keep lessons 5–15 minutes</li>
                <li className="mb-1">Use high-quality thumbnails</li>
                <li className="mb-1">Update content regularly</li>
                <li>Respond to student questions promptly</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showLessonModal}
        onHide={() => {
          setShowLessonModal(false);
          resetLessonForm();
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingLesson ? <FaEdit color="#667eea" /> : <FaPlus color="#48bb78" />}{' '}
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lesson Title *</Form.Label>
              <Form.Control
                type="text"
                value={editingLesson ? editingLesson.title : newLesson.title}
                onChange={(e) =>
                  editingLesson
                    ? setEditingLesson({ ...editingLesson, title: e.target.value })
                    : setNewLesson({ ...newLesson, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lesson Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editingLesson ? editingLesson.content : newLesson.content}
                onChange={(e) =>
                  editingLesson
                    ? setEditingLesson({ ...editingLesson, content: e.target.value })
                    : setNewLesson({ ...newLesson, content: e.target.value })
                }
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    <FaVideo /> Video URL (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editingLesson ? editingLesson.videoUrl || '' : newLesson.videoUrl || ''}
                    onChange={(e) =>
                      editingLesson
                        ? setEditingLesson({ ...editingLesson, videoUrl: e.target.value })
                        : setNewLesson({ ...newLesson, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <FaClock /> Duration
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editingLesson ? editingLesson.duration || '' : newLesson.duration || ''}
                    onChange={(e) =>
                      editingLesson
                        ? setEditingLesson({ ...editingLesson, duration: e.target.value })
                        : setNewLesson({ ...newLesson, duration: e.target.value })
                    }
                    placeholder="15:30"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaTimes}
            label="Cancel"
            variant="outline"
            onClick={() => {
              setShowLessonModal(false);
              resetLessonForm();
            }}
          />
          <IconButton
            icon={editingLesson ? FaSave : FaPlus}
            label={editingLesson ? 'Update Lesson' : 'Add Lesson'}
            variant="primary"
            onClick={editingLesson ? updateLesson : addLesson}
          />
        </Modal.Footer>
      </Modal>

      <Modal
        show={showStudentsModal}
        onHide={() => setShowStudentsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUsers color="#4299e1" /> Enrolled Students — {formData.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {enrolledStudents.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaUsers size={40} color="#cbd5e0" className="mb-2" />
              <p className="mb-0">No students enrolled yet.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Enrolled</th>
                  <th>Progress</th>
                  <th>Lessons</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.name}</td>
                    <td className="small">{s.email}</td>
                    <td className="small">
                      {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ width: 120 }}>
                      <div className="d-flex align-items-center gap-2">
                        <ProgressBar
                          now={s.progress || 0}
                          variant={s.progress === 100 ? 'success' : 'primary'}
                          style={{ height: 6, flex: 1 }}
                        />
                        <span className="small">{s.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="small">
                      {s.completedLessons || 0} / {s.totalLessons || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaTimes}
            label="Close"
            variant="outline"
            onClick={() => setShowStudentsModal(false)}
          />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditCourse;
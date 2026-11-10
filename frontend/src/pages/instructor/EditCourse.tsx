import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert, Spinner, Modal, Table, ProgressBar, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import IconButton from '../../components/IconButton';
import {
  FaEdit, FaTrash, FaPlus, FaSave, FaUsers, FaChartLine,
  FaTimes, FaClock, FaVideo, FaBookOpen, FaDollarSign,
  FaCheckCircle, FaEye, FaLightbulb
} from 'react-icons/fa';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    duration: '',
    level: '',
    thumbnail: ''
  });
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '', duration: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchEnrolledStudents();
    fetchCourseAnalytics();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      const course = response.data.data;
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        duration: course.duration,
        level: course.level,
        thumbnail: course.thumbnail || ''
      });
      setLessons(course.lessons || []);
    } catch (error) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}/students`);
      setEnrolledStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  const fetchCourseAnalytics = async () => {
    try {
      const response = await axios.get('/api/courses/analytics');
      const courseData = response.data.courses.find(c => c._id === id);
      setCourseAnalytics(courseData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLessonChange = (e) => {
    setNewLesson({ ...newLesson, [e.target.name]: e.target.value });
  };

  const addLesson = async () => {
    if (!newLesson.title || !newLesson.content) {
      alert('Please fill in lesson title and content');
      return;
    }
    try {
      const response = await axios.post(`/api/courses/${id}/lessons`, newLesson);
      setLessons(response.data.data.lessons);
      setNewLesson({ title: '', content: '', videoUrl: '', duration: '' });
      setShowLessonModal(false);
      fetchCourseAnalytics();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add lesson');
    }
  };

  const updateLesson = async () => {
    try {
      const updatedLessons = lessons.map(lesson =>
        lesson._id === editingLesson._id ? editingLesson : lesson
      );
      await axios.put(`/api/courses/${id}`, { lessons: updatedLessons });
      setLessons(updatedLessons);
      setShowLessonModal(false);
      setEditingLesson(null);
    } catch (error) {
      alert('Failed to update lesson');
    }
  };

  const deleteLesson = async (lessonIndex, lessonTitle) => {
    if (!window.confirm(`Delete "${lessonTitle}"?`)) return;
    const updatedLessons = lessons.filter((_, index) => index !== lessonIndex);
    try {
      await axios.put(`/api/courses/${id}`, { lessons: updatedLessons });
      setLessons(updatedLessons);
      fetchCourseAnalytics();
    } catch (error) {
      alert('Failed to delete lesson');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/courses/${id}`, formData);
      navigate('/instructor/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setNewLesson({ title: '', content: '', videoUrl: '', duration: '' });
  };

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
          {/* ═══ COURSE EDIT FORM ═══ */}
          <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: 20 }}>
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
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        <option>Programming</option>
                        <option>Design</option>
                        <option>Business</option>
                        <option>Marketing</option>
                        <option>Data Science</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Level</Form.Label>
                      <Form.Select name="level" value={formData.level} onChange={handleChange}>
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

          {/* ═══ LESSONS LIST ═══ */}
          <Card className="shadow-sm" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 d-flex align-items-center gap-2">
                  <FaBookOpen color="#667eea" /> Course Lessons
                  <Badge bg="primary">{lessons.length}</Badge>
                </h3>
                <IconButton
                  icon={FaPlus}
                  label="Add New Lesson"
                  variant="success"
                  size="sm"
                  onClick={() => { resetLessonForm(); setShowLessonModal(true); }}
                />
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ border: '2px dashed #e2e8f0', borderRadius: 16 }}>
                  <FaBookOpen size={40} color="#cbd5e0" className="mb-2" />
                  <p className="mb-0">No lessons added yet. Click "Add New Lesson" to get started.</p>
                </div>
              ) : (
                <div>
                  {lessons.map((lesson, index) => (
                    <Card key={index} className="mb-2 lesson-item-modern">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                              <Badge bg="primary">{index + 1}</Badge>
                              <strong>{lesson.title}</strong>
                              {lesson.duration && lesson.duration !== '00:00' && (
                                <Badge bg="info"><FaClock /> {lesson.duration}</Badge>
                              )}
                              {lesson.videoUrl && (
                                <Badge bg="warning" text="dark"><FaVideo /> Video</Badge>
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
                              onClick={() => { setEditingLesson(lesson); setShowLessonModal(true); }}
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
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <Col md={5}>
          {/* Stats Card */}
          <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="p-4">
              <h4 className="mb-3 d-flex align-items-center gap-2">
                <FaChartLine color="#667eea" /> Course Statistics
              </h4>
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="p-3 rounded-3 text-center" style={{ background: 'rgba(102,126,234,0.08)' }}>
                    <FaBookOpen color="#667eea" size={20} />
                    <h5 className="mt-2 mb-0">{lessons.length}</h5>
                    <small className="text-muted">Lessons</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 rounded-3 text-center" style={{ background: 'rgba(72,187,120,0.08)' }}>
                    <FaUsers color="#48bb78" size={20} />
                    <h5 className="mt-2 mb-0">{enrolledStudents.length}</h5>
                    <small className="text-muted">Students</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 rounded-3 text-center" style={{ background: 'rgba(237,137,54,0.08)' }}>
                    <FaDollarSign color="#ed8936" size={20} />
                    <h5 className="mt-2 mb-0">${(formData.price * enrolledStudents.length).toFixed(0)}</h5>
                    <small className="text-muted">Revenue</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 rounded-3 text-center" style={{ background: 'rgba(72,187,120,0.08)' }}>
                    <FaCheckCircle color="#48bb78" size={20} />
                    <h5 className="mt-2 mb-0">Active</h5>
                    <small className="text-muted">Status</small>
                  </div>
                </Col>
              </Row>

              <IconButton
                icon={FaUsers}
                label={`View Students (${enrolledStudents.length})`}
                variant="info"
                onClick={() => setShowStudentsModal(true)}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              />
              <IconButton
                icon={FaChartLine}
                label="View Analytics"
                variant="primary"
                onClick={() => setShowAnalyticsModal(true)}
                style={{ width: '100%', justifyContent: 'center' }}
              />
            </Card.Body>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-sm" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="p-4">
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FaLightbulb color="#ed8936" /> Quick Tips
              </h5>
              <ul className="small mb-0 ps-3">
                <li className="mb-1">Add engaging video content to increase engagement</li>
                <li className="mb-1">Keep lessons concise (5-15 minutes)</li>
                <li className="mb-1">Use high-quality thumbnails for better CTR</li>
                <li className="mb-1">Regularly update course content</li>
                <li>Respond to student questions promptly</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ═══ ADD/EDIT LESSON MODAL ═══ */}
      <Modal
        show={showLessonModal}
        onHide={() => { setShowLessonModal(false); resetLessonForm(); }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            {editingLesson ? <FaEdit color="#667eea" /> : <FaPlus color="#48bb78" />}
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
                onChange={(e) => {
                  if (editingLesson) setEditingLesson({ ...editingLesson, title: e.target.value });
                  else setNewLesson({ ...newLesson, title: e.target.value });
                }}
                placeholder="e.g., Introduction to Web Development"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lesson Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editingLesson ? editingLesson.content : newLesson.content}
                onChange={(e) => {
                  if (editingLesson) setEditingLesson({ ...editingLesson, content: e.target.value });
                  else setNewLesson({ ...newLesson, content: e.target.value });
                }}
                placeholder="Enter lesson description or content…"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaVideo /> Video URL (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={editingLesson ? editingLesson.videoUrl : newLesson.videoUrl}
                onChange={(e) => {
                  if (editingLesson) setEditingLesson({ ...editingLesson, videoUrl: e.target.value });
                  else setNewLesson({ ...newLesson, videoUrl: e.target.value });
                }}
                placeholder="https://www.youtube.com/watch?v=…"
              />
              <Form.Text className="text-muted">Paste YouTube or Vimeo URL</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaClock /> Duration (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={editingLesson ? editingLesson.duration : newLesson.duration}
                onChange={(e) => {
                  if (editingLesson) setEditingLesson({ ...editingLesson, duration: e.target.value });
                  else setNewLesson({ ...newLesson, duration: e.target.value });
                }}
                placeholder="e.g., 15:30"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaTimes}
            label="Cancel"
            variant="outline"
            onClick={() => { setShowLessonModal(false); resetLessonForm(); }}
          />
          <IconButton
            icon={editingLesson ? FaSave : FaPlus}
            label={editingLesson ? 'Update Lesson' : 'Add Lesson'}
            variant="primary"
            onClick={editingLesson ? updateLesson : addLesson}
          />
        </Modal.Footer>
      </Modal>

      {/* ═══ ENROLLED STUDENTS MODAL ═══ */}
      <Modal show={showStudentsModal} onHide={() => setShowStudentsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
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
              <thead style={{ background: '#f7fafc' }}>
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
                {enrolledStudents.map((student, index) => (
                  <tr key={student._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {student.profilePicture ? (
                          <img
                            src={student.profilePicture}
                            alt={student.name}
                            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{ width: 30, height: 30, fontSize: 12, fontWeight: 600 }}
                          >
                            {student.name?.charAt(0)}
                          </div>
                        )}
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="small">{student.email}</td>
                    <td className="small">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                    <td style={{ width: 120 }}>
                      <div className="d-flex align-items-center gap-2">
                        <ProgressBar
                          now={student.progress || 0}
                          variant={student.progress === 100 ? 'success' : 'primary'}
                          style={{ height: 6, flex: 1 }}
                        />
                        <span className="small">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="small">{student.completedLessons || 0} / {student.totalLessons || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton icon={FaTimes} label="Close" variant="outline" onClick={() => setShowStudentsModal(false)} />
        </Modal.Footer>
      </Modal>

      {/* ═══ ANALYTICS MODAL ═══ */}
      <Modal show={showAnalyticsModal} onHide={() => setShowAnalyticsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaChartLine color="#667eea" /> Analytics — {formData.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {courseAnalytics ? (
            <>
              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <Card className="stat-card-modern gradient-primary">
                    <h1 style={{ fontSize: '1.8rem' }}><FaUsers /> {enrolledStudents.length}</h1>
                    <p>Total Students</p>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card-modern gradient-success">
                    <h1 style={{ fontSize: '1.8rem' }}><FaDollarSign /> ${(formData.price * enrolledStudents.length).toFixed(0)}</h1>
                    <p>Total Revenue</p>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card-modern gradient-info">
                    <h1 style={{ fontSize: '1.8rem' }}><FaBookOpen /> {lessons.length}</h1>
                    <p>Total Lessons</p>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card-modern gradient-primary">
                    <h1 style={{ fontSize: '1.8rem' }}><FaCheckCircle /> {courseAnalytics.completionRate || 0}%</h1>
                    <p>Completion Rate</p>
                  </Card>
                </Col>
              </Row>

              <h6 className="section-heading mb-3" style={{ fontSize: '1rem' }}>Student Progress Distribution</h6>
              <div className="mb-3">
                {[
                  { label: '0–25%', filter: s => s.progress < 25, variant: 'danger' },
                  { label: '25–50%', filter: s => s.progress >= 25 && s.progress < 50, variant: 'warning' },
                  { label: '50–75%', filter: s => s.progress >= 50 && s.progress < 75, variant: 'info' },
                  { label: '75–99%', filter: s => s.progress >= 75 && s.progress < 100, variant: 'primary' },
                  { label: '100% (Completed)', filter: s => s.progress === 100, variant: 'success' }
                ].map(({ label, filter, variant }) => {
                  const count = enrolledStudents.filter(filter).length;
                  const pct = (count / (enrolledStudents.length || 1)) * 100;
                  return (
                    <div key={label} className="mb-2">
                      <div className="d-flex justify-content-between mb-1 small">
                        <span>{label}</span>
                        <span>{count} students</span>
                      </div>
                      <ProgressBar now={pct} variant={variant} className="progress-modern" />
                    </div>
                  );
                })}
              </div>

              <h6 className="section-heading mb-3 mt-4" style={{ fontSize: '1rem' }}>Recent Enrollments</h6>
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.slice(0, 5).map((student, idx) => (
                    <tr key={idx}>
                      <td>{student.name}</td>
                      <td>{new Date(student.enrolledAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={student.progress === 100 ? 'success' : 'info'}>
                          {student.progress}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center py-4 text-muted">
              <FaChartLine size={40} color="#cbd5e0" className="mb-2" />
              <p className="mb-0">No analytics data available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <IconButton icon={FaTimes} label="Close" variant="outline" onClick={() => setShowAnalyticsModal(false)} />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditCourse;
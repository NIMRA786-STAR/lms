import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Programming',
    price: 0, duration: '4 weeks', level: 'Beginner', thumbnail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post('/api/courses', formData);
      alert('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="p-4">
              <h2 className="mb-4">Create New Course</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Title *</Form.Label>
                  <Form.Control type="text" name="title" value={formData.title}
                    onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control as="textarea" rows={5} name="description"
                    value={formData.description} onChange={handleChange} required />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        <option>Programming</option><option>Design</option>
                        <option>Business</option><option>Marketing</option>
                        <option>Data Science</option><option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Level</Form.Label>
                      <Form.Select name="level" value={formData.level} onChange={handleChange}>
                        <option>Beginner</option><option>Intermediate</option>
                        <option>Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control type="number" name="price" value={formData.price}
                        onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Duration</Form.Label>
                      <Form.Control type="text" name="duration" value={formData.duration}
                        onChange={handleChange} placeholder="e.g., 4 weeks" />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mt-3">
                  <Form.Label>Thumbnail URL (optional)</Form.Label>
                  <Form.Control type="text" name="thumbnail" value={formData.thumbnail}
                    onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </Form.Group>
                <div className="d-flex gap-2 mt-4">
                  <IconButton icon={FaPlus} label={loading ? 'Creating…' : 'Create Course'}
                    variant="primary" type="submit" disabled={loading} />
                  <IconButton icon={FaTimes} label="Cancel" variant="outline"
                    onClick={() => navigate('/instructor/dashboard')} />
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateCourse;
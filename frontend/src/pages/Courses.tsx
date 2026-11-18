import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Container, Row, Col, Form, Spinner, Card, InputGroup } from 'react-bootstrap';
import { useCourseImage } from '../hooks/useCourseImage';
import axios from 'axios';
import { Link } from 'react-router-dom';
import IconButton from '../components/IconButton';
import { FaSearch, FaTimes, FaArrowRight } from 'react-icons/fa';
import type { Course } from '../types';
import { notify } from '../utils/notify';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const { src, onError } = useCourseImage(course);
  return (
    <Card className="course-card-modern">
      <div className="card-img-wrapper">
        <span className="category-badge">{course.category}</span>
        <Card.Img variant="top" src={src} alt={course.title} onError={onError} />
      </div>
      <Card.Body className="p-4">
        <Card.Title className="card-title">{course.title}</Card.Title>
        <div className="instructor-name">
          By {typeof course.instructor === 'object' && course.instructor !== null ? course.instructor.name : 'Unknown'}
        </div>
        <Card.Text className="course-description">{course.description?.substring(0, 90)}…</Card.Text>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="price-tag">${course.price || 0}</span>
          <span className="level-badge">{course.level || 'Beginner'}</span>
        </div>
        <Link to={`/courses/${course._id}`} className="text-decoration-none">
          <IconButton icon={FaArrowRight} label="View Course" variant="primary" style={{ width: '100%', justifyContent: 'center' }} />
        </Link>
      </Card.Body>
    </Card>
  );
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      const res = await axios.get<{ data: Course[] }>('/api/courses', { params });
      setCourses(res.data.data);
    } catch {
      notify.error('Failed to load courses. Please try again.');
    } finally { setLoading(false); }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchCourses, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, selectedCategory, selectedLevel]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchCourses();
  };

  const clearFilters = () => { setSearchTerm(''); setSelectedCategory(''); setSelectedLevel(''); };

  const categories = ['All','Programming','Python','Design','Business','Marketing','SEO','Data Science','DevOps','Cybersecurity','Other'];
  const levels = ['', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Explore Courses</h1>
      <Card className="mb-4 shadow-sm" style={{ border: 'none', borderRadius: 16 }}>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control type="text" placeholder="Search by title or description…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <IconButton icon={FaSearch} label="Search" variant="primary" type="submit" />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label>Category</Form.Label>
                <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Level</Form.Label>
                <Form.Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                  {levels.map((l) => <option key={l || 'all'} value={l}>{l || 'All Levels'}</option>)}
                </Form.Select>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <IconButton icon={FaTimes} variant="outline" onClick={clearFilters} title="Clear filters" className="w-100" style={{ justifyContent: 'center' }} />
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">Found {courses.length} courses</p>
        {loading && <Spinner animation="border" variant="primary" size="sm" />}
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3">Loading courses…</p></div>
      ) : courses.length === 0 ? (
        <Card className="text-center p-5 bg-light" style={{ border: 'none', borderRadius: 20 }}>
          <div className="py-4">
            <FaSearch size={48} color="#a0aec0" className="mb-3" />
            <h4>No courses found</h4>
            <p className="text-muted">Try adjusting your search or filter criteria.</p>
            <IconButton icon={FaTimes} label="Clear Filters" variant="outline" onClick={clearFilters} />
          </div>
        </Card>
      ) : (
        <Row>
          {courses.map((course) => (
            <Col key={course._id} md={6} lg={4} className="mb-4">
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Courses;
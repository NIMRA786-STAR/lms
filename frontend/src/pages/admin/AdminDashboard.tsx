import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import {
  FaUsers, FaUserGraduate, FaChalkboardTeacher, FaBook,
  FaChartLine, FaUserCog
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data.stats);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="stat-card-modern gradient-primary">
            <h1><FaUsers /> {stats?.users?.total || 0}</h1><p>Total Users</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern gradient-success">
            <h1><FaUserGraduate /> {stats?.users?.students || 0}</h1><p>Students</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern gradient-info">
            <h1><FaChalkboardTeacher /> {stats?.users?.instructors || 0}</h1><p>Instructors</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern gradient-primary">
            <h1><FaBook /> {stats?.courses?.total || 0}</h1><p>Courses</p>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <h4 className="mb-3">Quick Actions</h4>
              <div className="d-flex flex-column gap-2">
                <Link to="/admin/users" className="text-decoration-none">
                  <IconButton icon={FaUsers} label="Manage Users" outline
                    style={{ width: '100%', justifyContent: 'flex-start' }} />
                </Link>
                <Link to="/admin/courses" className="text-decoration-none">
                  <IconButton icon={FaBook} label="Manage Courses" outline
                    style={{ width: '100%', justifyContent: 'flex-start' }} />
                </Link>
                <Link to="/admin/analytics" className="text-decoration-none">
                  <IconButton icon={FaChartLine} label="View Analytics" outline
                    style={{ width: '100%', justifyContent: 'flex-start' }} />
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <h4 className="mb-3">Recent Activity</h4>
              <p><strong>New Users (30d):</strong> {stats?.users?.newLast30Days || 0}</p>
              <p><strong>New Courses (30d):</strong> {stats?.courses?.newLast30Days || 0}</p>
              <p className="mb-0"><strong>Total Enrollments:</strong> {stats?.enrollments?.total || 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="section-heading mb-3">Popular Courses</h3>
      <Row className="g-3">
        {stats?.popularCourses?.map((course, i) => (
          <Col key={course._id} md={4}>
            <Card style={{ border: 'none', borderRadius: 16 }}>
              <Card.Body>
                <h5 className="mb-1">{i + 1}. {course.title}</h5>
                <p className="text-muted mb-0">
                  <FaUsers /> {course.enrolledStudents?.length || 0} students
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminDashboard;
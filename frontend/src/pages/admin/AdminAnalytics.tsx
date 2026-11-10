import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaChartBar, FaUsers, FaBook, FaUserPlus } from 'react-icons/fa';

const AdminAnalytics = () => {
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
      <Spinner animation="border" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4 d-flex align-items-center gap-2">
        <FaChartBar color="#667eea" /> Analytics Overview
      </h2>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="stat-card-modern gradient-primary">
            <h1><FaUsers /> {stats?.users?.total || 0}</h1><p>Total Users</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-success">
            <h1><FaBook /> {stats?.courses?.total || 0}</h1><p>Total Courses</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-info">
            <h1><FaUserPlus /> {stats?.enrollments?.total || 0}</h1><p>Enrollments</p>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm" style={{ border: 'none', borderRadius: 20 }}>
        <Card.Body>
          <h5 className="mb-3">Popular Courses</h5>
          <Table responsive>
            <thead>
              <tr><th>#</th><th>Course</th><th>Enrolled Students</th></tr>
            </thead>
            <tbody>
              {stats?.popularCourses?.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>{c.title}</td>
                  <td>{c.enrolledStudents?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminAnalytics;
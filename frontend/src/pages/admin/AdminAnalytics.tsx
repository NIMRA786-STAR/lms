import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';
import { notify } from '../../utils/notify';
import { FaChartBar, FaUsers, FaBook, FaUserPlus } from 'react-icons/fa';

interface PopularCourse {
  _id: string;
  title: string;
  enrolledStudents?: string[];
}

interface AdminStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    newLast30Days: number;
  };
  courses: { total: number; newLast30Days: number };
  enrollments: { total: number };
  popularCourses: PopularCourse[];
}

const AdminAnalytics = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ success: boolean; stats: AdminStats }>(
          '/api/admin/stats'
        );
        setStats(res.data.stats);
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to load analytics'
          : 'Failed to load analytics';
        setError(msg);
        notify.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3" style={{ color: 'var(--text-muted)' }}>Loading analytics…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="section-heading mb-4 d-flex align-items-center gap-2">
        <FaChartBar color="#667eea" /> Analytics Overview
      </h2>

      {/* ── Top-line stats ── */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="stat-card-modern gradient-primary">
            <h1><FaUsers /> {stats?.users.total ?? 0}</h1>
            <p>Total Users</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-success">
            <h1><FaBook /> {stats?.courses.total ?? 0}</h1>
            <p>Total Courses</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card-modern gradient-info">
            <h1><FaUserPlus /> {stats?.enrollments.total ?? 0}</h1>
            <p>Enrollments</p>
          </Card>
        </Col>
      </Row>

      {/* ── User breakdown ── */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="card-modern text-center">
            <Card.Body>
              <h6 style={{ color: 'var(--text-muted)' }}>Students</h6>
              <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                {stats?.users.students ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="card-modern text-center">
            <Card.Body>
              <h6 style={{ color: 'var(--text-muted)' }}>Instructors</h6>
              <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                {stats?.users.instructors ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="card-modern text-center">
            <Card.Body>
              <h6 style={{ color: 'var(--text-muted)' }}>Admins</h6>
              <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                {stats?.users.admins ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Popular courses table ── */}
      <Card className="card-modern">
        <Card.Body>
          <h5 className="mb-3">Popular Courses</h5>
          {stats?.popularCourses && stats.popularCourses.length > 0 ? (
            <Table responsive hover>
              <thead style={{ background: 'var(--bg-secondary)' }}>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th className="text-end">Enrolled Students</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularCourses.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>{c.title}</td>
                    <td className="text-end">{c.enrolledStudents?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>No courses yet.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminAnalytics;
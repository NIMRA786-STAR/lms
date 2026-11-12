import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import IconButton from '../../components/IconButton';

interface Certificate {
  _id: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  course: { _id: string; title: string; category: string };
}

const MyCertificates = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/certificates/my')
      .then(res => setCerts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4 d-flex align-items-center gap-2">
        <FaTrophy color="#f59e0b" /> My Certificates
      </h2>

      {certs.length === 0 ? (
        <Alert variant="info">
          Complete a course and pass its quiz to earn your first certificate!
        </Alert>
      ) : (
        <Row className="g-3">
          {certs.map(c => (
            <Col key={c._id} md={6} lg={4}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20, overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  padding: 24, color: 'white', textAlign: 'center'
                }}>
                  <FaTrophy size={40} color="#fbbf24" />
                  <h5 className="mt-2 mb-0">Certificate</h5>
                  <small>of Completion</small>
                </div>
                <Card.Body>
                  <h6 className="mb-2">{c.course?.title}</h6>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge bg="success">Score: {c.score}%</Badge>
                    <Badge bg="secondary">{c.course?.category}</Badge>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                    <FaCalendarAlt /> {new Date(c.issuedAt).toLocaleDateString()}
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/courses/${c.course?._id}`} className="text-decoration-none">
                      <IconButton icon={FaExternalLinkAlt} label="View Course" variant="outline" size="sm" />
                    </Link>
                  </div>
                  <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
                    ID: {c.certificateId}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyCertificates;
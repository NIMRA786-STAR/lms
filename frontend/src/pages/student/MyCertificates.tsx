import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaTrophy, FaCalendarAlt, FaExternalLinkAlt, FaDownload
} from 'react-icons/fa';
import IconButton from '../../components/IconButton';

interface Certificate {
  _id: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  course: { _id: string; title: string; category: string };
  student?: { name: string };
}

const MyCertificates = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [certRes, meRes] = await Promise.all([
          axios.get('/api/certificates/my'),
          axios.get('/api/auth/me')
        ]);
        setCerts(certRes.data.data);
        setUserName(meRes.data.data?.name || 'Student');
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ─── Print / Download as PDF ───
  const downloadCertificate = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the certificate.');
      return;
    }

    const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.course.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Georgia', serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f5f7fa;
              padding: 20px;
            }
            .certificate {
              border: 12px double #667eea;
              padding: 60px 80px;
              text-align: center;
              background: white;
              max-width: 900px;
              position: relative;
            }
            .certificate::before {
              content: '';
              position: absolute;
              inset: 20px;
              border: 2px solid #764ba2;
              pointer-events: none;
            }
            .trophy { font-size: 60px; color: #f59e0b; margin-bottom: 20px; }
            h1 {
              color: #667eea;
              font-size: 2.8rem;
              letter-spacing: 4px;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            h2 {
              color: #764ba2;
              font-size: 1.3rem;
              margin-bottom: 40px;
              font-weight: normal;
            }
            p { font-size: 1.1rem; color: #444; margin: 10px 0; }
            .name {
              font-size: 2.2rem;
              margin: 30px 0;
              font-weight: bold;
              color: #1a202c;
              border-bottom: 2px solid #667eea;
              display: inline-block;
              padding-bottom: 10px;
            }
            .course {
              font-size: 1.6rem;
              color: #667eea;
              font-weight: bold;
              margin: 20px 0;
            }
            .score {
              display: inline-block;
              background: #48bb78;
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: bold;
              margin: 20px 0;
            }
            .meta {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              font-size: 0.9rem;
              color: #666;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              body { background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="trophy">🏆</div>
            <h1>Certificate</h1>
            <h2>of Completion</h2>
            <p>This is to certify that</p>
            <div class="name">${userName}</div>
            <p>has successfully completed the course</p>
            <div class="course">${cert.course.title}</div>
            <div class="score">Score: ${cert.score}%</div>
            <div class="meta">
              <span>Certificate ID: ${cert.certificateId}</span>
              <span>Issued: ${issuedDate}</span>
            </div>
          </div>
          <script>
            window.onload = () => setTimeout(() => window.print(), 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
              <Card className="shadow-sm border-0 h-100"
                style={{ borderRadius: 20, overflow: 'hidden' }}>
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
                  <div className="d-flex gap-2 flex-wrap">
                    <IconButton
                      icon={FaDownload}
                      label="Download"
                      variant="primary"
                      size="sm"
                      onClick={() => downloadCertificate(c)}
                    />
                    <Link to={`/courses/${c.course?._id}`} className="text-decoration-none">
                      <IconButton
                        icon={FaExternalLinkAlt}
                        label="View Course"
                        variant="outline"
                        size="sm"
                      />
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
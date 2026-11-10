import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import IconButton from '../components/IconButton';
import { FaTimesCircle, FaArrowLeft, FaBookOpen } from 'react-icons/fa';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <Card className="text-center p-5 shadow-sm"
        style={{ borderRadius: 20, border: 'none' }}>
        <FaTimesCircle size={64} color="#ed8936" />
        <h2 className="mt-3" style={{ fontWeight: 800 }}>
          Payment Cancelled
        </h2>
        <p className="text-muted">
          No charge was made. You can try again anytime.
        </p>

        <div className="d-flex gap-2 justify-content-center mt-4">
          {courseId ? (
            <Link to={`/courses/${courseId}`} className="text-decoration-none">
              <IconButton icon={FaArrowLeft} label="Back to Course" variant="primary" />
            </Link>
          ) : (
            <Link to="/courses" className="text-decoration-none">
              <IconButton icon={FaBookOpen} label="Browse Courses" variant="primary" />
            </Link>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default PaymentCancel;
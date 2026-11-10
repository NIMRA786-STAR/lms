import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../components/IconButton';
import {
  FaCheckCircle, FaTimesCircle, FaArrowRight, FaBookOpen
} from 'react-icons/fa';

interface VerifyResponse {
  success: boolean;
  data?: {
    paid: boolean;
    amount: number;
    currency: string;
    course: { _id: string; title: string; instructor: string } | null;
    enrolled: boolean;
    customerEmail: string;
  };
  message?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        // Webhook may take 1-3s — retry up to 5 times
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          try {
            const res = await axios.get<VerifyResponse>(
              `/api/payment/verify/${sessionId}`
            );
            if (res.data.success && res.data.data?.paid) {
              setVerified(res.data);
              setLoading(false);
              return;
            }
          } catch (err) {
            if (attempts === maxAttempts - 1) throw err;
          }
          attempts++;
          await new Promise((r) => setTimeout(r, 1000));
        }

        // If we get here, verification timed out
        setError('Payment is being processed. Check "My Courses" in a moment.');
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message
          : 'Failed to verify payment';
        setError(msg || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  // ═══════ Loading ═══════
  if (loading) {
    return (
      <Container className="py-5" style={{ maxWidth: 600 }}>
        <Card className="text-center p-5 shadow-sm"
          style={{ borderRadius: 20, border: 'none' }}>
          <Spinner animation="border" variant="primary"
            style={{ width: 60, height: 60, margin: '0 auto' }} />
          <h3 className="mt-4">Verifying your payment…</h3>
          <p className="text-muted">Please don't close this page.</p>
        </Card>
      </Container>
    );
  }

  // ═══════ Error ═══════
  if (error) {
    return (
      <Container className="py-5" style={{ maxWidth: 600 }}>
        <Card className="text-center p-5 shadow-sm"
          style={{ borderRadius: 20, border: 'none' }}>
          <FaTimesCircle size={64} color="#f56565" />
          <h3 className="mt-3">Something went wrong</h3>
          <Alert variant="warning" className="mt-3">{error}</Alert>
          <div className="d-flex gap-2 justify-content-center">
            <Link to="/my-courses" className="text-decoration-none">
              <IconButton icon={FaBookOpen} label="My Courses" variant="primary" />
            </Link>
            <Link to="/courses" className="text-decoration-none">
              <IconButton icon={FaArrowRight} label="Browse Courses" outline />
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const data = verified?.data;

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <Card className="text-center p-5 shadow-sm"
        style={{ borderRadius: 20, border: 'none' }}>
        <FaCheckCircle size={80} color="#48bb78" />
        <h2 className="mt-3" style={{ fontWeight: 800, color: '#1a202c' }}>
          Payment Successful! 🎉
        </h2>
        <p className="text-muted">
          You're now enrolled in <strong>{data?.course?.title}</strong>
        </p>

        <div className="p-3 my-3" style={{
          background: 'rgba(102,126,234,0.08)',
          borderRadius: 12
        }}>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Amount paid</span>
            <strong>${data?.amount.toFixed(2)} {data?.currency}</strong>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Course</span>
            <strong>{data?.course?.title}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Instructor</span>
            <strong>{data?.course?.instructor}</strong>
          </div>
        </div>

        <p className="text-muted small">
          A receipt has been sent to <strong>{data?.customerEmail}</strong>
        </p>

        <div className="d-flex gap-2 justify-content-center mt-3">
          <Link to="/my-courses" className="text-decoration-none">
            <IconButton icon={FaBookOpen} label="Start Learning" variant="primary" />
          </Link>
          {data?.course?._id && (
            <Link to={`/courses/${data.course._id}`} className="text-decoration-none">
              <IconButton icon={FaArrowRight} label="View Course" outline />
            </Link>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
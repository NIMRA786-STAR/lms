import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IconButton from '../components/IconButton';
import axios from 'axios';
import { FaSignInAlt, FaPaperPlane, FaLock, FaArrowLeft } from 'react-icons/fa';

type Mode = 'login' | 'forgot' | 'reset';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('resetToken');

  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resetToken) setMode('reset');
  }, [resetToken]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // ─── Login ───
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  // ─── Forgot Password ───
  const handleForgot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Reset link sent');
    } catch (err: unknown) {
      const fallback =
        err instanceof Error ? err.message : 'Failed to send reset link';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosErr.response?.data?.message || fallback);
      } else {
        setError(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset Password ───
  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/auth/reset-password/${resetToken}`,
        { password: newPassword }
      );
      setSuccess(res.data.message || 'Password reset successful');
      setTimeout(() => {
        navigate('/login');
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      const fallback =
        err instanceof Error ? err.message : 'Reset failed';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosErr.response?.data?.message || fallback);
      } else {
        setError(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="p-5">
              {/* ═══ LOGIN MODE ═══ */}
              {mode === 'login' && (
                <>
                  <h2 className="text-center mb-4">Login</h2>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                    <IconButton
                      icon={FaSignInAlt}
                      label={loading ? 'Logging in…' : 'Login'}
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', justifyContent: 'center' }}
                    />
                  </Form>
                  <div className="d-flex justify-content-between mt-3">
                    <span className="small">
                      No account? <Link to="/register">Register</Link>
                    </span>
                    <a
                      href="#"
                      className="small text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('forgot');
                        clearMessages();
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <hr />
                  <p className="text-center text-muted small mb-0">
                    <strong>Demo Accounts:</strong>
                    <br />
                    Admin: admin@example.com / admin123
                    <br />
                    Instructor: instructor@example.com / instructor123
                    <br />
                    Student: student@example.com / student123
                  </p>
                </>
              )}

              {/* ═══ FORGOT MODE ═══ */}
              {mode === 'forgot' && (
                <>
                  <h2 className="text-center mb-4">Forgot Password</h2>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  <Form onSubmit={handleForgot}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Enter your registered email"
                      />
                    </Form.Group>
                    <IconButton
                      icon={FaPaperPlane}
                      label={loading ? 'Sending…' : 'Send Reset Link'}
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', justifyContent: 'center' }}
                    />
                  </Form>
                  <p className="text-center mt-3 mb-0">
                    <a
                      href="#"
                      className="small text-decoration-none d-inline-flex align-items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('login');
                        clearMessages();
                      }}
                    >
                      <FaArrowLeft /> Back to Login
                    </a>
                  </p>
                </>
              )}

              {/* ═══ RESET MODE ═══ */}
              {mode === 'reset' && (
                <>
                  <h2 className="text-center mb-4">Reset Password</h2>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  <Form onSubmit={handleReset}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                    <IconButton
                      icon={FaLock}
                      label={loading ? 'Resetting…' : 'Reset Password'}
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', justifyContent: 'center' }}
                    />
                  </Form>
                  <p className="text-center mt-3 mb-0">
                    <a
                      href="#"
                      className="small text-decoration-none d-inline-flex align-items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('login');
                        clearMessages();
                      }}
                    >
                      <FaArrowLeft /> Back to Login
                    </a>
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../components/IconButton';
import { FaUserPlus } from 'react-icons/fa';
import { notify } from '../utils/notify';

type Role = 'student' | 'instructor';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      notify.warning(msg);
      return;
    }
    if (formData.password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      notify.warning(msg);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccess('Registration successful! Redirecting to login…');
      notify.success('Registration successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Registration failed'
        : 'Registration failed';
      setError(msg);
      notify.error(msg);
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
              <h2 className="text-center mb-4">Create Account</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">Min 6 characters</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Register as</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </Form.Select>
                </Form.Group>
                <IconButton
                  icon={FaUserPlus}
                  label={loading ? 'Registering…' : 'Register'}
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                />
              </Form>
              <p className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
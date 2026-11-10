import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaSave, FaUndo, FaSignOutAlt, FaUser } from 'react-icons/fa';

const StudentProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '', email: '', bio: '', phone: '', location: '', occupation: '', profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      const d = res.data.data;
      setProfile({
        name: d.name || '', email: d.email || '',
        bio: d.bio || '', phone: d.phone || '',
        location: d.location || '', occupation: d.occupation || '',
        profilePicture: d.profilePicture || ''
      });
    } catch {
      setMessage({ type: 'danger', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/users/${user._id}`, profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading profile…</p>
    </Container>
  );

  return (
    <Container className="py-4">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body className="text-center">
              <div className="mb-3">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name}
                    className="rounded-circle"
                    style={{ width: 120, height: 120, objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: 120, height: 120, fontSize: 48 }}>
                    <FaUser />
                  </div>
                )}
              </div>
              <h4>{profile.name}</h4>
              <p className="text-muted mb-2">{profile.email}</p>
              <p className="badge bg-primary" style={{ textTransform: 'capitalize' }}>
                {user?.role || 'Student'}
              </p>
              <hr />
              <IconButton icon={FaSignOutAlt} label="Logout" variant="danger"
                onClick={logout} style={{ width: '100%', justifyContent: 'center' }} />
            </Card.Body>
          </Card>

          <Card className="shadow-sm" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <h6 className="mb-3">Account Stats</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Member Since:</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Status:</span>
                <strong className="text-success">Active</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Type:</span>
                <strong style={{ textTransform: 'capitalize' }}>{user?.role || 'student'}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <h3 className="mb-4">Edit Profile</h3>
              {message.text && (
                <Alert variant={message.type} dismissible
                  onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control type="text" name="name" value={profile.name}
                        onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={profile.email} disabled />
                      <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control type="tel" name="phone" value={profile.phone}
                        onChange={handleChange} placeholder="+92 300 1234567" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Control type="text" name="location" value={profile.location}
                        onChange={handleChange} placeholder="City, Country" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Occupation</Form.Label>
                      <Form.Control type="text" name="occupation" value={profile.occupation}
                        onChange={handleChange} placeholder="e.g., Student, Engineer" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Bio</Form.Label>
                      <Form.Control as="textarea" rows={4} name="bio" value={profile.bio}
                        onChange={handleChange} placeholder="Tell us about yourself…" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Profile Picture URL</Form.Label>
                      <Form.Control type="text" name="profilePicture" value={profile.profilePicture}
                        onChange={handleChange} placeholder="https://example.com/photo.jpg" />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-3">
                  <IconButton icon={FaSave} label={saving ? 'Saving…' : 'Save Changes'}
                    variant="primary" type="submit" disabled={saving} />
                  <IconButton icon={FaUndo} label="Reset" variant="outline" onClick={fetchProfile} />
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfile;
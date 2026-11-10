import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import IconButton from './IconButton';
import {
  FaHome, FaBook, FaInfoCircle, FaUser, FaSignOutAlt,
  FaSignInAlt, FaUserPlus, FaTachometerAlt
} from 'react-icons/fa';

const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profilePath =
    user?.role === 'student' ? '/student/profile' :
    user?.role === 'instructor' ? '/instructor/profile' : '/profile';

  const dashboardPath =
    user?.role === 'instructor' ? '/instructor/dashboard' :
    user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <Navbar className="navbar-gradient" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <FaBook /> LMS Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/"><FaHome /> Home</Nav.Link>
            <Nav.Link as={Link} to="/courses"><FaBook /> Courses</Nav.Link>
            <Nav.Link as={Link} to="/about"><FaInfoCircle /> About</Nav.Link>
          </Nav>
          <Nav className="align-items-center gap-2">
            {user ? (
              <>
                <Nav.Link as={Link} to={dashboardPath}>
                  <FaTachometerAlt /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to={profilePath}>
                  <FaUser /> {user.name?.split(' ')[0]}
                </Nav.Link>
                <IconButton
                  icon={FaSignOutAlt}
                  label="Logout"
                  outline
                  size="sm"
                  onClick={handleLogout}
                  style={{ color: '#e2e8f0', borderColor: '#4a5568' }}
                />
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login"><FaSignInAlt /> Login</Nav.Link>
                <Nav.Link as={Link} to="/register"><FaUserPlus /> Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
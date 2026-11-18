import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import IconButton from './IconButton';
import {
  FaHome, FaBook, FaInfoCircle, FaUser, FaSignOutAlt,
  FaSignInAlt, FaUserPlus, FaTachometerAlt, FaTrophy,
  FaMoon, FaSun
} from 'react-icons/fa';

const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on navigation
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    setExpanded(false);
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  // Role-based paths
  const profilePath =
    user?.role === 'student'
      ? '/student/profile'
      : user?.role === 'instructor'
      ? '/instructor/profile'
      : '/admin/profile';

  const dashboardPath =
    user?.role === 'instructor'
      ? '/instructor/dashboard'
      : user?.role === 'admin'
      ? '/admin/dashboard'
      : '/dashboard';

  // Is active link helper
  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Navbar
      className="navbar-gradient"
      variant="dark"
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={(nextExpanded) => setExpanded(nextExpanded)}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
          onClick={handleNavClick}
        >
          <FaBook /> LMS Portal
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="nav"
          aria-label="Toggle navigation menu"
        />
        <Navbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              active={isActive('/')}
              onClick={handleNavClick}
            >
              <FaHome /> Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/courses"
              active={isActive('/courses')}
              onClick={handleNavClick}
            >
              <FaBook /> Courses
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/about"
              active={isActive('/about')}
              onClick={handleNavClick}
            >
              <FaInfoCircle /> About
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-2">
            {/* Theme toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {user ? (
              <>
                <Nav.Link
                  as={Link}
                  to={dashboardPath}
                  active={isActive(dashboardPath)}
                  onClick={handleNavClick}
                >
                  <FaTachometerAlt /> Dashboard
                </Nav.Link>

                {user.role === 'student' && (
                  <Nav.Link
                    as={Link}
                    to="/my-certificates"
                    active={isActive('/my-certificates')}
                    onClick={handleNavClick}
                  >
                    <FaTrophy /> Certificates
                  </Nav.Link>
                )}

                <Nav.Link
                  as={Link}
                  to={profilePath}
                  active={isActive(profilePath)}
                  onClick={handleNavClick}
                  title={`${user.role} profile`}
                >
                  <FaUser /> {user.name?.split(' ')[0]}
                </Nav.Link>

                <IconButton
                  icon={FaSignOutAlt}
                  label="Logout"
                  outline
                  size="sm"
                  onClick={handleLogout}
                  className="icon-btn-outline-light"
                />
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  active={isActive('/login')}
                  onClick={handleNavClick}
                >
                  <FaSignInAlt /> Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  active={isActive('/register')}
                  onClick={handleNavClick}
                >
                  <FaUserPlus /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
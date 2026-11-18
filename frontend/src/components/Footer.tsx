import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Social links — replace with your real pages when ready
  const socialLinks = [
    { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  ];

  return (
    <footer className="footer-gradient text-white mt-5 py-4">
      <Container>
        <Row>
          {/* Brand + description */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="d-flex align-items-center gap-2 mb-2">
              <FaBook style={{ color: '#c4b5fd' }} />
              <span>Learning Management System</span>
            </h5>
            <p
              className="small mb-0"
              style={{ color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}
            >
              Empowering education through technology. Learn anytime, anywhere
              with our expert-led courses.
            </p>
          </Col>

          {/* Quick links */}
          <Col md={2} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none small footer-link">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/courses"
                  className="text-decoration-none small footer-link"
                >
                  Courses
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-decoration-none small footer-link"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </Col>

          {/* Support */}
          <Col md={3} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3">Support</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <a
                  href="mailto:support@lms.com"
                  className="text-decoration-none small footer-link"
                >
                  Email Support
                </a>
              </li>
              <li className="mb-2">
                <span
                  className="small"
                  style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                >
                  Documentation{' '}
                  <em style={{ fontSize: '0.7rem' }}>(coming soon)</em>
                </span>
              </li>
              <li className="mb-2">
                <span
                  className="small"
                  style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                >
                  Privacy Policy{' '}
                  <em style={{ fontSize: '0.7rem' }}>(coming soon)</em>
                </span>
              </li>
            </ul>
          </Col>

          {/* Connect */}
          <Col md={3}>
            <h6 className="fw-bold mb-3">Connect With Us</h6>
            <div className="d-flex gap-2 mb-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="social-icon"
                  aria-label={label}
                  title={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <div className="contact-row">
              <FaEnvelope />
              <a
                href="mailto:support@lms.com"
                className="text-decoration-none footer-link small"
              >
                support@lms.com
              </a>
            </div>
            <div className="contact-row">
              <FaPhone />
              <a
                href="tel:+1234567890"
                className="text-decoration-none footer-link small"
              >
                +1 234 567 890
              </a>
            </div>
          </Col>
        </Row>

        <hr className="mt-4 mb-3" />

        <div className="text-center footer-copy">
          &copy; {currentYear} Learning Management System. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
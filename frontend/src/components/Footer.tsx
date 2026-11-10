import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaBook, FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
  FaEnvelope, FaPhone
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-gradient text-white mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="d-flex align-items-center gap-2">
              <FaBook style={{ color: '#c4b5fd' }} />
              <span>Learning Management System</span>
            </h5>
            <p className="text-muted small mb-0">
              Empowering education through technology. Learn anytime, anywhere
              with our expert-led courses.
            </p>
          </Col>

          <Col md={2} className="mb-3 mb-md-0">
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-1"><Link to="/" className="text-decoration-none small">Home</Link></li>
              <li className="mb-1"><Link to="/courses" className="text-decoration-none small">Courses</Link></li>
              <li className="mb-1"><Link to="/about" className="text-decoration-none small">About Us</Link></li>
            </ul>
          </Col>

          <Col md={3} className="mb-3 mb-md-0">
            <h6>Support</h6>
            <ul className="list-unstyled">
              <li className="mb-1"><Link to="/faq" className="text-decoration-none small">FAQ</Link></li>
              <li className="mb-1"><Link to="/contact" className="text-decoration-none small">Contact Us</Link></li>
              <li className="mb-1"><Link to="/privacy" className="text-decoration-none small">Privacy Policy</Link></li>
            </ul>
          </Col>

          <Col md={3}>
            <h6>Connect With Us</h6>
            <div className="d-flex gap-2 mb-3">
              <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
            <div className="contact-row"><FaEnvelope /><span>support@lms.com</span></div>
            <div className="contact-row"><FaPhone /><span>+1 234 567 890</span></div>
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
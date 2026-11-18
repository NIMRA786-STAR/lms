import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUsers,
  FaArrowRight,
} from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center g-4">
            <Col md={6}>
              <h1 className="hero-title">Learn Anywhere, Anytime</h1>
              <p className="hero-lead">
                Master new skills with our comprehensive online courses
                taught by industry experts.
              </p>
              <Link to="/courses" className="btn-hero-cta">
                Explore Courses <FaArrowRight />
              </Link>
            </Col>
            <Col md={6} className="text-center">
              <img
                src="https://www.billabonghighschool.com/images/blog/Allroundeducation-min2.jpg"
                alt="Learning"
                className="img-fluid hero-img"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* ═══════ WHY CHOOSE US ═══════ */}
      <Container className="my-5">
        <h2 className="section-heading text-center mb-4">Why Choose Us?</h2>
        <Row className="g-4">
          <Col md={4}>
            <div className="stat-card">
              <FaChalkboardTeacher size={40} color="#667eea" className="mb-3" />
              <h3 className="stat-number">100+</h3>
              <p className="stat-label">Expert Instructors</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <FaGraduationCap size={40} color="#667eea" className="mb-3" />
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">Online Courses</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <FaUsers size={40} color="#667eea" className="mb-3" />
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Happy Students</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
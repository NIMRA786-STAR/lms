import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaGraduationCap, FaChalkboardTeacher, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">About Us</h1>
      <p className="text-center text-muted mb-5">
        Learn more about our Learning Management System and mission
      </p>

      <Row className="mb-5 align-items-center">
        <Col md={6}>
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide accessible, high-quality education to
            learners worldwide. We believe that everyone deserves the
            opportunity to learn and grow, regardless of their location or
            financial situation.
          </p>
          <p>
            Through our Learning Management System, we connect expert
            instructors with motivated students, creating a vibrant community
            of lifelong learners.
          </p>
        </Col>
        <Col md={6}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo-2SYr7skT5yif-juQ_SJ5LSYcnnXQ8lk_g&s"
            alt="Our Mission"
            className="img-fluid rounded"
          />
        </Col>
      </Row>

      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="text-center h-100" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <FaGraduationCap size={56} color="#667eea" className="mb-3" />
              <Card.Title>Quality Education</Card.Title>
              <Card.Text>
                Expert-led courses designed to provide practical, real-world skills.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <FaChalkboardTeacher size={56} color="#667eea" className="mb-3" />
              <Card.Title>Expert Instructors</Card.Title>
              <Card.Text>
                Learn from industry professionals with years of experience.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100" style={{ border: 'none', borderRadius: 20 }}>
            <Card.Body>
              <FaTrophy size={56} color="#667eea" className="mb-3" />
              <Card.Title>Certification</Card.Title>
              <Card.Text>
                Earn certificates upon course completion to showcase your skills.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mx-auto text-center">
          <h3>Ready to Start Learning?</h3>
          <p>Join thousands of students already learning on our platform.</p>
          <Link to="/courses" className="btn-gradient d-inline-flex align-items-center gap-2">
            Browse Courses <FaArrowRight />
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
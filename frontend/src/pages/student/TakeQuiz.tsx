import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Card, Button, Spinner, Alert, Badge, ProgressBar
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft, FaTrophy
} from 'react-icons/fa';

interface Question {
  _id: string;
  question: string;
  options: string[];
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  passingScore: number;
  duration: number;
  questions: Question[];
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  certificateIssued: boolean;
}

const TakeQuiz: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  // ✅ Index-based answers (Number), not string
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const answersRef = useRef<Record<string, number>>({});
  const quizRef = useRef<Quiz | null>(null);
  const submittedRef = useRef(false);

  // ─── Fetch quiz ───
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quizzes/course/${courseId}/start`);
        const data = res.data.data as Quiz;
        setQuiz(data);
        quizRef.current = data;
        setTimeLeft((data.duration || 0) * 60);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load quiz');
        } else {
          setError('Failed to load quiz');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  // ─── Submit ───
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    const currentQuiz = quizRef.current;
    if (!currentQuiz) return;

    const currentAnswers = answersRef.current;
    const answeredCount = Object.keys(currentAnswers).length;

    if (answeredCount < currentQuiz.questions.length) {
      if (!window.confirm('You have not answered all questions. Submit anyway?')) return;
    }

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const payload = currentQuiz.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer:
          currentAnswers[q._id] !== undefined ? currentAnswers[q._id] : -1
      }));
      const res = await axios.post(
        `/api/quizzes/course/${courseId}/submit`,
        { answers: payload }
      );
      setResult(res.data.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to submit quiz');
      } else {
        alert('Failed to submit quiz');
      }
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [courseId]);

  // ─── Timer ───
  useEffect(() => {
    if (!quiz || !quiz.duration || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result, handleSubmit]);

  // ✅ Select answer by INDEX
  const selectAnswer = (questionId: string, optionIndex: number) => {
    const updated = { ...answers, [questionId]: optionIndex };
    setAnswers(updated);
    answersRef.current = updated;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Loading ───
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading quiz…</p>
      </Container>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <Container className="py-5" style={{ maxWidth: 600 }}>
        <Card className="text-center p-5" style={{ borderRadius: 20, border: 'none' }}>
          <FaTimesCircle size={48} color="#f56565" />
          <h4 className="mt-3">Quiz Not Available</h4>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => navigate(`/courses/${courseId}`)}>
            <FaArrowLeft /> Back to Course
          </Button>
        </Card>
      </Container>
    );
  }

  // ─── Result ───
  if (result) {
    return (
      <Container className="py-5" style={{ maxWidth: 600 }}>
        <Card className="text-center p-5 shadow-sm"
          style={{ borderRadius: 20, border: 'none' }}>
          {result.passed ? (
            <FaTrophy size={64} color="#48bb78" />
          ) : (
            <FaTimesCircle size={64} color="#ed8936" />
          )}
          <h2 className="mt-3" style={{ fontWeight: 800 }}>
            {result.passed ? '🎉 Passed!' : 'Not Passed'}
          </h2>

          <div className="my-4">
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {result.percentage}%
            </h1>
            <p className="text-muted">
              {result.score} / {result.totalPoints} points
            </p>
            <Badge bg="info">Passing score: {result.passingScore}%</Badge>
          </div>

          {result.certificateIssued && (
            <Alert variant="success">
              <FaTrophy /> <strong>Certificate Issued!</strong>
              <br />
              <small>Check your certificates page to download it.</small>
            </Alert>
          )}

          <div className="d-flex gap-2 justify-content-center mt-3">
            <Button variant="primary" onClick={() => navigate(`/courses/${courseId}`)}>
              <FaArrowLeft /> Back to Course
            </Button>
            {result.certificateIssued && (
              <Button variant="success" onClick={() => navigate('/my-certificates')}>
                <FaTrophy /> View Certificate
              </Button>
            )}
            {!result.passed && (
              <Button variant="warning" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </Container>
    );
  }

  // ─── Guard ───
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="warning">This quiz has no questions yet.</Alert>
      </Container>
    );
  }

  const question = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const allAnswered = answeredCount === quiz.questions.length;

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <Card className="mb-4" style={{ borderRadius: 16, border: 'none' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h3 className="mb-1" style={{ fontWeight: 700 }}>{quiz.title}</h3>
              <small className="text-muted">{quiz.description}</small>
            </div>
            {quiz.duration > 0 && (
              <Badge bg={timeLeft < 60 ? 'danger' : 'warning'} text="dark"
                style={{ fontSize: '1rem', padding: '10px 16px', borderRadius: 10 }}>
                <FaClock /> {formatTime(timeLeft)}
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between mb-1 small">
              <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <ProgressBar now={progress} className="progress-modern" />
          </div>
        </Card.Body>
      </Card>

      {/* Question */}
      <Card className="mb-4 shadow-sm" style={{ borderRadius: 20, border: 'none' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <Badge bg="primary"
              style={{ fontSize: '1rem', padding: '8px 14px', borderRadius: 10 }}>
              Q{currentIndex + 1}
            </Badge>
            <span className="ms-2 small text-muted">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
          </div>

          <h4 className="mb-4" style={{ fontWeight: 600, lineHeight: 1.4 }}>
            {question.question}
          </h4>

          <div className="d-flex flex-column gap-2">
            {question.options.map((option, idx) => {
              // ✅ Compare with INDEX
              const selected = answers[question._id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectAnswer(question._id, idx)}
                  className="btn text-start p-3"
                  style={{
                    border: `2px solid ${selected ? '#667eea' : '#e2e8f0'}`,
                    borderRadius: 12,
                    background: selected ? 'rgba(102,126,234,0.08)' : 'white',
                    transition: 'all 0.2s',
                    fontSize: '1rem',
                    fontWeight: selected ? 600 : 400
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: selected ? '#667eea' : '#edf2f7',
                    color: selected ? 'white' : '#4a5568',
                    marginRight: 12,
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Navigation */}
      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
        <Button variant="outline-secondary"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}>
          <FaArrowLeft /> Previous
        </Button>

        <div className="d-flex gap-2">
          {!isLastQuestion && (
            <Button variant="primary"
              onClick={() => setCurrentIndex(currentIndex + 1)}>
              Next
            </Button>
          )}
          {isLastQuestion && (
            <Button variant="success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <><Spinner size="sm" animation="border" /> Submitting…</>
              ) : (
                <><FaCheckCircle /> Submit Quiz</>
              )}
            </Button>
          )}
        </div>
      </div>

      {!isLastQuestion && allAnswered && (
        <div className="text-center mt-3">
          <Button variant="success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : <><FaCheckCircle /> Submit Quiz</>}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default TakeQuiz;
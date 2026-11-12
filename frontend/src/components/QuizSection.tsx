import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import {
  FaTrophy, FaPlay, FaCheckCircle, FaTimesCircle, FaClock,
  FaRedo, FaLock
} from 'react-icons/fa';
import IconButton from './IconButton';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: {
    _id: string;
    question: string;
    options: string[];
    points?: number;
  }[];
  passingScore: number;
  duration: number;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  certificateIssued: boolean;
}

interface QuizSectionProps {
  courseId: string;
  courseTitle: string;
}

const QuizSection: React.FC<QuizSectionProps> = ({ courseId, courseTitle }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState<{ attempts: number; bestScore: number | null } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(`/api/quizzes/course/${courseId}/attempts`);
      setAttempts(res.data.data);
    } catch {
      // no attempts
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`/api/quizzes/course/${courseId}/start`);
      setQuiz(res.data.data);
      setStarted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: idx }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.filter(q => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      if (!window.confirm(`${unanswered.length} questions unanswered. Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const payload = quiz.questions.map(q => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] ?? -1
      }));
      const res = await axios.post(`/api/quizzes/course/${courseId}/submit`, {
        answers: payload
      });
      setResult(res.data.data);
      setStarted(false);
      fetchAttempts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setStarted(false);
    setAnswers({});
    setResult(null);
    startQuiz();
  };

  // ─── RESULT VIEW ───
  if (result) {
    return (
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 20 }}>
        <Card.Body className="p-4 text-center">
          {result.passed ? (
            <>
              <FaTrophy size={64} color="#f59e0b" />
              <h3 className="mt-3 mb-2">🎉 Congratulations!</h3>
              <p className="text-muted">You passed the quiz for <strong>{courseTitle}</strong></p>
            </>
          ) : (
            <>
              <FaTimesCircle size={64} color="#ef4444" />
              <h3 className="mt-3 mb-2">Not quite there</h3>
              <p className="text-muted">
                You need <strong>{result.passingScore}%</strong> to pass. Try again!
              </p>
            </>
          )}

          <div className="my-4" style={{
            background: 'linear-gradient(135deg, #667eea10, #764ba210)',
            borderRadius: 16,
            padding: 24
          }}>
            <h2 style={{
              fontSize: '3rem', fontWeight: 800, marginBottom: 0,
              color: result.passed ? '#48bb78' : '#ef4444'
            }}>
              {result.percentage}%
            </h2>
            <p className="text-muted mb-2">
              {result.score} / {result.totalPoints} correct
            </p>
            <ProgressBar now={result.percentage}
              style={{ height: 10, borderRadius: 8 }}
              variant={result.passed ? 'success' : 'danger'} />
          </div>

          {result.certificateIssued && (
            <Alert variant="success">
              <FaCheckCircle /> Certificate issued! Check "My Certificates".
            </Alert>
          )}

          <div className="d-flex gap-2 justify-content-center">
            <IconButton icon={FaRedo} label="Retake" variant="primary" onClick={resetQuiz} />
          </div>
        </Card.Body>
      </Card>
    );
  }

  // ─── QUIZ RUNNING ───
  if (started && quiz) {
    const answeredCount = Object.keys(answers).length;
    return (
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 20 }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
            <div>
              <h4 className="mb-1">{quiz.title}</h4>
              <small className="text-muted">
                Passing: {quiz.passingScore}% · {quiz.questions.length} questions
              </small>
            </div>
            <Badge bg="primary" style={{ padding: '8px 14px' }}>
              {answeredCount} / {quiz.questions.length} answered
            </Badge>
          </div>

          <ProgressBar now={(answeredCount / quiz.questions.length) * 100}
            style={{ height: 6, borderRadius: 6, marginBottom: 24 }}
            variant="primary" />

          {quiz.questions.map((q, idx) => (
            <Card key={q._id} className="mb-3 border-0" style={{ background: '#f8fafc', borderRadius: 14 }}>
              <Card.Body>
                <div className="fw-semibold mb-3">
                  Q{idx + 1}. {q.question}
                </div>
                {q.options.map((opt, i) => (
                  <Form.Check
                    key={i}
                    type="radio"
                    name={`q-${q._id}`}
                    id={`q-${q._id}-${i}`}
                    label={opt}
                    checked={answers[q._id] === i}
                    onChange={() => handleOptionChange(q._id, i)}
                    className="mb-2"
                  />
                ))}
              </Card.Body>
            </Card>
          ))}

          <IconButton icon={FaCheckCircle} label={submitting ? 'Submitting…' : 'Submit Quiz'}
            variant="success" onClick={submitQuiz} disabled={submitting}
            style={{ width: '100%', justifyContent: 'center' }} />
        </Card.Body>
      </Card>
    );
  }

  // ─── INTRO VIEW ───
  return (
    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 20 }}>
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <FaTrophy size={24} />
          </div>
          <div>
            <h4 className="mb-1">Final Quiz</h4>
            <small className="text-muted">Test your knowledge to earn a certificate</small>
          </div>
        </div>

        {attempts && attempts.attempts > 0 && (
          <Alert variant="info" className="mb-3">
            You've attempted {attempts.attempts} time(s). Best score:{' '}
            <strong>{attempts.bestScore}%</strong>
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-3"><Spinner animation="border" /></div>
        ) : (
          <IconButton icon={FaPlay} label="Start Quiz" variant="primary"
            onClick={startQuiz} style={{ width: '100%', justifyContent: 'center' }} />
        )}
      </Card.Body>
    </Card>
  );
};

export default QuizSection;
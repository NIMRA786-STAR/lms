import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Container, Card, Form, Button, Spinner, Alert, Badge, Row, Col,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import {
  FaPlus, FaTrash, FaSave, FaArrowLeft, FaCheckCircle, FaEdit,
} from 'react-icons/fa';
import { notify } from '../../utils/notify';
import type { QuizQuestion } from '../../types';

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuizResponse {
  _id: string;
  title: string;
  description?: string;
  passingScore: number;
  duration: number;
  questions: QuizQuestion[];
}

const EMPTY_QUESTION = (): QuestionForm => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  points: 1,
});

const ManageQuiz: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Final Quiz');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState<QuestionForm[]>([EMPTY_QUESTION()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get<{ data: QuizResponse }>(
        `/api/quizzes/course/${courseId}`
      );
      const q = res.data.data;
      setTitle(q.title || 'Final Quiz');
      setDescription(q.description || '');
      setPassingScore(q.passingScore ?? 70);
      setDuration(q.duration ?? 10);
      setQuestions(
        q.questions?.length
          ? q.questions.map((item) => ({
              question: item.question,
              options:
                item.options && item.options.length === 4
                  ? item.options
                  : ['', '', '', ''],
              correctAnswer: item.correctAnswer ?? '',
              points: item.points ?? 1,
            }))
          : [EMPTY_QUESTION()]
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError('Failed to load quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) }
          : q
      )
    );
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, EMPTY_QUESTION()]);

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      notify.warning('At least one question is required');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Quiz title is required';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim())
        return `Question ${i + 1}: question text is required`;
      if (q.options.some((o) => !o.trim()))
        return `Question ${i + 1}: all 4 options are required`;
      if (!q.correctAnswer.trim())
        return `Question ${i + 1}: correct answer is required`;
      if (!q.options.includes(q.correctAnswer))
        return `Question ${i + 1}: correct answer must match one of the options`;
    }
    return null;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      notify.warning(validationError);
      return;
    }

    setSaving(true);
    try {
      await axios.post(`/api/quizzes/course/${courseId}`, {
        title,
        description,
        passingScore,
        duration,
        questions,
      });
      setSuccess('Quiz saved successfully!');
      notify.success('Quiz saved');
      setTimeout(() => navigate('/instructor/dashboard'), 1500);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : 'Failed to save quiz';
      setError(msg || 'Failed to save quiz');
      notify.error(msg || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setPassingScore(Math.max(0, Math.min(100, v)));
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setDuration(Math.max(0, v));
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading quiz…</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="d-flex align-items-center gap-2 mb-0">
          <FaEdit color="#667eea" /> Manage Quiz
        </h2>
        <IconButton
          icon={FaArrowLeft}
          label="Back"
          outline
          onClick={() => navigate('/instructor/dashboard')}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="card-modern mb-4">
        <Card.Body className="p-4">
          <h5 className="mb-3">Quiz Settings</h5>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Quiz Title *</Form.Label>
                <Form.Control
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Final Course Quiz"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Passing Score (%)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={handleScoreChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Duration (min)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={duration}
                  onChange={handleDurationChange}
                  placeholder="0 = no limit"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description shown to students"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Questions ({questions.length})</h5>
        <IconButton
          icon={FaPlus}
          label="Add Question"
          variant="success"
          size="sm"
          onClick={addQuestion}
        />
      </div>

      {questions.map((q, qIndex) => (
        <Card key={qIndex} className="card-modern mb-3">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <Badge
                bg="primary"
                style={{ fontSize: '1rem', padding: '8px 14px', borderRadius: 10 }}
              >
                Question {qIndex + 1}
              </Badge>
              <IconButton
                icon={FaTrash}
                variant="danger"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
                disabled={questions.length === 1}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Question Text *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="Enter your question"
              />
            </Form.Group>

            <Form.Label className="fw-semibold">Options (4 required)</Form.Label>
            {q.options.map((opt, oIndex) => {
              const isCorrect = q.correctAnswer === opt && opt.trim() !== '';
              return (
                <div key={oIndex} className="d-flex align-items-center gap-2 mb-2">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isCorrect ? '#48bb78' : '#edf2f7',
                      color: isCorrect ? 'white' : '#4a5568',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  <Form.Control
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                  />
                  <Button
                    variant={isCorrect ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                    disabled={!opt.trim()}
                    title="Mark as correct answer"
                  >
                    <FaCheckCircle />
                  </Button>
                </div>
              );
            })}

            <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
              <Form.Label className="mb-0 small text-muted">
                Correct answer:
              </Form.Label>
              <Badge bg={q.correctAnswer ? 'success' : 'secondary'}>
                {q.correctAnswer || 'Not set'}
              </Badge>
              <Form.Group className="ms-auto" style={{ width: 120 }}>
                <Form.Control
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, 'points', Number(e.target.value))
                  }
                  size="sm"
                />
              </Form.Group>
              <small className="text-muted">points</small>
            </div>
          </Card.Body>
        </Card>
      ))}

      <div className="d-flex gap-2 justify-content-end mt-4">
        <IconButton
          icon={FaArrowLeft}
          label="Cancel"
          outline
          onClick={() => navigate('/instructor/dashboard')}
        />
        <IconButton
          icon={FaSave}
          label={saving ? 'Saving…' : 'Save Quiz'}
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        />
      </div>
    </Container>
  );
};

export default ManageQuiz;
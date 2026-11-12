import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaTrash, FaSave, FaQuestionCircle } from 'react-icons/fa';
import IconButton from './IconButton';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizBuilderProps {
  courseId: string;
}

const emptyQuestion = (): Question => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: 1
});

const QuizBuilder: React.FC<QuizBuilderProps> = ({ courseId }) => {
  const [title, setTitle] = useState('Final Quiz');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    axios.get(`/api/quizzes/course/${courseId}`)
      .then(res => {
        const q = res.data.data;
        setTitle(q.title);
        setPassingScore(q.passingScore);
        setQuestions(q.questions.map((x: any) => ({
          question: x.question,
          options: x.options,
          correctAnswer: x.correctAnswer,
          points: x.points || 1
        })));
      })
      .catch(() => { /* no quiz yet */ });
  }, [courseId]);

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q
    ));
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const save = async () => {
    // Validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        return setMsg({ type: 'danger', text: `Question ${i + 1} is empty` });
      }
      if (questions[i].options.some(o => !o.trim())) {
        return setMsg({ type: 'danger', text: `All 4 options required for Q${i + 1}` });
      }
    }

    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await axios.post(`/api/quizzes/course/${courseId}`, {
        title, description: '', questions, passingScore, duration: 15
      });
      setMsg({ type: 'success', text: 'Quiz saved successfully!' });
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 20 }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaQuestionCircle color="#667eea" /> Final Quiz
          </h4>
          <Badge bg="primary">{questions.length} Questions</Badge>
        </div>

        {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

        <Row className="g-3 mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Quiz Title</Form.Label>
              <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Passing Score (%)</Form.Label>
              <Form.Control type="number" min={0} max={100}
                value={passingScore} onChange={e => setPassingScore(+e.target.value)} />
            </Form.Group>
          </Col>
        </Row>

        {questions.map((q, qIdx) => (
          <Card key={qIdx} className="mb-3 border-0" style={{ background: '#f8fafc', borderRadius: 14 }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Question {qIdx + 1}</strong>
                <Button variant="link" className="text-danger p-0"
                  onClick={() => removeQuestion(qIdx)} disabled={questions.length === 1}>
                  <FaTrash />
                </Button>
              </div>

              <Form.Control className="mb-2" placeholder="Question text"
                value={q.question}
                onChange={e => updateQuestion(qIdx, 'question', e.target.value)} />

              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="d-flex align-items-center gap-2 mb-2">
                  <Form.Check
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctAnswer === oIdx}
                    onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                    title="Mark as correct"
                  />
                  <Form.Control
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                  />
                  {q.correctAnswer === oIdx && (
                    <Badge bg="success">Correct</Badge>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        ))}

        <div className="d-flex gap-2 flex-wrap">
          <IconButton icon={FaPlus} label="Add Question" variant="outline" onClick={addQuestion} />
          <IconButton icon={FaSave} label={saving ? 'Saving…' : 'Save Quiz'}
            variant="primary" onClick={save} disabled={saving} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuizBuilder;
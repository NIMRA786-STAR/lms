import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, ProgressBar, Alert } from 'react-bootstrap';
import {
  FaPlay, FaCheck, FaUndo, FaClock, FaVideo, FaLock,
  FaChevronDown, FaChevronUp, FaBookOpen, FaExpandArrowsAlt
} from 'react-icons/fa';
import IconButton from './IconButton';
import type { Lesson, Enrollment } from '../types';

interface CourseContentProps {
  lessons: Lesson[];
  enrollment: Enrollment | null;
  onOpenVideo: (lesson: Lesson) => void;
  onToggleComplete: (lesson: Lesson) => void;
  toggling: boolean;
}

const CourseContent: React.FC<CourseContentProps> = ({
  lessons,
  enrollment,
  onOpenVideo,
  onToggleComplete,
  toggling
}) => {
  // ─── Expanded lesson(s) ───
  const [expanded, setExpanded] = useState<string | null>(null);

  // ─── Check completion (supports populated or string refs) ───
  const isCompleted = (lessonId: string): boolean => {
    if (!enrollment?.completedLessons) return false;
    return enrollment.completedLessons.some((l: unknown) => {
      const id =
        typeof l === 'object' && l !== null
          ? (l as { _id?: string })._id || String(l)
          : String(l);
      return id === lessonId;
    });
  };

  // ─── Completed count (only lessons in THIS course) ───
  const doneLessons = useMemo(() => {
    return lessons.filter(l => isCompleted(l._id)).length;
  }, [lessons, enrollment]);

  const totalLessons = lessons.length;
  const progress = enrollment?.progress || 0;

  // ─── Reset expansion when course changes ───
  useEffect(() => {
    setExpanded(null);
  }, [lessons.length > 0 ? lessons[0]?._id : undefined]);

  // ─── Auto-expand first incomplete lesson (for enrolled users) ───
  useEffect(() => {
    if (!enrollment || lessons.length === 0 || expanded !== null) return;
    const firstIncomplete = lessons.find(l => !isCompleted(l._id));
    if (firstIncomplete) {
      setExpanded(firstIncomplete._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?._id, lessons.length]);

  // ─── Toggle handler (accessibility) ───
  const handleToggle = (lessonId: string) => {
    setExpanded(prev => (prev === lessonId ? null : lessonId));
  };

  const handleKeyDown = (e: React.KeyboardEvent, lessonId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(lessonId);
    }
  };

  // ─── Expand all / Collapse all ───
  const expandAll = () => {
    if (lessons.length > 0) setExpanded(lessons[0]._id);
  };

  return (
    <Card
      className="shadow-sm border-0 mb-4"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      {/* ─── HEADER ─── */}
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h4 className="mb-1 d-flex align-items-center gap-2 fw-bold">
              <FaBookOpen /> Course Content
            </h4>
            <small style={{ opacity: 0.9 }}>
              {totalLessons} lessons
              {enrollment && ` · ${doneLessons} completed`}
            </small>
          </div>
          {enrollment && (
            <Badge
              bg="light"
              text="dark"
              style={{ fontSize: '0.95rem', padding: '8px 14px', borderRadius: 10 }}
            >
              {progress}% Complete
            </Badge>
          )}
        </div>

        {enrollment && (
          <ProgressBar
            now={progress}
            variant="light"
            className="mt-3"
            style={{ height: 8, borderRadius: 8 }}
          />
        )}
      </div>

      {/* ─── LESSON LIST ─── */}
      <Card.Body className="p-3">
        {lessons.length === 0 ? (
          <Alert variant="warning" className="mb-0">
            No lessons available yet.
          </Alert>
        ) : (
          <div className="d-flex flex-column gap-2">
            {lessons.map((lesson, idx) => {
              const lessonKey = lesson._id || `lesson-${idx}`;
              const done = isCompleted(lesson._id);
              const hasVideo = !!lesson.videoUrl;
              const isOpen = expanded === lessonKey;

              return (
                <div
                  key={lessonKey}
                  style={{
                    background: done ? '#f0fff4' : '#f8fafc',
                    border: done ? '1px solid #48bb784d' : '1px solid #e2e8f0',
                    borderRadius: 14,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* ── Lesson header (clickable) ── */}
                  <div
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleToggle(lessonKey)}
                    onKeyDown={e => handleKeyDown(e, lessonKey)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-label={`Lesson ${idx + 1}: ${lesson.title}`}
                  >
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      {/* Number / check circle */}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: 40,
                          height: 40,
                          background: done
                            ? 'linear-gradient(135deg, #48bb78, #38a169)'
                            : 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          flexShrink: 0
                        }}
                      >
                        {done ? <FaCheck /> : idx + 1}
                      </div>

                      <div className="flex-grow-1">
                        <div
                          className="fw-semibold"
                          style={{ fontSize: '0.95rem', lineHeight: 1.3 }}
                        >
                          {lesson.title}
                        </div>
                        <div className="d-flex gap-2 mt-1 flex-wrap">
                          {lesson.duration && lesson.duration !== '00:00' && (
                            <Badge
                              bg="light"
                              text="dark"
                              style={{ fontSize: '0.7rem' }}
                            >
                              <FaClock size={10} /> {lesson.duration}
                            </Badge>
                          )}
                          {hasVideo && (
                            <Badge
                              bg="warning"
                              text="dark"
                              style={{ fontSize: '0.7rem' }}
                            >
                              <FaVideo size={10} /> Video
                            </Badge>
                          )}
                          {done && (
                            <Badge bg="success" style={{ fontSize: '0.7rem' }}>
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div style={{ color: '#a0aec0' }}>
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>

                  {/* ── Expandable content ── */}
                  {isOpen && (
                    <div
                      className="px-3 pb-3"
                      style={{ borderTop: '1px solid #e2e8f0' }}
                    >
                      {lesson.content && (
                        <p
                          className="text-muted small mb-3 mt-3"
                          style={{ lineHeight: 1.6 }}
                        >
                          {lesson.content}
                        </p>
                      )}

                      {enrollment ? (
                        <div className="d-flex gap-2 flex-wrap">
                          <IconButton
                            icon={FaPlay}
                            label="Watch Video"
                            variant="info"
                            size="sm"
                            disabled={!hasVideo}
                            onClick={() => onOpenVideo(lesson)}
                          />
                          <IconButton
                            icon={done ? FaUndo : FaCheck}
                            label={done ? 'Mark Incomplete' : 'Mark Complete'}
                            variant={done ? 'warning' : 'success'}
                            size="sm"
                            disabled={toggling}
                            onClick={() => onToggleComplete(lesson)}
                          />
                        </div>
                      ) : (
                        <Alert
                          variant="info"
                          className="mb-0 small d-flex align-items-center gap-2"
                        >
                          <FaLock /> Enroll to access this lesson
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CourseContent;
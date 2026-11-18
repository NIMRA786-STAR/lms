import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaEye, FaTrash } from 'react-icons/fa';
import { notify } from '../../utils/notify';

interface CourseRow {
  _id: string; title: string; category: string; price: number;
  instructor?: { name?: string }; enrolledStudents?: string[];
}

const ManageCourses = () => {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data.data);
    } catch {
      setError('Failed to load courses');
      notify.error('Failed to load courses');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id: string, title: string) => {
    const ok = await notify.confirm(`Delete "${title}"? All enrollments will be removed.`);
    if (!ok) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      notify.success('Course deleted');
      fetchCourses();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Delete failed';
      notify.error(msg || 'Delete failed');
    }
  };

  if (loading) return (
    <Container className="text-center py-5"><Spinner animation="border" variant="primary" /></Container>
  );

  return (
    <Container className="py-4">
      <h2 className="section-heading mb-4">Manage Courses</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover>
        <thead style={{ background: 'var(--bg-secondary)' }}>
          <tr><th>#</th><th>Title</th><th>Instructor</th><th>Category</th><th>Price</th><th>Students</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td>{c.title}</td>
              <td>{c.instructor?.name || '—'}</td>
              <td>{c.category}</td>
              <td>${c.price || 0}</td>
              <td>{c.enrolledStudents?.length || 0}</td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  <Link to={`/courses/${c._id}`} className="text-decoration-none">
                    <IconButton icon={FaEye} label="View" variant="info" size="sm" />
                  </Link>
                  <IconButton icon={FaTrash} variant="danger" size="sm" onClick={() => handleDelete(c._id, c.title)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageCourses;
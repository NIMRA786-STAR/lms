import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaEye, FaTrash } from 'react-icons/fa';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data.data);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Manage Courses</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover>
        <thead style={{ background: '#f7fafc' }}>
          <tr>
            <th>#</th><th>Title</th><th>Instructor</th>
            <th>Category</th><th>Price</th><th>Students</th><th>Actions</th>
          </tr>
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
                  <IconButton icon={FaTrash} variant="danger" size="sm"
                    onClick={() => handleDelete(c._id, c.title)} />
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
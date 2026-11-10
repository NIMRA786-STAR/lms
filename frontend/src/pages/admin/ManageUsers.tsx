import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaUserEdit, FaTrash, FaUserShield } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await axios.put(`/api/users/${selectedUser._id}`, { role: selectedUser.role });
      setShowModal(false);
      fetchUsers();
    } catch { alert('Failed to update role'); }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Manage Users</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Table responsive hover>
        <thead style={{ background: '#f7fafc' }}>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'warning' : 'primary'}`}>
                  {user.role}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  <IconButton icon={FaUserEdit} label="Role" variant="warning" size="sm"
                    onClick={() => { setSelectedUser(user); setShowModal(true); }} />
                  <IconButton icon={FaTrash} variant="danger" size="sm"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    disabled={user.role === 'admin'} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaUserShield /> Change Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>User: <strong>{selectedUser?.name}</strong></p>
          <Form.Group>
            <Form.Label>New Role</Form.Label>
            <Form.Select value={selectedUser?.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <IconButton icon={FaUserShield} label="Save Changes" variant="primary" onClick={handleUpdateRole} />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageUsers;
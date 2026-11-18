import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import IconButton from '../../components/IconButton';
import { FaUserEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import { notify } from '../../utils/notify';

type UserRole = 'student' | 'instructor' | 'admin';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<{ success: boolean; data: UserRow[] }>('/api/users');
      setUsers(res.data.data);
      setError('');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch users'
        : 'Failed to fetch users';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const ok = await notify.confirm(`Delete user "${userName}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      notify.success('User deleted successfully');
      fetchUsers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to delete user'
        : 'Failed to delete user';
      notify.error(msg);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setSavingRole(true);
    try {
      await axios.put(`/api/users/${selectedUser._id}`, { role: selectedUser.role });
      notify.success('Role updated successfully');
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to update role'
        : 'Failed to update role';
      notify.error(msg);
    } finally {
      setSavingRole(false);
    }
  };

  const roleBadgeClass = (role: UserRole) => {
    if (role === 'admin') return 'bg-danger';
    if (role === 'instructor') return 'bg-warning text-dark';
    return 'bg-primary';
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="section-heading mb-4">Manage Users</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {users.length === 0 ? (
        <Alert variant="info">No users found.</Alert>
      ) : (
        <Table responsive hover>
          <thead style={{ background: 'var(--bg-secondary)' }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${roleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <IconButton
                      icon={FaUserEdit}
                      label="Role"
                      variant="warning"
                      size="sm"
                      onClick={() => { setSelectedUser(user); setShowModal(true); }}
                    />
                    <IconButton
                      icon={FaTrash}
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      disabled={user.role === 'admin'}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        show={showModal}
        onHide={() => { setShowModal(false); setSelectedUser(null); }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUserShield className="me-2" /> Change Role
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>User: <strong>{selectedUser?.name}</strong></p>
          <p className="small text-muted mb-3">Email: {selectedUser?.email}</p>
          <Form.Group>
            <Form.Label>New Role</Form.Label>
            <Form.Select
              value={selectedUser?.role ?? 'student'}
              onChange={(e) =>
                selectedUser &&
                setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })
              }
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Role changes take effect on the user's next login.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <IconButton
            icon={FaUserShield}
            label={savingRole ? 'Saving…' : 'Save Changes'}
            variant="primary"
            onClick={handleUpdateRole}
            disabled={savingRole || !selectedUser}
          />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageUsers;
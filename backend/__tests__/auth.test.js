const request = require('supertest');
const express = require('express');

// 🔑 CRITICAL: Set JWT_SECRET before any test runs
process.env.JWT_SECRET = 'test-secret-key';

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn()
}));

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller — Registration Security', () => {
  beforeEach(() => {
    User.findOne.mockReset();
    User.create.mockReset();
  });

  test('Rejects duplicate email', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test', email: 'test@example.com', password: '123456'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Forces role to student when admin role is requested', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation((data) =>
      Promise.resolve({
        _id: 'newid', name: data.name, email: data.email, role: data.role
      })
    );
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker', email: 'hacker@x.com', password: '123456', role: 'admin'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('student');
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'student' })
    );
  });

  test('Allows instructor role on public signup', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation((data) =>
      Promise.resolve({
        _id: 'newid', name: data.name, email: data.email, role: data.role
      })
    );
    const res = await request(app).post('/api/auth/register').send({
      name: 'Teacher', email: 'teacher@x.com', password: '123456', role: 'instructor'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('instructor');
  });
});

describe('Auth Controller — Login', () => {
  test('Rejects invalid password', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1', email: 'test@example.com',
      comparePassword: jest.fn().mockResolvedValue(false)
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'wrong'
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Logs in with valid credentials', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1', name: 'Test', email: 'test@example.com', role: 'student',
      comparePassword: jest.fn().mockResolvedValue(true)
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: '123456'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
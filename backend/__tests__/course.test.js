const request = require('supertest');
const express = require('express');

jest.mock('../models/Course', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/Enrollment', () => ({
  deleteMany: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

const Course = require('../models/Course');
const courseRoutes = require('../routes/courseRoutes');

const app = express();
app.use(express.json());
app.use('/api/courses', courseRoutes);

describe('Course Controller — Public endpoints', () => {
  test('GET /api/courses returns empty array', async () => {
    Course.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      })
    });
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('GET /api/courses/:id returns 404 for unknown ID', async () => {
    Course.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });
    const res = await request(app).get('/api/courses/123456789012345678901234');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
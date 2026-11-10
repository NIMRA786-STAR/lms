# 📚 LMS — Learning Management System

A full-stack MERN Learning Management System with role-based dashboards for **Students**, **Instructors**, and **Admins**.

## 🔗 Live Demo
- **Frontend**: https://your-frontend.vercel.app
- **Backend API**: https://your-backend.vercel.app

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Instructor | instructor@example.com | instructor123 |
| Student | student@example.com | student123 |

## ✨ Features

### Student
- Browse & search courses with filters
- Enroll in free courses
- Watch lessons (YouTube / Vimeo / MP4)
- Auto-track progress (can't be faked)
- Drop courses
- Edit profile

### Instructor
- Create / edit / delete courses
- Add / edit / delete lessons
- View enrolled students with progress
- Course analytics (completion rate, revenue, avg progress)

### Admin
- Manage users (change role / delete)
- Manage courses
- System-wide analytics

## 🛠 Tech Stack

**Frontend**
- React 18 + React Router 6
- React-Bootstrap 5 + react-icons
- Axios
- Custom modern CSS (gradients, glassmorphism)

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose 7
- JWT authentication (bcryptjs)
- Jest + Supertest (backend tests)

**Deployment**
- Vercel (frontend + backend)
- MongoDB Atlas

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, CORS_ORIGIN
npm install
npm run dev
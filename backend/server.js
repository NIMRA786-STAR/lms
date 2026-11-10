const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/security');

// ═══════════════════════════════════════════════════════════
// CONNECT TO MONGODB (with error handling)
// ═══════════════════════════════════════════════════════════
connectDB().catch((err) => {
  console.error('❌ DB Connection Failed:', err.message);
});

const app = express();

// ═══════════════════════════════════════════════════════════
// TRUST PROXY (needed for rate limiting behind Vercel)
// ═══════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// ═══════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// ═══════════════════════════════════════════════════════════
// STRIPE WEBHOOK — MUST be BEFORE express.json()
// ═══════════════════════════════════════════════════════════
const { stripeWebhook } = require('./controllers/paymentController');
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ═══════════════════════════════════════════════════════════
// BODY PARSERS
// ═══════════════════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ═══════════════════════════════════════════════════════════
// DATA SANITIZATION
// ═══════════════════════════════════════════════════════════
app.use(mongoSanitize());
app.use(hpp());

// ═══════════════════════════════════════════════════════════
// GLOBAL RATE LIMIT
// ═══════════════════════════════════════════════════════════
app.use('/api', apiLimiter);

// ═══════════════════════════════════════════════════════════
// REQUEST LOGGER (dev only)
// ═══════════════════════════════════════════════════════════
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enroll', require('./routes/enrollRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ═══════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LMS API is running',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLERS
// ═══════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════
// START SERVER (local dev only)
// ═══════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
}

module.exports = app;
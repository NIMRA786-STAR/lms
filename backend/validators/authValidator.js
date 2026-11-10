const { z } = require('zod');

// ═══════════════════════════════════════════════════════════
// REUSABLE SCHEMAS
// ═══════════════════════════════════════════════════════════
const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address')
  .max(254, 'Email is too long');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be under 128 characters');

const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be under 100 characters');

// ═══════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════
const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['student', 'instructor']).optional().default('student')
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  password: passwordSchema
});

// ═══════════════════════════════════════════════════════════
// COURSE SCHEMAS
// ═══════════════════════════════════════════════════════════
const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  category: z.enum(['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other']),
  price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
  duration: z.string().trim().max(50).default('4 weeks'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  thumbnail: z.string().url().or(z.literal('')).optional().default('')
});

// ═══════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE FACTORY
// ═══════════════════════════════════════════════════════════
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Validation failed',
        errors
      });
    }
    next(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createCourseSchema,
  validate
};
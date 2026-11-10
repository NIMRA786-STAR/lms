const Stripe = require('stripe');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// ═══════════════════════════════════════════════════════════
// LAZY STRIPE INIT (server won't crash if key missing)
// ═══════════════════════════════════════════════════════════
let stripeClient = null;

const getStripe = () => {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) {
    throw new Error(
      'STRIPE_SECRET_KEY missing or invalid in backend/.env'
    );
  }
  stripeClient = new Stripe(key);
  return stripeClient;
};

// ═══════════════════════════════════════════════════════════
// POST /api/courses/:id/checkout
// Creates a Stripe Checkout Session and returns its URL
// ═══════════════════════════════════════════════════════════
const createCheckoutSession = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Free course → use /api/enroll instead
    if (course.price === 0) {
      return res.status(400).json({
        success: false,
        message: 'This course is free. Use the enroll endpoint instead.'
      });
    }

    // Already enrolled? Block payment
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: course._id
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description.slice(0, 200),
              images: course.thumbnail ? [course.thumbnail] : []
            },
            unit_amount: Math.round(course.price * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?course_id=${course._id}`,
      customer_email: req.user.email,
      metadata: {
        courseId: course._id.toString(),
        studentId: req.user._id.toString(),
        studentName: req.user.name
      },
      payment_intent_data: {
        metadata: {
          courseId: course._id.toString(),
          studentId: req.user._id.toString()
        }
      }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('createCheckoutSession error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message,
      hint: err.message.includes('STRIPE_SECRET_KEY')
        ? 'Add STRIPE_SECRET_KEY to backend/.env and restart server'
        : undefined
    });
  }
};

// ═══════════════════════════════════════════════════════════
// POST /api/payment/webhook
// Handles Stripe events — MUST receive raw body
// ═══════════════════════════════════════════════════════════
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ═══════ Handle checkout completion ═══════
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, studentId } = session.metadata || {};

    if (!courseId || !studentId) {
      console.warn('Webhook: missing metadata');
      return res.json({ received: true });
    }

    try {
      // Check if enrollment already exists (idempotency)
      const existing = await Enrollment.findOne({
        student: studentId,
        course: courseId
      });

      if (existing) {
        console.log(`ℹ️  Already enrolled: ${studentId} → ${courseId}`);
        return res.json({ received: true, duplicate: true });
      }

      // Create enrollment
      await Enrollment.create({
        student: studentId,
        course: courseId,
        progress: 0,
        completedLessons: [],
        status: 'active'
      });

      // Add student to course's enrolledStudents
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: studentId }
      });

      console.log(`✅ Enrolled via Stripe: ${studentId} → ${courseId}`);
    } catch (err) {
      console.error('Enrollment creation failed:', err.message);
      // Don't return 500 — Stripe will retry. Return 200 to avoid infinite retries.
    }
  }

  // ═══════ Handle payment failures ═══════
  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    console.warn(`❌ Payment failed: ${intent.id}`);
  }

  // ═══════ Handle refunds ═══════
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const { courseId, studentId } = charge.metadata || {};

    if (courseId && studentId) {
      try {
        // Remove enrollment
        await Enrollment.findOneAndDelete({
          student: studentId,
          course: courseId
        });
        // Remove from course
        await Course.findByIdAndUpdate(courseId, {
          $pull: { enrolledStudents: studentId }
        });
        console.log(`🔄 Refund processed: unenrolled ${studentId} from ${courseId}`);
      } catch (err) {
        console.error('Refund cleanup failed:', err.message);
      }
    }
  }

  res.json({ received: true });
};

// ═══════════════════════════════════════════════════════════
// GET /api/payment/verify/:sessionId
// Verifies payment and returns course + enrollment info
// (Used by frontend success page to confirm)
// ═══════════════════════════════════════════════════════════
const verifySession = async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: session.payment_status
      });
    }

    const { courseId, studentId } = session.metadata || {};

    const course = await Course.findById(courseId).populate('instructor', 'name');
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    res.json({
      success: true,
      data: {
        paid: true,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        course: course
          ? {
              _id: course._id,
              title: course.title,
              instructor: course.instructor?.name || 'Instructor'
            }
          : null,
        enrolled: !!enrollment,
        customerEmail: session.customer_email
      }
    });
  } catch (err) {
    console.error('verifySession error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  verifySession
};
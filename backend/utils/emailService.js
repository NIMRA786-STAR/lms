const nodemailer = require('nodemailer');

// ═══════════════════════════════════════════════════════════
// LAZY TRANSPORTER
// - If Gmail/real SMTP creds exist in .env → use them
// - Otherwise → fallback to Ethereal test account (dev only)
// ═══════════════════════════════════════════════════════════
let transporter = null;
let usingEthereal = false;

const getTransporter = async () => {
  if (transporter) return transporter;

  const hasRealCreds =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (hasRealCreds) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 EmailService: using real SMTP →', process.env.EMAIL_USER);
    return transporter;
  }

  // Fallback: Ethereal
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  usingEthereal = true;
  console.log('📧 EmailService: using Ethereal test account (no real emails)');
  console.log('   Ethereal user:', testAccount.user);
  return transporter;
};

// Log preview URL after every email (only for Ethereal)
const logPreviewUrl = (info) => {
  if (usingEthereal) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('🔗 Email Preview:', url);
  }
};

// Wrapper — never throws, always returns { success, ... }
const safeSend = async (mailOptions) => {
  try {
    const tx = await getTransporter();
    const info = await tx.sendMail(mailOptions);
    console.log(`📧 Email sent → ${mailOptions.to} | subject: "${mailOptions.subject}"`);
    logPreviewUrl(info);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { success: false, error: err.message };
  }
};

// ═══════════════════════════════════════════════════════════
// 1. ENROLLMENT CONFIRMATION EMAIL
// ═══════════════════════════════════════════════════════════
const sendEnrollmentEmail = async ({
  to,
  studentName,
  courseTitle,
  courseId,
  isPaid = false,
}) => {
  const courseUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses/${courseId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 32px; border-radius: 16px 16px 0 0; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Enrollment Confirmed!</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>You have successfully enrolled in:</p>
        <h2 style="color: #667eea; margin: 16px 0;">${courseTitle}</h2>
        ${isPaid ? '<p style="color: #48bb78;"><strong>✅ Payment received</strong></p>' : ''}
        <p>You can start learning immediately by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${courseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
            Start Learning Now
          </a>
        </div>
        <p style="color: #718096; font-size: 14px;">
          If you didn't enroll in this course, please contact support.
        </p>
      </div>
    </div>
  `;

  return safeSend({
    from: `"LMS Support" <${process.env.EMAIL_USER || 'no-reply@lms.local'}>`,
    to,
    subject: `Enrollment Confirmed: ${courseTitle}`,
    html,
  });
};

// ═══════════════════════════════════════════════════════════
// 2. CERTIFICATE EMAIL (with PDF attachment)
// ═══════════════════════════════════════════════════════════
const sendCertificateEmail = async ({
  to,
  studentName,
  courseTitle,
  score,
  certificateId,
  pdfBuffer,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; border-radius: 16px 16px 0 0; text-align: center; color: white;">
        <div style="font-size: 48px;">🏆</div>
        <h1 style="margin: 8px 0 0; font-size: 24px;">Congratulations, ${studentName}!</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
        <p>You've successfully completed <strong>${courseTitle}</strong> with a score of <strong>${score}%</strong>.</p>
        <p>Your certificate is attached to this email as a PDF. You can download and print it anytime.</p>
        <div style="background: #f0fff4; border: 1px solid #48bb78; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #276749;"><strong>Certificate ID:</strong> ${certificateId}</p>
        </div>
        <p style="color: #718096; font-size: 14px;">
          This certificate is also available in your LMS account under "My Certificates".
        </p>
      </div>
    </div>
  `;

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `Certificate-${courseTitle.replace(/\s+/g, '-')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  return safeSend({
    from: `"LMS Certificates" <${process.env.EMAIL_USER || 'no-reply@lms.local'}>`,
    to,
    subject: `🏆 Your Certificate for ${courseTitle}`,
    html,
    attachments,
  });
};

module.exports = {
  sendEnrollmentEmail,
  sendCertificateEmail,
};
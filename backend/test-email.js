// backend/test-email.js (temporary file)
const nodemailer = require('nodemailer');
(async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test account:', testAccount.user, testAccount.pass);
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  const info = await transporter.sendMail({
    from: '"LMS Test" <test@lms.com>',
    to: 'student@example.com',
    subject: 'Test enrollment',
    html: '<p>Enrollment email test</p>',
    attachments: [{ filename: 'test.pdf', content: Buffer.from('%PDF-1.4 fake'), contentType: 'application/pdf' }],
  });
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
})();
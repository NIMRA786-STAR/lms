const puppeteer = require('puppeteer');

// ✅ HTML-escape helper
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const generateCertificatePdf = async ({
  studentName,
  courseTitle,
  score,
  certificateId,
  issuedDate,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        /* ... same CSS as before ... */
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="trophy">🏆</div>
        <h1>Certificate</h1>
        <h2>of Completion</h2>
        <p>This is to certify that</p>
        <div class="name">${esc(studentName)}</div>
        <p>has successfully completed the course</p>
        <div class="course">${esc(courseTitle)}</div>
        <div class="score">Score: ${esc(score)}%</div>
        <div class="meta">
          <span>Certificate ID: ${esc(certificateId)}</span>
          <span>Issued: ${esc(issuedDate)}</span>
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,     // ✅ fixed: 'new' is deprecated/removed in Puppeteer 22+
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    // ✅ Timeout to prevent DoS
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 10000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generateCertificatePdf };
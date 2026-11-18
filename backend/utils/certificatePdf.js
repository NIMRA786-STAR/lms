const puppeteer = require('puppeteer');

/**
 * Generate a certificate PDF from HTML template.
 * Returns a Buffer that can be attached to an email.
 */
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Georgia', serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f5f7fa;
          padding: 20px;
        }
        .certificate {
          border: 12px double #667eea;
          padding: 60px 80px;
          text-align: center;
          background: white;
          width: 100%;
          max-width: 900px;
          position: relative;
        }
        .certificate::before {
          content: '';
          position: absolute;
          inset: 20px;
          border: 2px solid #764ba2;
          pointer-events: none;
        }
        .trophy { font-size: 60px; margin-bottom: 20px; }
        h1 {
          color: #667eea;
          font-size: 2.8rem;
          letter-spacing: 4px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        h2 {
          color: #764ba2;
          font-size: 1.3rem;
          margin-bottom: 40px;
          font-weight: normal;
        }
        p { font-size: 1.1rem; color: #444; margin: 10px 0; }
        .name {
          font-size: 2.2rem;
          margin: 30px 0;
          font-weight: bold;
          color: #1a202c;
          border-bottom: 2px solid #667eea;
          display: inline-block;
          padding-bottom: 10px;
        }
        .course {
          font-size: 1.6rem;
          color: #667eea;
          font-weight: bold;
          margin: 20px 0;
        }
        .score {
          display: inline-block;
          background: #48bb78;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          margin: 20px 0;
        }
        .meta {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #666;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="trophy">🏆</div>
        <h1>Certificate</h1>
        <h2>of Completion</h2>
        <p>This is to certify that</p>
        <div class="name">${studentName}</div>
        <p>has successfully completed the course</p>
        <div class="course">${courseTitle}</div>
        <div class="score">Score: ${score}%</div>
        <div class="meta">
          <span>Certificate ID: ${certificateId}</span>
          <span>Issued: ${issuedDate}</span>
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });
    return pdfBuffer; // Buffer
  } finally {
    await browser.close();
  }
};

module.exports = { generateCertificatePdf };
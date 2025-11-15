// Dev helper to test SMTP configuration by sending a simple email
// Usage: set TEST_EMAIL_TO in .env or pass as arg: node scripts/test-email.js you@example.com
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const transporter = require('../config/nodemailer');

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error('Please specify a recipient email via arg or TEST_EMAIL_TO in .env');
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'SMTP test email',
      text: 'This is a test email from SheEm Shop (dev).',
    });
    console.log('✅ Test email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send test email:', err.message);
    process.exit(2);
  }
}

main();

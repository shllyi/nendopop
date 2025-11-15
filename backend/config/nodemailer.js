const nodemailer = require('nodemailer');

const port = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, 
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error.message || error);
    console.error(`   Host: ${process.env.SMTP_HOST}  Port: ${port}`);
  } else {
    console.log('✅ SMTP connection verified and ready to send emails');
  }
});

module.exports = transporter;


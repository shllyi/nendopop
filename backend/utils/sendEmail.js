const transporter = require('../config/nodemailer');

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Order Confirmation Email
const sendOrderConfirmationEmail = async (order) => {
  // Support both default export (module.exports = fn) and named export ({ generateReceiptPDF })
  const mod = require('./generateReceiptPDF');
  const generateReceiptPDF = typeof mod === 'function' ? mod : mod.generateReceiptPDF;
  if (typeof generateReceiptPDF !== 'function') {
    throw new TypeError('generateReceiptPDF is not a function export');
  }
  const pdfDoc = generateReceiptPDF(order);
  const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank You for Your Order!</h2>
      <p>Dear ${order.userId?.username || 'Customer'},</p>
      
      <p>Your order has been confirmed and is being processed.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order #:</strong> ${order._id.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount.toFixed(2)}</p>
        <p><strong>Shipping Method:</strong> ${order.shipping}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      
      <p>We've attached your receipt PDF for your records.</p>
      
      <p>You will receive another email when your order ships.</p>
      
      <p>Thank you for shopping with SheEm Shop!</p>
    </div>
  `;

  return await sendEmail({
    to: order.userId?.email,
    subject: `Order Confirmation - #${order._id.toString().slice(-6).toUpperCase()}`,
    html,
    attachments: [
      {
        filename: `receipt-${order._id.toString().slice(-6)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

// Password Reset Email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Dear ${user.username},</p>
      
      <p>You requested to reset your password. Click the link below to reset it:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes.</p>
      
      <p>Best regards,<br>SheEm Shop Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - SheEm Shop',
    html
  });
};

// Order Status Update Email
const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  const statusMessages = {
    Shipped: 'Your order has been shipped!',
    Delivered: 'Your order has been delivered!'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Status Update</h2>
      <p>Dear ${order.userId?.username || 'Customer'},</p>
      
      <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order #:</strong> ${order._id.toString().slice(-6).toUpperCase()}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount.toFixed(2)}</p>
      </div>
      
      <p>Thank you for shopping with SheEm Shop!</p>
    </div>
  `;

  return await sendEmail({
    to: order.userId?.email,
    subject: `Order ${newStatus} - #${order._id.toString().slice(-6).toUpperCase()}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendOrderStatusUpdateEmail
};


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

  // Calculate subtotal
  const subtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;

  // Generate items list HTML
  const itemsHtml = order.items?.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 8px; text-align: left; font-size: 14px;">${item.name || 'Unknown Item'}</td>
      <td style="padding: 12px 8px; text-align: center; font-size: 14px;">${item.quantity || 1}</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 14px;">₱${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 14px;">₱${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%);">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(255, 140, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎉 Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Thank you for choosing NendoPop by SheEm</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
            Dear <strong>${order.userId?.username || 'Valued Customer'}</strong>,<br><br>
            Your order has been successfully placed and confirmed! We're excited to prepare your premium Nendoroid collection for shipping.
          </p>

          <!-- Order Summary Card -->
          <div style="background: linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%); border: 2px solid #ff8c00; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #ff8c00; margin: 0 0 20px 0; font-size: 20px; text-align: center;">Order Summary</h3>

            <div style="display: table; width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #ff8c00; color: white;">
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px;">Product</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 14px;">Qty</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Price</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </div>

            <!-- Totals -->
            <div style="margin-top: 20px; border-top: 2px solid #ff8c00; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Subtotal:</span>
                <span>₱${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Shipping (${order.shipping || 'Standard'}):</span>
                <span>₱${(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #ff8c00; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                <span>Grand Total:</span>
                <span>₱${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Order Details -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📋 Order Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #666;">Order Number:</strong><br>
                <span style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">#${order._id.toString().slice(-6).toUpperCase()}</span>
              </div>
              <div>
                <strong style="color: #666;">Order Date:</strong><br>
                ${new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                <strong style="color: #666;">Status:</strong><br>
                <span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${order.status || 'Confirmed'}</span>
              </div>
              <div>
                <strong style="color: #666;">Shipping To:</strong><br>
                ${order.address || 'N/A'}
              </div>
            </div>
          </div>

          <!-- PDF Attachment Notice -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 1px solid #2196f3; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📎</div>
            <p style="margin: 0; font-weight: 600; color: #1976d2;">Official Receipt Attached</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Your detailed receipt PDF is attached to this email for your records.</p>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff3e0; border-left: 4px solid #ff8c00; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <h4 style="color: #e65100; margin: 0 0 10px 0; font-size: 16px;">🚚 What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.6;">
              <li>We'll prepare your Nendoroids with care</li>
              <li>You'll receive a shipping confirmation email</li>
              <li>Track your order status in your account dashboard</li>
              <li>Delivery typically takes 3-7 business days</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #ff8c00;">
            <p style="font-size: 18px; font-weight: bold; color: #ff8c00; margin: 0 0 10px 0;">Thank you for choosing NendoPop by SheEm! 🎨</p>
            <p style="color: #666; margin: 0 0 20px 0; font-style: italic;">Your premium Nendoroid destination</p>

            <div style="background: #ff8c00; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Need help?</strong> Contact our support team<br>
                📧 contact@nendopop.com | 🌐 www.nendopop.com | 📱 +63 XXX XXX XXXX
              </p>
            </div>

            <p style="font-size: 12px; color: #999; margin: 20px 0 0 0;">
              This email serves as confirmation of your order. Please keep it for your records.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: order.userId?.email,
    subject: `🎉 Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()} | NendoPop by SheEm`,
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
  // Support both default export (module.exports = fn) and named export ({ generateReceiptPDF })
  const mod = require('./generateReceiptPDF');
  const generateReceiptPDF = typeof mod === 'function' ? mod : mod.generateReceiptPDF;
  if (typeof generateReceiptPDF !== 'function') {
    throw new TypeError('generateReceiptPDF is not a function export');
  }
  const pdfDoc = generateReceiptPDF(order);
  const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

  // Calculate totals
  const subtotal = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
  const shippingFee = order.shippingFee || 0;
  const grandTotal = subtotal + shippingFee;

  // Generate items list HTML
  const itemsHtml = order.items?.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 8px; text-align: left; font-size: 14px;">${item.name || 'Unknown Item'}</td>
      <td style="padding: 12px 8px; text-align: center; font-size: 14px;">${item.quantity || 1}</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 14px;">₱${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 14px;">₱${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  const statusMessages = {
    Shipped: 'Your order has been shipped and is on its way!',
    Delivered: 'Your order has been successfully delivered!'
  };

  const statusColors = {
    Shipped: '#ff8c00',
    Delivered: '#4caf50'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%);">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(255, 140, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${statusColors[newStatus] || '#ff8c00'} 0%, #ffa500 100%); padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">
            ${newStatus === 'Shipped' ? '🚚' : newStatus === 'Delivered' ? '✅' : '📦'}
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Order ${newStatus}!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">NendoPop by SheEm</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
            Dear <strong>${order.userId?.username || 'Valued Customer'}</strong>,<br><br>
            ${statusMessages[newStatus] || 'Your order status has been updated.'}
          </p>

          <!-- Order Summary Card -->
          <div style="background: linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%); border: 2px solid ${statusColors[newStatus] || '#ff8c00'}; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: ${statusColors[newStatus] || '#ff8c00'}; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📦 Order Summary</h3>

            <div style="display: table; width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: ${statusColors[newStatus] || '#ff8c00'}; color: white;">
                  <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px;">Product</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 14px;">Qty</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Price</th>
                  <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </div>

            <!-- Totals -->
            <div style="margin-top: 20px; border-top: 2px solid ${statusColors[newStatus] || '#ff8c00'}; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Subtotal:</span>
                <span>₱${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Shipping (${order.shipping || 'Standard'}):</span>
                <span>₱${shippingFee.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: ${statusColors[newStatus] || '#ff8c00'}; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                <span>Grand Total:</span>
                <span>₱${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Status Information -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📋 Order Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #666;">Order Number:</strong><br>
                <span style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">#${order._id.toString().slice(-6).toUpperCase()}</span>
              </div>
              <div>
                <strong style="color: #666;">Order Date:</strong><br>
                ${new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                <strong style="color: #666;">Current Status:</strong><br>
                <span style="background: ${statusColors[newStatus] || '#ff8c00'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${newStatus}</span>
              </div>
              <div>
                <strong style="color: #666;">Shipping To:</strong><br>
                ${order.address || 'N/A'}
              </div>
            </div>
          </div>

          <!-- PDF Attachment Notice -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 1px solid #2196f3; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📎</div>
            <p style="margin: 0; font-weight: 600; color: #1976d2;">Updated Receipt Attached</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Your detailed receipt PDF is attached for your records.</p>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff3e0; border-left: 4px solid ${statusColors[newStatus] || '#ff8c00'}; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <h4 style="color: #e65100; margin: 0 0 10px 0; font-size: 16px;">
              ${newStatus === 'Shipped' ? '🚚 What happens next?' : newStatus === 'Delivered' ? '🎉 Enjoy your purchase!' : '📦 Order Update'}
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.6;">
              ${newStatus === 'Shipped' ?
                `<li>Your order is now in transit</li>
                 <li>You'll receive tracking information soon</li>
                 <li>Expected delivery: 3-7 business days</li>
                 <li>Questions? Contact our support team</li>` :
                newStatus === 'Delivered' ?
                `<li>Your order has been successfully delivered</li>
                 <li>Please inspect your items upon receipt</li>
                 <li>Enjoy your new Nendoroid collection!</li>
                 <li>Rate your experience in your account</li>` :
                `<li>Your order status has been updated</li>
                 <li>Check your account for more details</li>
                 <li>Contact us if you have any questions</li>`
              }
            </ul>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid ${statusColors[newStatus] || '#ff8c00'};">
            <p style="font-size: 18px; font-weight: bold; color: #ff8c00; margin: 0 0 10px 0;">Thank you for choosing NendoPop by SheEm! 🎨</p>
            <p style="color: #666; margin: 0 0 20px 0; font-style: italic;">Your premium Nendoroid destination</p>

            <div style="background: #ff8c00; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Need help?</strong> Contact our support team<br>
                📧 contact@nendopop.com | 🌐 www.nendopop.com | 📱 +63 XXX XXX XXXX
              </p>
            </div>

            <p style="font-size: 12px; color: #999; margin: 20px 0 0 0;">
              This email serves as notification of your order status update. Keep it for your records.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: order.userId?.email,
    subject: `🚚 Order ${newStatus} - #${order._id.toString().slice(-6).toUpperCase()} | NendoPop by SheEm`,
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

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendOrderStatusUpdateEmail
};

# Mailtrap Setup Guide for SheEm Shop

## 📧 What's Been Implemented

Your backend now has email functionality for:
1. ✅ **Order Confirmation** - Sends email with PDF receipt when order is placed
2. ✅ **Password Reset** - Sends reset link when user requests password change
3. ✅ **Order Status Updates** - Sends notification when order status changes to "Shipped" or "Delivered"

---

## 🔧 Setup Instructions

### Step 1: Create a Mailtrap Account
1. Go to https://mailtrap.io/
2. Sign up for a free account

### Step 2: Get Your Mailtrap Credentials
1. Login to Mailtrap dashboard
2. Click on "Inboxes" in the sidebar
3. Click on "SMTP Settings"
4. Select "Node.js - Nodemailer"
5. Copy the SMTP credentials

### Step 3: Update Your `.env` File
Add these lines to your `backend/.env` file (you may already have some):

```env
# SMTP Configuration for Mailtrap
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_EMAIL=your_mailtrap_username_here
SMTP_PASSWORD=your_mailtrap_password_here

# Email Settings
SMTP_FROM_NAME=SheEm Shop
SMTP_FROM_EMAIL=noreply@sheem.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `your_mailtrap_username_here` and `your_mailtrap_password_here` with your actual Mailtrap credentials.

### Step 4: Restart Your Backend Server
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected to HOST: ...
✅ Mailtrap is ready to send emails
✅ Server started on PORT: 5000
```

---

## 🧪 Testing the Emails

### Test 1: Order Confirmation Email
1. Place an order through your frontend
2. Go to Mailtrap inbox
3. You should see an email with a PDF attachment

### Test 2: Password Reset Email
1. Send a POST request to `/api/v1/auth/forgot-password`
   ```json
   {
     "email": "your-email@example.com"
   }
   ```
2. Check Mailtrap inbox
3. Click the reset link in the email

### Test 3: Order Status Update Email
1. As admin, change an order status to "Shipped" or "Delivered"
2. Check Mailtrap inbox
3. You should see a status update email

---

## 📝 Email Templates Location

- **Config:** `backend/config/nodemailer.js`
- **Utilities:** `backend/utils/sendEmail.js`
- **PDF Generation:** `backend/utils/generateReceiptPDF.js`

---

## 🚀 Production Setup

When ready for production, replace Mailtrap with a real email provider:
- **Gmail:** Use App Password
- **SendGrid:** Professional email service
- **AWS SES:** Scalable email service
- **Postmark:** Transactional email specialist

Just update the SMTP credentials in your `.env` file!

---

## ⚠️ Troubleshooting

**Problem:** "Mailtrap configuration error"
- **Solution:** Check that SMTP_EMAIL and SMTP_PASSWORD in .env match your Mailtrap credentials

**Problem:** Emails not appearing in inbox
- **Solution:** Check your Mailtrap inbox is empty (it starts empty) and you're looking at the right inbox

**Problem:** PDF attachment not working
- **Solution:** Make sure `jspdf` is installed: `cd backend && npm install jspdf`

---

## 🎉 You're All Set!

Your email system is now ready to go. All emails will be captured in Mailtrap for testing.


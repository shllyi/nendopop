const crypto = require('crypto');
const User = require('../models/user');
const { sendEmail } = require('../utils/sendEmail');

// Request OTP for password change (requires current password, authenticated)
const requestPasswordOtp = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password is required' });

    const userId = req.user?.id;
    const user = userId ? await User.findById(userId).select('+password') : null;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const matches = await user.comparePassword(currentPassword);
    if (!matches) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    user.passwordOtpCode = otpHash;
    user.passwordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your SheEm Shop OTP Code',
      html: `<p>Hello ${user.username},</p><p>Your OTP code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('requestPasswordOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Verify OTP and change password
const verifyPasswordOtpAndChange = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) return res.status(400).json({ success: false, message: 'OTP and newPassword are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });

    const userId = req.user?.id;
    const user = userId ? await User.findById(userId).select('+password') : null;
    if (!user || !user.passwordOtpCode || !user.passwordOtpExpire) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    if (user.passwordOtpExpire < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired' });
    if (user.passwordOtpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.passwordOtpCode) {
      user.passwordOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    user.password = newPassword;
    user.passwordOtpCode = undefined;
    user.passwordOtpExpire = undefined;
    user.passwordOtpAttempts = 0;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('verifyPasswordOtpAndChange error:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

module.exports = { requestPasswordOtp, verifyPasswordOtpAndChange };

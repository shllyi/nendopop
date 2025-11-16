// Clean, single-source controller with OTP-based password change
const crypto = require('crypto');
const User = require('../models/user');
const sendToken = require('../utils/sendToken');
const cloudinary = require('cloudinary');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const sendEmail = require('../utils/sendEmail').sendEmail;

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let avatarData = {
      public_id: 'default_avatar',
      url: 'https://res.cloudinary.com/dwfmkvikk/image/upload/v1761637373/product_images/chjth6dty9qmfbf7rg58.jpg',
    };
    if (avatar) {
      const result = await cloudinary.v2.uploader.upload(avatar, { folder: 'avatars', width: 150, crop: 'scale' });
      avatarData = { public_id: result.public_id, url: result.secure_url };
    }

    const user = await User.create({ username, email, password, avatar: avatarData });
    sendToken(user, 201, res);
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user account is deactivated
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Logout User
const logout = (req, res) => {
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Update Profile; prefer req.user.id, fallback to body.userId for compatibility
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // prefer authenticated user id
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const { username, email, password, firstName, lastName, address, phone, gender, avatar } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (typeof username !== 'undefined') user.username = username;
    if (typeof email !== 'undefined') user.email = email;
    if (typeof firstName !== 'undefined') user.firstName = firstName;
    if (typeof lastName !== 'undefined') user.lastName = lastName;
    if (typeof address !== 'undefined') user.address = address;
    if (typeof phone !== 'undefined') user.phone = phone;
    if (typeof gender !== 'undefined') user.gender = gender;
    if (password) user.password = password;

    if (avatar) {
      const uploadSource = typeof avatar === 'string' ? avatar : String(avatar);
      const result = await cloudinary.v2.uploader.upload(uploadSource, { folder: 'avatars', width: 150, crop: 'scale' });
      user.avatar = { public_id: result.public_id, url: result.secure_url };
    }

    await user.save();
    const updatedUser = await User.findById(user._id);
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + (error?.message || 'unknown') });
  }
};

// Forgot Password (email reset link with token)
const forgotPassword = async (req, res) => {
    const { currentPassword } = req.body;
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found with this email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendPasswordResetEmail(user, resetToken);
    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
    res.status(200).json({ success: true, message: 'Password reset email sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Reset Password (via token from email)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required' });

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// Request OTP for password change (email confirmation)
const requestPasswordOtp = async (req, res) => {
  try {
    const { currentPassword, email } = req.body;
    if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password is required' });

    // Prefer authenticated user
    let user;
    if (req.user?.id) {
      user = await User.findById(req.user.id).select('+password');
    } else if (email) {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      // Do not reveal account existence
      return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent.' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

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

const verifyPasswordOtpAndChange = async (req, res) => {
  try {
    const { otp, newPassword, email } = req.body;
    if (!otp || !newPassword) return res.status(400).json({ success: false, message: 'OTP and newPassword are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });

    let user;
    if (req.user?.id) {
      user = await User.findById(req.user.id).select('+password');
    } else if (email) {
      user = await User.findOne({ email }).select('+password');
    }

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

module.exports = {
  registerUser,
  loginUser,
  logout,
  updateProfile,
  forgotPassword,
  resetPassword,
  requestPasswordOtp,
  verifyPasswordOtpAndChange,
};

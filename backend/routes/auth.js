const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth');
const { requestPasswordOtp, verifyPasswordOtpAndChange } = require('../controllers/passwordOtp');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.put('/profile', isAuthenticated, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// OTP password change
router.post('/password-otp/request', isAuthenticated, requestPasswordOtp);
router.post('/password-otp/verify', isAuthenticated, verifyPasswordOtpAndChange);

module.exports = router;

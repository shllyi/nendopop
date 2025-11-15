// backend/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    unique: true,
    trim: true,
    maxlength: [30, 'Your username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Your password must be at least 6 characters long'],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      default: 'default_avatar'
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/dwfmkvikk/image/upload/v1761637373/product_images/chjth6dty9qmfbf7rg58.jpg'
    }
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  gender: { type: String, enum: ['', 'female', 'male', 'nonbinary', 'other', 'prefer_not_to_say'], default: '' },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // OTP for password change
  passwordOtpCode: String,
  passwordOtpExpire: Date,
  passwordOtpAttempts: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME || '7d'
  });
};

module.exports = mongoose.model('User', userSchema);

const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin: list all reviews with product and user info
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
});

// User: get current user's reviews
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const Review = require('../models/review');
    const userId = req.user?.id;
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load user reviews' });
  }
});

module.exports = router;

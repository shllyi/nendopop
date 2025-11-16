const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const cloudinary = require('cloudinary');
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

// Admin: delete a review
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Find the review first to get image public_ids
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Delete associated images from Cloudinary
    if (review.images && review.images.length > 0) {
      for (const img of review.images) {
        try {
          await cloudinary.v2.uploader.destroy(img.public_id);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }
    }

    // Delete the review from database
    await Review.findByIdAndDelete(reviewId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
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

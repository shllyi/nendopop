const Review = require('../models/review');
const Order = require('../models/orders');
const cloudinary = require('cloudinary');
const Filter = require('bad-words');

// Create or update a review (only if user completed an order containing the product)
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { id: productId } = req.params; // product id
    const userId = req.user?.id;
    const { rating, comment, images } = req.body;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    // Must have at least one Completed order including this product
    const eligible = await Order.findOne({
      userId,
      status: 'Completed',
      'items.productId': productId,
    }).select('_id');

    if (!eligible) {
      return res.status(403).json({ success: false, message: 'You can only review products you have completed.' });
    }

    // Prepare uploads if images provided
    let uploadedImages = undefined;
    if (Array.isArray(images) && images.length > 0) {
      uploadedImages = [];
      for (const img of images) {
        const result = await cloudinary.v2.uploader.upload(img, { folder: 'review_images' });
        uploadedImages.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    // retainImagePublicIds: optional array of public_ids the user wants to keep
    const retainImagePublicIds = req.body.retainImagePublicIds;

    // Filter bad words from comment
    const filter = new Filter();
    const filteredComment = comment ? filter.clean(comment) : '';

    // Create or update existing review
    let review = await Review.findOne({ productId, userId });
    if (!review) {
      review = await Review.create({ productId, userId, rating: parsedRating, comment: filteredComment, images: uploadedImages || [] });
    } else {
      // If retainImagePublicIds provided, remove un-retained images and keep retained ones
      if (Array.isArray(retainImagePublicIds)) {
        const toRemove = (review.images || []).filter((img) => !retainImagePublicIds.includes(img.public_id));
        for (const img of toRemove) {
          try { await cloudinary.v2.uploader.destroy(img.public_id); } catch {}
        }
        review.images = (review.images || []).filter((img) => retainImagePublicIds.includes(img.public_id));

        // Append any newly uploaded images
        if (uploadedImages) review.images = review.images.concat(uploadedImages);
      } else if (uploadedImages) {
        // Backwards-compatible: replace all images when uploadedImages provided and no retain list
        for (const img of review.images || []) {
          try { await cloudinary.v2.uploader.destroy(img.public_id); } catch {}
        }
        review.images = uploadedImages;
      }

      review.rating = parsedRating;
      review.comment = filteredComment ?? review.comment;
      await review.save();
    }

    return res.json({ success: true, review });
  } catch (error) {
    // Handle duplicate key (unique index) race conditions
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
};

// Get all reviews made by the authenticated user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });

    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load user reviews' });
  }
};

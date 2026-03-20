const Review = require('../models/Review');
const User = require('../models/User');

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    const reviews = await Review.getProductReviews(productId, {
      status,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reviews.length
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

const getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const rating = await Review.getProductRating(productId);

    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating'
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating, title, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const existingReview = await Review.hasUserReviewed(req.user.id, productId);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      status: 'pending' 
    });

    await review.save();

    await review.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating,
        title: title?.trim(),
        comment: comment?.trim(),
        status: 'pending' 
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await Review.deleteOne({ _id: reviewId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews'
    });
  }
};

const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status, reason: reason?.trim() },
      { new: true }
    ).populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: `Review ${status}`,
      data: review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review'
    });
  }
};

module.exports = {
  getProductReviews,
  getProductRating,
  createReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  moderateReview
};
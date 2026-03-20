const Review = require('../models/Review');

const reviewOwnership = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const review = await Review.findOne({
      _id: reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found or access denied.' });
    }

    req.review = review;
    next();
  } catch (error) {
    console.error('Review ownership middleware error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  review: reviewOwnership
};
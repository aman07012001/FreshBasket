const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const requireOwnership = require('../middleware/ownership');
const { requireRole } = require('../middleware/roles');

router.get('/product/:productId', reviewController.getProductReviews);

router.get('/product/:productId/rating', reviewController.getProductRating);

router.post('/', auth, reviewController.createReview);

router.put('/:reviewId', auth, requireOwnership.review, reviewController.updateReview);

router.delete('/:reviewId', auth, requireOwnership.review, reviewController.deleteReview);

router.get('/pending', auth, requireRole('admin'), reviewController.getPendingReviews);

router.put('/:reviewId/moderate', auth, requireRole('admin'), reviewController.moderateReview);

module.exports = router;
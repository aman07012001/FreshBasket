const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  verifiedPurchase: {
    type: Boolean,
    default: false 
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); 

reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const { status = 'approved', limit = 10, skip = 0 } = options;
  return this.find({ productId, status })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

reviewSchema.statics.getProductRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        productId: productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [0, 0, 0, 0, 0]
    };
  }

  const data = result[0];
  const distribution = [0, 0, 0, 0, 0];
  data.ratingDistribution.forEach(rating => {
    distribution[rating - 1]++;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

reviewSchema.statics.hasUserReviewed = function(userId, productId) {
  return this.findOne({ userId, productId }).exec();
};

module.exports = mongoose.model('Review', reviewSchema);
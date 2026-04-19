import { api } from '../utils/api';

export const reviewsApi = {

  getProductReviews: async (productId, options = {}) => {
    const params = new URLSearchParams(options);
    const response = await api.get(`reviews/product/${productId}?${params}`);
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch reviews');
    }
    return response;
  },

  getProductRating: async (productId) => {
    const response = await api.get(`reviews/product/${productId}/rating`);
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch rating');
    }
    return response;
  },

  createReview: async (productId, reviewData) => {
    const response = await api.post('reviews', {
      productId,
      ...reviewData
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to create review');
    }
    return response;
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`reviews/${reviewId}`, reviewData);
    if (response.error) {
      throw new Error(response.message || 'Failed to update review');
    }
    return response;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`reviews/${reviewId}`);
    if (response.error) {
      throw new Error(response.message || 'Failed to delete review');
    }
    return response;
  },

  getPendingReviews: async () => {
    const response = await api.get('reviews/pending');
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch pending reviews');
    }
    return response;
  },

  moderateReview: async (reviewId, status, reason) => {
    const response = await api.put(`reviews/${reviewId}/moderate`, {
      status,
      reason
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to moderate review');
    }
    return response;
  }
};
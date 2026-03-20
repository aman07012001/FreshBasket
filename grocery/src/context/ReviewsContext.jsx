import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { reviewsApi } from '../services/reviewsService';
import { useAuth } from '../hooks/useAuth';

const ReviewsContext = createContext();

const reviewsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_REVIEWS':
      return {
        ...state,
        reviews: action.payload.reviews,
        rating: action.payload.rating,
        loading: false
      };
    case 'ADD_REVIEW':
      return {
        ...state,
        reviews: [action.payload, ...state.reviews],
        rating: {
          ...state.rating,
          totalReviews: state.rating.totalReviews + 1,
          averageRating: action.payload.rating
        }
      };
    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(review =>
          review._id === action.payload._id ? action.payload : review
        )
      };
    case 'DELETE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.filter(review => review._id !== action.payload),
        rating: {
          ...state.rating,
          totalReviews: state.rating.totalReviews - 1
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  reviews: [],
  rating: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  },
  loading: false,
  error: null
};

export const ReviewsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reviewsReducer, initialState);
  const { user } = useAuth();

  const loadReviews = async (productId) => {
    if (!productId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [reviewsResponse, ratingResponse] = await Promise.all([
        reviewsApi.getProductReviews(productId),
        reviewsApi.getProductRating(productId)
      ]);

      dispatch({
        type: 'SET_REVIEWS',
        payload: {
          reviews: reviewsResponse.data,
          rating: ratingResponse.data
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createReview = async (productId, reviewData) => {
    try {
      const result = await reviewsApi.createReview(productId, reviewData);
      dispatch({ type: 'ADD_REVIEW', payload: result.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    try {
      const result = await reviewsApi.updateReview(reviewId, reviewData);
      dispatch({ type: 'UPDATE_REVIEW', payload: result.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await reviewsApi.deleteReview(reviewId);
      dispatch({ type: 'DELETE_REVIEW', payload: reviewId });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  const hasUserReviewed = (userId) => {
    return state.reviews.some(review => review.userId._id === userId);
  };

  return (
    <ReviewsContext.Provider
      value={{
        ...state,
        loadReviews,
        createReview,
        updateReview,
        deleteReview,
        hasUserReviewed
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within ReviewsProvider');
  }
  return context;
};
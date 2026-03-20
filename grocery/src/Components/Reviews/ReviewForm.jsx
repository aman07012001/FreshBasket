import React, { useState } from 'react';
import { Box, TextField, Button, Rating, Typography, Alert } from '@mui/material';
import { useReviews } from '../../context/ReviewsContext';
import { useAuth } from '../../hooks/useAuth';

const ReviewForm = ({ productId }) => {
  const { user } = useAuth();
  const { createReview, loading, error } = useReviews();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rating || !formData.title || !formData.comment) {
      return;
    }

    setSubmitting(true);
    const result = await createReview(productId, formData);
    setSubmitting(false);

    if (result.success) {
      setFormData({
        rating: 0,
        title: '',
        comment: ''
      });
    }
  };

  if (!user) {
    return (
      <Alert severity="info" className="mb-4">
        Please <a href="/login" className="text-green-600 hover:text-green-700">login</a> to write a review
      </Alert>
    );
  }

  return (
    <Box className="bg-gray-50 p-6 rounded-lg mb-6">
      <Typography variant="h6" className="mb-4">
        Write a Review
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box className="space-y-4">
          <Box>
            <Typography className="mb-2">Rating</Typography>
            <Rating
              value={formData.rating}
              onChange={(e, newValue) => handleChange('rating', newValue)}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            label="Review Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Review Comment"
            value={formData.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            multiline
            rows={4}
            required
          />

          <Button
            type="submit"
            variant="contained"
            className="bg-green-600 hover:bg-green-700"
            disabled={submitting || loading || !formData.rating || !formData.title || !formData.comment}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ReviewForm;
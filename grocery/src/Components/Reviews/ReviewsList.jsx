import React from 'react';
import { Box, Typography, Chip, Divider, Avatar } from '@mui/material';
import StarRating from './StarRating';
import { format } from 'date-fns';

const ReviewsList = ({ reviews }) => {
  return (
    <Box className="space-y-4">
      <Typography variant="h6" className="mb-4">
        Customer Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Typography color="textSecondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review._id} className="bg-white p-4 rounded-lg shadow">
            <Box className="flex items-start justify-between">
              <Box className="flex items-center space-x-3">
                <Avatar>
                  {review.userId.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography className="font-semibold">
                    {review.userId.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
              <Box className="flex items-center space-x-2">
                {review.verifiedPurchase && (
                  <Chip label="Verified Purchase" size="small" color="success" />
                )}
                <StarRating rating={review.rating} size="small" />
              </Box>
            </Box>

            <Box className="mt-3">
              <Typography className="font-semibold">
                {review.title}
              </Typography>
              <Typography className="mt-2 text-gray-700">
                {review.comment}
              </Typography>
            </Box>

            {review.status !== 'approved' && (
              <Box className="mt-3">
                <Chip
                  label={`Status: ${review.status}`}
                  color={review.status === 'pending' ? 'warning' : 'error'}
                />
              </Box>
            )}

            <Divider className="mt-4" />
          </Box>
        ))
      )}
    </Box>
  );
};

export default ReviewsList;
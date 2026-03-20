import React from 'react';
import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

const StarRating = ({ rating, size = 'medium', interactive = false, onRatingChange }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <StarIcon
        key={`full-${i}`}
        fontSize={size}
        className="text-yellow-400"
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalfIcon
        key="half"
        fontSize={size}
        className="text-yellow-400"
        onClick={() => interactive && onRatingChange && onRatingChange(fullStars + 0.5)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      />
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <StarBorderIcon
        key={`empty-${i}`}
        fontSize={size}
        className="text-yellow-400"
        onClick={() => interactive && onRatingChange && onRatingChange(fullStars + hasHalfStar + i + 1)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      />
    );
  }

  return (
    <Box className="flex space-x-1">
      {stars}
    </Box>
  );
};

export default StarRating;
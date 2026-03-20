const cloudinary = require('../config/cloudinary');

const handleCloudinaryError = (error) => {
  if (error.message.includes('Invalid file format')) {
    return {
      statusCode: 400,
      message: 'Invalid file format. Please upload a valid image file.',
    };
  }
  if (error.message.includes('File size too large')) {
    return {
      statusCode: 400,
      message: 'File size exceeds the 5MB limit. Please upload a smaller file.',
    };
  }
  if (error.message.includes('Rate limit')) {
    return {
      statusCode: 429,
      message: 'Too many upload requests. Please try again later.',
    };
  }
  return {
    statusCode: 500,
    message: 'An error occurred during file upload. Please try again.',
  };
};

class ApiError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (error, req, res) => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    field: error.field,
  });

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || null;
  let field = error.field || null;

  if (error.name === 'CloudinaryError') {
    const cloudinaryError = handleCloudinaryError(error);
    statusCode = cloudinaryError.statusCode;
    message = cloudinaryError.message;
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the limit.';
    code = 'FILE_SIZE_LIMIT_EXCEEDED';
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Too many files uploaded.';
    code = 'TOO_MANY_FILES';
  }
  if (error.message.includes('Only image files are allowed')) {
    statusCode = 400;
    message = 'Only image files are allowed.';
    code = 'INVALID_FILE_TYPE';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
    code = 'INVALID_TOKEN';
  }
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
    code = 'TOKEN_EXPIRED';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    code = 'VALIDATION_ERROR';
    field = Object.keys(error.errors)[0] || null;
  }
  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found.';
    code = 'RESOURCE_NOT_FOUND';
  }

  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(field && { field }),
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  errorHandler,
  ApiError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
};

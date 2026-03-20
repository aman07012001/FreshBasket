

const ERROR_CODE_MAPPINGS = {

  INVALID_TOKEN: 'Your session has expired. Please log in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'You need to be logged in to access this resource.',

  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_SIZE_LIMIT_EXCEEDED: 'File size exceeds the limit. Please upload a smaller file.',
  TOO_MANY_FILES: 'Too many files uploaded. Please reduce the number of files.',
  INVALID_FILE_TYPE: 'Only image files are allowed.',

  RESOURCE_NOT_FOUND: 'The requested item was not found.',
  CONFLICT_ERROR: 'This resource already exists or has been modified.',

  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  UPLOAD_NETWORK_ERROR: 'Network error during upload. Please try again.',
  UPLOAD_TIMEOUT_ERROR: 'Upload request timed out. Please try again.',
  PARSE_ERROR: 'Failed to process response. Please try again.',

  INVALID_FILE_FORMAT: 'Invalid file format. Please upload a valid image file.',
  CLOUDINARY_RATE_LIMIT: 'Too many upload requests. Please try again later.',

  INSUFFICIENT_STOCK: 'Some items are no longer in stock.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  ORDER_CREATION_FAILED: 'Failed to create order. Please try again.',
};

const FIELD_ERROR_MAPPINGS = {

  email: 'Please enter a valid email address.',
  password: 'Please enter a password that meets the requirements.',
  confirmPassword: 'Passwords do not match.',
  fullName: 'Please enter your full name.',
  address: 'Please enter a valid address.',
  phone: 'Please enter a valid phone number.',
  pincode: 'Please enter a valid pincode.',
};

export function mapErrorMessage(error) {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (error.code && ERROR_CODE_MAPPINGS[error.code]) {
    return ERROR_CODE_MAPPINGS[error.code];
  }

  if (error.field && FIELD_ERROR_MAPPINGS[error.field]) {
    return FIELD_ERROR_MAPPINGS[error.field];
  }

  if (error.message) {

    const message = error.message.toLowerCase();

    if (message.includes('file size') || message.includes('limit')) {
      return ERROR_CODE_MAPPINGS.FILE_SIZE_LIMIT_EXCEEDED;
    }
    if (message.includes('invalid file format') || message.includes('file format')) {
      return ERROR_CODE_MAPPINGS.INVALID_FILE_FORMAT;
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ERROR_CODE_MAPPINGS.CLOUDINARY_RATE_LIMIT;
    }
    if (message.includes('invalid token') || message.includes('token')) {
      return ERROR_CODE_MAPPINGS.INVALID_TOKEN;
    }
    if (message.includes('expired')) {
      return ERROR_CODE_MAPPINGS.TOKEN_EXPIRED;
    }
    if (message.includes('not found') || message.includes('does not exist')) {
      return ERROR_CODE_MAPPINGS.RESOURCE_NOT_FOUND;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_CODE_MAPPINGS.VALIDATION_ERROR;
    }
    if (message.includes('network') || message.includes('connection')) {
      return ERROR_CODE_MAPPINGS.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ERROR_CODE_MAPPINGS.TIMEOUT_ERROR;
    }
    if (message.includes('payment') || message.includes('transaction')) {
      return ERROR_CODE_MAPPINGS.PAYMENT_FAILED;
    }
    if (message.includes('stock') || message.includes('availability')) {
      return ERROR_CODE_MAPPINGS.INSUFFICIENT_STOCK;
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function isRetryableError(error) {
  if (!error) {
    return false;
  }

  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'UPLOAD_NETWORK_ERROR',
    'UPLOAD_TIMEOUT_ERROR',
    'CLOUDINARY_RATE_LIMIT',
  ];

  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }

  if (error.message) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('connection') ||
           message.includes('rate limit');
  }

  return false;
}

export function isAuthError(error) {
  if (!error) {
    return false;
  }

  const authCodes = [
    'INVALID_TOKEN',
    'TOKEN_EXPIRED',
    'UNAUTHORIZED',
    'INVALID_CREDENTIALS',
  ];

  if (error.code && authCodes.includes(error.code)) {
    return true;
  }

  if (error.message) {
    const message = error.message.toLowerCase();
    return message.includes('token') || 
           message.includes('auth') || 
           message.includes('login') ||
           message.includes('credential');
  }

  return false;
}

export function formatErrorForUI(error) {
  if (!error || !error.error) {
    return null;
  }

  const userMessage = mapErrorMessage(error);
  const isRetryable = isRetryableError(error);
  const isAuth = isAuthError(error);

  return {
    message: userMessage,
    code: error.code,
    field: error.field,
    status: error.status,
    isRetryable,
    isAuth,
    timestamp: error.timestamp || new Date().toISOString(),
  };
}

export default {
  mapErrorMessage,
  isRetryableError,
  isAuthError,
  formatErrorForUI,
};
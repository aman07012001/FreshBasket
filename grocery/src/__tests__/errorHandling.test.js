import { describe, it, expect } from 'vitest';
import { mapErrorMessage, isRetryableError, isAuthError, formatErrorForUI } from '../utils/errorMapper';

describe('Error Handling Utilities', () => {
  describe('mapErrorMessage', () => {
    it('should map error codes to user-friendly messages', () => {
      const testCases = [
        { code: 'INVALID_TOKEN', expected: 'Your session has expired. Please log in again.' },
        { code: 'TOKEN_EXPIRED', expected: 'Your session has expired. Please log in again.' },
        { code: 'FILE_SIZE_LIMIT_EXCEEDED', expected: 'File size exceeds the limit. Please upload a smaller file.' },
        { code: 'INVALID_FILE_TYPE', expected: 'Only image files are allowed.' },
        { code: 'NETWORK_ERROR', expected: 'Network error. Please check your internet connection and try again.' },
        { code: 'TIMEOUT_ERROR', expected: 'The request timed out. Please try again.' },
      ];

      testCases.forEach(({ code, expected }) => {
        const result = mapErrorMessage({ code, message: 'Original message' });
        expect(result).toBe(expected);
      });
    });

    it('should map field-specific errors', () => {
      const testCases = [
        { field: 'email', expected: 'Please enter a valid email address.' },
        { field: 'password', expected: 'Please enter a password that meets the requirements.' },
        { field: 'confirmPassword', expected: 'Passwords do not match.' },
      ];

      testCases.forEach(({ field, expected }) => {
        const result = mapErrorMessage({ field, message: 'Original message' });
        expect(result).toBe(expected);
      });
    });

    it('should handle message pattern matching', () => {
      const testCases = [
        { message: 'File size too large', expected: 'File size exceeds the limit. Please upload a smaller file.' },
        { message: 'Invalid file format detected', expected: 'Invalid file format. Please upload a valid image file.' },
        { message: 'Token is invalid', expected: 'Invalid authentication token. Please log in again.' },
        { message: 'Resource not found', expected: 'The requested item was not found.' },
        { message: 'Network connection failed', expected: 'Network error. Please check your internet connection and try again.' },
      ];

      testCases.forEach(({ message, expected }) => {
        const result = mapErrorMessage({ message });
        expect(result).toBe(expected);
      });
    });

    it('should return original message if no mapping found', () => {
      const result = mapErrorMessage({ message: 'Unknown error occurred' });
      expect(result).toBe('Unknown error occurred');
    });

    it('should return fallback message for null/undefined errors', () => {
      const result = mapErrorMessage(null);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable error codes', () => {
      const retryableCodes = [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'UPLOAD_NETWORK_ERROR',
        'UPLOAD_TIMEOUT_ERROR',
        'CLOUDINARY_RATE_LIMIT',
      ];

      retryableCodes.forEach(code => {
        const result = isRetryableError({ code });
        expect(result).toBe(true);
      });
    });

    it('should identify retryable error messages', () => {
      const testCases = [
        'Network connection failed',
        'Request timeout occurred',
        'Connection lost',
        'Rate limit exceeded',
      ];

      testCases.forEach(message => {
        const result = isRetryableError({ message });
        expect(result).toBe(true);
      });
    });

    it('should identify non-retryable errors', () => {
      const nonRetryable = [
        { code: 'INVALID_TOKEN' },
        { code: 'VALIDATION_ERROR' },
        { message: 'Invalid credentials' },
        { message: 'Permission denied' },
      ];

      nonRetryable.forEach(error => {
        const result = isRetryableError(error);
        expect(result).toBe(false);
      });
    });
  });

  describe('isAuthError', () => {
    it('should identify authentication error codes', () => {
      const authCodes = [
        'INVALID_TOKEN',
        'TOKEN_EXPIRED',
        'UNAUTHORIZED',
        'INVALID_CREDENTIALS',
      ];

      authCodes.forEach(code => {
        const result = isAuthError({ code });
        expect(result).toBe(true);
      });
    });

    it('should identify authentication error messages', () => {
      const testCases = [
        'Token has expired',
        'Invalid authentication credentials',
        'Login required',
        'Authentication failed',
      ];

      testCases.forEach(message => {
        const result = isAuthError({ message });
        expect(result).toBe(true);
      });
    });

    it('should identify non-authentication errors', () => {
      const nonAuthErrors = [
        { code: 'NETWORK_ERROR' },
        { code: 'VALIDATION_ERROR' },
        { message: 'File upload failed' },
        { message: 'Server error occurred' },
      ];

      nonAuthErrors.forEach(error => {
        const result = isAuthError(error);
        expect(result).toBe(false);
      });
    });
  });

  describe('formatErrorForUI', () => {
    it('should format error object for UI display', () => {
      const inputError = {
        error: true,
        message: 'Original error message',
        code: 'NETWORK_ERROR',
        status: 500,
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      const result = formatErrorForUI(inputError);

      expect(result).toEqual({
        message: 'Network error. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        field: undefined,
        status: 500,
        isRetryable: true,
        isAuth: false,
        timestamp: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should handle errors with field information', () => {
      const inputError = {
        error: true,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        field: 'email',
        status: 400,
      };

      const result = formatErrorForUI(inputError);

      expect(result).toEqual({
        message: 'Please enter a valid email address.',
        code: 'VALIDATION_ERROR',
        field: 'email',
        status: 400,
        isRetryable: false,
        isAuth: false,
        timestamp: expect.any(String),
      });
    });

    it('should return null for non-error objects', () => {
      const result1 = formatErrorForUI(null);
      const result2 = formatErrorForUI({});
      const result3 = formatErrorForUI({ error: false });

      expect(result1).toBe(null);
      expect(result2).toBe(null);
      expect(result3).toBe(null);
    });
  });
});
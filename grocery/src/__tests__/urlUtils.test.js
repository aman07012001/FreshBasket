import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeBaseUrl, normalizePath, buildApiUrl, buildApiEndpoint, API_ENDPOINTS } from '../utils/urlUtils';

describe('URL Utilities', () => {
  describe('normalizeBaseUrl', () => {
    it('should remove trailing slashes from base URL', () => {
      expect(normalizeBaseUrl('http://localhost:5000')).toBe('http://localhost:5000');
      expect(normalizeBaseUrl('http://localhost:5000/')).toBe('http://localhost:5000');
      expect(normalizeBaseUrl('http://localhost:5000//')).toBe('http://localhost:5000');
      expect(normalizeBaseUrl('http://localhost:5000/api')).toBe('http://localhost:5000/api');
      expect(normalizeBaseUrl('http://localhost:5000/api/')).toBe('http://localhost:5000/api');
    });

    it('should handle empty or undefined URLs', () => {
      expect(normalizeBaseUrl('')).toBe('');
      expect(normalizeBaseUrl(undefined)).toBe('');
      expect(normalizeBaseUrl(null)).toBe('');
    });
  });

  describe('normalizePath', () => {
    it('should remove leading and trailing slashes from path', () => {
      expect(normalizePath('auth/login')).toBe('auth/login');
      expect(normalizePath('/auth/login')).toBe('auth/login');
      expect(normalizePath('auth/login/')).toBe('auth/login');
      expect(normalizePath('/auth/login/')).toBe('auth/login');
      expect(normalizePath('//auth/login//')).toBe('auth/login');
    });

    it('should handle empty or undefined paths', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath(undefined)).toBe('');
      expect(normalizePath(null)).toBe('');
    });
  });

  describe('buildApiUrl', () => {
    it('should construct proper API URLs', () => {
      // Test with a mock base URL by temporarily setting environment variable
      const originalEnv = process.env.VITE_API_BASE_URL;
      process.env.VITE_API_BASE_URL = 'http://localhost:5000';
      
      // Re-import the module to get the updated config
      delete require.cache[require.resolve('../utils/urlUtils')];
      
      try {
        const { buildApiUrl } = require('../utils/urlUtils');
        const url = buildApiUrl('auth/login');
        expect(url).toBe('http://localhost:5000/api/auth/login');
      } finally {
        // Restore original environment
        if (originalEnv !== undefined) {
          process.env.VITE_API_BASE_URL = originalEnv;
        } else {
          delete process.env.VITE_API_BASE_URL;
        }
      }
    });

    it('should handle multiple path segments', () => {
      const originalEnv = process.env.VITE_API_BASE_URL;
      process.env.VITE_API_BASE_URL = 'http://localhost:5000';
      
      delete require.cache[require.resolve('../utils/urlUtils')];
      
      try {
        const { buildApiUrl } = require('../utils/urlUtils');
        const url = buildApiUrl('auth', 'sessions', '123', 'revoke');
        expect(url).toBe('http://localhost:5000/api/auth/sessions/123/revoke');
      } finally {
        if (originalEnv !== undefined) {
          process.env.VITE_API_BASE_URL = originalEnv;
        } else {
          delete process.env.VITE_API_BASE_URL;
        }
      }
    });

    it('should prevent double slashes', () => {
      const originalEnv = process.env.VITE_API_BASE_URL;
      process.env.VITE_API_BASE_URL = 'http://localhost:5000';
      
      delete require.cache[require.resolve('../utils/urlUtils')];
      
      try {
        const { buildApiUrl } = require('../utils/urlUtils');
        const url = buildApiUrl('/auth//login/');
        expect(url).toBe('http://localhost:5000/api/auth/login');
      } finally {
        if (originalEnv !== undefined) {
          process.env.VITE_API_BASE_URL = originalEnv;
        } else {
          delete process.env.VITE_API_BASE_URL;
        }
      }
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should provide properly constructed endpoint functions', () => {
      // Test that endpoint functions exist and are callable
      expect(typeof API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET).toBe('function');
      expect(typeof API_ENDPOINTS.AUTH.RESET_PASSWORD).toBe('function');
      expect(typeof API_ENDPOINTS.AUTH.LOGIN).toBe('function');
      expect(typeof API_ENDPOINTS.AUTH.LOGOUT).toBe('function');
    });
  });
});
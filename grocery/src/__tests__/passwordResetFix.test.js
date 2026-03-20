import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../Components/Authantication/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from '../Components/Authantication/ResetPassword/ResetPassword.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { API_ENDPOINTS } from '../utils/urlUtils';

// Mock the API endpoints to avoid actual network calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Password Reset Fix - URL Construction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'If that account exists, you will receive an email shortly.',
        emailJobId: 'job_123456'
      })
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('URL Construction', () => {
    it('should generate correct password reset request URL without double slashes', () => {
      const expectedUrl = API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET();
      
      // Verify the URL is properly constructed
      expect(expectedUrl).toBe('http://localhost:5000/api/auth/request-password-reset');
      expect(expectedUrl).not.toContain('//why');
      expect(expectedUrl).not.toContain('//api');
      expect(expectedUrl).not.toContain('///');
    });

    it('should generate correct password reset URL without double slashes', () => {
      const expectedUrl = API_ENDPOINTS.AUTH.RESET_PASSWORD();
      
      // Verify the URL is properly constructed
      expect(expectedUrl).toBe('http://localhost:5000/api/auth/reset-password');
      expect(expectedUrl).not.toContain('//why');
      expect(expectedUrl).not.toContain('//api');
      expect(expectedUrl).not.toContain('///');
    });

    it('should use correct URL in API calls', async () => {
      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if that account exists/i)).toBeInTheDocument();
      });

      // Verify the fetch was called with the correct URL
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:5000/api/auth/request-password-reset'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );

      // Verify no double slashes in the URL
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).not.toContain('///');
      expect(calledUrl).not.toContain('//why');
    });
  });

  describe('Component Integration', () => {
    it('should render ForgotPassword component without errors', () => {
      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Forgot Password')).toBeInTheDocument();
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should render ResetPassword component without errors', () => {
      render(
        <MemoryRouter initialEntries={['/reset?uid=user123&token=token123']}>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to send password reset email'
        })
      });

      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to request password reset/i)).toBeInTheDocument();
      });
    });
  });
});
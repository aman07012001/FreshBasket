import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../Components/Authantication/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from '../../Components/Authantication/ResetPassword/ResetPassword.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';

const API_BASE_URL = 'http://localhost:5000';

const TestWrapper = ({ children, initialRoute = '/forgot-password' }) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Password Reset Flow Integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('ForgotPassword Component', () => {
    it('successfully requests password reset and stores email job ID', async () => {
      const mockEmailJobId = 'job_123456';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'If that account exists, you will receive an email shortly.',
          emailJobId: mockEmailJobId
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if that account exists/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/request-password-reset`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );

      expect(sessionStorage.getItem('passwordResetJobId')).toBe(mockEmailJobId);
    });

    it('handles password reset request errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to send password reset email'
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to request password reset/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('ResetPassword Component', () => {
    it('successfully resets password with valid token and uid', async () => {
      const mockUid = 'user_123';
      const mockToken = 'valid_token_123';
      const newPassword = 'NewPassword1';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password has been reset. You can now log in with your new password.'
        }),
      });

      render(
        <TestWrapper initialRoute={`/reset?uid=${mockUid}&token=${mockToken}`}>
          <ResetPassword />
        </TestWrapper>
      );

      // Check that the component shows the reset form
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: newPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: newPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password has been reset/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/reset-password`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
          body: JSON.stringify({ 
            uid: mockUid, 
            token: mockToken, 
            password: newPassword 
          }),
        })
      );
    });

    it('shows error for invalid or missing reset link parameters', () => {
      render(
        <TestWrapper initialRoute="/reset">
          <ResetPassword />
        </TestWrapper>
      );

      expect(screen.getByText(/invalid or missing password reset link/i)).toBeInTheDocument();
    });

    it('validates password confirmation matching', async () => {
      const mockUid = 'user_123';
      const mockToken = 'valid_token_123';

      render(
        <TestWrapper initialRoute={`/reset?uid=${mockUid}&token=${mockToken}`}>
          <ResetPassword />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'Password1' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Different1' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('handles password reset errors gracefully', async () => {
      const mockUid = 'user_123';
      const mockToken = 'invalid_token_123';
      const newPassword = 'Password1';

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid or expired token'
        }),
      });

      render(
        <TestWrapper initialRoute={`/reset?uid=${mockUid}&token=${mockToken}`}>
          <ResetPassword />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: newPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: newPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to reset password/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('End-to-End Password Reset Flow', () => {
    it('completes full password reset flow from request to completion', async () => {
      const testEmail = 'user@example.com';
      const mockUid = 'user_123';
      const mockToken = 'reset_token_123';
      const newPassword = 'NewPassword1';

      // Mock the request password reset response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'If that account exists, you will receive an email shortly.',
          emailJobId: 'job_123'
        }),
      });

      // Mock the reset password response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Password has been reset. You can now log in with your new password.'
        }),
      });

      const { rerender } = render(
        <TestWrapper initialRoute="/forgot-password">
          <ForgotPassword />
        </TestWrapper>
      );

      // Step 1: Request password reset
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: testEmail } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if that account exists/i)).toBeInTheDocument();
      });

      // Step 2: Navigate to reset page (simulating clicking the email link)
      rerender(
        <TestWrapper initialRoute={`/reset?uid=${mockUid}&token=${mockToken}`}>
          <ResetPassword />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/reset password/i)).toBeInTheDocument();
      });

      // Step 3: Complete password reset
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const resetButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: newPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: newPassword } });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText(/password has been reset/i)).toBeInTheDocument();
      });

      // Verify both API calls were made
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `${API_BASE_URL}/api/auth/request-password-reset`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: testEmail }),
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        `${API_BASE_URL}/api/auth/reset-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            uid: mockUid, 
            token: mockToken, 
            password: newPassword 
          }),
        })
      );
    });
  });
});
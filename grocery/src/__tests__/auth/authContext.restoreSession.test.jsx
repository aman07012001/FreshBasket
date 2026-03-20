import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const API_BASE_URL = 'http://localhost:5000';

function setup(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

const TestRestoreSessionConsumer = () => {
  const { user, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
    </div>
  );
};

describe('AuthContext restoreSession', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it('successfully restores session when /api/auth/me returns a user and uses credentials: include', async () => {
    const mockUser = {
      id: '1',
      name: 'Restore User',
      email: 'restore@example.com',
      role: 'user',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    setup(<TestRestoreSessionConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/me`,
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    expect(screen.getByTestId('user-email').textContent).toBe('restore@example.com');
    expect(localStorage.getItem('authUser')).toEqual(JSON.stringify(mockUser));
  });

  it('clears session when /api/auth/me returns 401 and still uses credentials: include', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    setup(<TestRestoreSessionConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/me`,
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(localStorage.getItem('authUser')).toBeNull();
  });

  it('handles network errors from /api/auth/me, clears session, and does not crash', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    setup(<TestRestoreSessionConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/api/auth/me`);
    expect(options).toEqual(
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(localStorage.getItem('authUser')).toBeNull();
  });
});

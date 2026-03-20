import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const API_BASE_URL = 'http://localhost:5000';

function setup(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

const TestLogoutConsumer = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      logout();
    }
  }, [user, logout]);

  return <div data-testid="user-email">{user?.email || 'no-user'}</div>;
};

describe('AuthContext logout', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
  });

  it('calls POST /api/auth/logout with credentials: include and clears user/sessionStorage after a restored session', async () => {
    const mockUser = {
      id: '1',
      name: 'Logout User',
      email: 'logout@example.com',
      role: 'user',
    };

    // First call: /api/auth/me for restoreSession
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    // Second call: /api/auth/logout
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    setup(<TestLogoutConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    });

    // Expect two calls: one for /me, one for /logout
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const [meUrl, meOptions] = global.fetch.mock.calls[0];
    expect(meUrl).toBe(`${API_BASE_URL}/api/auth/me`);
    expect(meOptions).toEqual(
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    const [logoutUrl, logoutOptions] = global.fetch.mock.calls[1];
    expect(logoutUrl).toBe(`${API_BASE_URL}/api/auth/logout`);
    expect(logoutOptions).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    expect(sessionStorage.getItem('authUser')).toBeNull();
  });

  it('does not throw and still clears session when logout responds with 500', async () => {
    const mockUser = {
      id: '2',
      name: 'Logout Error User',
      email: 'logout-error@example.com',
      role: 'user',
    };

    // /api/auth/me
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    // /api/auth/logout returns 500 but AuthContext ignores response body
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    setup(<TestLogoutConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);

    const [logoutUrl, logoutOptions] = global.fetch.mock.calls[1];
    expect(logoutUrl).toBe(`${API_BASE_URL}/api/auth/logout`);
    expect(logoutOptions).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    expect(sessionStorage.getItem('authUser')).toBeNull();
  });
});

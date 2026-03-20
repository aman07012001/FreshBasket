import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const API_BASE_URL = 'http://localhost:5000';

function setup(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

const TestRevokedSessionThenLogin = () => {
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      login({ email: 'revoked@example.com', password: 'Password1' });
    }
  }, [loading, user, login]);

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
    </div>
  );
};


describe('AuthContext revoked / expired session then login', () => {
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

  it('treats 401 from /api/auth/me as revoked session, clears user, then allows fresh login with credentials: include', async () => {
    const mockUser = {
      id: '1',
      name: 'Revoked Then Login',
      email: 'revoked@example.com',
      role: 'user',
    };

    // First call: /api/auth/me returns 401 (revoked/expired session)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    // Second call: /api/auth/login succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    setup(<TestRevokedSessionThenLogin />);

    // Wait for login to complete and user to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
      expect(screen.getByTestId('user-email').textContent).toBe('revoked@example.com');
    });

    // Expect two calls: /me then /login
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const [meUrl, meOptions] = global.fetch.mock.calls[0];
    expect(meUrl).toBe(`${API_BASE_URL}/api/auth/me`);
    expect(meOptions).toEqual(
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    const [loginUrl, loginOptions] = global.fetch.mock.calls[1];
    expect(loginUrl).toBe(`${API_BASE_URL}/api/auth/login`);
    expect(loginOptions).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    const body = JSON.parse(loginOptions.body);
    expect(body.email).toBe('revoked@example.com');
    expect(body.password).toBe('Password1');

    expect(sessionStorage.getItem('authUser')).toEqual(JSON.stringify(mockUser));
  });
});

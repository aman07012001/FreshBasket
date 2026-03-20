import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const API_BASE_URL = 'http://localhost:5000';

const TestLoginCaller = () => {
  const { login } = useAuth();

  useEffect(() => {
    login({ email: 'test@example.com', password: 'Password1' });
  }, [login]);

  return null;
};

describe('AuthContext login', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn((url, options = {}) => {
      if (typeof url === 'string' && url.startsWith(`${API_BASE_URL}/api/auth/login`)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
          }),
        });
      }

      // /api/auth/me during restoreSession
      if (typeof url === 'string' && url.startsWith(`${API_BASE_URL}/api/auth/me`)) {
        return Promise.resolve({ ok: false, json: async () => ({}) });
      }

      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
  });

  it('calls backend login endpoint with correct payload and includes credentials', async () => {
    render(
      <AuthProvider>
        <TestLoginCaller />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const loginCall = global.fetch.mock.calls.find(([url]) =>
      typeof url === 'string' && url.startsWith(`${API_BASE_URL}/api/auth/login`),
    );

    expect(loginCall).toBeTruthy();
    const [, options] = loginCall;
    const body = JSON.parse(options.body);
    expect(body.email).toBe('test@example.com');
    expect(body.password).toBe('Password1');
    expect(options.credentials).toBe('include');
  });
});

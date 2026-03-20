import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProtectedRoute from '../../Components/ProtectedRoute/ProtectedRoute.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';

const API_BASE_URL = 'http://localhost:5000';

function setup(initialPath = '/protected') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}


describe('ProtectedRoute with expired / revoked session (401 from /api/auth/me)', () => {
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

  it('redirects to /login when /api/auth/me returns 401 and ensures credentials: include', async () => {
    // /api/auth/me returns 401 (expired or revoked session)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    setup('/protected');

    // Wait for redirect to take effect
    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [meUrl, meOptions] = global.fetch.mock.calls[0];
    expect(meUrl).toBe(`${API_BASE_URL}/api/auth/me`);
    expect(meOptions).toEqual(
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });
});

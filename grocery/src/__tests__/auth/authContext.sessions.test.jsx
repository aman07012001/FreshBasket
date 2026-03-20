import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const API_BASE_URL = 'http://localhost:5000';

function setup(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

let lastSessionsResult;
let lastRevokeResult;

const TestFetchSessions = () => {
  const { fetchSessions } = useAuth();

  useEffect(() => {
    (async () => {
      lastSessionsResult = await fetchSessions();
    })();
  }, [fetchSessions]);

  return null;
};

const TestRevokeSession = ({ sessionId }) => {
  const { revokeSession } = useAuth();

  useEffect(() => {
    (async () => {
      lastRevokeResult = await revokeSession(sessionId);
    })();
  }, [revokeSession, sessionId]);

  return null;
};

describe('AuthContext sessions helpers', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    global.fetch = vi.fn();
    lastSessionsResult = undefined;
    lastRevokeResult = undefined;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
  });

  it('fetchSessions calls GET /api/auth/sessions with credentials: include and returns session list', async () => {
    const mockSessions = [
      { id: 's1', ip: '127.0.0.1', userAgent: 'Chrome' },
      { id: 's2', ip: '10.0.0.1', userAgent: 'Firefox' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessions: mockSessions }),
    });

    setup(<TestFetchSessions />);

    await waitFor(() => {
      expect(lastSessionsResult).toBeDefined();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/sessions`,
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    expect(lastSessionsResult).toEqual({ success: true, sessions: mockSessions });
  });

  it('revokeSession calls POST /api/auth/sessions/:id/revoke with credentials: include', async () => {
    const sessionId = 'revokable-session-id';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Session revoked.' }),
    });

    setup(<TestRevokeSession sessionId={sessionId} />);

    await waitFor(() => {
      expect(lastRevokeResult).toBeDefined();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/sessions/${sessionId}/revoke`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    expect(lastRevokeResult).toEqual({ success: true, message: 'Session revoked.' });
  });
});

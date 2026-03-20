import React, { createContext, useCallback, useEffect, useState } from 'react';
import { tokenStorage, jwtUtils, authApi } from '../utils/auth';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../utils/urlUtils';
import { config } from '../config';

console.log('🔐 AuthContext imports loaded:', {
  tokenStorage: typeof tokenStorage,
  jwtUtils: typeof jwtUtils,
  authApi: typeof authApi,
  api: typeof api,
  apiMethods: api ? Object.keys(api) : 'undefined'
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const saveSession = useCallback((newUser) => {
    console.log('🔐 saveSession called with:', {
      newUser: newUser ? { ...newUser, passwordHash: '***' } : null,
      hasLocalStorage: typeof localStorage !== 'undefined'
    });

    setUser(newUser);
    tokenStorage.setUser(newUser);

    console.log('🔐 Session saved, current localStorage:', {
      user: tokenStorage.getUser() ? { ...tokenStorage.getUser(), passwordHash: '***' } : null,
      tokens: tokenStorage.getTokens()
    });
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    tokenStorage.clearAll();
  }, []);

  const login = useCallback(
      async ({ email, password }) => {
        setLoading(true);
        setError('');

        try {

          const result = await api.requestWithRetry(API_ENDPOINTS.AUTH.LOGIN(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          }, 0); 

        const res = {
          ok: !result.error,
          status: result.status || (result.error ? 500 : 200),
          json: async () => result,
          headers: new Headers(result.headers || {})
        };

        console.log('🔐 Login response status:', res.status);
        console.log('🔐 Login response ok:', res.ok);
        console.log('🔐 Login response headers:', Object.fromEntries(res.headers.entries()));

        const data = result; 
        console.log('🔐 Login response data:', data);

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Login failed');
        }

        if (!data || !data.user) {
          throw new Error('Invalid response from server.');
        }

        console.log('🔐 Login successful, saving session:', {
          user: data.user,
          hasTokens: !!tokenStorage.getTokens(),
          tokens: tokenStorage.getTokens()
        });

        saveSession(data.user);
        return { success: true };
      } catch (err) {

        console.error('Login error:', err);
        const message = err.message || 'Login failed';
        setError(message);
        clearSession();
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [clearSession, saveSession],
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.REGISTER(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Registration failed');
        }

        if (!data || !data.user) {
          throw new Error('Invalid response from server.');
        }

        saveSession(data.user);
        return { success: true };
      } catch (err) {

        console.error('Register error:', err);
        const message = err.message || 'Registration failed';
        setError(message);
        clearSession();
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [clearSession, saveSession],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT(), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {

    } finally {
      clearSession();
    }
  }, [clearSession]);

  const requestPasswordReset = useCallback(
    async ({ email }) => {
      try {
        setError('');
        const res = await fetch(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Failed to request password reset');
        }

        return {
          success: true,
          message: data.message || 'If that account exists, you will receive an email shortly.',
          emailJobId: data.emailJobId
        };
      } catch (err) {

        console.error('requestPasswordReset error:', err);
        const message = err.message || 'Failed to request password reset';
        setError(message);
        return { success: false, message };
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async ({ uid, token, password }) => {
      try {
        setError('');
        const res = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ uid, token, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Failed to reset password');
        }

        return { success: true, message: data.message || 'Password has been reset.' };
      } catch (err) {

        console.error('resetPassword error:', err);
        const message = err.message || 'Failed to reset password';
        setError(message);
        return { success: false, message };
      }
    },
    [],
  );

  const sendVerifyEmail = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(API_ENDPOINTS.AUTH.SEND_VERIFY_EMAIL(), {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to send verification email');
      }

      return {
        success: true,
        message: data.message || 'Verification email sent.',
        emailJobId: data.emailJobId
      };
    } catch (err) {

      console.error('sendVerifyEmail error:', err);
      const message = err.message || 'Failed to send verification email';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await authApi.get(API_ENDPOINTS.AUTH.SESSIONS());

      return { success: true, sessions: data.sessions || [] };
    } catch (err) {

      console.error('fetchSessions error:', err);
      const message = err.message || 'Failed to load sessions';
      return { success: false, sessions: [], message };
    }
  }, []);

  const revokeSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      return { success: false, message: 'Missing session id' };
    }

    try {
      const data = await authApi.post(API_ENDPOINTS.AUTH.REVOKE_SESSION(sessionId));

      return { success: true, message: data.message || 'Session revoked.' };
    } catch (err) {

      console.error('revokeSession error:', err);
      const message = err.message || 'Failed to revoke session';
      return { success: false, message };
    }
  }, []);

  const revokeAllOtherSessions = useCallback(async () => {
    try {
      const sessions = await fetchSessions();
      if (!sessions.success) {
        return { success: false, message: 'Failed to fetch sessions' };
      }

      const currentRefreshToken = tokenStorage.getTokens()?.refreshToken;
      const otherSessions = sessions.sessions.filter(s => s.id !== currentRefreshToken);

      const revokePromises = otherSessions.map(session => 
        revokeSession(session.id)
      );

      const results = await Promise.allSettled(revokePromises);
      const failed = results.filter(r => r.status === 'rejected' || 
        (r.status === 'fulfilled' && !r.value.success)).length;

      if (failed > 0) {
        return { 
          success: false, 
          message: `Failed to revoke ${failed} sessions` 
        };
      }

      return { 
        success: true, 
        message: `Successfully revoked ${otherSessions.length} sessions` 
      };
    } catch (err) {
      console.error('revokeAllOtherSessions error:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to revoke other sessions' 
      };
    }
  }, [fetchSessions, revokeSession]);

  const checkSessionLimits = useCallback(async () => {
    try {
      const sessions = await fetchSessions();
      if (!sessions.success) {
        return { success: false, sessions: [] };
      }

      const activeSessions = sessions.sessions.filter(s => !s.revoked);
      const maxSessions = 5; 

      return {
        success: true,
        activeCount: activeSessions.length,
        limit: maxSessions,
        isOverLimit: activeSessions.length >= maxSessions,
        sessions: activeSessions
      };
    } catch (err) {
      console.error('checkSessionLimits error:', err);
      return { 
        success: false, 
        activeCount: 0, 
        limit: 5,
        isOverLimit: false,
        sessions: []
      };
    }
  }, [fetchSessions]);

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const restoreUrl = API_ENDPOINTS.AUTH.ME();
      console.log('🔐 Restore session attempt to:', restoreUrl);
      console.log('🔐 API_BASE_URL:', config.API_BASE_URL);
      console.log('🔐 Network status:', navigator.onLine ? 'Online' : 'Offline');
      console.log('🔐 Restore session - checking cookies...');

      const cookies = document.cookie;
      console.log('🔐 Current cookies:', cookies);

      const tokens = tokenStorage.getTokens();
      const accessToken = tokens?.accessToken;

      const headers = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔐 Using access token for session restore');
      } else {
        console.log('🔐 No access token found, relying on cookies');
      }

      console.log('🔐 Making session restore request with:', {
        url: restoreUrl,
        method: 'GET',
        credentials: 'include',
        headers: headers,
        accessToken: accessToken ? 'PRESENT' : 'MISSING',
        cookies: document.cookie
      });

      const result = await api.requestWithRetry(API_ENDPOINTS.AUTH.ME(), {
        method: 'GET',
        credentials: 'include',
        headers: headers,
      }, 1); 

      const res = {
        ok: !result.error,
        status: result.status || (result.error ? 500 : 200),
        json: async () => result,
        headers: new Headers(result.headers || {})
      };

      console.log('🔐 Restore session response status:', res.status);
      console.log('🔐 Restore session response ok:', res.ok);
      console.log('🔐 Restore session response headers:', Object.fromEntries(res.headers.entries()));

      if (res.ok) {
        const data = result; 
        console.log('🔐 Restore session successful data:', data);
        if (data && data.user) {
          saveSession(data.user);
          return { success: true };
        }
      } else {

        const errorData = result;
        console.warn('Session restore failed:', errorData.error || res.statusText);
        console.warn('Session restore error details:', errorData);
      }

      clearSession();
      return { success: false };
    } catch (err) {

      console.error('Restore session error:', err);
      clearSession();
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [clearSession, saveSession]);

  useEffect(() => {
    let isRestoring = false;
    let restoreAttempts = 0;
    let restoreTimer = null;
    let lastRestoreAttempt = 0;

    const attemptRestoreSession = async () => {
      if (isRestoring) return;

      const now = Date.now();
      const timeSinceLastAttempt = now - lastRestoreAttempt;
      if (timeSinceLastAttempt < 5000 && restoreAttempts > 0) {
        const waitTime = 5000 - timeSinceLastAttempt;
        console.log(`🔐 Waiting ${waitTime}ms before next restore attempt`);
        restoreTimer = setTimeout(attemptRestoreSession, waitTime);
        return;
      }

      lastRestoreAttempt = now;
      isRestoring = true;

      try {
        const result = await restoreSession();

        if (!result.success) {
          restoreAttempts++;

          const backoffTime = Math.min(5000 * Math.pow(2, Math.min(restoreAttempts - 1, 3)), 60000);
          console.log(`🔐 Session restore failed, retrying in ${backoffTime}ms (attempt ${restoreAttempts})`);

          restoreTimer = setTimeout(attemptRestoreSession, backoffTime);
        } else {
          restoreAttempts = 0; 
          console.log('🔐 Session restore successful, stopping retry loop');
        }
      } catch (error) {
        console.error('🔐 Session restore error:', error);
        restoreAttempts++;
        const backoffTime = Math.min(5000 * Math.pow(2, Math.min(restoreAttempts - 1, 3)), 60000);
        restoreTimer = setTimeout(attemptRestoreSession, backoffTime);
      } finally {
        isRestoring = false;
      }
    };

    restoreTimer = setTimeout(attemptRestoreSession, 1000);

    return () => {
      if (restoreTimer) {
        clearTimeout(restoreTimer);
      }
    };
  }, [restoreSession]); 

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    sendVerifyEmail,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    checkSessionLimits,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

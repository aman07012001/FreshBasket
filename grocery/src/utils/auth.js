

import { buildApiUrl } from './urlUtils';

const TOKEN_STORAGE_KEY = 'authTokens';
const USER_STORAGE_KEY = 'authUser';

export const tokenStorage = {

  setTokens(accessToken, refreshToken) {
    try {
      const tokens = { accessToken, refreshToken, timestamp: Date.now() };
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      return true;
    } catch (error) {
      console.error('Failed to store tokens:', error);
      return false;
    }
  },

  getTokens() {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return null;

      const tokens = JSON.parse(stored);

      const age = Date.now() - (tokens.timestamp || 0);
      const maxAge = 30 * 24 * 60 * 60 * 1000; 

      if (age > maxAge) {
        this.clearTokens();
        return null;
      }

      return tokens;
    } catch (error) {
      console.error('Failed to parse stored tokens:', error);
      this.clearTokens();
      return null;
    }
  },

  clearTokens() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      return false;
    }
  },

  setUser(user) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log('🔐 Stored user data in localStorage:', {
        user: user ? { ...user, passwordHash: '***' } : null,
        key: USER_STORAGE_KEY
      });
      return true;
    } catch (error) {
      console.error('Failed to store user data:', error);
      return false;
    }
  },

  getUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  },

  clearAll() {
    this.clearTokens();
    this.clearUser();
  }
};

export const jwtUtils = {

  decodeToken(token) {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },

  isTokenExpired(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  },

  getTokenExpiration(token) {
    const payload = this.decodeToken(token);
    return payload?.exp ? new Date(payload.exp * 1000) : null;
  },

  isTokenExpiringSoon(token, thresholdMinutes = 5) {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;

    const now = new Date();
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return expiration.getTime() - now.getTime() < thresholdMs;
  }
};

export class TokenRefreshManager {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.refreshPromise = null;
    this.refreshThreshold = 5 * 60 * 1000; 
  }

  async refreshTokens() {
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performRefresh() {
    try {
      const response = await fetch(buildApiUrl('auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.user) {
        tokenStorage.setUser(data.user);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenStorage.clearAll();
      return { success: false, error: error.message };
    }
  }

  async checkAndRefresh(accessToken) {
    if (!accessToken) {
      return { needsRefresh: false, refreshed: false };
    }

    try {

      const isExpired = jwtUtils.isTokenExpired(accessToken);
      const isExpiringSoon = jwtUtils.isTokenExpiringSoon(accessToken);

      if (!isExpired && !isExpiringSoon) {
        return { needsRefresh: false, refreshed: false };
      }

      console.log('Token needs refresh, attempting automatic refresh...');
      const refreshResult = await this.refreshTokens();

      return {
        needsRefresh: true,
        refreshed: refreshResult.success,
        user: refreshResult.user,
        error: refreshResult.error
      };
    } catch (error) {
      console.error('Token refresh check failed:', error);
      return {
        needsRefresh: true,
        refreshed: false,
        error: error.message
      };
    }
  }
}

export class AuthenticatedApiClient {
  constructor(apiBaseUrl = 'http://localhost:5000') {
    this.apiBaseUrl = apiBaseUrl;
    this.refreshManager = new TokenRefreshManager(apiBaseUrl);
  }

  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

    const tokens = tokenStorage.getTokens();
    const accessToken = tokens?.accessToken;

    console.log('🔐 AuthenticatedApiClient request check:', {
      hasTokens: !!tokens,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken ? accessToken.length : 0,
      tokens: tokens ? { ...tokens, accessToken: accessToken ? accessToken.substring(0, 10) + '...' : null } : null,
      url: fullUrl
    });

    const headers = {
      ...(options.headers || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('🔐 Added Authorization header:', `Bearer ${accessToken.substring(0, 10)}...`);
    } else {
      console.log('🔐 No access token found in localStorage, relying on cookies');
    }

    if (accessToken) {
      const refreshCheck = await this.refreshManager.checkAndRefresh(accessToken);

      if (refreshCheck.refreshed && refreshCheck.user) {
        const newTokens = tokenStorage.getTokens();
        if (newTokens?.accessToken) {
          headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        }
      }

      if (refreshCheck.needsRefresh && !refreshCheck.refreshed) {
        tokenStorage.clearAll();
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 

    try {
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        credentials: options.credentials || 'include',
        headers,
      });

      if (response.status === 401) {
        tokenStorage.clearAll();
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {

            try {
              const errorJson = JSON.parse(errorBody);
              errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch {
              errorMessage += `: ${errorBody}`;
            }
          }
        } catch (_) {

        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return data;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('The request timed out. Please try again.');
      }
      console.error('API request failed:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

export const authApi = new AuthenticatedApiClient();

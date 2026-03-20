

import { buildApiUrl } from './urlUtils';

const DEFAULT_TIMEOUT = 15000; 

import { config } from '../config.js';

console.log('🌐 API Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL: config.API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  location: window.location.href
});

export async function apiRequest(url, options = {}, { timeout = DEFAULT_TIMEOUT } = {}) {
  if (!url) {
    return { error: true, message: "Invalid request URL" };
  }

  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

  if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
    return { error: true, message: "You appear to be offline. Please check your internet connection." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  console.log('🌐 API Request timeout configuration:', {
    timeout: timeout,
    url: fullUrl,
    method: options.method || 'GET'
  });

  const headers = {
    ...(options.headers || {}),
  };

    const token = localStorage.getItem('token');
    console.log('🌐 API Request token check:', {
      localStorageToken: token ? 'PRESENT' : 'MISSING',
      tokenLength: token ? token.length : 0,
      currentUrl: window.location.href,
      fullUrl: fullUrl
    });

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🌐 Added Authorization header:', `Bearer ${token.substring(0, 10)}...`);
    }

    if (fullUrl.includes('/request-password-reset')) {
      console.log('🌐 Password Reset Request Details:', {
        url: fullUrl,
        method: options.method || 'GET',
        headers: Object.keys(headers),
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 5) + '...' : 'NONE',
        body: options.body ? 'PRESENT' : 'NONE',
        credentials: options.credentials || 'include'
      });
    }

  if (!('Content-Type' in headers) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  let startTime;

  try {
      console.log('🌐 API Request:', {
        method: options.method || 'GET',
        url: fullUrl,
        headers: Object.keys(headers),
        hasBody: !!options.body,
        timeout: timeout,
        credentials: options.credentials || 'include'
      });

      startTime = Date.now();
      console.log('🌐 Starting fetch request at:', new Date().toISOString());
      console.log('🌐 Fetch request details:', {
        url: fullUrl,
        method: options.method || 'GET',
        credentials: options.credentials || 'include',
        headers: Object.keys(headers),
        hasAuthorization: !!headers['Authorization'],
        hasCookies: !!document.cookie
      });

      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        credentials: options.credentials || 'include',
        headers,
      });

      console.log('🌐 Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      const endTime = Date.now();
      console.log('🌐 Fetch completed at:', new Date().toISOString(), 'Duration:', endTime - startTime, 'ms');

      if ((endTime - startTime) > 5000) {
        console.warn('⚠️  SLOW API REQUEST:', {
          duration: endTime - startTime,
          url: fullUrl,
          method: options.method || 'GET',
          status: response.status
        });
      }

      console.log('🌐 API Response status:', response.status, 'URL:', fullUrl);
      console.log('🌐 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.warn('🌐 API Request failed:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          method: options.method || 'GET'
        });

        const rateLimitHeaders = {
          'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
          'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
          'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
          'retry-after': response.headers.get('retry-after')
        };

        if (Object.values(rateLimitHeaders).some(val => val !== null)) {
          console.warn('🌐 Rate limit headers detected:', rateLimitHeaders);
        }
      }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorCode = null;
      let errorField = null;

      try {
        const errorBody = await response.text();
        if (errorBody) {
          try {
            const errorData = JSON.parse(errorBody);

            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
              errorCode = errorData.error.code;
              errorField = errorData.error.field;
            } else {
              errorMessage = errorBody;
            }
          } catch (parseError) {
            errorMessage = errorBody;
          }
        }
      } catch (_) {

      }

      return {
        error: true,
        message: errorMessage,
        code: errorCode,
        field: errorField,
        status: response.status
      };
    }

    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      return { error: true, message: "Failed to parse server response.", code: "PARSE_ERROR" };
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      console.error('❌ API Request aborted due to timeout:', {
        timeout: timeout,
        url: fullUrl,
        method: options.method || 'GET',
        duration: startTime ? Date.now() - startTime : 'unknown'
      });
      return { error: true, message: "The request timed out. Please try again.", code: "TIMEOUT_ERROR" };
    }

    console.error('❌ API Request failed with error:', {
      error: error.name,
      message: error.message,
      url: fullUrl,
      method: options.method || 'GET',
      duration: startTime ? Date.now() - startTime : 'unknown'
    });

    return { error: true, message: "Network error. Please try again.", code: "NETWORK_ERROR" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: async (url, options = {}) => {
    return apiRequest(url, { method: 'GET', ...options });
  },

  post: async (url, data = null, options = {}) => {
    const opts = {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    };
    return apiRequest(url, opts);
  },

  put: async (url, data = null, options = {}) => {
    const opts = {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    };
    return apiRequest(url, opts);
  },

  delete: async (url, options = {}) => {
    return apiRequest(url, { method: 'DELETE', ...options });
  },

  _requestCache: new Map(),

  requestWithRetry: async function(url, options = {}, maxRetries = 2) {

    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;

    console.log('🔐 requestWithRetry called:', {
      cacheKey,
      cacheSize: api._requestCache.size,
      cacheKeys: Array.from(api._requestCache.keys())
    });

    if (api._requestCache.has(cacheKey)) {
      console.log('🔐 Deduplicating request:', cacheKey);
      return api._requestCache.get(cacheKey);
    }

    const requestPromise = api._performRequestWithRetry(url, options, maxRetries);
    api._requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      console.log('🔐 Request completed successfully:', cacheKey);
      return result;
    } catch (error) {
      console.error('🔐 Request failed:', cacheKey, error);
      throw error;
    } finally {

      api._requestCache.delete(cacheKey);
      console.log('🔐 Cache cleanup completed, size:', api._requestCache.size);
    }
  },

  _performRequestWithRetry: async function(url, options = {}, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiRequest(url, options);

        if (!result.error || result.status !== 429) {
          return result;
        }

        if (result.status === 429) {
          lastError = result;

          const retryAfter = result.headers?.['retry-after'];
          let delay = 1000; 

          if (retryAfter) {
            if (retryAfter < 1000) {
              delay = parseInt(retryAfter) * 1000; 
            } else {
              delay = parseInt(retryAfter); 
            }
          } else if (attempt < maxRetries) {

            const isAuthEndpoint = url.includes('/api/auth/');
            if (isAuthEndpoint) {

              delay = Math.min(2000 * Math.pow(2, attempt), 8000);
            } else {

              delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            }
          }

          console.warn(`🔐 Rate limited on attempt ${attempt + 1}, waiting ${delay}ms before retry`);

          if (attempt === maxRetries) {
            return result; 
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return lastError;
  },

  upload: async (url, formData, onProgress = null, options = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            resolve({ error: false, data: xhr.responseText });
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);

            if (errorData.error && errorData.error.message) {
              reject({
                error: true,
                message: errorData.error.message,
                code: errorData.error.code,
                field: errorData.error.field,
                status: xhr.status
              });
            } else {
              reject({ error: true, message: errorData.message || `Request failed with status ${xhr.status}` });
            }
          } catch (error) {
            reject({ error: true, message: `Request failed with status ${xhr.status}` });
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject({ error: true, message: "Network error during upload.", code: "UPLOAD_NETWORK_ERROR" });
      });

      xhr.addEventListener('timeout', () => {
        reject({ error: true, message: "Upload request timed out.", code: "UPLOAD_TIMEOUT_ERROR" });
      });

      const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
      xhr.open('POST', fullUrl);

      const headers = {
        ...(options.headers || {}),
      };

      Object.entries(headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, value);
        }
      });

      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.timeout = options.timeout || DEFAULT_TIMEOUT;
      xhr.send(formData);
    });
  },
};


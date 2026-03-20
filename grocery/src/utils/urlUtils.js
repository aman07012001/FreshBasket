

import { config } from '../config.js';

const API_BASE_URL = config.API_BASE_URL;

export function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/+$/, '');
}

export function normalizePath(path) {
  if (!path) return '';
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
}

export function buildApiUrl(...pathSegments) {
  const normalizedBase = normalizeBaseUrl(API_BASE_URL);
  const normalizedSegments = pathSegments.map(normalizePath).filter(Boolean);
  const path = normalizedSegments.join('/');

  return `${normalizedBase}/api/${path}`;
}

export function buildApiEndpoint(endpoint) {
  const url = buildApiUrl(endpoint);

  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid API URL constructed:', { url, endpoint, baseUrl: API_BASE_URL });
    throw new Error(`Invalid API endpoint: ${endpoint}`);
  }
}

export const API_ENDPOINTS = {

  AUTH: {
    REGISTER: () => buildApiEndpoint('auth/register'),
    LOGIN: () => buildApiEndpoint('auth/login'),
    LOGOUT: () => buildApiEndpoint('auth/logout'),
    REFRESH: () => buildApiEndpoint('auth/refresh'),
    ME: () => buildApiEndpoint('auth/me'),
    REQUEST_PASSWORD_RESET: () => buildApiEndpoint('auth/request-password-reset'),
    RESET_PASSWORD: () => buildApiEndpoint('auth/reset-password'),
    SEND_VERIFY_EMAIL: () => buildApiEndpoint('auth/send-verify-email'),
    VERIFY_EMAIL: () => buildApiEndpoint('auth/verify-email'),
    SESSIONS: () => buildApiEndpoint('auth/sessions'),
    REVOKE_SESSION: (sessionId) => buildApiEndpoint(`auth/sessions/${sessionId}/revoke`),
  },

  ORDERS: {
    LIST: () => buildApiEndpoint('orders'),
    CREATE: () => buildApiEndpoint('orders'),
    GET: (id) => buildApiEndpoint(`orders/${id}`),
    UPDATE: (id) => buildApiEndpoint(`orders/${id}`),
    CANCEL: (id) => buildApiEndpoint(`orders/${id}/cancel`),
    PAYPAL_CAPTURE: (orderId) => buildApiEndpoint(`orders/${orderId}/capture`),
  },

  INVENTORY: {
    LIST: () => buildApiEndpoint('inventory'),
    CREATE: () => buildApiEndpoint('inventory'),
    UPDATE: (id) => buildApiEndpoint(`inventory/${id}`),
    DELETE: (id) => buildApiEndpoint(`inventory/${id}`),
  },

  REVIEWS: {
    LIST: (productId) => buildApiEndpoint(`reviews/product/${productId}`),
    CREATE: () => buildApiEndpoint('reviews'),
    UPDATE: (id) => buildApiEndpoint(`reviews/${id}`),
    DELETE: (id) => buildApiEndpoint(`reviews/${id}`),
  },

  UPLOAD: {
    IMAGE: () => buildApiEndpoint('upload/image'),
  },

  EMAIL_STATUS: {
    HISTORY: () => buildApiEndpoint('email-status/history'),
    LATEST: () => buildApiEndpoint('email-status/latest'),
  },

  CART: {
    GET: () => buildApiEndpoint('cart'),
    ADD: () => buildApiEndpoint('cart'),
    REMOVE: (productId) => buildApiEndpoint(`cart/${productId}`),
  },

  PRODUCTS: {
    LIST:   (category) => category
      ? buildApiEndpoint(`products?category=${encodeURIComponent(category)}`)
      : buildApiEndpoint('products'),
    CREATE: () => buildApiEndpoint('products'),
    UPDATE: (id) => buildApiEndpoint(`products/${id}`),
    DELETE: (id) => buildApiEndpoint(`products/${id}`),
  },
};
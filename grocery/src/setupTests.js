import '@testing-library/jest-dom/vitest';

const mockStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: vi.fn(() => ({
      toString: vi.fn(() => 'mock-random-token'),
    })),
  },
});

global.fetch = vi.fn();

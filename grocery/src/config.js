

export const config = {
  API_BASE_URL: (() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    try {
      new URL(baseUrl);

      if (baseUrl.endsWith('/api') || baseUrl.endsWith('/api/')) {
        console.warn('⚠️  VITE_API_BASE_URL ends with "/api". This may cause double slashes in API URLs.');
        console.warn('💡 Consider setting VITE_API_BASE_URL to just the base URL (e.g., "http://localhost:5000")');
      }

      console.log('🌐 API Base URL configured:', baseUrl);

      return baseUrl;
    } catch (error) {
      console.error('❌ Invalid VITE_API_BASE_URL:', baseUrl);
      console.error('Error:', error.message);
      console.error('Using fallback:', 'http://localhost:5000');
      return 'http://localhost:5000';
    }
  })(),

  NODE_ENV: import.meta.env.NODE_ENV,
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',

  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000', 10),

  FEATURES: {
    ENABLE_EMAIL_MONITORING: import.meta.env.VITE_ENABLE_EMAIL_MONITORING !== 'false',
    ENABLE_SESSION_MANAGEMENT: import.meta.env.VITE_ENABLE_SESSION_MANAGEMENT !== 'false',
    ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
  }
};

if (typeof window !== 'undefined') {
  console.log('⚙️  Application Configuration:', {
    API_BASE_URL: config.API_BASE_URL,
    NODE_ENV: config.NODE_ENV,
    ENABLE_DEBUG: config.ENABLE_DEBUG,
    API_TIMEOUT: config.API_TIMEOUT,
    FEATURES: config.FEATURES
  });
}
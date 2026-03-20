

const { env } = require('../config');

const required = [
  'MONGO_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'FRONTEND_URL',
];

const missing = required.filter((key) => {
  if (process.env[key]) return false;

  if (Object.prototype.hasOwnProperty.call(env, key) && env[key]) return false;
  return true;
});

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((k) => console.error(`  - ${k}`));
  process.exit(1);
}

console.log('✅ Environment looks OK (basic checks passed).');
process.exit(0);

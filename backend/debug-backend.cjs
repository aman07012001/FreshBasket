require('dotenv').config({ path: './.env' });

console.log('=== Backend Environment Variables Debug ===');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URL:', process.env.MONGO_URL ? 'SET' : 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('====================================');

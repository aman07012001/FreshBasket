require('dotenv').config({ path: './.env' });
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().optional(),

  MONGO_URL: z.string().min(1, 'MONGO_URL is required'),
  REDIS_URL: z.string().optional(),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),
  ACCESS_TOKEN_TTL_MS: z
    .string()
    .default('600000')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'ACCESS_TOKEN_TTL_MS must be a positive number',
    }),
  REFRESH_TOKEN_TTL_DAYS: z
    .string()
    .default('30')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'REFRESH_TOKEN_TTL_DAYS must be a positive number',
    }),

  COOKIE_DOMAIN: z.string().optional(),
  CORS_ORIGIN: z
    .string()
    .min(1, 'CORS_ORIGIN is required (comma-separated origins, e.g. http://localhost:5173)'),
  FRONTEND_URL: z
    .string()
    .min(1, 'FRONTEND_URL is required')
    .url('FRONTEND_URL must be a valid URL'),

  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z
    .string()
    .default('587')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'SMTP_PORT must be a positive number',
    }),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
  EMAIL_ON_ORDER: z.string().default('false'),
  ADMIN_EMAILS: z.string().optional(),

  EMAIL_MAX_RETRIES: z
    .string()
    .default('3')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_MAX_RETRIES must be a positive number',
    }),
  EMAIL_BACKOFF_MULTIPLIER: z
    .string()
    .default('1500')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_BACKOFF_MULTIPLIER must be a positive number',
    }),
  EMAIL_BACKOFF_MAX: z
    .string()
    .default('5000')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_BACKOFF_MAX must be a positive number',
    }),
  EMAIL_JITTER_MAX: z
    .string()
    .default('300')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v >= 0, {
      message: 'EMAIL_JITTER_MAX must be a non-negative number',
    }),
  EMAIL_ENABLE_LOGGING: z.string().default('true'),

  EMAIL_QUEUE_ENABLED: z.string().default('true'),
  EMAIL_QUEUE_ATTEMPTS: z
    .string()
    .default('5')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_QUEUE_ATTEMPTS must be a positive number',
    }),
  EMAIL_QUEUE_BACKOFF_MS: z
    .string()
    .default('2000')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_QUEUE_BACKOFF_MS must be a positive number',
    }),
  EMAIL_QUEUE_CONCURRENCY: z
    .string()
    .default('5')
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v > 0, {
      message: 'EMAIL_QUEUE_CONCURRENCY must be a positive number',
    }),
  EMAIL_QUEUE_PRIORITY_ENABLED: z.string().default('true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. Please check your .env file.');
}

const env = parsed.data;

module.exports = {
  env,
  JWT_SECRET: env.JWT_SECRET,
  ACCESS_TOKEN_TTL_MS: env.ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_DAYS: env.REFRESH_TOKEN_TTL_DAYS,
};

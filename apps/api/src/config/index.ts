import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or apps/api
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/the_visa_gate?schema=public',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'the-visa-gate-dev-secret-super-safe-key-32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'the-visa-gate-dev-refresh-secret-32chars',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || 'the-visa-gate-cookie-secret',
    secure: process.env.NODE_ENV === 'production',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // 32 bytes hex
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: process.env.VERCEL
      ? '/tmp/storage/documents'
      : path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR || './storage/documents'),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'thevisagate/documents',
  },

  // Outbound email for one-time verification codes and password reset tokens.
  // When SMTP_HOST is empty the codes fall back to the in-app notification inbox.
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'The Visa Gate <no-reply@thevisagate.com>',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '100', 10),
  },

  bootstrap: {
    adminEmail: process.env.INITIAL_ADMIN_EMAIL || 'mehedihasan110577@gmail.com',
    adminPassword: process.env.INITIAL_ADMIN_PASSWORD || 'Mehedi@TVG',
    adminName: process.env.INITIAL_ADMIN_NAME || 'Mehedi Hasan',
  }
};

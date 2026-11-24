import dotenv from 'dotenv';
import path from 'path';

// Secrets must come from the environment. There are no built-in fallback
// values: this repository is public, and any default shipped in source would
// be the production secret for every deployment that forgot to set one.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[config] Missing required environment variable ${name}. Copy .env.example to .env and set a strong random value. The server will not start with a built-in default secret.`
    );
  }
  return value;
}

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
    secret: requiredEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: requiredEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cookie: {
    secret: requiredEnv('COOKIE_SECRET'),
    secure: process.env.NODE_ENV === 'production',
  },

  encryption: {
    key: requiredEnv('ENCRYPTION_KEY'), // 32 bytes hex (64 hex chars) for AES-256-GCM
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR || './storage/documents'),
  },

  // Outbound email for one-time verification codes and password reset tokens.
  // SMTP is REQUIRED: staff MFA codes and password-reset tokens are delivered
  // by email only. There is no in-app or retrievable-code fallback (see
  // verification-delivery.service.ts and SECURITY_REVIEW.md).
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
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },

  bootstrap: {
    adminEmail: requiredEnv('INITIAL_ADMIN_EMAIL'),
    adminPassword: requiredEnv('INITIAL_ADMIN_PASSWORD'),
    adminName: process.env.INITIAL_ADMIN_NAME || 'Mehedi Hasan',
  }
};

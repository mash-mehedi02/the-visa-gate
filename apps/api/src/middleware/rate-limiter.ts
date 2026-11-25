import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { sendError } from '../utils/response';

// In development, use very permissive limits to avoid blocking during active development
const isDev = config.env === 'development';

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isDev ? 10000 : config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip rate limiting entirely in development
  handler: (req, res) => {
    sendError(res, 'Too many requests from this IP, please try again later.', 429, null, 'RATE_LIMIT_EXCEEDED');
  },
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isDev ? 1000 : config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip rate limiting entirely in development
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED' },
  },
});

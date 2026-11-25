import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { globalLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';

// Module Routes
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/client.routes';
import staffRoutes from './modules/staff/staff.routes';
import countryRoutes from './modules/countries/country.routes';
import applicationRoutes from './modules/applications/application.routes';
import workflowRoutes from './modules/workflows/workflow.routes';
import documentRoutes from './modules/documents/document.routes';
import paymentRoutes from './modules/payments/payment.routes';
import clientPortalRoutes from './modules/client-portal/client-portal.routes';
import reportRoutes from './modules/reports/report.routes';
import auditRoutes from './modules/audit-logs/audit.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import inquiryRoutes from './modules/inquiries/inquiry.routes';
import bookingRoutes from './modules/bookings/booking.routes';

const app = express();

// Trust reverse proxy headers (Nginx, Cloudflare, Render, Railway)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS (supports comma-separated CLIENT_ORIGIN in production)
const allowedOrigins = config.clientOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Global Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser(config.cookie.secret));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Global Rate Limiter
app.use(globalLimiter);

// Serve public uploads (e.g. avatars)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'The Visa Gate API Gateway',
    version: '1.0.0',
  });
});

// Versioned API Routes (/api/v1)
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/countries', countryRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/workflows', workflowRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/client', clientPortalRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/inquiries', inquiryRoutes);
apiRouter.use('/bookings', bookingRoutes);

app.use(config.apiPrefix, apiRouter);

// Serve built frontend in production (single-server deployment)
const webDistDir = path.resolve(__dirname, '../../../apps/web/dist');
if (config.env === 'production' && fs.existsSync(webDistDir)) {
  app.use(express.static(webDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith(config.apiPrefix) || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webDistDir, 'index.html'));
  });
}

// Central Error Handler
app.use(errorHandler);

export default app;

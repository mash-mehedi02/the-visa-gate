import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[API Error]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 422, formattedErrors, 'VALIDATION_ERROR');
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Invalid or expired token', 401, null, 'UNAUTHORIZED');
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size exceeds maximum allowed limit (15MB)', 400, null, 'FILE_TOO_LARGE');
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message || 'Internal Server Error');

  return sendError(res, message, statusCode, err.details || null);
}

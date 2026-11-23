import { Response } from 'express';
import { ApiResponse } from '@thevisagate/shared';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200, meta?: any): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode: number = 400, details?: any, code?: string): Response {
  const body: ApiResponse = {
    success: false,
    message,
    error: {
      code: code || `ERR_${statusCode}`,
      ...(details && { details })
    }
  };
  return res.status(statusCode).json(body);
}

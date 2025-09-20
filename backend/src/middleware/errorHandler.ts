import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  status?: number;
  details?: any;
}

// Central error handler
export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status && err.status >= 400 ? err.status : 500;
  const payload = {
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {})
  };
  res.status(status).json(payload);
}

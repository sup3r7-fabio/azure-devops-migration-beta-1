// Placeholder rate limiting middleware (swap with express-rate-limit or Redis-based impl later)
import { Request, Response, NextFunction } from 'express';

export function rateLimitPlaceholder(_req: Request, _res: Response, next: NextFunction): void {
  // No real limiting implemented yet
  next();
}

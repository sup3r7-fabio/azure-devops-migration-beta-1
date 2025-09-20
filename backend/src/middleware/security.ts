import helmet from 'helmet';
import { RequestHandler } from 'express';

// Basic security headers via helmet plus custom adjustments if needed
export const securityHeaders: RequestHandler[] = [
  helmet({
    contentSecurityPolicy: false // can customize later if serving static assets
  })
];

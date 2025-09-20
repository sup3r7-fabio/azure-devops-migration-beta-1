import express, { Request, Response } from 'express';
import config from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders } from './middleware/security';
import { rateLimitPlaceholder } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import workItemsRoute from './routes/workItems';
import { jwtValidator } from './middleware/auth/jwtValidator';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(corsMiddleware);
securityHeaders.forEach(h => app.use(h));
app.use(rateLimitPlaceholder);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authenticated API routes
app.use('/api', jwtValidator); // protect everything under /api
app.use('/api/workitems', workItemsRoute);

app.use(errorHandler);

app.listen(config.server.port, () => {
  console.log(`Backend proxy listening on port ${config.server.port}`);
});

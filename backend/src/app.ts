import path from 'node:path';

import cors from 'cors';
import express, { type Express } from 'express';

import { env } from './config/env';
import { adminRouter } from './modules/admin/admin.router';
import { catalogRouter } from './modules/catalog/catalog.router';
import { ideasRouter } from './modules/ideas/ideas.router';
import { scansRouter } from './modules/scans/scans.router';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.use('/static', express.static(path.resolve(process.cwd(), 'public')));
  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'waste2worth-backend' });
  });

  app.use('/api', catalogRouter);
  app.use('/api/scans', scansRouter);
  app.use('/api/ideas', ideasRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

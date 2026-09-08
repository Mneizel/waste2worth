import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { UnauthorizedError } from '../lib/errors';

/** Guards `/api/admin/*`. Requires a matching `x-admin-key` request header. */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const provided = req.header('x-admin-key');
  if (!provided || provided !== env.ADMIN_API_KEY) {
    throw new UnauthorizedError('A valid x-admin-key header is required');
  }
  next();
}

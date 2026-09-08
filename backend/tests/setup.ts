import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { disconnectPrisma } from '../src/db/prisma';
import { resetDb } from './helpers/db';

// Keep expected error-path logs out of the test output.
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await disconnectPrisma();
  rmSync(resolve(__dirname, '.tmp'), { recursive: true, force: true });
});

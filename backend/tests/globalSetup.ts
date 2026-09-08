import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from 'dotenv';

/** Build a fresh SQLite schema for the test run. */
export default async function globalSetup(): Promise<void> {
  const backendDir = resolve(__dirname, '..');
  config({ path: resolve(backendDir, '.env.test') });

  const dbFile = resolve(backendDir, 'prisma', 'test.db');
  rmSync(dbFile, { force: true });
  rmSync(`${dbFile}-journal`, { force: true });

  execSync('npx prisma migrate deploy', {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}

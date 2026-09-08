import { resolve } from 'node:path';

import { config } from 'dotenv';

// Runs before any application module is imported (jest `setupFiles`).
config({ path: resolve(__dirname, '..', '.env.test') });

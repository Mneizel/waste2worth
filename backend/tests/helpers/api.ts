import supertest from 'supertest';

import { createApp } from '../../src/app';

export const app = createApp();
export const api = supertest(app);

export const ADMIN_HEADERS = { 'x-admin-key': 'test-admin-key' };

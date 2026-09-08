import { api } from '../helpers/api';

describe('health & routing', () => {
  it('GET /health returns ok', async () => {
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'waste2worth-backend' });
  });

  it('unknown routes return a 404 envelope', async () => {
    const res = await api.get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('GET /api/does-not-exist');
  });
});

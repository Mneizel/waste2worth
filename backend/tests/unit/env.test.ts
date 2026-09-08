import { parseEnv } from '../../src/config/env';

describe('parseEnv', () => {
  const base = {
    DATABASE_URL: 'file:./x.db',
    ADMIN_API_KEY: 'secret',
  };

  it('applies defaults when only required vars are present', () => {
    const env = parseEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      VISION_PROVIDER: 'stub',
      MEDIA_BASE_URL: '',
      MAX_UPLOAD_BYTES: 8 * 1024 * 1024,
      UPLOAD_DIR: 'public/uploads',
      CORS_ORIGIN: '*',
      PORT: 4000,
    });
  });

  it('honours provided values and coerces numbers', () => {
    const env = parseEnv({
      ...base,
      NODE_ENV: 'production',
      MEDIA_BASE_URL: 'http://cdn.example',
      MAX_UPLOAD_BYTES: '1024',
      UPLOAD_DIR: 'tmp/up',
      CORS_ORIGIN: 'http://localhost:5173',
      PORT: '8080',
    });
    expect(env.NODE_ENV).toBe('production');
    expect(env.MAX_UPLOAD_BYTES).toBe(1024);
    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGIN).toBe('http://localhost:5173');
  });

  it('throws a descriptive error when required vars are missing', () => {
    expect(() => parseEnv({})).toThrow(/Invalid environment configuration/);
  });

  it('throws when a value is invalid', () => {
    expect(() => parseEnv({ ...base, MAX_UPLOAD_BYTES: '-3' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('reads process.env by default', () => {
    const env = parseEnv();
    expect(env.NODE_ENV).toBe('test');
  });

  it('labels root-level issues', () => {
    expect(() => parseEnv('nope' as unknown as NodeJS.ProcessEnv)).toThrow(
      /\(root\)/,
    );
  });
});

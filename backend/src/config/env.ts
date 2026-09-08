import { z } from 'zod';

/**
 * Environment schema. Everything the app reads from `process.env` goes through
 * here so tests can build a config from an arbitrary source object.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  ADMIN_API_KEY: z.string().min(1),
  // Only "stub" for now. Real providers get added here when we wire them up.
  VISION_PROVIDER: z.enum(['stub']).default('stub'),
  MEDIA_BASE_URL: z.string().default(''),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),
  UPLOAD_DIR: z.string().min(1).default('public/uploads'),
  CORS_ORIGIN: z.string().min(1).default('*'),
  PORT: z.coerce.number().int().positive().default(4000),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return parsed.data;
}

export const env = parseEnv();

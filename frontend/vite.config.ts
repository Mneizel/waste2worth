/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineConfig } from 'vitest/config';

// SINGLEFILE=1 -> bundle everything (JS, CSS, artwork) into one index.html that
// opens by double-click, no server needed. Otherwise a normal multi-file build.
const singleFile = process.env.SINGLEFILE === '1';

export default defineConfig({
  // Relative base + HashRouter => the built site works from any static host
  // and any sub-path (GitHub Pages project sites, Netlify, a local folder).
  base: './',
  // All placeholder artwork is inlined as data URIs (src/data/media.ts), so the
  // build needs nothing from public/.
  publicDir: false,
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        'src/lib/types.ts',
        'src/data/**',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
      ],
      reporter: ['text', 'text-summary'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});

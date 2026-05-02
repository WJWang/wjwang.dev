import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const uiDist = resolve(__dirname, 'packages/ui/dist');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@wjwang/ui/types': `${uiDist}/types/index.js`,
      '@wjwang/ui/components': `${uiDist}/components/index.js`,
      '@wjwang/ui/article': `${uiDist}/article/index.js`,
      '@wjwang/ui/primitives': `${uiDist}/primitives/index.js`,
      '@wjwang/ui': `${uiDist}/index.js`,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['@testing-library/jest-dom/vitest'],
    include: [
      'packages/**/src/**/*.test.{ts,tsx}',
      'apps/**/src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
    ],
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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

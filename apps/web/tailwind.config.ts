import type { Config } from 'tailwindcss';
import preset from '@wjwang/ui/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../content/articles/**/*.tsx',
  ],
};

export default config;

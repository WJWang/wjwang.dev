import { defineConfig } from 'tsup';

export default defineConfig([
  // Bundles containing client components (hooks / Radix interactivity) — banner required
  // because tsup/esbuild strips source-level 'use client' during bundling
  {
    entry: {
      'components/index': 'src/components/index.ts',  // SiteHeader uses useState
      'primitives/index': 'src/primitives/index.ts',  // Radix UI components use hooks internally
    },
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    banner: { js: "'use client';" },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    esbuildOptions(opts) {
      opts.jsx = 'automatic';
    },
  },
  // Server-safe bundles — no 'use client' banner, RSC tree-shaking friendly
  {
    entry: {
      'index':            'src/index.ts',
      'article/index':    'src/article/index.ts',     // Prose, CodeBlock, Callout, etc. — pure RSC
      'types/index':      'src/types/index.ts',
      'tailwind.preset':  'src/tailwind.preset.ts',
    },
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    esbuildOptions(opts) {
      opts.jsx = 'automatic';
    },
  },
]);

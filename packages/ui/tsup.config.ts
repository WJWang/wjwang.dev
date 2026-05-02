import { defineConfig } from 'tsup';

export default defineConfig([
  // Client components — needs "use client" directive preserved in output
  {
    entry: {
      'components/index': 'src/components/index.ts',
      'article/index':    'src/article/index.ts',
      'primitives/index': 'src/primitives/index.ts',
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
  // Server-safe (no hooks) — no banner needed
  {
    entry: {
      'index':           'src/index.ts',
      'types/index':     'src/types/index.ts',
      'tailwind.preset': 'src/tailwind.preset.ts',
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

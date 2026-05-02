import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index':            'src/index.ts',
    'components/index': 'src/components/index.ts',
    'article/index':    'src/article/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'types/index':      'src/types/index.ts',
    'tailwind.preset':  'src/tailwind.preset.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions(opts) {
    opts.jsx = 'automatic';
  },
});

import { defineConfig } from 'tsdown';

// Content and popup are built as two separate single-entry bundles so each
// output is fully self-contained. Content scripts are loaded as classic scripts
// and cannot `require()` shared chunks, so code-splitting across the two entries
// must be avoided. The build script runs this config once per target.
const target = process.env.TSDOWN_TARGET ?? 'popup';

const shared = {
  outDir: 'dist',
  format: ['cjs'] as const,
  external: ['chrome'],
  clean: false, // `prebuild` handles cleaning so the two runs don't wipe each other
};

export default defineConfig(
  target === 'content'
    ? {
        ...shared,
        entry: ['src/content/content.ts'],
      }
    : {
        ...shared,
        entry: ['src/popup/popup.tsx'],
        alias: {
          'react/jsx-runtime': 'preact/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/jsx-runtime',
        },
      },
);

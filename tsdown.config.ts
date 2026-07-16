import { defineConfig } from 'tsdown';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Content and popup are built as two separate single-entry bundles so each
// output is fully self-contained. Content scripts are loaded as classic scripts
// and cannot `require()` shared chunks, so code-splitting across the two entries
// must be avoided. The build script runs this config once per target.
const target = process.env.TSDOWN_TARGET ?? 'popup';

// Copy static assets after every bundle write, so `--watch` keeps dist/ in sync
// with manifest, HTML, CSS, and assets — not just the JS entries.
const copyStaticPlugin = {
  name: 'copy-static',
  writeBundle() {
    try {
      if (existsSync('manifest.json')) {
        copyFileSync('manifest.json', 'dist/manifest.json');
      }
      mkdirSync('dist/popup', { recursive: true });
      if (existsSync('src/popup/popup.html')) {
        copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
      }
      if (existsSync('src/popup/popup.css')) {
        copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');
      }
      if (existsSync('src/content/styles.css')) {
        mkdirSync('dist/content', { recursive: true });
        copyFileSync('src/content/styles.css', 'dist/content/styles.css');
      }
      if (existsSync('src/content/content-loader.js')) {
        copyFileSync('src/content/content-loader.js', 'dist/content-loader.js');
      }
      if (existsSync('src/assets')) {
        mkdirSync('dist/assets', { recursive: true });
        for (const file of readdirSync('src/assets')) {
          copyFileSync(join('src/assets', file), join('dist/assets', file));
        }
      }
    } catch (error) {
      console.error('Error copying static files:', error);
    }
  },
};

const shared = {
  outDir: 'dist',
  external: ['chrome'],
  clean: false, // `prebuild` handles cleaning so the two runs don't wipe each other
  plugins: [copyStaticPlugin],
};

export default defineConfig(
  target === 'content'
    ? {
        ...shared,
        entry: ['src/content/content.ts'],
        // ES module: its declarations live in module scope (never the shared
        // isolated-world scope) and it is evaluated once per URL. The manifest
        // injects content-loader.js, which dynamically imports this bundle, so
        // re-injection can't redeclare identifiers. `chrome` stays a free global.
        format: ['esm'] as const,
      }
    : {
        ...shared,
        entry: ['src/popup/popup.tsx'],
        format: ['cjs'] as const,
        alias: {
          'react/jsx-runtime': 'preact/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/jsx-runtime',
        },
      },
);
